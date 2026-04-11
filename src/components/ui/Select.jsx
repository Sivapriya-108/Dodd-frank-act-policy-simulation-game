// src/components/ui/Select.jsx
import { cn } from '../../lib/utils'

export function Select({ options, value, onChange, placeholder, className, ...props }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg',
        'text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'appearance-none cursor-pointer',
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>{placeholder}</option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
