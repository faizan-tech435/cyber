import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, Filter, SortAsc, ChevronLeft, ChevronRight,
  FileText, Plus, RefreshCw, Eye
} from 'lucide-react'
import { useIncidents } from '@/contexts/IncidentContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils'

const PAGE_SIZE = 10

export function IncidentsPage() {
  const { incidents, loading, refreshIncidents } = useIncidents()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...incidents]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.reference_id.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.reporter?.full_name || '').toLowerCase().includes(q)
      )
    }
    if (filterCategory !== 'all') result = result.filter(i => i.category === filterCategory)
    if (filterSeverity !== 'all') result = result.filter(i => i.severity === filterSeverity)
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus)

    const severityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    else result.sort((a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0))
    return result
  }, [incidents, search, filterCategory, filterSeverity, filterStatus, sortBy])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch(''); setFilterCategory('all'); setFilterSeverity('all')
    setFilterStatus('all'); setSortBy('newest'); setPage(1)
  }

  if (loading) return <LoadingSpinner message="Loading incidents..." />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incident Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} incident{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshIncidents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="cyber" size="sm" onClick={() => navigate('/report')}>
            <Plus className="h-4 w-4 mr-1.5" /> Report Incident
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by title, ID, reporter..." className="pl-9 h-9" />
            </div>
            <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setPage(1) }}>
              <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="phishing_email">Phishing Email</SelectItem>
                <SelectItem value="suspicious_link">Suspicious Link</SelectItem>
                <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="data_exposure">Data Exposure</SelectItem>
                <SelectItem value="account_compromise">Account Compromise</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={v => { setFilterSeverity(v); setPage(1) }}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1) }}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={v => setSortBy(v as 'newest' | 'oldest' | 'severity')}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="severity">By Severity</SelectItem>
              </SelectContent>
            </Select>
            {(search || filterCategory !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all') && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={FileText} title="No incidents found"
            description="No incidents match your current filters. Try adjusting your search or filters."
            action={{ label: 'Clear filters', onClick: resetFilters }} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    {['Ref ID', 'Title', 'Category', 'Severity', 'Status', 'Reporter', 'Assigned To', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map(inc => (
                    <tr key={inc.id}
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      className="group cursor-pointer hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-[11px] font-mono text-muted-foreground">{inc.reference_id}</code>
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="text-sm font-medium text-foreground truncate group-hover:text-blue-400 transition-colors">
                          {inc.title}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <CategoryBadge category={inc.category} />
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={inc.reporter || null} size="sm" />
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {inc.reporter?.full_name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {inc.assignee ? (
                          <div className="flex items-center gap-2">
                            <UserAvatar user={inc.assignee} size="sm" />
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                              {inc.assignee.full_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{formatDate(inc.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
                <span className="text-xs text-muted-foreground">
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8"
                    disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                    return (
                      <Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs"
                        onClick={() => setPage(p)}>{p}</Button>
                    )
                  })}
                  <Button variant="outline" size="icon" className="h-8 w-8"
                    disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
