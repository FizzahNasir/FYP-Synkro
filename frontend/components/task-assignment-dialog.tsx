'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingApi } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, User, Calendar, AlertCircle } from 'lucide-react'

interface TeamMember {
  id: string
  full_name: string
  email: string
}

interface PendingAssignment {
  id: string
  description: string
  assignee_mentioned?: string
  speaker_label?: string
  speaker_display_name?: string
  deadline_mentioned?: string
  confidence_score: number
  suggested_assignee_id?: string
}

interface TaskAssignmentDialogProps {
  meetingId: string
  meetingTitle: string
  pendingItems: PendingAssignment[]
  teamMembers: TeamMember[]
  onClose: () => void
}

export function TaskAssignmentDialog({
  meetingId,
  meetingTitle,
  pendingItems,
  teamMembers,
  onClose,
}: TaskAssignmentDialogProps) {
  const queryClient = useQueryClient()

  // Map action_item_id → selected assignee_id (pre-fill with suggestion)
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const item of pendingItems) {
      initial[item.id] = item.suggested_assignee_id ?? ''
    }
    return initial
  })

  const bulkAssignMutation = useMutation({
    mutationFn: () => {
      const list = Object.entries(assignments)
        .filter(([, assigneeId]) => assigneeId !== '')
        .map(([action_item_id, assignee_id]) => ({ action_item_id, assignee_id }))
      return meetingApi.bulkAssignActionItems(meetingId, list)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      onClose()
    },
  })

  const assignedCount = Object.values(assignments).filter(Boolean).length

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Assign Tasks from Meeting
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{meetingTitle}</span> has been
            transcribed. Assign these action items to team members — they will appear
            as tasks in their profiles.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {pendingItems.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              <p>All action items have been assigned.</p>
            </div>
          ) : (
            pendingItems.map((item) => {
              const member = teamMembers.find((m) => m.id === assignments[item.id])
              return (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card p-3 space-y-2"
                >
                  <p className="text-sm font-medium leading-snug">{item.description}</p>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.speaker_display_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Mentioned by: <span className="font-medium text-foreground">{item.speaker_display_name}</span>
                      </span>
                    )}
                    {item.assignee_mentioned && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        Assigned to: <span className="font-medium text-foreground">{item.assignee_mentioned}</span>
                      </span>
                    )}
                    {item.deadline_mentioned && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(item.deadline_mentioned).toLocaleDateString()}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {Math.round(item.confidence_score * 100)}% confidence
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={assignments[item.id] ?? ''}
                      onChange={(e) =>
                        setAssignments((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">— Leave unassigned —</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.email})
                        </option>
                      ))}
                    </select>
                    {member && (
                      <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                        ✓ {member.full_name}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-2 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
            {assignedCount} of {pendingItems.length} items assigned
          </div>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button
            onClick={() => bulkAssignMutation.mutate()}
            disabled={bulkAssignMutation.isPending || assignedCount === 0}
          >
            {bulkAssignMutation.isPending
              ? 'Assigning...'
              : `Assign ${assignedCount} Task${assignedCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
