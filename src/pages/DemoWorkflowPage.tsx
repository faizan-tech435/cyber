import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckSquare, Square, Shield, User, Search, BarChart3,
  ClipboardList, ArrowRight, RefreshCw, Info, LogIn,
  CheckCircle2, Circle, ChevronDown, ChevronUp
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DEMO_ACCOUNTS } from '@/data/demoData'
import { cn } from '@/lib/utils'

// 12-step demo workflow from the master spec
const DEMO_STEPS = [
  {
    id: 1,
    role: 'employee',
    title: 'Sign in as Employee',
    detail: 'Use the demo Employee account (Sam Rivera) on the login page.',
    action: '/login',
    actionLabel: 'Go to Login',
    icon: User,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 2,
    role: 'employee',
    title: 'Submit a fictional phishing incident',
    detail: 'Navigate to Report Incident. Fill in a phishing email title, select "Phishing Email" category, set severity to High, and submit.',
    action: '/report',
    actionLabel: 'Open Report Form',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 3,
    role: 'employee',
    title: 'Note the unique incident reference ID',
    detail: 'After submission, a reference ID such as INC-XXXXX-XXXX is generated. Copy and save it — you will use it to track the incident.',
    action: '/incidents',
    actionLabel: 'View My Incidents',
    icon: ClipboardList,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 4,
    role: 'analyst',
    title: 'Sign in as Security Analyst',
    detail: 'Sign out and sign back in as Jordan Lee (analyst@cybersafe.demo). Analysts can review all submitted incidents.',
    action: '/login',
    actionLabel: 'Go to Login',
    icon: Search,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 5,
    role: 'analyst',
    title: 'Review the submitted incident',
    detail: 'Open Incident Reports, find the phishing incident just submitted. Click it to open the full detail view.',
    action: '/incidents',
    actionLabel: 'Open Incidents',
    icon: Search,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 6,
    role: 'analyst',
    title: 'Assign the incident to an analyst',
    detail: 'In the incident detail view, use the "Assign Analyst" dropdown on the right panel to assign it to Jordan Lee.',
    action: '/incidents',
    actionLabel: 'Open Incidents',
    icon: User,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 7,
    role: 'analyst',
    title: 'Add investigation notes',
    detail: 'Scroll to Investigation Notes, type a note describing what you observed (e.g. "Phishing domain confirmed, DNS blocking applied"), then click Add Note.',
    action: '/incidents',
    actionLabel: 'Open Incidents',
    icon: ClipboardList,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 8,
    role: 'analyst',
    title: 'Change the incident status',
    detail: 'Use the "Update Status" dropdown to change the status from Submitted → Under Review → Investigating.',
    action: '/incidents',
    actionLabel: 'Open Incidents',
    icon: RefreshCw,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 9,
    role: 'analyst',
    title: 'Resolve the incident with a summary',
    detail: 'Expand the "Resolve Incident" section, type a resolution summary, and click Mark as Resolved. Status updates to Resolved.',
    action: '/incidents',
    actionLabel: 'Open Incidents',
    icon: CheckCircle2,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 10,
    role: 'admin',
    title: 'Sign in as Administrator',
    detail: 'Sign out and sign back in as Alex Morgan (admin@cybersafe.demo). Admins have full access to all features.',
    action: '/login',
    actionLabel: 'Go to Login',
    icon: Shield,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 11,
    role: 'admin',
    title: 'View the updated Overview dashboard',
    detail: 'The Overview dashboard should now reflect your new incident. KPI cards, charts, and the recent incidents table update from live data.',
    action: '/',
    actionLabel: 'Open Overview',
    icon: BarChart3,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 12,
    role: 'admin',
    title: 'Review Analytics and Audit Logs',
    detail: 'Navigate to Analytics to see charts and CSV export. Then open Audit Logs to see every action taken — incident created, assigned, status changed, resolved.',
    action: '/analytics',
    actionLabel: 'Open Analytics',
    icon: ClipboardList,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
]

const ROLE_BADGE: Record<string, string> = {
  employee: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  analyst:  'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  admin:    'bg-violet-500/15 text-violet-400 border border-violet-500/30',
}
const ROLE_LABEL: Record<string, string> = {
  employee: 'Employee',
  analyst:  'Security Analyst',
  admin:    'Administrator',
}

export function DemoWorkflowPage() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [loggingIn, setLoggingIn] = useState<string | null>(null)
  const [showCreds, setShowCreds] = useState(false)

  const toggle = (id: number) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const completedCount = Object.values(checked).filter(Boolean).length
  const pct = Math.round((completedCount / DEMO_STEPS.length) * 100)

  const quickLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoggingIn(account.email)
    await signIn(account.email, account.password)
    setLoggingIn(null)
    navigate('/')
  }

  const resetChecklist = () => setChecked({})

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              Demo Mode
            </span>
            <span className="text-xs text-muted-foreground">EduQual Level 3 — Cloud Cyber Security</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Demo Workflow</h1>
          <p className="text-sm text-muted-foreground mt-1">
            12-step examiner script. Tick each step as you demonstrate it.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetChecklist} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Reset
        </Button>
      </div>

      {/* Progress bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-foreground">{completedCount} of {DEMO_STEPS.length} steps completed</span>
            <span className={cn('font-bold', pct === 100 ? 'text-emerald-400' : 'text-blue-400')}>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500',
                pct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <div className="flex items-center gap-2 mt-3 text-sm text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Full workflow demonstrated!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick login panel */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-2">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowCreds(v => !v)}
          >
            <CardTitle className="text-sm flex items-center gap-2">
              <LogIn className="h-4 w-4 text-blue-400" />
              Quick Sign-In — Demo Accounts
            </CardTitle>
            {showCreds
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {showCreds && (
          <CardContent className="pt-0 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              Click a button to instantly sign in as that role. All data is fictional.
            </p>
            {DEMO_ACCOUNTS.map(account => (
              <div key={account.email}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-2.5">
                <div>
                  <div className="text-sm font-semibold text-foreground">{account.name}</div>
                  <div className="text-xs text-muted-foreground">{account.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold border',
                    account.role === 'super_admin' ? ROLE_BADGE.admin :
                    account.role === 'security_analyst' ? ROLE_BADGE.analyst : ROLE_BADGE.employee
                  )}>
                    {account.role === 'super_admin' ? 'Admin' :
                     account.role === 'security_analyst' ? 'Analyst' : 'Employee'}
                  </span>
                  <Button size="sm" variant="cyber" className="h-7 text-xs"
                    disabled={loggingIn === account.email}
                    onClick={() => quickLogin(account)}>
                    {loggingIn === account.email ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : <>Sign in <ArrowRight className="h-3 w-3 ml-1" /></>}
                  </Button>
                </div>
              </div>
            ))}
            {user && (
              <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
                Currently signed in as: <strong>{user.full_name}</strong> ({user.role.replace('_', ' ')})
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        {DEMO_STEPS.map(step => {
          const done = checked[step.id]
          const Icon = step.icon
          return (
            <div key={step.id}
              className={cn(
                'rounded-xl border transition-all duration-200',
                done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card hover:border-border/70'
              )}>
              <div className="flex items-start gap-4 p-4">
                {/* Checkbox */}
                <button onClick={() => toggle(step.id)} className="shrink-0 mt-0.5">
                  {done
                    ? <CheckSquare className="h-5 w-5 text-emerald-400" />
                    : <Square className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />}
                </button>

                {/* Icon */}
                <div className={cn('rounded-lg border p-2 shrink-0', step.bg)}>
                  <Icon className={cn('h-4 w-4', step.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className={cn(
                      'text-sm font-semibold',
                      done ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}>
                      Step {step.id}. {step.title}
                    </span>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', ROLE_BADGE[step.role])}>
                      {ROLE_LABEL[step.role]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                </div>

                {/* Navigate button */}
                <Button variant="ghost" size="sm"
                  className="shrink-0 h-7 text-xs text-blue-400 hover:text-blue-300"
                  onClick={() => navigate(step.action)}>
                  {step.actionLabel}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info footer */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
              <p><strong className="text-foreground">Demo Mode</strong> — all data is fictional and session-only. Changes reset on logout.</p>
              <p>For persistent data, connect a real Supabase project using <code className="font-mono text-blue-400">.env</code> credentials and run <code className="font-mono text-blue-400">supabase/schema.sql</code> + <code className="font-mono text-blue-400">supabase/seed.sql</code>.</p>
              <p>This page is accessible via <code className="font-mono text-blue-400">/demo</code> without authentication — share the URL with your examiner.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
