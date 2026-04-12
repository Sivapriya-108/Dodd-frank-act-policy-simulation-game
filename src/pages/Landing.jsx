// src/pages/Landing.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogIn } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { InteractiveRoleCard } from '../components/ui/InteractiveRoleCard'
import { useGame } from '../context/GameContext'

export default function Landing() {
  const navigate = useNavigate()
  const { createRoom, joinRoom, loading, error } = useGame()
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [roomName, setRoomName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [localError, setLocalError] = useState('')

  const roleCards = [
    {
      title: 'Government',
      subtitle: 'Set regulation and steady the system',
      imageUrl: '/role-government.jpg',
      actionText: 'Lead Policy',
      href: 'https://www.investopedia.com/terms/d/dodd-frank-financial-regulatory-reform-bill.asp'
    },
    {
      title: 'Banks',
      subtitle: 'Manage credit, liquidity, and exposure',
      imageUrl: '/role-banks.jpg',
      actionText: 'Run Capital',
      href: 'https://www.federalreserve.gov/'
    },
    {
      title: 'Investors',
      subtitle: 'Price risk under shifting policy',
      imageUrl: '/role-investors.jpg',
      actionText: 'Trade Strategy',
      href: 'https://www.sec.gov/'
    },
    {
      title: 'Citizens',
      subtitle: 'Absorb market shocks and policy fallout',
      imageUrl: '/role-citizens.jpg',
      actionText: 'Shape Outcomes',
      href: 'https://www.consumerfinance.gov/'
    }
  ]

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
    <div className="min-h-screen flex flex-col">
      <section className="relative h-[50vh] min-h-[340px] w-full overflow-hidden">
        <img
          src="/dodd-frank.jpg"
          alt="Retro financial control room"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 text-white">
          <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight">
            Too Big To Fail
            <span className="block text-government-100">Simulation Game</span>
          </h1>
        </div>
      </section>

      <section className="flex-1 bg-[#f6f1e7] px-4 py-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center mb-10 animate-fade-in">
            <p className="text-lg text-stone-700 max-w-2xl mx-auto">
              Play through the 2008 crisis - make decisions, manage risk, and shape the system’s future.
            </p>
          </div>

          <div className="w-full max-w-6xl mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 font-serif">Player Cards</h2>
              <p className="text-sm text-stone-700">Each role sees different incentives and tradeoffs</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {roleCards.map((role) => (
                <InteractiveRoleCard
                  key={role.title}
                  title={role.title}
                  subtitle={role.subtitle}
                  imageUrl={role.imageUrl}
                  actionText={role.actionText}
                  href={role.href}
                  onActionClick={() => setMode('join')}
                />
              ))}
            </div>
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
                    className="text-sm text-zinc-100 hover:text-white mb-4"
                  >
                    ← Back
                  </button>

                  <h2 className="text-xl font-semibold text-zinc-100 mb-6">
                    {mode === 'create' ? 'Create a Room' : 'Join a Room'}
                  </h2>

                  <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-200 focus:outline-none focus:ring-2 focus:ring-government-500 focus:border-transparent"
                        maxLength={50}
                      />
                    </div>

                    {mode === 'create' ? (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Room Name
                        </label>
                        <input
                          type="text"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          placeholder="e.g., Econ 101 - Session 3"
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-200 focus:outline-none focus:ring-2 focus:ring-government-500 focus:border-transparent"
                          maxLength={100}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Room Code
                        </label>
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="Enter 6-character code"
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-200 focus:outline-none focus:ring-2 focus:ring-government-500 focus:border-transparent font-mono text-center text-xl tracking-widest"
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

          {/* Footer */}
          <footer className="py-6 text-center text-stone-700 text-sm">
            <p>Based on the Dodd-Frank Wall Street Reform and Consumer Protection Act (2010)</p>
          </footer>
        </div>
      </section>
    </div>
  )
}
