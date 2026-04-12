// src/pages/Lobby.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Check, Play, Users, Crown, RefreshCw } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PlayerList } from '../components/game/PlayerList'
import { useGame } from '../context/GameContext'
import { useRealtime } from '../hooks/useRealtime'
import { useGameActions } from '../hooks/useGameState'
import { getBalancedRoleCounts } from '../lib/constants'

export default function Lobby() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { room, player, players, fetchRoomData, setRoom } = useGame()
  const { startGame } = useGameActions()
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)

  // Subscribe to realtime updates
  useRealtime(room?.id)

  // Fetch initial data
  useEffect(() => {
    const loadRoom = async () => {
      // Find room by code if not loaded
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

  // Navigate when game starts
  useEffect(() => {
    if (room?.status === 'in_progress') {
      navigate(`/game/${room.code}`)
    }
  }, [room?.status])

  const handleCopy = () => {
    navigator.clipboard.writeText(room?.code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStart = async () => {
    setStarting(true)
    try {
      await startGame()
    } catch (err) {
      console.error('Failed to start game:', err)
    }
    setStarting(false)
  }

  const isHost = player?.role === 'government'
  const minPlayers = 4
  const canStart = players.length >= minPlayers

  // Calculate role counts
  const roleBreakdown = getBalancedRoleCounts(players.length)

  return (
    <Layout className="bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">{room?.name}</h1>
          <p className="text-zinc-300">Waiting for players to join...</p>
        </div>

        {/* Room Code Card */}
        <Card className="mb-8 bg-gradient-to-br from-zinc-900 to-slate-900 border-zinc-700">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-zinc-200 mb-2">Share this code with players:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-mono font-bold text-government-100 tracking-[0.3em]">
                {room?.code}
              </span>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player List */}
          <div className="lg:col-span-2">
            <PlayerList players={players} currentPlayerId={player?.id} />
          </div>

          {/* Game Info & Controls */}
          <div className="space-y-6">
            {/* Role Distribution Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-government-500" />
                    <span className="text-zinc-100">Government</span>
                  </div>
                  <Badge role="government">{roleBreakdown.government}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-100">Banks</span>
                  <Badge role="bank">~{roleBreakdown.bank}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-100">Investors</span>
                  <Badge role="investor">~{roleBreakdown.investor}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-100">Citizens</span>
                  <Badge role="citizen">~{roleBreakdown.citizen}</Badge>
                </div>
                <p className="text-xs text-zinc-200 mt-4">
                  Roles will be randomly assigned when the game starts
                </p>
              </CardContent>
            </Card>

            {/* Start Game */}
            {isHost && (
              <Card className="bg-gradient-to-br from-zinc-900 to-slate-900 border-government-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-government-500" />
                    <span className="font-semibold text-zinc-100">Host Controls</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-200">Players</span>
                      <span className="text-zinc-100">{players.length} / {minPlayers} minimum</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-government-500 to-investor-600 transition-all"
                        style={{ width: `${Math.min(100, (players.length / minPlayers) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleStart}
                    disabled={!canStart}
                    loading={starting}
                    variant="government"
                    className="w-full"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>

                  {!canStart && (
                    <p className="text-xs text-zinc-200 text-center mt-2">
                      Need at least {minPlayers} players to start
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {!isHost && (
              <Card>
                <CardContent className="p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-zinc-300 mx-auto mb-3 animate-spin" style={{ animationDuration: '3s' }} />
                  <p className="text-zinc-100">Waiting for host to start the game...</p>
                  <p className="text-sm text-zinc-200 mt-1">You'll be assigned a role automatically</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
