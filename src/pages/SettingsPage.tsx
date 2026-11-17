import { useState } from 'react'
import { User, Bell, Shield, Building, Info, CheckCircle2, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from '@/components/shared/UserAvatar'

const API_INTEGRATIONS = [
  { name: 'Slack Notifications', status: 'simulated', desc: 'Send incident alerts to a Slack channel', color: 'text-emerald-400' },
  { name: 'Email SMTP', status: 'simulated', desc: 'Send email notifications on critical incidents', color: 'text-emerald-400' },
  { name: 'PagerDuty', status: 'not_configured', desc: 'On-call alerting for critical incidents', color: 'text-muted-foreground' },
  { name: 'Jira Integration', status: 'not_configured', desc: 'Create Jira tickets from incidents automatically', color: 'text-muted-foreground' },
]

export function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState({ fullName: user?.full_name || '', department: user?.department || '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({ email: true, critical: true, assignment: true, resolved: false, weekly: true })

  const handleSaveProfile = async () => {
    setSaving(true)
    await updateProfile({ full_name: profile.fullName, department: profile.department || null })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin', security_analyst: 'Security Analyst', employee: 'Employee'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, notifications, and application preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Integrations</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Profile Settings</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <UserAvatar user={user} size="lg" />
                <div>
                  <div className="text-sm font-semibold text-foreground">{user?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                  <div className="mt-1 text-xs text-blue-400 font-medium">{roleLabel[user?.role || ''] || user?.role}</div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. Finance, IT, HR" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={user?.email || ''} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed from this panel.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input value={roleLabel[user?.role || ''] || ''} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Role changes require admin action.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="cyber" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : saved ? <><CheckCircle2 className="h-4 w-4 mr-1.5" />Saved</> : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border mt-4">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                <div>
                  <div className="text-sm font-medium text-foreground">Password</div>
                  <div className="text-xs text-muted-foreground">Last changed: Not available in demo mode</div>
                </div>
                <Button variant="outline" size="sm" disabled>Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                <div>
                  <div className="text-sm font-medium text-foreground">Two-Factor Authentication</div>
                  <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                </div>
                <Button variant="outline" size="sm" disabled>Configure MFA</Button>
              </div>
              <p className="text-xs text-muted-foreground">Password and MFA changes are managed via your Supabase auth provider in production.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email',      label: 'Email Notifications',         desc: 'Receive incident updates via email' },
                { key: 'critical',   label: 'Critical Incident Alerts',    desc: 'Immediate alerts for critical severity incidents' },
                { key: 'assignment', label: 'Assignment Notifications',     desc: 'Notify when an incident is assigned to you' },
                { key: 'resolved',   label: 'Resolved Incident Updates',    desc: 'Notify when an incident you reported is resolved' },
                { key: 'weekly',     label: 'Weekly Security Digest',       desc: 'Weekly summary of incidents and security metrics' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch
                    checked={notifs[item.key as keyof typeof notifs]}
                    onCheckedChange={v => setNotifs(n => ({ ...n, [item.key]: v }))}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Notification delivery requires a connected email provider. Preferences are saved locally in demo mode.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Integrations */}
        <TabsContent value="api">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" />API Integrations</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Connect CyberSafe Desk to external notification and ticketing systems. Credentials are stored as server-side environment variables — never exposed to the frontend.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {API_INTEGRATIONS.map(api => (
                <div key={api.name} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{api.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{api.desc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${api.status === 'simulated' ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground/30'}`} />
                      <span className={`text-xs font-medium ${api.color}`}>
                        {api.status === 'simulated' ? 'Simulated' : 'Not Configured'}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" disabled={api.status !== 'not_configured'}>
                      {api.status === 'simulated' ? 'Configured' : 'Configure'}
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="text-sm font-semibold text-blue-400 mb-2">How Real API Integration Works</div>
                <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal pl-4">
                  <li>Add your API credentials to server-side environment variables (never in frontend code)</li>
                  <li>Create a Supabase Edge Function or backend handler to call the external API</li>
                  <li>Trigger the function via a database webhook when incidents are created or updated</li>
                  <li>The function sends a notification payload to Slack, PagerDuty, or your SMTP server</li>
                  <li>Monitor the connection status and last sync time from this panel</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4" />Application Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Application', value: 'CyberSafe Desk' },
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Environment', value: 'Demo / Development' },
                  { label: 'Frontend', value: 'React 18 + TypeScript' },
                  { label: 'Build Tool', value: 'Vite 5' },
                  { label: 'Styling', value: 'Tailwind CSS' },
                  { label: 'UI Components', value: 'shadcn/ui (Radix UI)' },
                  { label: 'Charts', value: 'Recharts' },
                  { label: 'Backend', value: 'Supabase (PostgreSQL)' },
                  { label: 'Auth', value: 'Supabase Auth' },
                  { label: 'Icons', value: 'Lucide React' },
                  { label: 'Deployment', value: 'Vercel' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-lg border border-border bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                    <div className="text-sm font-medium text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground leading-relaxed">
                CyberSafe Desk is a demonstration cybersecurity incident management and awareness platform.
                It is intended for academic and professional demonstration purposes.
                All demo data is clearly labeled as sample data. The application is built with
                enterprise-grade architecture and security patterns including Row Level Security (RLS),
                role-based access control, and secure credential handling.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
