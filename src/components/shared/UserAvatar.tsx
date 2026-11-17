import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface UserAvatarProps {
  user: Partial<Profile> | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function hashColor(name: string) {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return colors[hash % colors.length]
}

const sizeMap = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-11 w-11 text-base' }

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const name = user?.full_name || user?.email || '?'
  const initials = getInitials(name)
  const gradient = hashColor(name)

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br shrink-0',
      gradient, sizeMap[size], className
    )}>
      {initials}
    </div>
  )
}
