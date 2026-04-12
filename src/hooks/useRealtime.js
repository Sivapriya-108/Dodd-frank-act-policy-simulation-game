// src/hooks/useRealtime.js
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useGame } from '../context/GameContext'

export function useRealtime(roomId) {
  const { fetchRoomData } = useGame()
  const channelRef = useRef(null)

  useEffect(() => {
    if (!roomId) return

    let isActive = true

    const refreshRoomState = async () => {
      try {
        if (!isActive) return
        await fetchRoomData(roomId)
      } catch (err) {
        console.error('Realtime fallback refresh failed:', err)
      }
    }

    // Create channel for this room
    const channel = supabase.channel(`room:${roomId}`)
    channelRef.current = channel

    // Subscribe to room changes
    channel
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        async () => {
          await refreshRoomState()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${roomId}` },
        async () => {
          await refreshRoomState()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        async () => {
          await refreshRoomState()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'decisions', filter: `room_id=eq.${roomId}` },
        async () => {
          await refreshRoomState()
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await refreshRoomState()
        }
      })

    // Poll as a fallback for cases where realtime events are delayed/dropped.
    const pollId = setInterval(() => {
      refreshRoomState()
    }, 2000)

    // Cleanup
    return () => {
      isActive = false
      clearInterval(pollId)
      channel.unsubscribe()
    }
  }, [roomId, fetchRoomData])

  return channelRef.current
}
