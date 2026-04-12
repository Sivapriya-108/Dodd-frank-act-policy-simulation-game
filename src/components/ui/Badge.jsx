// src/components/ui/Badge.jsx
import { cn } from '../../lib/utils'
import { ROLE_COLORS } from '../../lib/constants'

export function Badge({ children, variant = 'default', role, className, ...props }) {
  const roleClass = role ? `role-badge-${role}` : ''
  
  const variants = {
    default: 'bg-zinc-800 text-zinc-100 border-zinc-600',
    success: 'bg-bank-700 text-zinc-950 border-bank-500',
    warning: 'bg-government-700 text-zinc-950 border-government-500',
    danger: 'bg-investor-700 text-zinc-950 border-investor-500',
    info: 'bg-citizen-700 text-zinc-950 border-citizen-500'
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
