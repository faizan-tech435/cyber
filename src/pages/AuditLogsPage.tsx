import { useState, useMemo } from 'react'
import { Search, Download, ClipboardList, FileText, User, Eye, AlertTriangle, CheckCircle2, MessageSquare, Edit2 } from 'lucide-react'
import { useIncidents } from '@/contexts/IncidentContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDateTime, downloadCSV } from '@/lib/utils'

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'incident.created':        { label: 'Incident Created',       icon: FileText,     color: 'text-blue-400 bg-blue-500/10' },
  'incident.assigned':       { label: 'Incident Assigned',      icon: User,         color: 'text-cyan-400 bg-cyan-500/10' },
  'incident.status_changed': { label: 'Status Changed',         icon: Eye,          color: 'text-amber-400 bg-amber-500/10' },
  'incident.severity_changed':{ label: 'Severity Changed',      icon: AlertTriangle,color: 'text-orange-400 bg-orange-500/10' },
  'incident.resolved':       { label: 'Incident Resolved',      icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
  'note.added':              { label: 'Note Added',             icon: MessageSquare,color: 'text-violet-400 bg-violet-500/10' },
  'user.role_changed':       { label: 'User Role Changed',      icon: Edit2,        color: 'text-rose-400 bg-rose-500/10' },
}

export function AuditLogsPage() {
  const { auditLogs, loading } = useIncidents()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const canView = user?.role === 'super_admin' || user?.role === 'security_analyst'

  const filtered = useMemo(() => {
    let result = [...auditLogs]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        (l.actor?.full_name || '').toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        JSON.stringify(l.details).toLowerCase().includes(q)
      )
    }
    if (filterAction !== 'all') result = result.filter(l => l.action === filterAction)
    return result
  }, [auditLogs, search, filterAction])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleExport = () => {
    downloadCSV(filtered.map(l => ({
      timestamp: l.created_at,
      actor: l.actor?.full_name || l.actor_id,
      action: l.action,
      resource_type: l.resource_type,
      resource_id: l.resource_id || '',
      details: JSON.stringify(l.details),
    })), 'cybersafe-audit-logs.csv')
  }

  if (!canView) {
    return <EmptyState icon={ClipboardList} title="Access Restricted"
      description="Audit logs are only accessible to administrators and security analysts." />
  }

  if (loading) return <LoadingSpinner message="Loading audit logs..." />

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Append-only record of all security-relevant actions in CyberSafe Desk.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by actor, action, details..." className="pl-9 h-9" />
            </div>
            <Select value={filterAction} onValueChange={v => { setFilterAction(v); setPage(1) }}>
              <SelectTrigger className="w-48 h-9"><SelectValue placeholder="All Actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(ACTION_CONFIG).map(([action, cfg]) => (
                  <SelectItem key={action} value={action}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Log Entries</CardTitle>
          <span className="text-xs text-muted-foreground">{filtered.length} entries</span>
        </CardHeader>
        {paginated.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No log entries" description="No audit logs match your current filters." />
        ) : (
          <>
            <div className="divide-y divide-border">
              {paginated.map(log => {
                const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: ClipboardList, color: 'text-muted-foreground bg-secondary' }
                const EntryIcon = cfg.icon
                const details = log.details as Record<string, string>
                return (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-accent/20 transition-colors">
                    <div className={`rounded-lg p-2 mt-0.5 shrink-0 ${cfg.color}`}>
                      <EntryIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{cfg.label}</span>
                        {details?.reference_id && (
                          <code className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                            {details.reference_id}
                          </code>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <UserAvatar user={log.actor || null} size="sm" className="h-4 w-4" />
                          {log.actor?.full_name || 'System'}
                        </span>
                        {details?.from && details?.to && (
                          <span>{details.from} → {details.to}</span>
                        )}
                        {details?.assigned_to && (
                          <span>→ {details.assigned_to}</span>
                        )}
                        {details?.note_preview && (
                          <span className="italic truncate max-w-[200px]">"{details.note_preview}"</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 text-right">
                      {formatDateTime(log.created_at)}
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-secondary/20">
                <span className="text-xs text-muted-foreground">
                  {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
