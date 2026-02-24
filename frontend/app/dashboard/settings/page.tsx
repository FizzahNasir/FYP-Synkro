'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, integrationsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Link2, Link2Off, RefreshCw, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { Integration } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const { user, fetchUser } = useAuthStore()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [integrationMessage, setIntegrationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Handle OAuth callback query params
  useEffect(() => {
    const integration = searchParams.get('integration')
    const status = searchParams.get('status')

    if (integration && status) {
      if (status === 'success') {
        setIntegrationMessage({ type: 'success', text: `${integration.charAt(0).toUpperCase() + integration.slice(1)} connected successfully!` })
      } else if (status === 'error') {
        const message = searchParams.get('message') || 'Connection failed'
        setIntegrationMessage({ type: 'error', text: `Failed to connect ${integration}: ${message}` })
      }

      // Clean URL params
      window.history.replaceState({}, '', '/dashboard/settings')

      // Auto-dismiss after 5s
      setTimeout(() => setIntegrationMessage(null), 5000)
    }
  }, [searchParams])

  // Fetch integrations
  const { data: integrationsData, isLoading: integrationsLoading } = useQuery<{ data: Integration[] }>({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.getIntegrations(),
  })

  const integrations = integrationsData?.data || []
  const gmailIntegration = integrations.find((i) => i.platform === 'gmail')

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: () => {
      fetchUser()
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to update profile')
      setTimeout(() => setError(''), 5000)
    },
  })

  // Gmail connect mutation (IMAP - one click, no OAuth redirect)
  const connectGmailMutation = useMutation({
    mutationFn: () => integrationsApi.connectGmail(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setIntegrationMessage({
        type: 'success',
        text: `Gmail connected: ${response.data.email}`,
      })
      setTimeout(() => setIntegrationMessage(null), 5000)
    },
    onError: (err: any) => {
      setIntegrationMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to connect Gmail',
      })
      setTimeout(() => setIntegrationMessage(null), 5000)
    },
  })

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: (integrationId: string) => integrationsApi.disconnectIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setIntegrationMessage({ type: 'success', text: 'Gmail disconnected' })
      setTimeout(() => setIntegrationMessage(null), 3000)
    },
  })

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: (integrationId: string) => integrationsApi.syncIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setIntegrationMessage({ type: 'success', text: 'Sync triggered!' })
      setTimeout(() => setIntegrationMessage(null), 3000)
    },
  })

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    updateMutation.mutate({
      full_name: fullName.trim(),
      timezone,
    })
  }

  const handleCancel = () => {
    setFullName(user.full_name)
    setTimezone(user.timezone)
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handleDisconnect = (integrationId: string, name: string) => {
    if (confirm(`Are you sure you want to disconnect ${name}?`)) {
      disconnectMutation.mutate(integrationId)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Integration notification */}
      {integrationMessage && (
        <div
          className={`rounded-md p-3 text-sm flex items-center gap-2 ${
            integrationMessage.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-400'
              : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-400'
          }`}
        >
          {integrationMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {integrationMessage.text}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center h-10">
                  <Badge>{user.role}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!isEditing}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Badge variant={user.is_active ? 'default' : 'destructive'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant={user.is_verified ? 'default' : 'outline'}>
                {user.is_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect third-party services to enhance your workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Gmail Integration */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium">Gmail</p>
                  {gmailIntegration ? (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {gmailIntegration.metadata?.email || 'Connected'}
                      </p>
                      {gmailIntegration.last_synced_at && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {formatRelativeTime(gmailIntegration.last_synced_at)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Sync emails and extract tasks
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {gmailIntegration ? (
                  <>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncMutation.mutate(gmailIntegration.id)}
                      disabled={syncMutation.isPending}
                      title="Sync now"
                    >
                      {syncMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(gmailIntegration.id, 'Gmail')}
                      disabled={disconnectMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Disconnect"
                    >
                      {disconnectMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2Off className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => connectGmailMutation.mutate()}
                    disabled={connectGmailMutation.isPending}
                  >
                    {connectGmailMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-1" />
                    )}
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Slack */}
            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-xs text-muted-foreground">
                    Process messages and mentions
                  </p>
                </div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>

            {/* Jira */}
            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24.013 12.5V1.005A1.005 1.005 0 0 0 23.013 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Jira</p>
                  <p className="text-xs text-muted-foreground">
                    Sync tasks with Jira issues
                  </p>
                </div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Synkro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Version: 1.0.0</p>
            <p>AI-Powered Workspace Orchestration System</p>
            <p>Built with Next.js, FastAPI, and Groq AI</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
