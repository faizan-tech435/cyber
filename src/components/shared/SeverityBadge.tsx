import { cn } from '@/lib/utils'
import { AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react'

interface SeverityBadgeProps {
  severity: string
  showIcon?: boolean
  className?: string
}

const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  critical: { label: 'Critical', className: 'severity-critical', icon: Zap },
  high: { label: 'High', className: 'severity-high', icon: AlertCircle },
  medium: { label: 'Medium', className: 'severity-medium', icon: AlertTriangle },
  low: { label: 'Low', className: 'severity-low', icon: Info },
}

export function SeverityBadge({ severity, showIcon = true, className }: SeverityBadgeProps) {
  const cfg = config[severity.toLowerCase()] || config.low
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', cfg.className, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {cfg.label}
    </span>
  )
}
