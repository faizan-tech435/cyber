import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, Lock, Mail, User, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_ACCOUNTS } from '@/data/demoData'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(true)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await signIn(email, password)
    if (err) { setError(err); setLoading(false) }
    else navigate('/')
  }

  const loginAsDemo = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoading(true)
    setError('')
    const { error: err } = await signIn(account.email, account.password)
    if (err) { setError(err); setLoading(false) }
    else navigate('/')
  }

  const roleBadge: Record<string, string> = {
    super_admin:      'bg-violet-500/20 text-violet-400 border-violet-500/30',
    security_analyst: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    employee:         'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  const roleLabels: Record<string, string> = {
    super_admin:      'Super Admin',
    security_analyst: 'Security Analyst',
    employee:         'Employee',
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[hsl(222_47%_8%)] border-r border-border p-12">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-blue-500/30 blur-md" />
            <div className="relative rounded-xl bg-blue-500/10 border border-blue-500/30 p-3">
              <Shield className="h-7 w-7 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-gradient">CyberSafe Desk</div>
            <div className="text-xs text-muted-foreground">Security starts with awareness</div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-foreground leading-tight mb-4">
            Enterprise-grade<br />
            <span className="text-gradient">incident management</span><br />
            for modern organizations.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Report, track, and resolve cybersecurity incidents with a centralized platform built for security teams, analysts, and employees.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Incidents Tracked', value: '12,400+' },
              { label: 'Avg Resolution', value: '4.2h' },
              { label: 'Organizations', value: '340+' },
              { label: 'Uptime SLA', value: '99.9%' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} CyberSafe Desk. Built for demonstration purposes.
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex flex-col justify-center flex-1 px-6 py-10 lg:px-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-2">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="font-bold text-gradient">CyberSafe Desk</div>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your security workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" variant="cyber" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign in <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-2">or try a demo account</div>
          </div>

          {/* Demo accounts */}
          <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
            <button
              onClick={() => setShowDemo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Demo Accounts
              </span>
              {showDemo ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {showDemo && (
              <div className="border-t border-border divide-y divide-border">
                {DEMO_ACCOUNTS.map(account => (
                  <div key={account.email} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{account.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{account.email}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleBadge[account.role]}`}>
                        {roleLabels[account.role]}
                      </span>
                      <button
                        onClick={() => loginAsDemo(account)}
                        disabled={loading}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                      >
                        Sign in →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Need an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
