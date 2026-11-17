import { cn } from '@/lib/utils'
import { Clock, Eye, Search, CheckCircle, Archive, Send } from 'lucide-react'

interface StatusBadgeProps {
  status: string
  showIcon?: boolean
  className?: string
}

const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  submitted:     { label: 'Submitted',     className: 'status-submitted',    icon: Send },
  under_review:  { label: 'Under Review',  className: 'status-review',       icon: Eye },
  investigating: { label: 'Investigating', className: 'status-investigating', icon: Search },
  resolved:      { label: 'Resolved',      className: 'status-resolved',      icon: CheckCircle },
  closed:        { label: 'Closed',        className: 'status-closed',        icon: Archive },
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const cfg = config[status.toLowerCase()] || config.submitted
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', cfg.className, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {cfg.label}
    </span>
  )
}
