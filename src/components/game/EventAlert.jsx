// src/components/game/EventAlert.jsx
import { AlertTriangle, TrendingUp, Vote, Newspaper, Cpu, Globe, Shield, Minus } from 'lucide-react'
import { EVENTS } from '../../lib/constants'
import { cn } from '../../lib/utils'

const eventIcons = {
  financial_boom: TrendingUp,
  market_crash_warning: AlertTriangle,
  election_pressure: Vote,
  media_scandal: Newspaper,
  tech_innovation: Cpu,
  international_crisis: Globe,
  regulatory_success: Shield,
  none: Minus
}

const eventColors = {
  financial_boom: 'bg-green-900/30 border-green-700 text-green-400',
  market_crash_warning: 'bg-red-900/30 border-red-700 text-red-400',
  election_pressure: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
  media_scandal: 'bg-orange-900/30 border-orange-700 text-orange-400',
  tech_innovation: 'bg-blue-900/30 border-blue-700 text-blue-400',
  international_crisis: 'bg-purple-900/30 border-purple-700 text-purple-400',
  regulatory_success: 'bg-green-900/30 border-green-700 text-green-400',
  none: 'bg-slate-800/50 border-slate-700 text-slate-400'
}

export function EventAlert({ eventId }) {
  const event = EVENTS.find(e => e.id === eventId)
  if (!event || event.id === 'none') return null

  const Icon = eventIcons[eventId] || AlertTriangle
  const colorClass = eventColors[eventId] || eventColors.none

  return (
    <div className={cn('p-4 rounded-xl border-2 animate-fade-in', colorClass)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/10">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <p className="text-sm opacity-80">{event.description}</p>
          {event.effects && Object.keys(event.effects).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(event.effects).map(([key, value]) => (
                <span 
                  key={key} 
                  className={cn(
                    'text-xs px-2 py-1 rounded-full bg-white/10',
                    value > 0 ? 'text-green-300' : 'text-red-300'
                  )}
                >
                  {key.replace('_', ' ')}: {value > 0 ? '+' : ''}{value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
