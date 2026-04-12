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

    let isActive = true

    const refreshPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at')

      if (!isActive || error || !data) return

      setPlayers(data)

      // Keep current player state in sync with latest DB values.
      if (player) {
        const updatedPlayer = data.find((p) => p.id === player.id)
        if (updatedPlayer) {
          setPlayer(updatedPlayer)
        }
      }
    }

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
          await refreshPlayers()
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'decisions', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          setDecisions(prev => [...prev, payload.new])
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await refreshPlayers()
        }
      })

    // Poll as a fallback for cases where realtime events are delayed/dropped.
    const pollId = setInterval(() => {
      refreshPlayers()
    }, 2500)

    // Cleanup
    return () => {
      isActive = false
      clearInterval(pollId)
      channel.unsubscribe()
    }
  }, [roomId, player?.id])

  return channelRef.current
}
