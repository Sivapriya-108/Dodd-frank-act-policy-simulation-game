// src/hooks/useRealtime.js
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useGame } from '../context/GameContext'

export function useRealtime(roomId) {
  const { 
    setRoom, 
    setGameState, 
    setPlayers, 
    setDecisions,
    setPlayer,
    player 
  } = useGame()
  const channelRef = useRef(null)

  useEffect(() => {
    if (!roomId) return

    // Create channel for this room
    const channel = supabase.channel(`room:${roomId}`)
    channelRef.current = channel

    // Subscribe to room changes
    channel
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRoom(payload.new)
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setGameState(payload.new)
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        async () => {
          // Refetch all players on any change
          const { data } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at')
          if (data) {
            setPlayers(data)
            // Update current player if needed
            if (player) {
              const updatedPlayer = data.find(p => p.id === player.id)
              if (updatedPlayer) {
                setPlayer(updatedPlayer)
              }
            }
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'decisions', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          setDecisions(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      channel.unsubscribe()
    }
  }, [roomId, player?.id])

  return channelRef.current
}
