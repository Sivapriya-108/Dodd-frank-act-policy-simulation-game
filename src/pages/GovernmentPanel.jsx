// src/pages/GovernmentPanel.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, Play, SkipForward, Users, CheckCircle, AlertTriangle, BarChart3, Download } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SystemMetrics } from '../components/game/SystemMetrics'
import { PlayerList } from '../components/game/PlayerList'
import { EventAlert } from '../components/game/EventAlert'
import { RoundTimer } from '../components/game/RoundTimer'
import { StabilityChart } from '../components/charts/StabilityChart'
import { useGame } from '../context/GameContext'
import { useRealtime } from '../hooks/useRealtime'
import { useGameActions } from '../hooks/useGameState'
import { generateAnalyticsData, exportAnalytics } from '../lib/gameEngine'
import { POLICIES, PHASES } from '../lib/constants'
import { cn } from '../lib/utils'

export default function GovernmentPanel() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { room, player, players, gameState, decisions, history, fetchRoomData, setRoom } = useGame()
  const { selectPolicy, resolveRound, nextRound, endGame } = useGameActions()
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [processing, setProcessing] = useState(false)

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

  // Navigate on game completion
  useEffect(() => {
    if (room?.status === 'completed') {
      navigate(`/leaderboard/${room.code}`)
    }
  }, [room?.status])

  const handleSelectPolicy = async () => {
    if (!selectedPolicy) return
    setProcessing(true)
    try {
      await selectPolicy(selectedPolicy)
      setSelectedPolicy(null)
    } catch (err) {
      console.error('Failed to select policy:', err)
    }
    setProcessing(false)
  }

  const handleResolve = async () => {
    setProcessing(true)
    try {
      await resolveRound()
    } catch (err) {
      console.error('Failed to resolve round:', err)
    }
    setProcessing(false)
  }

  const handleNextRound = async () => {
    setProcessing(true)
    try {
      const result = await nextRound()
      if (result?.ended) {
        navigate(`/leaderboard/${room.code}`)
      }
    } catch (err) {
      console.error('Failed to advance round:', err)
    }
    setProcessing(false)
  }

  const handleEndGame = async () => {
    if (confirm('Are you sure you want to end the game early?')) {
      await endGame()
      navigate(`/leaderboard/${room.code}`)
    }
  }

  const handleExport = (format) => {
    const analytics = generateAnalyticsData(history)
    const data = exportAnalytics(analytics, format)
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dodd-frank-session-${room?.code}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isPolicyPhase = room?.phase === PHASES.POLICY_SELECTION
  const isActionPhase = room?.phase === PHASES.PLAYER_ACTIONS
  const isResultsPhase = room?.phase === PHASES.RESULTS

  const submittedCount = decisions.length
  const totalPlayers = players.filter(p => p.role !== 'government').length
  const allSubmitted = submittedCount >= totalPlayers && totalPlayers > 0

  const analytics = generateAnalyticsData(history)

  // Group players by role for monitoring
  const playersByRole = {
    bank: players.filter(p => p.role === 'bank'),
    investor: players.filter(p => p.role === 'investor'),
    citizen: players.filter(p => p.role === 'citizen')
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Control Bar */}
        <Card className="mb-6 bg-government-900/20 border-government-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-government-400" />
                  <span className="font-semibold text-lg text-white">Government Control Panel</span>
                </div>
                <Badge variant="info">Round {room?.current_round || 0} / {room?.max_rounds || 10}</Badge>
              </div>

              <div className="flex items-center gap-4">
                {room?.round_started_at && (
                  <RoundTimer 
                    startedAt={room.round_started_at} 
                    duration={room.round_duration || 60}
                  />
                )}

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>
                    <Download className="w-4 h-4 mr-1" /> JSON
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
                    <Download className="w-4 h-4 mr-1" /> CSV
                  </Button>
                </div>

                <Button variant="danger" size="sm" onClick={handleEndGame}>
                  End Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policy Selection Phase */}
            {isPolicyPhase && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Policy for Round {room?.current_round}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {POLICIES.map((policy) => (
                      <button
                        key={policy.id}
                        onClick={() => setSelectedPolicy(policy.id)}
                        className={cn(
                          'action-card text-left border-slate-700 bg-slate-800/50',
                          selectedPolicy === policy.id && 'action-card-selected border-government-500 ring-government-500'
                        )}
                      >
                        <h4 className="font-semibold text-slate-200 mb-1">{policy.name}</h4>
                        <p className="text-sm text-slate-400">{policy.description}</p>
                      </button>
                    ))}
                  </div>
                  <Button 
                    onClick={handleSelectPolicy}
                    disabled={!selectedPolicy || processing}
                    loading={processing}
                    variant="government"
                    className="w-full"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Announce Policy & Start Round
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Action Phase - Monitor */}
            {isActionPhase && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Round in Progress</CardTitle>
                    <Badge variant={allSubmitted ? 'success' : 'warning'}>
                      {submittedCount} / {totalPlayers} submitted
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Current Policy & Event */}
                  {gameState?.current_policy && (
                    <div className="mb-4 p-4 bg-government-900/30 rounded-lg">
                      <span className="text-sm text-slate-400">Active Policy:</span>
                      <span className="ml-2 font-semibold text-white">
                        {POLICIES.find(p => p.id === gameState.current_policy)?.name}
                      </span>
                    </div>
                  )}

                  {gameState?.current_event && gameState.current_event !== 'none' && (
                    <EventAlert eventId={gameState.current_event} />
                  )}

                  {/* Player Submission Status */}
                  <div className="mt-6 space-y-4">
                    {Object.entries(playersByRole).map(([role, rolePlayers]) => (
                      <div key={role}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge role={role}>{role}s</Badge>
                          <span className="text-sm text-slate-400">
                            {rolePlayers.filter(p => decisions.find(d => d.player_id === p.id)).length} / {rolePlayers.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rolePlayers.map(p => {
                            const hasSubmitted = decisions.find(d => d.player_id === p.id)
                            return (
                              <span 
                                key={p.id}
                                className={cn(
                                  'px-2 py-1 text-sm rounded-full',
                                  hasSubmitted ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'
                                )}
                              >
                                {p.name} {hasSubmitted && <CheckCircle className="inline w-3 h-3 ml-1" />}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleResolve}
                    disabled={processing}
                    loading={processing}
                    variant="government"
                    className="w-full mt-6"
                    size="lg"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    End Round & Calculate Results
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results Phase */}
            {isResultsPhase && (
              <Card>
                <CardHeader>
                  <CardTitle>Round {room?.current_round} Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="text-sm text-slate-400 mb-4">System Metrics Change</h4>
                    <SystemMetrics gameState={gameState} compact />
                  </div>

                  <Button 
                    onClick={handleNextRound}
                    disabled={processing}
                    loading={processing}
                    variant="government"
                    className="w-full"
                    size="lg"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />
                    {room?.current_round >= (room?.max_rounds || 10) ? 'View Final Results' : 'Start Next Round'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Analytics Chart */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Game Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StabilityChart data={analytics} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SystemMetrics gameState={gameState} />
            <PlayerList players={players} currentPlayerId={player?.id} showScores />
          </div>
        </div>
      </div>
    </Layout>
  )
}
