import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import type { Incident, IncidentNote, AuditLog, Notification } from '@/types'
import {
  DEMO_INCIDENTS, DEMO_NOTES, DEMO_AUDIT_LOGS, DEMO_NOTIFICATIONS, DEMO_PROFILES
} from '@/data/demoData'
import { generateIncidentId } from '@/lib/utils'

interface IncidentContextValue {
  incidents: Incident[]
  notes: IncidentNote[]
  auditLogs: AuditLog[]
  notifications: Notification[]
  loading: boolean
  createIncident: (data: Partial<Incident>) => Promise<{ error: string | null; incident?: Incident }>
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<{ error: string | null }>
  addNote: (incidentId: string, content: string) => Promise<{ error: string | null }>
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  refreshIncidents: () => void
}

const IncidentContext = createContext<IncidentContextValue | undefined>(undefined)

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [notes, setNotes] = useState<IncidentNote[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const loadDemoData = useCallback(() => {
    if (!user) return
    let visibleIncidents = DEMO_INCIDENTS
    if (user.role === 'employee') {
      visibleIncidents = DEMO_INCIDENTS.filter(i => i.reporter_id === user.id)
    }
    setIncidents([...visibleIncidents])
    setNotes([...DEMO_NOTES])
    setAuditLogs([...DEMO_AUDIT_LOGS])
    setNotifications(DEMO_NOTIFICATIONS.filter(n => n.user_id === user.id))
    setLoading(false)
  }, [user])

  const loadRealData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: incData } = await supabase
        .from('incidents')
        .select('*, reporter:profiles!reporter_id(*), assignee:profiles!assigned_to(*)')
        .order('created_at', { ascending: false })
      if (incData) setIncidents(incData as Incident[])

      const { data: notesData } = await supabase
        .from('incident_notes')
        .select('*, author:profiles!author_id(*)')
        .order('created_at', { ascending: true })
      if (notesData) setNotes(notesData as IncidentNote[])

      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('*, actor:profiles!actor_id(*)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (auditData) setAuditLogs(auditData as AuditLog[])

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (notifData) setNotifications(notifData as Notification[])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    if (isDemo) loadDemoData()
    else loadRealData()
  }, [user, isDemo, loadDemoData, loadRealData])

  const createIncident = useCallback(async (data: Partial<Incident>) => {
    if (!user) return { error: 'Not authenticated' }
    const refId = generateIncidentId()
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      reference_id: refId,
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'other',
      severity: data.severity || 'medium',
      status: 'submitted',
      affected_system: data.affected_system || null,
      reporter_id: user.id,
      reporter: user,
      assigned_to: null,
      resolution_summary: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isDemo) {
      setIncidents(prev => [newIncident, ...prev])
      const log: AuditLog = {
        id: `audit-${Date.now()}`,
        actor_id: user.id,
        actor: user,
        action: 'incident.created',
        resource_type: 'incident',
        resource_id: newIncident.id,
        details: { reference_id: refId, title: newIncident.title },
        created_at: new Date().toISOString(),
      }
      setAuditLogs(prev => [log, ...prev])
      return { error: null, incident: newIncident }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error } = await (supabase as any)
        .from('incidents')
        .insert({
          reference_id: refId,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'other',
          severity: data.severity || 'medium',
          status: 'submitted',
          affected_system: data.affected_system || null,
          reporter_id: user.id,
          assigned_to: null,
          resolution_summary: null,
        })
        .select('*, reporter:profiles!reporter_id(*)')
        .single()
      if (error) return { error: error.message }
      setIncidents(prev => [created as Incident, ...prev])
      return { error: null, incident: created as Incident }
    } catch {
      return { error: 'Failed to create incident.' }
    }
  }, [user, isDemo])

  const updateIncident = useCallback(async (id: string, updates: Partial<Incident>) => {
    if (!user) return { error: 'Not authenticated' }
    const previous = incidents.find(i => i.id === id)
    if (!previous) return { error: 'Incident not found' }

    const resolvedAssignee = updates.assigned_to
      ? DEMO_PROFILES.find(p => p.id === updates.assigned_to) || previous.assignee
      : previous.assignee

    const updatedIncident: Incident = {
      ...previous,
      ...updates,
      assignee: resolvedAssignee,
      updated_at: new Date().toISOString(),
    }

    if (isDemo) {
      setIncidents(prev => prev.map(i => i.id === id ? updatedIncident : i))
      const actionMap: Record<string, string> = {}
      if (updates.status && updates.status !== previous.status) {
        actionMap['status'] = `incident.status_changed`
      }
      if (updates.severity && updates.severity !== previous.severity) {
        actionMap['severity'] = 'incident.severity_changed'
      }
      if (updates.assigned_to && updates.assigned_to !== previous.assigned_to) {
        actionMap['assign'] = 'incident.assigned'
      }
      if (updates.resolution_summary) {
        actionMap['resolve'] = 'incident.resolved'
      }

      const newLogs = Object.values(actionMap).map(action => ({
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        actor_id: user.id,
        actor: user,
        action,
        resource_type: 'incident',
        resource_id: id,
        details: {
          reference_id: previous.reference_id,
          ...updates,
        } as Record<string, unknown>,
        created_at: new Date().toISOString(),
      }))
      if (newLogs.length) setAuditLogs(prev => [...newLogs, ...prev])
      return { error: null }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('incidents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return { error: error.message }
      setIncidents(prev => prev.map(i => i.id === id ? updatedIncident : i))

      // Insert audit log entries for each change
      const auditEntries: { action: string; details: Record<string, unknown> }[] = []
      if (updates.status && updates.status !== previous.status) {
        auditEntries.push({ action: 'incident.status_changed', details: { from: previous.status, to: updates.status, reference_id: previous.reference_id } })
      }
      if (updates.severity && updates.severity !== previous.severity) {
        auditEntries.push({ action: 'incident.severity_changed', details: { from: previous.severity, to: updates.severity, reference_id: previous.reference_id } })
      }
      if (updates.assigned_to && updates.assigned_to !== previous.assigned_to) {
        auditEntries.push({ action: 'incident.assigned', details: { assigned_to: updates.assigned_to, reference_id: previous.reference_id } })
      }
      if (updates.resolution_summary) {
        auditEntries.push({ action: 'incident.resolved', details: { reference_id: previous.reference_id, resolution: updates.resolution_summary } })
      }
      for (const entry of auditEntries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('audit_logs').insert({
          actor_id: user.id,
          action: entry.action,
          resource_type: 'incident',
          resource_id: id,
          details: entry.details,
        })
      }
      return { error: null }
    } catch {
      return { error: 'Failed to update incident.' }
    }
  }, [user, isDemo, incidents])

  const addNote = useCallback(async (incidentId: string, content: string) => {
    if (!user) return { error: 'Not authenticated' }
    const newNote: IncidentNote = {
      id: `note-${Date.now()}`,
      incident_id: incidentId,
      author_id: user.id,
      author: user,
      content,
      created_at: new Date().toISOString(),
    }

    if (isDemo) {
      setNotes(prev => [...prev, newNote])
      const log: AuditLog = {
        id: `audit-${Date.now()}`,
        actor_id: user.id,
        actor: user,
        action: 'note.added',
        resource_type: 'incident',
        resource_id: incidentId,
        details: { note_preview: content.slice(0, 60) + (content.length > 60 ? '...' : '') } as Record<string, unknown>,
        created_at: new Date().toISOString(),
      }
      setAuditLogs(prev => [log, ...prev])
      return { error: null }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('incident_notes')
        .insert({ incident_id: incidentId, author_id: user.id, content })
        .select('*, author:profiles!author_id(*)')
        .single()
      if (error) return { error: error.message }
      setNotes(prev => [...prev, data as IncidentNote])
      return { error: null }
    } catch {
      return { error: 'Failed to add note.' }
    }
  }, [user, isDemo])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    if (!isDemo) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).from('notifications').update({ read: true }).eq('id', id).then(() => {})
    }
  }, [isDemo])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (!isDemo && user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).from('notifications').update({ read: true }).eq('user_id', user.id).then(() => {})
    }
  }, [isDemo, user])

  const refreshIncidents = useCallback(() => {
    if (isDemo) loadDemoData()
    else loadRealData()
  }, [isDemo, loadDemoData, loadRealData])

  return (
    <IncidentContext.Provider value={{
      incidents, notes, auditLogs, notifications, loading,
      createIncident, updateIncident, addNote,
      markNotificationRead, markAllNotificationsRead, refreshIncidents,
    }}>
      {children}
    </IncidentContext.Provider>
  )
}

export function useIncidents() {
  const ctx = useContext(IncidentContext)
  if (!ctx) throw new Error('useIncidents must be used within IncidentProvider')
  return ctx
}
