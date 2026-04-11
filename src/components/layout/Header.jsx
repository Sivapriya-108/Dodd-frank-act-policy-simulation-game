// src/components/layout/Header.jsx
import { useNavigate } from 'react-router-dom'
import { Landmark, LogOut, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useGame } from '../../context/GameContext'

export function Header() {
  const navigate = useNavigate()
  const { player, room, leaveRoom } = useGame()

  const handleLeave = async () => {
    await leaveRoom()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/75 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 shadow-lg shadow-amber-950/40 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-amber-100 tracking-tight">Dodd-Frank Simulation</h1>
              {room && (
                <p className="text-xs text-zinc-400">Room: {room.code}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {player && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-zinc-200">{player.name}</p>
                  {player.role && (
                    <Badge role={player.role} className="mt-0.5">
                      {player.role.charAt(0).toUpperCase() + player.role.slice(1)}
                    </Badge>
                  )}
                </div>
                {room && (
                  <Button variant="ghost" size="sm" onClick={handleLeave}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
