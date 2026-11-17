export type {
  Database,
  IncidentSeverity,
  IncidentStatus,
  IncidentCategory,
  UserRole,
  Json,
} from './database'

export interface Incident {
  id: string
  reference_id: string
  title: string
  description: string
  category: string
  severity: string
  status: string
  affected_system: string | null
  reporter_id: string
  reporter?: Profile
  assigned_to: string | null
  assignee?: Profile
  resolution_summary: string | null
  created_at: string
  updated_at: string
  notes?: IncidentNote[]
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  department: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface IncidentNote {
  id: string
  incident_id: string
  author_id: string
  author?: Profile
  content: string
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  actor?: Profile
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown>
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  incident_id: string | null
  created_at: string
}

export interface KPIData {
  total: number
  open: number
  highSeverity: number
  resolved: number
  totalTrend: number
  openTrend: number
  highTrend: number
  resolvedTrend: number
}
