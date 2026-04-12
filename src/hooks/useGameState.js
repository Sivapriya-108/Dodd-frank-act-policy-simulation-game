// src/hooks/useGameState.js
import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useGame } from '../context/GameContext'
import { 
  calculateRoundResults, 
  applyStateChanges, 
  selectRandomEvent,
  checkGameEnd 
} from '../lib/gameEngine'
import { PHASES, getBalancedRoleCounts } from '../lib/constants'
import { shuffleArray } from '../lib/utils'

export function useGameActions() {
  const { room, gameState, players, decisions, player } = useGame()

  const assignRoles = useCallback(async () => {
    if (!room || players.length < 2) return

    const unassigned = players.filter(p => !p.role)
    const shuffled = shuffleArray(unassigned)
    const roleCounts = getBalancedRoleCounts(players.length)

    const roles = [
      ...Array(roleCounts.bank).fill('bank'),
      ...Array(roleCounts.investor).fill('investor'),
      ...Array(roleCounts.citizen).fill('citizen')
    ]

    const shuffledRoles = shuffleArray(roles)

    // Update each player
    for (let i = 0; i < shuffled.length; i++) {
      await supabase
        .from('players')
        .update({ role: shuffledRoles[i] })
        .eq('id', shuffled[i].id)
    }
  }, [room, players])

  const startGame = useCallback(async () => {
    if (!room) return

    await assignRoles()

    await supabase
      .from('rooms')
      .update({
        status: 'in_progress',
        current_round: 1,
        phase: PHASES.POLICY_SELECTION,
        round_started_at: new Date().toISOString()
      })
      .eq('id', room.id)
  }, [room, assignRoles])

  const selectPolicy = useCallback(async (policyId) => {
    if (!room || !gameState) return

    const event = selectRandomEvent()

    await supabase
      .from('game_state')
      .update({
        current_policy: policyId,
        current_event: event.id,
        event_modifier: event.effects
      })
      .eq('room_id', room.id)

    await supabase
      .from('rooms')
      .update({
        phase: PHASES.PLAYER_ACTIONS,
        round_started_at: new Date().toISOString()
      })
      .eq('id', room.id)
  }, [room, gameState])

  const submitAction = useCallback(async (actionId) => {
    if (!room || !player) return

    const { error } = await supabase
      .from('decisions')
      .upsert({
        room_id: room.id,
        player_id: player.id,
        round: room.current_round,
        action: actionId
      }, {
        onConflict: 'room_id,player_id,round'
      })

    if (error) {
      console.error('Error submitting action:', error)
    }
  }, [room, player])

  const resolveRound = useCallback(async () => {
    if (!room || !gameState) return

    // Get all decisions for current round with player roles
    const { data: roundDecisions } = await supabase
      .from('decisions')
      .select('*, players!inner(role)')
      .eq('room_id', room.id)
      .eq('round', room.current_round)

    const decisionsWithRoles = roundDecisions?.map(d => ({
      ...d,
      role: d.players?.role
    })) || []

    // Calculate results
    const results = calculateRoundResults(
      gameState,
      gameState.current_policy,
      decisionsWithRoles,
      { id: gameState.current_event, effects: gameState.event_modifier }
    )

    // Update player scores
    for (const [playerId, scoreChange] of Object.entries(results.playerScores)) {
      await supabase
        .from('players')
        .update({ 
          score: supabase.rpc ? undefined : 0 // We'll use raw SQL
        })
        .eq('id', playerId)
      
      // Use raw update with increment
      const { data: playerData } = await supabase
        .from('players')
        .select('score')
        .eq('id', playerId)
        .single()
      
      if (playerData) {
        await supabase
          .from('players')
          .update({ score: (playerData.score || 0) + scoreChange })
          .eq('id', playerId)
      }
    }

    // Update decision score changes
    for (const decision of decisionsWithRoles) {
      await supabase
        .from('decisions')
        .update({ score_change: results.playerScores[decision.player_id] || 0 })
        .eq('id', decision.id)
    }

    // Apply state changes
    const newState = applyStateChanges(gameState, results.stateChanges)

    await supabase
      .from('game_state')
      .update({
        financial_stability: newState.financial_stability,
        economic_growth: newState.economic_growth,
        market_risk: newState.market_risk,
        public_trust: newState.public_trust
      })
      .eq('room_id', room.id)

    // Save to history
    const { data: allPlayers } = await supabase
      .from('players')
      .select('id, name, role, score')
      .eq('room_id', room.id)

    await supabase
      .from('history')
      .insert({
        room_id: room.id,
        round: room.current_round,
        phase: PHASES.RESULTS,
        policy: gameState.current_policy,
        event: gameState.current_event,
        state_snapshot: newState,
        decisions_summary: results.analysis,
        scores_snapshot: allPlayers?.reduce((acc, p) => ({ ...acc, [p.id]: p.score }), {}) || {}
      })

    // Update room phase
    await supabase
      .from('rooms')
      .update({ phase: PHASES.RESULTS })
      .eq('id', room.id)

    // Check for game end
    const gameEnd = checkGameEnd(newState, room.current_round, room.max_rounds)
    
    return { results, gameEnd }
  }, [room, gameState])

  const nextRound = useCallback(async () => {
    if (!room) return

    // Check if game should end
    const { data: latestState } = await supabase
      .from('game_state')
      .select('*')
      .eq('room_id', room.id)
      .single()

    const gameEnd = checkGameEnd(latestState, room.current_round, room.max_rounds)

    if (gameEnd.ended) {
      await supabase
        .from('rooms')
        .update({ status: 'completed' })
        .eq('id', room.id)
      return { ended: true, reason: gameEnd.reason }
    }

    // Clear decisions for new round
    // Start new round
    await supabase
      .from('rooms')
      .update({
        current_round: room.current_round + 1,
        phase: PHASES.POLICY_SELECTION,
        round_started_at: new Date().toISOString()
      })
      .eq('id', room.id)

    // Clear current policy/event
    await supabase
      .from('game_state')
      .update({
        current_policy: null,
        current_event: null,
        event_modifier: {}
      })
      .eq('room_id', room.id)

    return { ended: false }
  }, [room])

  const endGame = useCallback(async () => {
    if (!room) return

    await supabase
      .from('rooms')
      .update({ status: 'completed' })
      .eq('id', room.id)
  }, [room])

  return {
    startGame,
    selectPolicy,
    submitAction,
    resolveRound,
    nextRound,
    endGame,
    assignRoles
  }
}
