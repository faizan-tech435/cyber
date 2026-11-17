import { Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function DemoBanner() {
  const { isDemo } = useAuth()
  if (!isDemo) return null

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-xs text-amber-400">
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span>
        <strong>Demo Mode</strong> — You are viewing sample data. Changes are session-only and will not persist after logout.
        Sign in with real Supabase credentials for full persistence.
      </span>
    </div>
  )
}
