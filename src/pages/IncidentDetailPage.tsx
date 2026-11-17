import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, CheckCircle2, Clock, User, Calendar,
  FileText, MessageSquare, Send, ChevronDown, AlertCircle,
  Shield, Eye, Search, Archive, Zap, Paperclip, ExternalLink
} from 'lucide-react'
import { useIncidents } from '@/contexts/IncidentContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import { DEMO_PROFILES } from '@/data/demoData'

interface EvidenceFile {
  id: string
  file_name: string
  file_url: string | null
  file_type: string | null
  file_size: number | null
  created_at: string
}

const STATUS_FLOW = ['submitted', 'under_review', 'investigating', 'resolved', 'closed']
const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted', under_review: 'Under Review',
  investigating: 'Investigating', resolved: 'Resolved', closed: 'Closed'
}

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { incidents, notes, updateIncident, addNote, loading } = useIncidents()
  const { user } = useAuth()

  const incident = incidents.find(i => i.id === id)
  const incidentNotes = useMemo(() => notes.filter(n => n.incident_id === id), [notes, id])

  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [resolutionText, setResolutionText] = useState('')
  const [showResolve, setShowResolve] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])

  // Load evidence files from Supabase Storage records
  useEffect(() => {
    if (!id) return
    const loadEvidence = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('incident_evidence')
          .select('*')
          .eq('incident_id', id)
          .order('created_at', { ascending: true })
        if (data) setEvidence(data as EvidenceFile[])
      } catch { /* storage not configured — silently skip */ }
    }
    loadEvidence()
  }, [id])

  const canManage = user?.role === 'super_admin' || user?.role === 'security_analyst'
  const analysts = DEMO_PROFILES.filter(p => p.role === 'security_analyst' || p.role === 'super_admin')

  const handleStatusChange = async (status: string) => {
    if (!incident) return
    setSaving(true)
    await updateIncident(incident.id, { status })
    setSaveMsg('Status updated')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const handleAssign = async (userId: string) => {
    if (!incident) return
    setSaving(true)
    await updateIncident(incident.id, { assigned_to: userId })
    setSaveMsg('Analyst assigned')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const handleAddNote = async () => {
    if (!noteText.trim() || !incident) return
    setAddingNote(true)
    await addNote(incident.id, noteText)
    setNoteText('')
    setAddingNote(false)
  }

  const handleResolve = async () => {
    if (!incident || !resolutionText.trim()) return
    setSaving(true)
    await updateIncident(incident.id, { status: 'resolved', resolution_summary: resolutionText })
    setShowResolve(false)
    setSaving(false)
  }

  if (loading) return <LoadingSpinner message="Loading incident..." />
  if (!incident) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-bold">Incident not found</h2>
      <p className="text-sm text-muted-foreground mt-1">The incident may have been removed or the ID is invalid.</p>
      <Button className="mt-4" onClick={() => navigate('/incidents')}>Back to Incidents</Button>
    </div>
  )

  const currentStatusIdx = STATUS_FLOW.indexOf(incident.status)
  const statusIcons: Record<string, React.ElementType> = {
    submitted: Send, under_review: Eye, investigating: Search, resolved: CheckCircle2, closed: Archive
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/incidents')} className="shrink-0 mt-0.5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <code className="text-xs font-mono text-muted-foreground">{incident.reference_id}</code>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <h1 className="text-xl font-bold text-foreground">{incident.title}</h1>
        </div>
        {saveMsg && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />{saveMsg}
          </span>
        )}
      </div>

      {/* Status progress */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentStatusIdx
              const current = i === currentStatusIdx
              const StIcon = statusIcons[s] || Clock
              return (
                <div key={s} className="flex items-center gap-1 shrink-0">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${current ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : done ? 'bg-emerald-500/10 text-emerald-400' : 'text-muted-foreground'}`}>
                    <StIcon className="h-3 w-3" />
                    {STATUS_LABELS[s]}
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`h-0.5 w-6 rounded ${i < currentStatusIdx ? 'bg-emerald-500/50' : 'bg-border'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-border">
            <CardHeader className="pb-3"><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/90 leading-relaxed">{incident.description}</p>
              {incident.affected_system && (
                <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">Affected System</div>
                  <div className="text-sm text-foreground">{incident.affected_system}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Files */}
          {evidence.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Evidence Files</CardTitle>
                  <span className="text-xs text-muted-foreground">({evidence.length})</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {evidence.map(file => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="rounded bg-blue-500/10 p-1.5 shrink-0">
                        <Shield className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{file.file_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {file.file_type || 'Unknown type'}
                          {file.file_size ? ` · ${(file.file_size / 1024).toFixed(0)} KB` : ''}
                        </div>
                      </div>
                    </div>
                    {file.file_url && (
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0 ml-2">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Resolution */}
          {incident.resolution_summary && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-base text-emerald-400">Resolution Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 leading-relaxed">{incident.resolution_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Investigation Notes</CardTitle>
                <span className="text-xs text-muted-foreground">{incidentNotes.length} note{incidentNotes.length !== 1 ? 's' : ''}</span>
              </div>
            </CardHeader>
            <CardContent>
              {incidentNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No notes added yet.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {incidentNotes.map(note => (
                    <div key={note.id} className="flex gap-3">
                      <UserAvatar user={note.author || null} size="sm" className="shrink-0 mt-0.5" />
                      <div className="flex-1 rounded-xl border border-border bg-secondary/30 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">{note.author?.full_name || 'Unknown'}</span>
                          <span className="text-[11px] text-muted-foreground">{formatRelativeTime(note.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canManage && (
                <div className="space-y-2">
                  <Textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                    placeholder="Add an investigation note..." rows={3} />
                  <div className="flex justify-end">
                    <Button size="sm" variant="cyber" onClick={handleAddNote}
                      disabled={!noteText.trim() || addingNote}>
                      {addingNote ? 'Adding...' : <><Send className="h-3.5 w-3.5 mr-1.5" />Add Note</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolve incident */}
          {canManage && !['resolved', 'closed'].includes(incident.status) && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Resolve Incident</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowResolve(v => !v)}>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showResolve ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              {showResolve && (
                <CardContent>
                  <div className="space-y-3">
                    <Textarea value={resolutionText} onChange={e => setResolutionText(e.target.value)}
                      placeholder="Describe the resolution, actions taken, and verification steps..." rows={4} />
                    <Button variant="cyber" onClick={handleResolve} disabled={!resolutionText.trim() || saving}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      {saving ? 'Resolving...' : 'Mark as Resolved'}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3"><CardTitle className="text-base">Incident Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Category</div>
                <CategoryBadge category={incident.category} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Severity</div>
                <SeverityBadge severity={incident.severity} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reporter</div>
                <div className="flex items-center gap-2">
                  <UserAvatar user={incident.reporter || null} size="sm" />
                  <div>
                    <div className="text-xs font-medium text-foreground">{incident.reporter?.full_name || 'Unknown'}</div>
                    <div className="text-[11px] text-muted-foreground">{incident.reporter?.department || ''}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reported</div>
                <div className="text-xs text-foreground">{formatDateTime(incident.created_at)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
                <div className="text-xs text-foreground">{formatRelativeTime(incident.updated_at)}</div>
              </div>
            </CardContent>
          </Card>

          {canManage && (
            <>
              <Card className="border-border">
                <CardHeader className="pb-3"><CardTitle className="text-base">Assign Analyst</CardTitle></CardHeader>
                <CardContent>
                  <Select value={incident.assigned_to || ''} onValueChange={handleAssign}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      {analysts.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          <div className="flex items-center gap-2">
                            <UserAvatar user={a} size="sm" />
                            <span>{a.full_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {incident.assignee && (
                    <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-secondary/30 border border-border">
                      <UserAvatar user={incident.assignee} size="sm" />
                      <div>
                        <div className="text-xs font-medium text-foreground">{incident.assignee.full_name}</div>
                        <div className="text-[11px] text-muted-foreground capitalize">{incident.assignee.role.replace('_', ' ')}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3"><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
                <CardContent>
                  <Select value={incident.status} onValueChange={handleStatusChange} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3"><CardTitle className="text-base">Change Severity</CardTitle></CardHeader>
                <CardContent>
                  <Select value={incident.severity}
                    onValueChange={async v => { setSaving(true); await updateIncident(incident.id, { severity: v }); setSaving(false) }}
                    disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
