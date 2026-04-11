// src/components/ui/Progress.jsx
import { cn, getMetricBarColor } from '../../lib/utils'

export function Progress({ value, max = 100, inverted = false, className, showLabel = false, label }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const colorClass = getMetricBarColor(value, inverted)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-300 font-medium">{value}</span>
        </div>
      )}
      <div className="metric-bar">
        <div 
          className={cn('metric-bar-fill', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
