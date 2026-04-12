// src/context/GameContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, ensureSupabaseConfigured } from '../lib/supabase'

const GameContext = createContext({})

export function GameProvider({ children }) {
  const [player, setPlayer] = useState(null)
  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [players, setPlayers] = useState([])
  const [decisions, setDecisions] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const normalizeErrorMessage = useCallback((err) => {
    const msg = err?.message || 'Unknown error'
    if (msg === 'Load failed' || msg === 'Failed to fetch' || /network|fetch/i.test(msg)) {
      return 'Network request to Supabase failed. Check internet connection and verify Supabase URL/key in environment variables.'
    }
    return msg
  }, [])

  // Load player from localStorage
  useEffect(() => {
    const savedPlayer = localStorage.getItem('dodd_frank_player')
    if (savedPlayer) {
      try {
        setPlayer(JSON.parse(savedPlayer))
      } catch (e) {
        localStorage.removeItem('dodd_frank_player')
      }
    }
  }, [])

  // Save player to localStorage
  useEffect(() => {
    if (player) {
      localStorage.setItem('dodd_frank_player', JSON.stringify(player))
    }
  }, [player])

  const createRoom = useCallback(async (name, playerName) => {
    setLoading(true)
    setError(null)
    try {
      ensureSupabaseConfigured()

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({ name, code: null })
        .select()
        .single()

      if (roomError) throw roomError

      // Create initial game state
      const { error: stateError } = await supabase
        .from('game_state')
        .insert({ room_id: roomData.id })

      if (stateError) throw stateError

      // Create government player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: playerName,
          role: 'government'
        })
        .select()
        .single()

      if (playerError) throw playerError

      // Update room with creator
      await supabase
        .from('rooms')
        .update({ created_by: playerData.id })
        .eq('id', roomData.id)

      setRoom(roomData)
      setPlayer(playerData)
      
      return roomData
    } catch (err) {
      setError(normalizeErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [normalizeErrorMessage])

  const joinRoom = useCallback(async (code, playerName) => {
    setLoading(true)
    setError(null)
    try {
      ensureSupabaseConfigured()

      // Find room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (roomError) throw new Error('Room not found')
      if (roomData.status === 'completed') throw new Error('Game has ended')
      if (roomData.status === 'in_progress') throw new Error('Game already in progress')

      // Check for existing player with same name
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('name', playerName)
        .single()

      if (existingPlayer) {
        // Reconnect
        await supabase
          .from('players')
          .update({ is_connected: true, last_seen: new Date().toISOString() })
          .eq('id', existingPlayer.id)
        
        setRoom(roomData)
        setPlayer(existingPlayer)
        return roomData
      }

      // Create new player (role assigned later)
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: playerName,
          role: null
        })
        .select()
        .single()

      if (playerError) throw playerError

      setRoom(roomData)
      setPlayer(playerData)
      
      return roomData
    } catch (err) {
      setError(normalizeErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [normalizeErrorMessage])

  const leaveRoom = useCallback(async () => {
    ensureSupabaseConfigured()
    if (player) {
      await supabase
        .from('players')
        .update({ is_connected: false })
        .eq('id', player.id)
    }
    setRoom(null)
    setPlayer(null)
    setGameState(null)
    setPlayers([])
    setDecisions([])
    setHistory([])
    localStorage.removeItem('dodd_frank_player')
  }, [player])

  const fetchRoomData = useCallback(async (roomId) => {
    ensureSupabaseConfigured()
    const [roomResult, stateResult, playersResult, historyResult] = await Promise.all([
      supabase.from('rooms').select('*').eq('id', roomId).single(),
      supabase.from('game_state').select('*').eq('room_id', roomId).single(),
      supabase.from('players').select('*').eq('room_id', roomId).order('created_at'),
      supabase.from('history').select('*').eq('room_id', roomId).order('round')
    ])

    if (roomResult.data) setRoom(roomResult.data)
    if (stateResult.data) setGameState(stateResult.data)
    if (playersResult.data) setPlayers(playersResult.data)
    if (historyResult.data) setHistory(historyResult.data)

    // Also fetch current round decisions
    if (roomResult.data?.current_round > 0) {
      const { data: decisionsData } = await supabase
        .from('decisions')
        .select('*')
        .eq('room_id', roomId)
        .eq('round', roomResult.data.current_round)
      
      if (decisionsData) setDecisions(decisionsData)
    }
  }, [])

  const value = {
    player,
    setPlayer,
    room,
    setRoom,
    gameState,
    setGameState,
    players,
    setPlayers,
    decisions,
    setDecisions,
    history,
    setHistory,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    fetchRoomData
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
