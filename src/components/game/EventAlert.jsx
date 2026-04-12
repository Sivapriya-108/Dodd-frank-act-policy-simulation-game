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
  financial_boom: 'bg-bank-900 border-bank-500 text-zinc-100',
  market_crash_warning: 'bg-investor-900 border-investor-500 text-zinc-100',
  election_pressure: 'bg-government-900 border-government-500 text-zinc-100',
  media_scandal: 'bg-citizen-900 border-citizen-500 text-zinc-100',
  tech_innovation: 'bg-government-900 border-government-500 text-zinc-100',
  international_crisis: 'bg-zinc-900 border-zinc-700 text-zinc-100',
  regulatory_success: 'bg-bank-900 border-bank-500 text-zinc-100',
  none: 'bg-zinc-900 border-zinc-700 text-zinc-100'
}

export function EventAlert({ eventId }) {
  const event = EVENTS.find(e => e.id === eventId)
  if (!event || event.id === 'none') return null

  const Icon = eventIcons[eventId] || AlertTriangle
  const colorClass = eventColors[eventId] || eventColors.none

  return (
    <div className={cn('p-4 rounded-xl border-2 animate-fade-in', colorClass)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <p className="text-sm text-zinc-200">{event.description}</p>
          {event.effects && Object.keys(event.effects).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(event.effects).map(([key, value]) => (
                <span 
                  key={key} 
                  className={cn(
                    'text-xs px-2 py-1 rounded-full bg-black/15',
                    value > 0 ? 'text-bank-100' : 'text-investor-100'
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
