export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'submitted' | 'under_review' | 'investigating' | 'resolved' | 'closed'
export type IncidentCategory =
  | 'phishing_email'
  | 'suspicious_link'
  | 'unauthorized_access'
  | 'malware'
  | 'data_exposure'
  | 'account_compromise'
  | 'other'
export type UserRole = 'super_admin' | 'security_analyst' | 'employee'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          department: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      incidents: {
        Row: {
          id: string
          reference_id: string
          title: string
          description: string
          category: IncidentCategory
          severity: IncidentSeverity
          status: IncidentStatus
          affected_system: string | null
          reporter_id: string
          assigned_to: string | null
          resolution_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['incidents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>
      }
      incident_notes: {
        Row: {
          id: string
          incident_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['incident_notes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['incident_notes']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string
          action: string
          resource_type: string
          resource_id: string | null
          details: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          incident_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      incident_severity: IncidentSeverity
      incident_status: IncidentStatus
      incident_category: IncidentCategory
      user_role: UserRole
    }
  }
}
