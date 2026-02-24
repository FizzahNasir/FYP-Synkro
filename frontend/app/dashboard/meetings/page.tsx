'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Video, FileAudio, X, Trash2, RotateCcw } from 'lucide-react'
import { formatDateTime, formatRelativeTime, getStatusColor, formatFileSize } from '@/lib/utils'
import type { Meeting } from '@/types'
import Link from 'next/link'

export default function MeetingsPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [uploadError, setUploadError] = useState('')

  // Fetch meetings
  const { data, isLoading } = useQuery<{ data: Meeting[] }>({
    queryKey: ['meetings'],
    queryFn: () => meetingApi.getMeetings({ limit: 20 }),
    refetchInterval: 5000, // Refetch every 5s to check transcription status
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => meetingApi.uploadMeeting(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      setSelectedFile(null)
      setMeetingTitle('')
      setUploadError('')
    },
    onError: (error: any) => {
      setUploadError(error.response?.data?.detail || 'Upload failed')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (meetingId: string) => meetingApi.deleteMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })

  // Retry mutation
  const retryMutation = useMutation({
    mutationFn: (meetingId: string) => meetingApi.retryMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })

  const handleRetry = (e: React.MouseEvent, meetingId: string) => {
    e.preventDefault()
    e.stopPropagation()
    retryMutation.mutate(meetingId)
  }

  const handleDelete = (e: React.MouseEvent, meetingId: string, meetingTitle: string) => {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation()

    if (confirm(`Are you sure you want to delete "${meetingTitle}"? This will also delete the recording and cannot be undone.`)) {
      deleteMutation.mutate(meetingId)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['.mp3', '.wav', '.m4a', '.webm', '.mp4', '.mpeg', '.mpga']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(fileExt)) {
      setUploadError(`Invalid file type. Supported: ${validTypes.join(', ')}`)
      return
    }

    // Validate file size (25MB max - Whisper API limit)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size: 25MB (Whisper API limit)')
      return
    }

    setSelectedFile(file)
    setUploadError('')

    // Auto-fill title from filename
    if (!meetingTitle) {
      const name = file.name.replace(/\.[^/.]+$/, '')
      setMeetingTitle(name)
    }
  }

  const handleUpload = () => {
    if (!selectedFile || !meetingTitle) return

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', meetingTitle)

    uploadMutation.mutate(formData)
  }

  const meetings = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meetings</h1>
        <p className="text-sm text-muted-foreground">
          Upload and transcribe meeting recordings with AI
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Meeting Recording</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {uploadError}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.webm,.mp4,.mpeg,.mpga"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV, M4A, WebM, MP4 (max 25MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileAudio className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <Input
                  placeholder="Meeting title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
                <Button
                  onClick={handleUpload}
                  disabled={!meetingTitle || uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload and Transcribe'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meetings List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Meetings</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground mb-4">No meetings yet</p>
            <p className="text-sm text-muted-foreground">
              Upload your first meeting recording to get AI-powered transcription and summaries
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="relative group">
                <Link
                  href={`/dashboard/meetings/${meeting.id}`}
                  className="block"
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Video className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{meeting.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(meeting.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>

                        {meeting.action_items && meeting.action_items.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {meeting.action_items.length} action items
                          </p>
                        )}

                        {(meeting.status === 'processing' || meeting.status === 'transcribed') && (
                          <div className="mt-2">
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary animate-pulse w-2/3" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {meeting.status === 'processing' ? 'Transcribing audio...' : 'Generating summary and action items...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {meeting.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleRetry(e, meeting.id)}
                      disabled={retryMutation.isPending}
                      title="Retry transcription"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleDelete(e, meeting.id, meeting.title)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
