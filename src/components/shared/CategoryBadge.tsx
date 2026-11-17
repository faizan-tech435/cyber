import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: string
  className?: string
}

const labels: Record<string, string> = {
  phishing_email:      'Phishing Email',
  suspicious_link:     'Suspicious Link',
  unauthorized_access: 'Unauthorized Access',
  malware:             'Malware',
  data_exposure:       'Data Exposure',
  account_compromise:  'Account Compromise',
  other:               'Other',
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
      'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      className
    )}>
      {labels[category] || category}
    </span>
  )
}

export function categoryLabel(category: string) {
  return labels[category] || category
}
