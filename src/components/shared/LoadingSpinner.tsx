import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  message?: string
  className?: string
}

export function LoadingSpinner({ fullScreen, message, className }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="relative rounded-full bg-blue-500/10 border border-blue-500/30 p-4">
            <Shield className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="text-gradient text-xl font-bold mb-1">CyberSafe Desk</div>
        {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
        <div className="flex gap-1 mt-4">
          {[0,1,2].map(i => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}
