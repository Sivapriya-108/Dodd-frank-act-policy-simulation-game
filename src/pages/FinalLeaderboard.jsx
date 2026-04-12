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

const finalStateClasses = {
  financial_stability: 'bg-government-900',
  economic_growth: 'bg-bank-900',
  public_trust: 'bg-citizen-900',
  market_risk: 'bg-investor-900'
}

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
      color: 'text-investor-500'
    }
  } else if (finalStability > 70 && finalTrust > 50) {
    outcome = { 
      title: 'Stable Economy', 
      description: 'Effective regulation maintained market stability.',
      color: 'text-bank-500'
    }
  } else if (finalTrust < 30) {
    outcome = { 
      title: 'Loss of Confidence', 
      description: 'Public trust eroded despite regulatory efforts.',
      color: 'text-government-500'
    }
  } else {
    outcome = { 
      title: 'Mixed Results', 
      description: 'The economy navigated challenges with varying success.',
      color: 'text-citizen-500'
    }
  }

  const podiumIcons = [Trophy, Medal, Award]
  const podiumColors = [
    'from-government-500 to-government-700 text-zinc-950',
    'from-bank-500 to-bank-700 text-zinc-950',
    'from-investor-500 to-investor-700 text-zinc-950'
  ]

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">Game Complete!</h1>
          <div className={cn('text-2xl font-semibold mb-2', outcome.color)}>
            {outcome.title}
          </div>
          <p className="text-zinc-300">{outcome.description}</p>
          <p className="text-sm text-zinc-400 mt-2">
            {room?.current_round} rounds played in session {room?.code}
          </p>
        </div>

        {/* Podium */}
        <Card className="mb-8 bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 border-zinc-700">
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
                  <div className="bg-zinc-900 rounded-t-xl p-4 h-24 flex flex-col justify-end border border-zinc-700">
                    <p className="font-semibold text-zinc-100">{topThree[1].name}</p>
                    <Badge role={topThree[1].role} className="mx-auto mt-1">{topThree[1].role}</Badge>
                    <p className="text-lg font-bold text-zinc-100 mt-1">{topThree[1].score || 0}</p>
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
                  <div className="bg-zinc-900 rounded-t-xl p-4 h-32 flex flex-col justify-end border border-zinc-700">
                    <p className="font-bold text-lg text-zinc-100">{topThree[0].name}</p>
                    <Badge role={topThree[0].role} className="mx-auto mt-1">{topThree[0].role}</Badge>
                    <p className="text-2xl font-bold text-government-500 mt-1">{topThree[0].score || 0}</p>
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
                  <div className="bg-zinc-900 rounded-t-xl p-4 h-20 flex flex-col justify-end border border-zinc-700">
                    <p className="font-semibold text-zinc-100">{topThree[2].name}</p>
                    <Badge role={topThree[2].role} className="mx-auto mt-1">{topThree[2].role}</Badge>
                    <p className="text-lg font-bold text-zinc-100 mt-1">{topThree[2].score || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rest of players */}
            {rest.length > 0 && (
              <div className="border-t border-zinc-700 pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {rest.map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                      <span className="text-zinc-200 font-mono">{index + 4}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-100 truncate">{player.name}</p>
                        <Badge role={player.role} className="mt-0.5">{player.role}</Badge>
                      </div>
                      <span className="font-mono text-zinc-100">{player.score || 0}</span>
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
              ].map(({ key, label, inverted }) => (
                  <div key={key} className={cn('p-4 rounded-xl border border-zinc-700', finalStateClasses[key])}>
                    <p className="text-sm text-zinc-200 mb-1">{label}</p>
                  <p className={cn(
                    'text-3xl font-bold',
                    inverted 
                      ? gameState?.[key] > 70 ? 'text-investor-600' : gameState?.[key] > 40 ? 'text-government-500' : 'text-bank-500'
                      : gameState?.[key] > 70 ? 'text-bank-500' : gameState?.[key] > 40 ? 'text-government-500' : 'text-investor-600'
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
