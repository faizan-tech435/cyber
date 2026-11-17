import { useState, useMemo } from 'react'
import { Download, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts'
import { useIncidents } from '@/contexts/IncidentContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { downloadCSV } from '@/lib/utils'
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
    const key = d.toLocaleDateString('en-US', { month: 'short' })
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

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
const CATEGORY_LABELS: Record<string, string> = {
  phishing_email: 'Phishing', suspicious_link: 'Susp. Link',
  unauthorized_access: 'Unauth.', malware: 'Malware',
  data_exposure: 'Data Exp.', account_compromise: 'Acct Comp.', other: 'Other',
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; fill?: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-foreground mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.fill || '#3b82f6' }} />
          <span className="text-muted-foreground capitalize">{String(p.name).replace(/_/g, ' ')}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const { incidents, loading } = useIncidents()
  const [dateRange, setDateRange] = useState('all')

  const stats = useMemo(() => {
    const total = incidents.length
    const resolved = incidents.filter(i => ['resolved', 'closed'].includes(i.status)).length
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0

    const resolvedWithTime = incidents.filter(i => ['resolved', 'closed'].includes(i.status))
    const avgResolutionHrs = resolvedWithTime.length
      ? Math.round(resolvedWithTime.reduce((acc, i) => {
          const diff = new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()
          return acc + diff / 3600000
        }, 0) / resolvedWithTime.length)
      : 0

    return { total, resolved, resolutionRate, avgResolutionHrs }
  }, [incidents])

  const severityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    incidents.forEach(i => { if (i.severity in counts) counts[i.severity]++ })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), value
    })).filter(d => d.value > 0)
  }, [incidents])

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    incidents.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({
      name: CATEGORY_LABELS[name] || name, value
    })).sort((a, b) => b.value - a.value)
  }, [incidents])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    incidents.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, ' '), value
    }))
  }, [incidents])

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; total: number; resolved: number; critical: number }> = {}
    incidents.forEach(i => {
      const d = new Date(i.created_at)
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (!months[key]) months[key] = { month: key, total: 0, resolved: 0, critical: 0 }
      months[key].total++
      if (['resolved', 'closed'].includes(i.status)) months[key].resolved++
      if (i.severity === 'critical') months[key].critical++
    })
    return Object.values(months).slice(-6)
  }, [incidents])

  const handleExport = () => {
    const rows = incidents.map(i => ({
      reference_id: i.reference_id,
      title: i.title,
      category: i.category,
      severity: i.severity,
      status: i.status,
      reporter: i.reporter?.full_name || '',
      assigned_to: i.assignee?.full_name || '',
      created_at: i.created_at,
      updated_at: i.updated_at,
    }))
    downloadCSV(rows, 'cybersafe-desk-incidents.csv')
  }

  if (loading) return <LoadingSpinner message="Loading analytics..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Incident trends, severity distribution, and security metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: stats.total, icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Resolution Rate', value: `${stats.resolutionRate}%`, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Avg Resolution', value: `${stats.avgResolutionHrs}h`, icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(item => (
          <Card key={item.label} className="border-border">
            <CardContent className="p-5">
              <div className={`rounded-lg ${item.bg} p-2.5 w-fit mb-3`}>
                <item.icon className={`h-4.5 w-4.5 h-5 w-5 ${item.color}`} />
              </div>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Reported vs resolved per month</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={incidents.length > 0 ? computeTrendData(incidents) : TREND_DATA} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 40% 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="reported" stroke="#3b82f6" fill="url(#reported)" strokeWidth={2} name="reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolved)" strokeWidth={2} name="resolved" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground/60 text-right mt-1">* Includes sample demo data</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Severity Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Breakdown by severity level</p>
          </CardHeader>
          <CardContent className="pt-0">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {severityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(222 45% 9%)', border: '1px solid hsl(222 40% 16%)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Incidents by Category</CardTitle>
            <p className="text-xs text-muted-foreground">Distribution across incident types</p>
          </CardHeader>
          <CardContent className="pt-0">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 40% 16%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="incidents">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status Overview</CardTitle>
            <p className="text-xs text-muted-foreground">Incidents grouped by current status</p>
          </CardHeader>
          <CardContent className="pt-0">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 40% 16%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} name="incidents">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department breakdown */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Department-Level Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">Incidents grouped by affected system/department</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Department / System', 'Total', 'Critical', 'High', 'Resolved', 'Open'].map(h => (
                    <th key={h} className="pb-2.5 text-left text-xs font-semibold text-muted-foreground pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(() => {
                  const depts: Record<string, { total: number; critical: number; high: number; resolved: number; open: number }> = {}
                  incidents.forEach(i => {
                    const dept = i.affected_system?.split('/')[0]?.trim() || i.affected_system || 'Unknown'
                    if (!depts[dept]) depts[dept] = { total: 0, critical: 0, high: 0, resolved: 0, open: 0 }
                    depts[dept].total++
                    if (i.severity === 'critical') depts[dept].critical++
                    if (i.severity === 'high') depts[dept].high++
                    if (['resolved', 'closed'].includes(i.status)) depts[dept].resolved++
                    else depts[dept].open++
                  })
                  return Object.entries(depts).slice(0, 8).map(([dept, d]) => (
                    <tr key={dept}>
                      <td className="py-2.5 pr-4 font-medium text-foreground max-w-[200px] truncate">{dept}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{d.total}</td>
                      <td className="py-2.5 pr-4"><span className="text-red-400 font-medium">{d.critical}</span></td>
                      <td className="py-2.5 pr-4"><span className="text-orange-400 font-medium">{d.high}</span></td>
                      <td className="py-2.5 pr-4"><span className="text-emerald-400 font-medium">{d.resolved}</span></td>
                      <td className="py-2.5"><span className="text-amber-400 font-medium">{d.open}</span></td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
