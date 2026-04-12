// src/pages/GameDashboard.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { SystemMetrics } from '../components/game/SystemMetrics'
import { ActionPanel } from '../components/game/ActionPanel'
import { EventAlert } from '../components/game/EventAlert'
import { RoundTimer } from '../components/game/RoundTimer'
import { Leaderboard } from '../components/game/Leaderboard'
import { useGame } from '../context/GameContext'
import { useRealtime } from '../hooks/useRealtime'
import { useGameActions } from '../hooks/useGameState'
import { POLICIES, PHASES } from '../lib/constants'
import { Clock, Target, Users, TrendingUp } from 'lucide-react'

export default function GameDashboard() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { room, player, players, gameState, decisions, fetchRoomData, setRoom } = useGame()
  const { submitAction } = useGameActions()
  const [submitting, setSubmitting] = useState(false)

  // Subscribe to realtime updates
  useRealtime(room?.id)

  // Fetch initial data
  useEffect(() => {
    const loadRoom = async () => {
      if (!room || room.code !== roomCode) {
        const { supabase } = await import('../lib/supabase')
        const { data } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode.toUpperCase())
          .single()
        
        if (data) {
          setRoom(data)
          await fetchRoomData(data.id)
        } else {
          navigate('/')
        }
      } else {
        await fetchRoomData(room.id)
      }
    }
    loadRoom()
  }, [roomCode])

  // Navigate on game state changes
  useEffect(() => {
    if (room?.status === 'completed') {
      navigate(`/leaderboard/${room.code}`)
    }
    if (room?.phase === PHASES.RESULTS) {
      navigate(`/results/${room.code}`)
    }
  }, [room?.status, room?.phase])

  const handleAction = async (actionId) => {
    setSubmitting(true)
    try {
      await submitAction(actionId)
    } catch (err) {
      console.error('Failed to submit action:', err)
    }
    setSubmitting(false)
  }

  const currentPolicy = POLICIES.find(p => p.id === gameState?.current_policy)
  const myDecision = decisions.find(d => d.player_id === player?.id)
  const submittedCount = decisions.length
  const totalPlayers = players.filter(p => p.role !== 'government').length

  const isWaitingForPolicy = room?.phase === PHASES.POLICY_SELECTION
  const isActionPhase = room?.phase === PHASES.PLAYER_ACTIONS

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-zinc-900 to-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-government-900">
                  <Target className="w-5 h-5 text-government-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-200">Round</p>
                  <p className="text-2xl font-bold text-zinc-100">
                    {room?.current_round || 0} / {room?.max_rounds || 10}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900 to-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-investor-900">
                  <TrendingUp className="w-5 h-5 text-investor-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-200">Your Score</p>
                  <p className="text-2xl font-bold text-zinc-100">{player?.score || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900 to-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-bank-900">
                  <Users className="w-5 h-5 text-bank-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-200">Submitted</p>
                  <p className="text-2xl font-bold text-zinc-100">{submittedCount} / {totalPlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900 to-slate-900">
            <CardContent className="p-4 flex items-center justify-center">
              {room?.round_started_at && (
                <RoundTimer 
                  startedAt={room.round_started_at} 
                  duration={room.round_duration || 60}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Policy & Event */}
            {isWaitingForPolicy ? (
              <Card className="bg-gradient-to-br from-zinc-900 to-slate-900">
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-zinc-200 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-xl font-semibold text-zinc-100 mb-2">
                    Waiting for Government Policy
                  </h2>
                  <p className="text-zinc-300">
                    The government is selecting this round's policy...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Current Policy */}
                {currentPolicy && (
                  <Card className="bg-gradient-to-br from-zinc-900 to-slate-900 border-government-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-government-900">
                          <Target className="w-6 h-6 text-government-500" />
                        </div>
                        <div>
                          <Badge role="government" className="mb-2">Current Policy</Badge>
                          <h3 className="text-xl font-semibold text-zinc-100">{currentPolicy.name}</h3>
                          <p className="text-zinc-200">{currentPolicy.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Random Event */}
                {gameState?.current_event && gameState.current_event !== 'none' && (
                  <EventAlert eventId={gameState.current_event} />
                )}

                {/* Action Panel */}
                {isActionPhase && player?.role && player.role !== 'government' && (
                  <ActionPanel 
                    role={player.role}
                    onSubmit={handleAction}
                    disabled={submitting || !!myDecision}
                    currentAction={myDecision?.action}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SystemMetrics gameState={gameState} />
            <Leaderboard players={players} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
