// src/components/ui/Button.jsx
import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-gradient-to-r from-government-500 via-government-600 to-investor-600 hover:from-government-400 hover:via-government-500 hover:to-investor-500 text-zinc-950 shadow-lg shadow-government-900/30',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600',
  danger: 'bg-gradient-to-r from-investor-600 to-citizen-700 hover:from-investor-500 hover:to-citizen-600 text-zinc-950 shadow-lg shadow-black/20',
  success: 'bg-gradient-to-r from-bank-500 to-bank-700 hover:from-bank-400 hover:to-bank-600 text-zinc-950 shadow-lg shadow-black/20',
  ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-200',
  government: 'bg-gradient-to-r from-government-500 to-government-700 hover:from-government-400 hover:to-government-600 text-zinc-950 shadow-lg shadow-black/20',
  bank: 'bg-gradient-to-r from-bank-500 to-bank-700 hover:from-bank-400 hover:to-bank-600 text-zinc-950 shadow-lg shadow-black/20',
  investor: 'bg-gradient-to-r from-investor-500 to-investor-700 hover:from-investor-400 hover:to-investor-600 text-zinc-950 shadow-lg shadow-black/20',
  citizen: 'bg-gradient-to-r from-citizen-500 to-citizen-700 hover:from-citizen-400 hover:to-citizen-600 text-zinc-950 shadow-lg shadow-black/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg'
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  disabled,
  loading,
  ...props 
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-government-400 focus:ring-offset-2 focus:ring-offset-zinc-950',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
