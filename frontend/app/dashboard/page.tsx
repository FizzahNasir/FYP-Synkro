'use client'

import { useQuery } from '@tanstack/react-query'
import { taskApi, meetingApi, adminApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  Video,
  MessageSquare,
  Users,
  Shield,
  User,
  Calendar,
  AlertTriangle,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime, getStatusColor, getPriorityColor, formatDueDate } from '@/lib/utils'
import type { TaskStats, Task, Meeting, AdminUserStats } from '@/types'
import { CreateTaskDialog } from '@/components/create-task-dialog'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  // Stats — admins see team-wide; non-admins see only their own
  const { data: stats } = useQuery<{ data: TaskStats }>({
    queryKey: ['task-stats', user?.id, isAdmin],
    queryFn: () =>
      isAdmin
        ? taskApi.getStats()
        : taskApi.getStats({ assignee_id: user!.id }),
    enabled: !!user,
  })

  // Recent tasks — admins: last 5 team tasks; non-admins: last 5 assigned to them
  const { data: tasksResponse } = useQuery<{ data: Task[] }>({
    queryKey: ['recent-tasks', user?.id, isAdmin],
    queryFn: () =>
      isAdmin
        ? taskApi.getTasks({ limit: 5 })
        : taskApi.getTasks({ limit: 5, assignee_id: user!.id }),
    enabled: !!user,
  })

  // Non-admins: check for recently assigned (last 7 days) tasks as a notification signal
  const { data: newlyAssignedResponse } = useQuery<{ data: Task[] }>({
    queryKey: ['newly-assigned-tasks', user?.id],
    queryFn: () => {
      const since = new Date()
      since.setDate(since.getDate() - 7)
      return taskApi.getTasks({ limit: 20, assignee_id: user!.id })
    },
    enabled: !!user && !isAdmin,
    staleTime: 30_000,
  })

  // Recent meetings
  const { data: meetingsResponse } = useQuery<{ data: Meeting[] }>({
    queryKey: ['recent-meetings'],
    queryFn: () => meetingApi.getMeetings({ limit: 3 }),
  })

  // Admin only: user stats
  const { data: userCountData } = useQuery<{ data: AdminUserStats }>({
    queryKey: ['admin-user-count'],
    queryFn: () => adminApi.getUserCount(),
    enabled: isAdmin,
  })

  const taskStats = stats?.data
  const recentTasks = tasksResponse?.data || []
  const recentMeetings = meetingsResponse?.data || []
  const userStats = userCountData?.data

  // Notification: tasks assigned in the last 7 days that are still todo/blocked
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const newlyAssigned = (newlyAssignedResponse?.data || []).filter(
    (t) =>
      new Date(t.created_at) >= sevenDaysAgo &&
      (t.status === 'todo' || t.status === 'blocked')
  )

  const overdueTasks = recentTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done'
  )

  return (
    <div className="space-y-6">

      {/* Newly-assigned notification banner — non-admins only */}
      {!isAdmin && newlyAssigned.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 px-4 py-3">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              {newlyAssigned.length} new task{newlyAssigned.length !== 1 ? 's' : ''} assigned to you this week
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              {newlyAssigned.slice(0, 2).map((t) => t.title).join(', ')}
              {newlyAssigned.length > 2 ? ` and ${newlyAssigned.length - 2} more` : ''}
            </p>
          </div>
          <Link
            href="/dashboard/tasks"
            className="shrink-0 text-xs font-medium text-blue-700 dark:text-blue-300 hover:underline"
          >
            View →
          </Link>
        </div>
      )}

      {/* Admin banner */}
      {isAdmin && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 px-4 py-3">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Admin Dashboard
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              You have full system access. You can upload meetings and manage users.
            </p>
          </div>
        </div>
      )}

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">{overdueTasks.length}</span> overdue task{overdueTasks.length !== 1 ? 's' : ''} —{' '}
            <Link href="/dashboard/tasks" className="underline hover:no-underline">
              view in Tasks
            </Link>
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {isAdmin ? 'Team Overview' : 'My Task Summary'}
        </p>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? 'Total Tasks' : 'My Tasks'}
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats?.total ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats?.todo ?? 0} to do, {taskStats?.in_progress ?? 0} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats?.in_progress ?? 0}</div>
              <p className="text-xs text-muted-foreground">Currently being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(taskStats?.overdue ?? 0) > 0 ? 'text-red-500' : ''}`}>
                {taskStats?.overdue ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taskStats?.completion_rate?.toFixed(0) ?? 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {taskStats?.done ?? 0} completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin-only: User Statistics */}
      {isAdmin && userStats && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.active} active, {userStats.inactive} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.new_last_30_days}</div>
              <p className="text-xs text-muted-foreground">Joined last 30 days</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(userStats.by_role || {}).map(([role, count]) =>
                  Number(count) > 0 ? (
                    <div key={role} className="flex items-center gap-1.5">
                      <Badge variant="outline" className="capitalize">
                        {role.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm font-medium">{String(count)}</span>
                    </div>
                  ) : null
                )}
              </div>
              <Link
                href="/dashboard/settings"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Manage Users →
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks column */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isAdmin ? 'Recent Tasks' : 'My Tasks'}</CardTitle>
              <Link
                href="/dashboard/tasks"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? 'No tasks yet.' : 'No tasks assigned to you yet.'}
                </p>
                {isAdmin && <CreateTaskDialog />}
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => {
                  const isOverdue =
                    task.due_date && new Date(task.due_date) < now && task.status !== 'done'
                  return (
                    <Link
                      key={task.id}
                      href="/dashboard/tasks"
                      className={`block rounded-lg border p-3 hover:bg-muted/50 transition-colors ${isOverdue ? 'border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-950/30' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Show assignee chip for admins */}
                            {isAdmin && task.assignee && (
                              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                                <User className="h-3 w-3" />
                                {task.assignee.full_name}
                              </span>
                            )}
                            {isAdmin && !task.assignee && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">Unassigned</span>
                            )}
                            {task.due_date && (
                              <span className={`inline-flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                {isOverdue ? 'Overdue: ' : ''}{formatDueDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <Badge className={`${getStatusColor(task.status)} text-xs px-1.5 py-0`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${getPriorityColor(task.priority)} text-xs px-1.5 py-0`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Meetings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Meetings</CardTitle>
              <Link
                href="/dashboard/meetings"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentMeetings.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Video className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {isAdmin
                    ? 'No meetings yet. Upload your first recording!'
                    : 'No meetings uploaded yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMeetings.map((meeting) => {
                  const pendingCount =
                    meeting.action_items?.filter((a) => a.status === 'pending').length ?? 0
                  return (
                    <Link
                      key={meeting.id}
                      href={`/dashboard/meetings/${meeting.id}`}
                      className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Video className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{meeting.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatRelativeTime(meeting.created_at)}
                          </p>
                          {pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                              <Bell className="h-3 w-3" />
                              {pendingCount} unassigned action item{pendingCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(meeting.status)} text-xs shrink-0`}>
                          {meeting.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isAdmin && (
              <CreateTaskDialog
                trigger={
                  <button className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors text-left w-full">
                    <CheckSquare className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Create Task</p>
                      <p className="text-xs text-muted-foreground">Add a new task manually</p>
                    </div>
                  </button>
                }
              />
            )}

            {isAdmin && (
              <Link
                href="/dashboard/meetings"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Upload Meeting</p>
                  <p className="text-xs text-muted-foreground">Transcribe and summarize</p>
                </div>
              </Link>
            )}

            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <CheckSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{isAdmin ? 'All Tasks' : 'My Tasks'}</p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'View and manage team tasks' : 'View your assigned tasks'}
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/chat"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Ask AI</p>
                <p className="text-xs text-muted-foreground">Query your workspace</p>
              </div>
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
              >
                <Users className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-xs text-muted-foreground">View and manage team members</p>
                </div>
              </Link>
            )}

            <Link
              href="/dashboard/messages"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-xs text-muted-foreground">Chat with teammates</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
