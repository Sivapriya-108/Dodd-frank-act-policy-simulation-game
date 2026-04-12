// src/components/game/PlayerList.jsx
import { Users, Wifi, WifiOff, Crown, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

export function PlayerList({ players, currentPlayerId, showScores = false }) {
  const sortedPlayers = showScores 
    ? [...players].sort((a, b) => (b.score || 0) - (a.score || 0))
    : players

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Players ({players.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto scrollbar-thin">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={cn(
                'flex items-center justify-between px-6 py-3 transition-colors',
                player.id === currentPlayerId && 'bg-zinc-800'
              )}
            >
              <div className="flex items-center gap-3">
                {showScores && index < 3 && (
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 && 'bg-government-500 text-zinc-950',
                    index === 1 && 'bg-bank-500 text-zinc-950',
                    index === 2 && 'bg-investor-600 text-zinc-950'
                  )}>
                    {index + 1}
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{player.name}</span>
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-zinc-200">(You)</span>
                    )}
                    {player.role === 'government' && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  {player.role && (
                    <Badge role={player.role} className="mt-1">
                      {player.role}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {showScores && (
                  <span className="font-mono font-medium text-zinc-100">
                    {player.score || 0} pts
                  </span>
                )}
                {player.is_ready && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {player.is_connected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-zinc-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
