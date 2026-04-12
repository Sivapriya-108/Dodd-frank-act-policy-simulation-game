// src/components/ui/Card.jsx
import { cn } from '../../lib/utils'

export function Card({ children, className, glow = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl shadow-black/35',
        glow && 'card-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-b border-zinc-700', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-zinc-100', className)} {...props}>
      {children}
    </h3>
  )
}
