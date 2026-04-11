// src/components/ui/Badge.jsx
import { cn } from '../../lib/utils'
import { ROLE_COLORS } from '../../lib/constants'

export function Badge({ children, variant = 'default', role, className, ...props }) {
  const roleClass = role ? `role-badge-${role}` : ''
  
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-600',
    success: 'bg-green-900/50 text-green-400 border-green-700',
    warning: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
    danger: 'bg-red-900/50 text-red-400 border-red-700',
    info: 'bg-blue-900/50 text-blue-400 border-blue-700'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        role ? roleClass : variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
