import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, ChevronRight, Settings, LogOut, User, Shield } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useIncidents } from '@/contexts/IncidentContext'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'

const routeMeta: Record<string, { title: string; breadcrumb: string[] }> = {
  '/':               { title: 'Security Overview',    breadcrumb: ['Dashboard', 'Overview'] },
  '/incidents':      { title: 'Incident Reports',     breadcrumb: ['Dashboard', 'Incidents'] },
  '/report':         { title: 'Report an Incident',   breadcrumb: ['Dashboard', 'Report Incident'] },
  '/investigation':  { title: 'Investigation Center', breadcrumb: ['Dashboard', 'Investigation'] },
  '/analytics':      { title: 'Analytics & Reports',  breadcrumb: ['Dashboard', 'Analytics'] },
  '/awareness':      { title: 'Security Awareness',   breadcrumb: ['Dashboard', 'Awareness'] },
  '/knowledge-base': { title: 'Knowledge Base',       breadcrumb: ['Dashboard', 'Knowledge Base'] },
  '/team':           { title: 'Team Management',      breadcrumb: ['Dashboard', 'Team'] },
  '/audit-logs':     { title: 'Audit Logs',           breadcrumb: ['Dashboard', 'Audit Logs'] },
  '/settings':       { title: 'Settings',             breadcrumb: ['Dashboard', 'Settings'] },
}

interface TopNavProps {
  onMenuClick: () => void
  sidebarCollapsed?: boolean
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useIncidents()

  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const meta = routeMeta[pathname] || { title: 'CyberSafe Desk', breadcrumb: ['Dashboard'] }
  const unreadCount = notifications.filter(n => !n.read).length

  const notifTypeColors: Record<string, string> = {
    critical:   'text-red-400',
    assignment: 'text-blue-400',
    success:    'text-emerald-400',
    info:       'text-cyan-400',
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur-sm px-4 gap-4">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden rounded-lg p-1.5 hover:bg-accent text-muted-foreground">
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb + Title */}
      <div className="flex-1 min-w-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
          {meta.breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <span className={i === meta.breadcrumb.length - 1 ? 'text-blue-400' : ''}>{crumb}</span>
            </span>
          ))}
        </div>
        <h1 className="text-sm font-semibold text-foreground truncate">{meta.title}</h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center">
        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/incidents?q=${encodeURIComponent(searchQuery)}`)
                  setSearchQuery('')
                  setShowSearch(false)
                }
                if (e.key === 'Escape') { setShowSearch(false); setSearchQuery('') }
              }}
              onBlur={() => { if (!searchQuery) setShowSearch(false) }}
              placeholder="Search incidents..."
              className="h-8 w-56 rounded-md border border-border bg-secondary pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="hidden sm:inline-block rounded border border-border px-1 text-[10px]">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Date */}
      <div className="hidden lg:block text-xs text-muted-foreground shrink-0">{today}</div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setShowNotifs(v => !v); setShowProfile(false) }}
          className="relative rounded-lg p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="h-4.5 w-4.5 h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="font-semibold text-sm">Notifications</div>
              {unreadCount > 0 && (
                <button onClick={markAllNotificationsRead} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id)
                    if (n.incident_id) { navigate(`/incidents/${n.incident_id}`); setShowNotifs(false) }
                  }}
                  className={cn(
                    'px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition-colors',
                    !n.read && 'bg-blue-500/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />}
                    <div className={cn('flex-1', n.read && 'ml-3.5')}>
                      <div className={cn('text-xs font-semibold', notifTypeColors[n.type] || 'text-foreground')}>{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(n.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile menu */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setShowProfile(v => !v); setShowNotifs(false) }}
          className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors"
        >
          <UserAvatar user={user} size="sm" />
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium leading-none">{user?.full_name}</div>
          </div>
        </button>

        {showProfile && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-border">
              <div className="font-semibold text-sm">{user?.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <div className="p-1">
              <button onClick={() => { navigate('/settings'); setShowProfile(false) }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                <User className="h-4 w-4 text-muted-foreground" /> Profile Settings
              </button>
              <button onClick={() => { navigate('/settings'); setShowProfile(false) }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                <Settings className="h-4 w-4 text-muted-foreground" /> Settings
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={async () => { setShowProfile(false); await signOut(); navigate('/login') }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
