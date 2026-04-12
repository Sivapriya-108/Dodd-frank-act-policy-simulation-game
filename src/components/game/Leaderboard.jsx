// src/components/game/Leaderboard.jsx
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

export function Leaderboard({ players, previousScores = {} }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-800">
          {sorted.map((player, index) => {
            const prevScore = previousScores[player.id] || 0
            const change = (player.score || 0) - prevScore

            return (
              <div 
                key={player.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0 && 'bg-gradient-to-br from-government-500 to-government-700 text-zinc-950',
                    index === 1 && 'bg-gradient-to-br from-bank-500 to-bank-700 text-zinc-950',
                    index === 2 && 'bg-gradient-to-br from-investor-500 to-investor-700 text-zinc-950',
                    index > 2 && 'bg-zinc-800 text-zinc-100'
                  )}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-zinc-100">{player.name}</span>
                    <Badge role={player.role} className="ml-2">
                      {player.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {change !== 0 && (
                    <span className={cn(
                      'flex items-center gap-1 text-sm',
                      change > 0 ? 'text-bank-500' : 'text-investor-600'
                    )}>
                      {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {change > 0 ? '+' : ''}{change}
                    </span>
                  )}
                  <span className="font-mono text-lg font-bold text-zinc-100">
                    {player.score || 0}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
