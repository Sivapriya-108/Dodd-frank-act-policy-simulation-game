// src/components/game/RoundTimer.jsx
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { calculateTimeRemaining } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function RoundTimer({ startedAt, duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining(startedAt, duration))

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(startedAt, duration)
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt, duration, onComplete])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const isUrgent = timeLeft <= 10
  const isWarning = timeLeft <= 30 && !isUrgent

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-lg font-mono',
      isUrgent && 'bg-red-900/50 text-red-400 animate-pulse',
      isWarning && 'bg-yellow-900/50 text-yellow-400',
      !isUrgent && !isWarning && 'bg-slate-800 text-slate-300'
    )}>
      <Clock className="w-5 h-5" />
      <span className="text-xl font-bold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
