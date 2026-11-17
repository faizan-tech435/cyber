import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  FileText, Shield, Activity, ArrowRight, Clock, Zap,
  AlertCircle, Eye, Users
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useIncidents } from '@/contexts/IncidentContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatRelativeTime } from '@/lib/utils'
import { TREND_DATA } from '@/data/demoData'
import type { Incident } from '@/types'

// Compute monthly trend data from live incident records
function computeTrendData(incidents: Incident[]) {
  const months: { month: string; reported: number; resolved: number }[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), reported: 0, resolved: 0 })
  }
  incidents.forEach(inc => {
    const d = new Date(inc.created_at)
    const key = d.toLocaleDateString('en-US', { month: 'Short' })
    const m = months.find(x => x.month === key)
    if (m) m.reported++
    if (['resolved', 'closed'].includes(inc.status)) {
      const rd = new Date(inc.updated_at)
      const rkey = rd.toLocaleDateString('en-US', { month: 'short' })
      const rm = months.find(x => x.month === rkey)
      if (rm) rm.resolved++
    }
  })
  return months
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#10b981',
}

const DONUT_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981']

function KPICard({
  title, value, icon: Icon, trend, description, color
}: {
  title: string; value: number; icon: React.ElementType
  trend: number; description: string; color: string
}) {
  const positive = trend >= 0
  return (
    <Card className="relative overflow-hidden border-border hover:border-blue-500/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value.toLocaleString()}</div>
        <div className="text-sm font-medium text-foreground mb-0.5">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </CardContent>
      {/* subtle bottom border accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${color.replace('/10', '/60').replace('bg-', 'bg-')}`} />
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-foreground mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.name === 'reported' ? '#3b82f6' : '#10b981' }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function OverviewPage() {
  const { incidents, auditLogs, loading } = useIncidents()
  const { user } = useAuth()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const total = incidents.length
    const open = incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length
    const highSeverity = incidents.filter(i => ['high', 'critical'].includes(i.severity)).length
    const resolved = incidents.filter(i => ['resolved', 'closed'].includes(i.status)).length
    return { total, open, highSeverity, resolved }
  }, [incidents])

  const severityDist = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    incidents.forEach(i => { if (i.severity in counts) counts[i.severity]++ })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  }, [incidents])

  const categoryDist = useMemo(() => {
    const counts: Record<string, number> = {}
    incidents.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [incidents])

  const categoryLabels: Record<string, string> = {
    phishing_email: 'Phishing Email', suspicious_link: 'Suspicious Link',
    unauthorized_access: 'Unauth. Access', malware: 'Malware',
    data_exposure: 'Data Exposure', account_compromise: 'Acct. Compromise', other: 'Other',
  }

  const recentIncidents = incidents.slice(0, 6)

  if (loading) return <LoadingSpinner message="Loading security overview..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor incidents, track risks, and strengthen your organization's security posture.
          </p>
        </div>
        {user?.role !== 'employee' && (
          <Button variant="cyber" size="sm" onClick={() => navigate('/report')}>
            <Shield className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total Incidents" value={stats.total} icon={FileText}
          trend={12} description="All time reported incidents"
          color="bg-blue-500/10 text-blue-400" />
        <KPICard title="Open Incidents" value={stats.open} icon={AlertTriangle}
          trend={-8} description="Requiring action or review"
          color="bg-amber-500/10 text-amber-400" />
        <KPICard title="High Severity" value={stats.highSeverity} icon={Zap}
          trend={5} description="High and critical severity"
          color="bg-red-500/10 text-red-400" />
        <KPICard title="Resolved" value={stats.resolved} icon={CheckCircle2}
          trend={18} description="Successfully closed incidents"
          color="bg-emerald-500/10 text-emerald-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend chart - 2 cols */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Incident Trends</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Reported vs resolved over time</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-400" />Reported</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-400" />Resolved</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={incidents.length > 0 ? computeTrendData(incidents) : TREND_DATA} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 40% 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="reported" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="resolved" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground/60 text-right mt-1">* Includes sample demo data</p>
          </CardContent>
        </Card>

        {/* Severity donut */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Severity Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Breakdown by severity level</p>
          </CardHeader>
          <CardContent className="pt-0">
            {severityDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={severityDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" stroke="none">
                    {severityDist.map((entry, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11, color: 'hsl(215 20% 55%)' }}>{v}</span>} />
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'hsl(222 45% 9%)', border: '1px solid hsl(222 40% 16%)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No incidents yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent incidents table */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Incidents</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}
                className="text-xs text-blue-400 hover:text-blue-300 gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            {recentIncidents.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No incidents reported yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground pr-3">Ref ID</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground pr-3">Title</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground pr-3 hidden sm:table-cell">Severity</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground pr-3 hidden md:table-cell">Status</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Reported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentIncidents.map(inc => (
                    <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)}
                      className="cursor-pointer hover:bg-accent/40 transition-colors group">
                      <td className="py-2.5 pr-3">
                        <code className="text-[11px] text-muted-foreground font-mono">{inc.reference_id.split('-').slice(0,2).join('-')}</code>
                      </td>
                      <td className="py-2.5 pr-3 max-w-[200px]">
                        <span className="truncate block text-xs font-medium group-hover:text-blue-400 transition-colors">{inc.title}</span>
                        <CategoryBadge category={inc.category} className="mt-0.5 sm:hidden" />
                      </td>
                      <td className="py-2.5 pr-3 hidden sm:table-cell"><SeverityBadge severity={inc.severity} /></td>
                      <td className="py-2.5 pr-3 hidden md:table-cell"><StatusBadge status={inc.status} /></td>
                      <td className="py-2.5 text-xs text-muted-foreground hidden lg:table-cell">{formatRelativeTime(inc.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Activity feed + category dist */}
        <div className="space-y-4">
          {/* Category distribution */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2.5">
              {categoryDist.length === 0 ? (
                <div className="text-sm text-muted-foreground">No data yet</div>
              ) : categoryDist.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{categoryLabels[cat] || cat}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${(count / incidents.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Security Feed</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {auditLogs.slice(0, 5).map(log => {
                const actionColors: Record<string, string> = {
                  'incident.created':       'text-blue-400',
                  'incident.resolved':      'text-emerald-400',
                  'incident.assigned':      'text-cyan-400',
                  'incident.status_changed':'text-amber-400',
                  'note.added':             'text-violet-400',
                }
                const actionIcons: Record<string, React.ElementType> = {
                  'incident.created':       FileText,
                  'incident.resolved':      CheckCircle2,
                  'incident.assigned':      Users,
                  'incident.status_changed':Eye,
                  'note.added':             Activity,
                }
                const color = actionColors[log.action] || 'text-muted-foreground'
                const EntryIcon = actionIcons[log.action] || Activity

                return (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 rounded p-1 bg-secondary ${color}`}>
                      <EntryIcon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground font-medium leading-tight truncate">
                        {log.actor?.full_name || 'System'}
                      </div>
                      <div className="text-[11px] text-muted-foreground capitalize">
                        {log.action.replace('.', ' ').replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60">{formatRelativeTime(log.created_at)}</div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
