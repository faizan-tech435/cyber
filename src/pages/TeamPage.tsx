import { useState } from 'react'
import { Users, Shield, User, Mail, Building, Edit2, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_PROFILES } from '@/data/demoData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Profile } from '@/types'

const ROLE_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  super_admin:      { label: 'Super Admin',       color: 'bg-violet-500/15 text-violet-400 border-violet-500/30', desc: 'Full access to all incidents, users, and settings' },
  security_analyst: { label: 'Security Analyst',  color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',     desc: 'Can review, investigate, and resolve incidents' },
  employee:         { label: 'Employee',           color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',     desc: 'Can submit and view their own incident reports' },
}

export function TeamPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Profile[]>(DEMO_PROFILES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  const isAdmin = user?.role === 'super_admin'
  const canView = user?.role === 'super_admin' || user?.role === 'security_analyst'

  if (!canView) {
    return (
      <EmptyState icon={Shield} title="Access Restricted"
        description="Team management is only accessible to administrators and security analysts." />
    )
  }

  const handleSaveRole = (memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: editRole as Profile['role'] } : m))
    setEditingId(null)
    setSaved(memberId)
    setTimeout(() => setSaved(null), 2000)
  }

  const byRole: Record<string, Profile[]> = { super_admin: [], security_analyst: [], employee: [] }
  members.forEach(m => { if (m.role in byRole) byRole[m.role].push(m) })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members, roles, and access permissions.
          </p>
        </div>
        {isAdmin && (
          <Button variant="cyber" size="sm" disabled>
            <Plus className="h-4 w-4 mr-1.5" /> Invite Member
          </Button>
        )}
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <Card key={role} className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground mb-1">{byRole[role]?.length || 0}</div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
                {cfg.label}
              </span>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{cfg.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members list */}
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {members.map(member => {
              const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.employee
              const isEditing = editingId === member.id
              return (
                <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                  <UserAvatar user={member} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{member.full_name}</span>
                      {member.id === user?.id && (
                        <span className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">You</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />{member.email}
                      </span>
                      {member.department && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building className="h-3 w-3" />{member.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Select value={editRole} onValueChange={setEditRole}>
                          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="security_analyst">Security Analyst</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="cyber" className="h-8 text-xs" onClick={() => handleSaveRole(member.id)}>Save</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleCfg.color}`}>
                          {saved === member.id ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                          {roleCfg.label}
                        </span>
                        {isAdmin && member.id !== user?.id && (
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => { setEditingId(member.id); setEditRole(member.role) }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permissions matrix */}
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-base">Role Permissions Matrix</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Permission</th>
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                  <th key={role} className="px-6 py-3 text-center text-xs font-semibold">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${cfg.color}`}>{cfg.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { action: 'Submit incident reports', admin: true, analyst: true, employee: true },
                { action: 'View own incident reports', admin: true, analyst: true, employee: true },
                { action: 'View all incident reports', admin: true, analyst: true, employee: false },
                { action: 'Assign incidents to analysts', admin: true, analyst: false, employee: false },
                { action: 'Change incident status', admin: true, analyst: true, employee: false },
                { action: 'Change incident severity', admin: true, analyst: true, employee: false },
                { action: 'Add investigation notes', admin: true, analyst: true, employee: false },
                { action: 'Resolve incidents', admin: true, analyst: true, employee: false },
                { action: 'View audit logs', admin: true, analyst: true, employee: false },
                { action: 'Manage team members', admin: true, analyst: false, employee: false },
                { action: 'View analytics', admin: true, analyst: true, employee: false },
              ].map(row => (
                <tr key={row.action}>
                  <td className="px-6 py-3 text-sm text-foreground">{row.action}</td>
                  {[row.admin, row.analyst, row.employee].map((has, i) => (
                    <td key={i} className="px-6 py-3 text-center">
                      {has
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                        : <span className="text-muted-foreground/30">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
