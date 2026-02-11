/**
 * TypeScript type definitions for Synkro application
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  timezone: string;
  role: 'admin' | 'member';
  is_active: boolean;
  is_verified: boolean;
  team_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  assignee_id?: string;
  created_by_id?: string;
  team_id: string;
  source_type: 'manual' | 'meeting' | 'message' | 'ai';
  source_id?: string;
  external_id?: string;
  created_at: string;
  updated_at?: string;
  assignee?: Partial<User>;
  creator?: Partial<User>;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  blocked: number;
  overdue: number;
  completion_rate: number;
}

export interface Meeting {
  id: string;
  title: string;
  scheduled_at?: string;
  duration_minutes?: number;
  recording_url?: string;
  transcript?: string;
  summary?: string;
  status: 'scheduled' | 'processing' | 'transcribed' | 'completed' | 'failed';
  team_id: string;
  created_by_id?: string;
  created_at: string;
  updated_at?: string;
  action_items: ActionItem[];
}

export interface ActionItem {
  id: string;
  description: string;
  assignee_mentioned?: string;
  deadline_mentioned?: string;
  confidence_score: number;
  status: 'pending' | 'converted' | 'rejected';
  task_id?: string;
  meeting_id?: string;
  message_id?: string;
  created_at: string;
}

export interface ChatQuery {
  message: string;
}

export interface ChatResponse {
  response: string;
  context_used: Record<string, any>;
  suggested_actions: Array<{
    action: string;
    label: string;
    url: string;
  }>;
}

export interface ApiError {
  detail: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  team_id?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Integration types
export interface Integration {
  id: string;
  platform: 'gmail' | 'slack' | 'google_calendar' | 'jira' | 'microsoft_teams';
  is_active: boolean;
  last_synced_at?: string;
  created_at: string;
  metadata: Record<string, any>;
}

// Analytics types
export interface WorkloadAnalytics {
  period_days: number;
  tasks_by_status: Record<string, number>;
  tasks_by_priority: Record<string, number>;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
}

export interface TeamMemberWorkload {
  user_id: string;
  full_name: string;
  email: string;
  active_tasks: number;
  completed_tasks_30d: number;
  overdue_tasks: number;
  estimated_hours_remaining: number;
}

export interface TeamWorkloadResponse {
  team_workload: TeamMemberWorkload[];
}

export interface MeetingInsights {
  period_days: number;
  total_meetings: number;
  completed_meetings: number;
  total_action_items: number;
  converted_action_items: number;
  action_item_conversion_rate: number;
  average_duration_minutes?: number;
}

export interface ProductivityTrendDay {
  date: string;
  created: number;
  completed: number;
}

export interface ProductivityTrendResponse {
  trend: ProductivityTrendDay[];
  period_days: number;
}
