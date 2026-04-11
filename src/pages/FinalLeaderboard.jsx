// src/pages/FinalLeaderboard.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Medal, Award, BarChart3, Download, Home, RotateCcw } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { StabilityChart } from '../components/charts/StabilityChart'
import { TrendChart } from '../components/charts/TrendChart'
import { useGame } from '../context/GameContext'
import { generateAnalyticsData, exportAnalytics } from '../lib/gameEngine'
import { cn } from '../lib/utils'

export default function FinalLeaderboard() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { room, players, gameState, history, fetchRoomData, setRoom, leaveRoom } = useGame()

  // Fetch data
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

  const handleHome = async () => {
    await leaveRoom()
    navigate('/')
  }

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))
  const analytics = generateAnalyticsData(history)

  const topThree = sortedPlayers.slice(0, 3)
  const rest = sortedPlayers.slice(3)

  // Determine game outcome
  const finalStability = gameState?.financial_stability || 0
  const finalTrust = gameState?.public_trust || 0
  const finalRisk = gameState?.market_risk || 0

  let outcome = { title: '', description: '', color: '' }
  if (finalStability < 20 || finalRisk > 80) {
    outcome = { 
      title: 'Financial Crisis!', 
      description: 'The system collapsed under market pressure.',
      color: 'text-red-400'
    }
  } else if (finalStability > 70 && finalTrust > 50) {
    outcome = { 
      title: 'Stable Economy', 
      description: 'Effective regulation maintained market stability.',
      color: 'text-green-400'
    }
  } else if (finalTrust < 30) {
    outcome = { 
      title: 'Loss of Confidence', 
      description: 'Public trust eroded despite regulatory efforts.',
      color: 'text-yellow-400'
    }
  } else {
    outcome = { 
      title: 'Mixed Results', 
      description: 'The economy navigated challenges with varying success.',
      color: 'text-blue-400'
    }
  }

  const podiumIcons = [Trophy, Medal, Award]
  const podiumColors = [
    'from-yellow-400 to-yellow-600 text-yellow-950',
    'from-slate-300 to-slate-500 text-slate-950',
    'from-amber-600 to-amber-800 text-amber-100'
  ]

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Game Complete!</h1>
          <div className={cn('text-2xl font-semibold mb-2', outcome.color)}>
            {outcome.title}
          </div>
          <p className="text-slate-400">{outcome.description}</p>
          <p className="text-sm text-slate-500 mt-2">
            {room?.current_round} rounds played in session {room?.code}
          </p>
        </div>

        {/* Podium */}
        <Card className="mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <CardContent className="p-8">
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className={cn(
                    'w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br mb-3',
                    podiumColors[1]
                  )}>
                    <Medal className="w-10 h-10" />
                  </div>
                  <div className="bg-slate-800 rounded-t-xl p-4 h-24 flex flex-col justify-end">
                    <p className="font-semibold text-white">{topThree[1].name}</p>
                    <Badge role={topThree[1].role} className="mx-auto mt-1">{topThree[1].role}</Badge>
                    <p className="text-lg font-bold text-slate-300 mt-1">{topThree[1].score || 0}</p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="text-center animate-slide-up">
                  <div className={cn(
                    'w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br mb-3 ring-4 ring-yellow-400/30',
                    podiumColors[0]
                  )}>
                    <Trophy className="w-12 h-12" />
                  </div>
                  <div className="bg-slate-800 rounded-t-xl p-4 h-32 flex flex-col justify-end">
                    <p className="font-bold text-lg text-white">{topThree[0].name}</p>
                    <Badge role={topThree[0].role} className="mx-auto mt-1">{topThree[0].role}</Badge>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">{topThree[0].score || 0}</p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className={cn(
                    'w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br mb-3',
                    podiumColors[2]
                  )}>
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="bg-slate-800 rounded-t-xl p-4 h-20 flex flex-col justify-end">
                    <p className="font-semibold text-white">{topThree[2].name}</p>
                    <Badge role={topThree[2].role} className="mx-auto mt-1">{topThree[2].role}</Badge>
                    <p className="text-lg font-bold text-slate-300 mt-1">{topThree[2].score || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rest of players */}
            {rest.length > 0 && (
              <div className="border-t border-slate-700 pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {rest.map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                      <span className="text-slate-500 font-mono">{index + 4}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-200 truncate">{player.name}</p>
                        <Badge role={player.role} className="mt-0.5">{player.role}</Badge>
                      </div>
                      <span className="font-mono text-slate-400">{player.score || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Metrics Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StabilityChart data={analytics} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Common Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={analytics.topActions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={analytics.policies} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final State & Export */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Final System State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'financial_stability', label: 'Stability', color: 'blue' },
                { key: 'economic_growth', label: 'Growth', color: 'green' },
                { key: 'public_trust', label: 'Trust', color: 'purple' },
                { key: 'market_risk', label: 'Risk', color: 'red', inverted: true }
              ].map(({ key, label, color, inverted }) => (
                <div key={key} className={cn('p-4 rounded-xl', `bg-${color}-900/20`)}>
                  <p className="text-sm text-slate-400 mb-1">{label}</p>
                  <p className={cn(
                    'text-3xl font-bold',
                    inverted 
                      ? gameState?.[key] > 70 ? 'text-red-400' : gameState?.[key] > 40 ? 'text-yellow-400' : 'text-green-400'
                      : gameState?.[key] > 70 ? 'text-green-400' : gameState?.[key] > 40 ? 'text-yellow-400' : 'text-red-400'
                  )}>
                    {gameState?.[key] || 0}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="secondary" onClick={() => handleExport('json')}>
            <Download className="w-5 h-5 mr-2" />
            Export JSON
          </Button>
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleHome}>
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Button>
        </div>
      </div>
    </Layout>
  )
}
