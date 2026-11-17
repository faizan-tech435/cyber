import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, CheckSquare, Square, AlertCircle, Clock,
  FileText, Shield, User, MessageSquare, ChevronRight, Zap
} from 'lucide-react'
import { useIncidents } from '@/contexts/IncidentContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatRelativeTime } from '@/lib/utils'

const CHECKLIST = [
  'Initial review completed',
  'Incident category confirmed',
  'Severity assessed and validated',
  'Relevant evidence reviewed',
  'Response actions documented',
  'Affected parties notified',
  'Resolution verified',
]

export function InvestigationPage() {
  const { incidents, notes, loading } = useIncidents()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<Record<string, boolean[]>>({})

  const activeIncidents = useMemo(() => {
    let result = incidents.filter(i => !['closed'].includes(i.status))
    if (user?.role === 'security_analyst') {
      result = result.filter(i => i.assigned_to === user.id || i.assigned_to === null)
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') result = result.filter(i => !['resolved', 'closed'].includes(i.status))
      else result = result.filter(i => i.status === filterStatus)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.reference_id.toLowerCase().includes(q))
    }
    return result
  }, [incidents, user, filterStatus, search])

  const selected = incidents.find(i => i.id === selectedId) || activeIncidents[0]
  const selectedNotes = useMemo(() => notes.filter(n => n.incident_id === selected?.id), [notes, selected])

  const getChecklist = (id: string) => checklist[id] || CHECKLIST.map(() => false)
  const toggleCheck = (id: string, idx: number) => {
    setChecklist(prev => {
      const current = prev[id] || CHECKLIST.map(() => false)
      const updated = [...current]
      updated[idx] = !updated[idx]
      return { ...prev, [id]: updated }
    })
  }

  if (loading) return <LoadingSpinner message="Loading investigation center..." />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investigation Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Structured workspace for reviewing and investigating active security incidents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident list */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search incidents..." className="pl-9 h-9" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeIncidents.length === 0 ? (
            <EmptyState icon={Shield} title="No incidents to investigate"
              description="All active incidents appear here." />
          ) : (
            <div className="space-y-2">
              {activeIncidents.map(inc => (
                <button key={inc.id}
                  onClick={() => setSelectedId(inc.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${(selected?.id === inc.id) ? 'border-blue-500/40 bg-blue-500/5' : 'border-border hover:border-border/70 hover:bg-accent/40'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${inc.severity === 'critical' ? 'bg-red-400 animate-pulse' : inc.severity === 'high' ? 'bg-orange-400' : inc.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{inc.title}</div>
                      <code className="text-[10px] text-muted-foreground font-mono">{inc.reference_id}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={inc.severity} showIcon={false} />
                    <StatusBadge status={inc.status} showIcon={false} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-2">{formatRelativeTime(inc.created_at)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Investigation workspace */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <EmptyState icon={Search} title="Select an incident" description="Choose an incident from the list to start investigating." />
          ) : (
            <>
              {/* Overview */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <code className="text-xs font-mono text-muted-foreground">{selected.reference_id}</code>
                        <SeverityBadge severity={selected.severity} />
                        <StatusBadge status={selected.status} />
                      </div>
                      <CardTitle className="text-base">{selected.title}</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/incidents/${selected.id}`)}>
                      Open Full View <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90 leading-relaxed mb-4">{selected.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="text-[11px] text-muted-foreground mb-0.5">Reporter</div>
                      <div className="text-xs font-medium truncate">{selected.reporter?.full_name || 'Unknown'}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="text-[11px] text-muted-foreground mb-0.5">Assigned To</div>
                      <div className="text-xs font-medium truncate">{selected.assignee?.full_name || 'Unassigned'}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="text-[11px] text-muted-foreground mb-0.5">Category</div>
                      <div className="text-xs font-medium capitalize">{selected.category.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="text-[11px] text-muted-foreground mb-0.5">Reported</div>
                      <div className="text-xs font-medium">{formatRelativeTime(selected.created_at)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investigation checklist */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Investigation Checklist</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {getChecklist(selected.id).filter(Boolean).length}/{CHECKLIST.length} complete
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {CHECKLIST.map((item, i) => {
                      const checked = getChecklist(selected.id)[i]
                      return (
                        <button key={i} onClick={() => toggleCheck(selected.id, i)}
                          className="flex w-full items-center gap-3 rounded-lg p-2.5 hover:bg-accent/40 transition-colors text-left">
                          {checked
                            ? <CheckSquare className="h-4.5 w-4.5 h-5 w-5 text-emerald-400 shrink-0" />
                            : <Square className="h-5 w-5 text-muted-foreground shrink-0" />}
                          <span className={`text-sm ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {/* progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span>{Math.round((getChecklist(selected.id).filter(Boolean).length / CHECKLIST.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${(getChecklist(selected.id).filter(Boolean).length / CHECKLIST.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes timeline */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Investigation Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Navigate to the full incident view to add notes.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedNotes.map((note, i) => (
                        <div key={note.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <UserAvatar user={note.author || null} size="sm" className="shrink-0" />
                            {i < selectedNotes.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-foreground">{note.author?.full_name || 'Unknown'}</span>
                              <span className="text-[11px] text-muted-foreground">{formatRelativeTime(note.created_at)}</span>
                            </div>
                            <div className="rounded-xl border border-border bg-secondary/30 p-3 text-sm text-foreground/90 leading-relaxed">
                              {note.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-2"
                    onClick={() => navigate(`/incidents/${selected.id}`)}>
                    <MessageSquare className="h-4 w-4 mr-1.5" /> Add Note in Full View
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
