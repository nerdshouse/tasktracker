/*
 *
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */
export enum UserRole {
  ADMIN = 'admin',
  TEAMMATE = 'teammate',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  password?: string;
  approved?: boolean;
  created_at?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RecurringType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'fortnightly'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled'
  | 'closed_permanently'
  | 'pending_verification'
  | 'correction_required';

export type AuditStatus = 'pending' | 'audited' | 'bogus' | 'unclear';

export interface Task {
  id: string;
  title: string;
  description: string;
  start_date?: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  recurring: RecurringType;
  verification_required?: boolean;
  verifier_id?: string;
  attachment_required: boolean;
  attachment_type?: 'media' | 'text';
  attachment_description?: string;
  recurring_days?: number[];
  assigned_to_id: string;
  assigned_by_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  is_holiday?: boolean;
  /** True for scheduler/controller record of a recurring stream. */
  is_recurring_master?: boolean;
  parent_task_id?: string;
  audit_status?: AuditStatus;
  audited_at?: string;
  audited_by?: string;
  attachment_url?: string;
  attachment_text?: string;
  assignee_deleted?: boolean;
  verified_at?: string;
  verified_by?: string;
  /** Mandatory note entered by doer when marking task complete. */
  doer_remark?: string;
  /** Set when verifier rejects (status correction_required). Visible to assignee. */
  verification_rejection_comment?: string;
  verification_rejected_at?: string;
  verification_rejected_by?: string;
  client_id?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  created_at: string;
}

export interface Absence {
  id: string;
  user_id: string;
  user_name: string;
  from_date: string;
  to_date: string;
  reason?: string;
  created_at: string;
}

export type HelpTicketStatus = 'open' | 'in_progress' | 'resolved' | 'rated';

export interface HelpTicketProposedSolution {
  text: string;
  /** Optional priority ordering (1 = highest). */
  priority?: 1 | 2 | 3;
}

export interface HelpTicketRating {
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface HelpTicket {
  id: string;
  title: string;
  description: string;
  doer_id: string;
  doer_name: string;
  helper_id: string;
  helper_name: string;
  status: HelpTicketStatus;
  proposed_solutions?: HelpTicketProposedSolution[];
  helper_note?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  rated_at?: string;
  rating?: HelpTicketRating;
}

export interface KpiMetrics {
  total_assigned: number;
  on_time_completed: number;
  late_completed: number;
  overdue_count: number;
  overdue_percent: number;
  late_completion_percent: number;
}
