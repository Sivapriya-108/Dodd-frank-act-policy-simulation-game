// src/pages/Landing.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Plus, LogIn, Users, Shield, TrendingUp, Scale } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useGame } from '../context/GameContext'

export default function Landing() {
  const navigate = useNavigate()
  const { createRoom, joinRoom, loading, error } = useGame()
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [roomName, setRoomName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [localError, setLocalError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!roomName.trim() || !playerName.trim()) {
      setLocalError('Please fill in all fields')
      return
    }
    try {
      const room = await createRoom(roomName.trim(), playerName.trim())
      navigate(`/lobby/${room.code}`)
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!roomCode.trim() || !playerName.trim()) {
      setLocalError('Please fill in all fields')
      return
    }
    try {
      const room = await joinRoom(roomCode.trim(), playerName.trim())
      navigate(`/lobby/${room.code}`)
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <div className="min-h-screen app-shell flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 mb-6 shadow-2xl shadow-orange-900/30">
            <Landmark className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-50 mb-4 font-serif">
            Dodd-Frank
            <span className="text-gradient bg-gradient-to-r from-amber-300 to-cyan-300"> Simulation</span>
          </h1>
          <p className="text-lg text-zinc-300 max-w-xl mx-auto">
            Experience financial regulation dynamics in real-time. Navigate the 2008 crisis, 
            balance stability and growth, and discover the tradeoffs of regulatory policy.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-12">
          {[
            { icon: Users, title: '20-25 Players', desc: 'Real-time multiplayer' },
            { icon: Scale, title: 'Policy Tradeoffs', desc: 'Balance competing interests' },
            { icon: TrendingUp, title: 'Market Dynamics', desc: 'React to economic shocks' }
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="bg-zinc-900/50 border-zinc-700/60">
              <CardContent className="p-4 text-center">
                <Icon className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <h3 className="font-semibold text-zinc-100">{title}</h3>
                <p className="text-sm text-zinc-400">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Section */}
        <div className="w-full max-w-md">
          {!mode ? (
            <div className="space-y-4 animate-slide-up">
              <Button 
                onClick={() => setMode('create')}
                className="w-full"
                size="xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Room
              </Button>
              <Button 
                onClick={() => setMode('join')}
                variant="secondary"
                className="w-full"
                size="xl"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Join Existing Room
              </Button>
            </div>
          ) : (
            <Card className="animate-slide-up">
              <CardContent className="p-6">
                <button 
                  onClick={() => { setMode(null); setLocalError('') }}
                  className="text-sm text-zinc-400 hover:text-zinc-200 mb-4"
                >
                  ← Back
                </button>

                <h2 className="text-xl font-semibold text-zinc-100 mb-6">
                  {mode === 'create' ? 'Create a Room' : 'Join a Room'}
                </h2>

                <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      maxLength={50}
                    />
                  </div>

                  {mode === 'create' ? (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Room Name
                      </label>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="e.g., Econ 101 - Session 3"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        maxLength={100}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Room Code
                      </label>
                      <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character code"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-center text-xl tracking-widest"
                        maxLength={6}
                      />
                    </div>
                  )}

                  {(localError || error) && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                      {localError || error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    {mode === 'create' ? 'Create Room' : 'Join Room'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-zinc-400 text-sm">
        <p>Based on the Dodd-Frank Wall Street Reform and Consumer Protection Act (2010)</p>
      </footer>
    </div>
  )
}
