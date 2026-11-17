import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Shield, LayoutDashboard, FileText, FilePlus, Search,
  BarChart3, BookOpen, Database, Users, ClipboardList,
  Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight,
  Bell, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { to: '/',                label: 'Overview',           icon: LayoutDashboard },
  { to: '/incidents',       label: 'Incident Reports',   icon: FileText },
  { to: '/report',          label: 'Report Incident',    icon: FilePlus },
  { to: '/investigation',   label: 'Investigation',      icon: Search },
  { to: '/analytics',       label: 'Analytics',          icon: BarChart3 },
  { to: '/awareness',       label: 'Security Awareness', icon: BookOpen },
  { to: '/knowledge-base',  label: 'Knowledge Base',     icon: Database },
  { to: '/team',            label: 'Team Management',    icon: Users },
  { to: '/audit-logs',      label: 'Audit Logs',         icon: ClipboardList },
  { to: '/settings',        label: 'Settings',           icon: Settings },
]

const adminOnlyItems = ['/team', '/audit-logs']
const analystItems = ['/investigation', '/audit-logs']

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const canAccess = (path: string) => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    if (user.role === 'security_analyst') return !adminOnlyItems.includes(path) || analystItems.includes(path)
    // employee
    return ![...adminOnlyItems, '/investigation'].includes(path)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    security_analyst: 'Security Analyst',
    employee: 'Employee',
  }

  const roleColor: Record<string, string> = {
    super_admin: 'text-violet-400',
    security_analyst: 'text-cyan-400',
    employee: 'text-blue-400',
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-[hsl(222_47%_8%)] border-r border-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
        'lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className={cn(
          'flex items-center border-b border-border shrink-0',
          collapsed ? 'justify-center p-4' : 'gap-3 px-5 py-4'
        )}>
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-lg bg-blue-500/20 blur-sm" />
            <div className="relative rounded-lg bg-blue-500/10 border border-blue-500/30 p-1.5">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-gradient">CyberSafe Desk</div>
              <div className="text-[10px] text-muted-foreground">Security starts with awareness</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.filter(item => canAccess(item.to)).map(({ to, label, icon: Icon }) => (
            <Tooltip key={to} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={onMobileClose}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', collapsed && 'h-5 w-5')} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border p-2 space-y-1 shrink-0">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/settings')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all',
                  collapsed && 'justify-center px-2'
                )}
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Help & Support</span>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Help & Support</TooltipContent>}
          </Tooltip>

          {!collapsed && user && (
            <div className="mt-2 rounded-lg border border-border bg-secondary/50 p-2.5">
              <div className="flex items-center gap-2.5">
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{user.full_name}</div>
                  <div className={cn('text-[10px] font-medium', roleColor[user.role] || 'text-muted-foreground')}>
                    {roleLabel[user.role] || user.role}
                  </div>
                </div>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button onClick={handleSignOut} className="rounded p-1 hover:bg-destructive/20 hover:text-destructive transition-colors">
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Sign out</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {collapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleSignOut} className="flex w-full justify-center rounded-lg px-2 py-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all">
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all mt-1"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  )
}
