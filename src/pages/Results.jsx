// src/pages/Results.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart3, TrendingUp, TrendingDown, ArrowRight, RefreshCw } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SystemMetrics } from '../components/game/SystemMetrics'
import { Leaderboard } from '../components/game/Leaderboard'
import { EventAlert } from '../components/game/EventAlert'
import { useGame } from '../context/GameContext'
import { useRealtime } from '../hooks/useRealtime'
import { POLICIES, PHASES, ACTIONS } from '../lib/constants'
import { cn } from '../lib/utils'

export default function Results() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { room, player, players, gameState, history, decisions, fetchRoomData, setRoom } = useGame()

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

  // Navigate when round advances
  useEffect(() => {
    if (room?.status === 'completed') {
      navigate(`/leaderboard/${room.code}`)
    }
    if (room?.phase === PHASES.POLICY_SELECTION || room?.phase === PHASES.PLAYER_ACTIONS) {
      navigate(`/game/${room.code}`)
    }
  }, [room?.status, room?.phase])

  const currentPolicy = POLICIES.find(p => p.id === gameState?.current_policy)
  const latestHistory = history[history.length - 1]
  const previousHistory = history[history.length - 2]

  // Get player's decision and score change
  const myDecision = decisions.find(d => d.player_id === player?.id)
  const myAction = myDecision && ACTIONS[player?.role]?.find(a => a.id === myDecision.action)

  // Calculate state changes
  const stateChanges = latestHistory && previousHistory ? {
    financial_stability: latestHistory.state_snapshot.financial_stability - previousHistory.state_snapshot.financial_stability,
    economic_growth: latestHistory.state_snapshot.economic_growth - previousHistory.state_snapshot.economic_growth,
    market_risk: latestHistory.state_snapshot.market_risk - previousHistory.state_snapshot.market_risk,
    public_trust: latestHistory.state_snapshot.public_trust - previousHistory.state_snapshot.public_trust
  } : null

  const isGovernment = player?.role === 'government'

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Round {room?.current_round} Results
          </h1>
          <p className="text-slate-400">
            {isGovernment ? 'Review the round outcome' : 'See how your actions impacted the economy'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Round Summary */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Policy */}
                <div className="text-center p-4 bg-government-900/20 rounded-xl">
                  <Badge role="government" className="mb-2">Policy</Badge>
                  <h3 className="font-semibold text-white">{currentPolicy?.name || 'N/A'}</h3>
                </div>

                {/* Event */}
                <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                  <Badge variant="info" className="mb-2">Event</Badge>
                  <h3 className="font-semibold text-white">
                    {gameState?.current_event === 'none' ? 'Calm Markets' : 
                      gameState?.current_event?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </h3>
                </div>

                {/* Your Action */}
                {!isGovernment && (
                  <div className={cn(
                    'text-center p-4 rounded-xl',
                    player?.role && `bg-${player.role}-900/20`
                  )}>
                    <Badge role={player?.role} className="mb-2">Your Action</Badge>
                    <h3 className="font-semibold text-white">{myAction?.name || 'No action'}</h3>
                    {myDecision?.score_change !== undefined && (
                      <p className={cn(
                        'text-lg font-bold mt-2',
                        myDecision.score_change >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {myDecision.score_change >= 0 ? '+' : ''}{myDecision.score_change} pts
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* State Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stateChanges ? (
                <div className="space-y-4">
                  {Object.entries(stateChanges).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className={cn(
                        'flex items-center gap-1 font-semibold',
                        value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-slate-400'
                      )}>
                        {value > 0 ? <TrendingUp className="w-4 h-4" /> : value < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                        {value > 0 ? '+' : ''}{value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No changes recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Current State */}
          <Card>
            <CardHeader>
              <CardTitle>Current System State</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemMetrics gameState={gameState} compact />
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="lg:col-span-2">
            <Leaderboard 
              players={players} 
              previousScores={previousHistory?.scores_snapshot || {}}
            />
          </Card>
        </div>

        {/* Waiting for next round */}
        {!isGovernment && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800 rounded-lg">
              <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-slate-300">Waiting for government to start next round...</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
