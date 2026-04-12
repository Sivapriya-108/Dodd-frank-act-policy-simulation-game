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

  const throwIfError = (error, context) => {
    if (error) {
      throw new Error(`${context}: ${error.message || 'Unknown Supabase error'}`)
    }
  }

  const assignRoles = useCallback(async () => {
    if (!room || players.length < 2) return

    const governmentPlayer =
      players.find(p => p.id === room.created_by) ||
      players.find(p => p.role === 'government') ||
      players[0]

    const governmentPlayerId = governmentPlayer?.id
    const assignablePlayers = players.filter(p => p.id !== governmentPlayerId)
    const shuffled = shuffleArray(assignablePlayers)
    const totalPlayers = assignablePlayers.length + 1
    const roleCounts = getBalancedRoleCounts(totalPlayers)

    const roles = [
      ...Array(roleCounts.bank).fill('bank'),
      ...Array(roleCounts.investor).fill('investor'),
      ...Array(roleCounts.citizen).fill('citizen')
    ]

    const shuffledRoles = shuffleArray(roles)

    // Ensure there is exactly one government role before assigning other roles.
    if (governmentPlayerId) {
      const { error: governmentError } = await supabase
        .from('players')
        .update({ role: 'government' })
        .eq('id', governmentPlayerId)
      throwIfError(governmentError, 'Failed to mark government player')
    }

    // Update each player
    for (let i = 0; i < shuffled.length; i++) {
      const { error: roleError } = await supabase
        .from('players')
        .update({ role: shuffledRoles[i] })
        .eq('id', shuffled[i].id)
      throwIfError(roleError, 'Failed to assign role')
    }
  }, [room, players])

  const startGame = useCallback(async () => {
    if (!room) return

    await assignRoles()

    const { error: startError } = await supabase
      .from('rooms')
      .update({
        status: 'in_progress',
        current_round: 1,
        phase: PHASES.POLICY_SELECTION,
        round_started_at: new Date().toISOString()
      })
      .eq('id', room.id)
    throwIfError(startError, 'Failed to start game')
  }, [room, assignRoles])

  const selectPolicy = useCallback(async (policyId) => {
    if (!room || !gameState) return

    const event = selectRandomEvent()

    const { error: stateError } = await supabase
      .from('game_state')
      .update({
        current_policy: policyId,
        current_event: event.id,
        event_modifier: event.effects
      })
      .eq('room_id', room.id)
    throwIfError(stateError, 'Failed to save policy/event')

    const { error: phaseError } = await supabase
      .from('rooms')
      .update({
        phase: PHASES.PLAYER_ACTIONS,
        round_started_at: new Date().toISOString()
      })
      .eq('id', room.id)
    throwIfError(phaseError, 'Failed to switch to action phase')
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
      throw error
    }
  }, [room, player])

  const resolveRound = useCallback(async () => {
    if (!room || !gameState) return

    // Get all decisions for current round with player roles
    const { data: roundDecisions, error: decisionsError } = await supabase
      .from('decisions')
      .select('*, players!inner(role)')
      .eq('room_id', room.id)
      .eq('round', room.current_round)
    throwIfError(decisionsError, 'Failed to fetch round decisions')

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
      const { data: playerData, error: playerFetchError } = await supabase
        .from('players')
        .select('score')
        .eq('id', playerId)
        .single()
      throwIfError(playerFetchError, 'Failed to fetch player score')
      
      if (playerData) {
        const { error: scoreUpdateError } = await supabase
          .from('players')
          .update({ score: (playerData.score || 0) + scoreChange })
          .eq('id', playerId)
        throwIfError(scoreUpdateError, 'Failed to update player score')
      }
    }

    // Update decision score changes
    for (const decision of decisionsWithRoles) {
      const { error: decisionUpdateError } = await supabase
        .from('decisions')
        .update({ score_change: results.playerScores[decision.player_id] || 0 })
        .eq('id', decision.id)
      throwIfError(decisionUpdateError, 'Failed to update decision score change')
    }

    // Apply state changes
    const newState = applyStateChanges(gameState, results.stateChanges)

    const { error: gameStateUpdateError } = await supabase
      .from('game_state')
      .update({
        financial_stability: newState.financial_stability,
        economic_growth: newState.economic_growth,
        market_risk: newState.market_risk,
        public_trust: newState.public_trust
      })
      .eq('room_id', room.id)
    throwIfError(gameStateUpdateError, 'Failed to update game state')

    // Save to history
    const { data: allPlayers, error: allPlayersError } = await supabase
      .from('players')
      .select('id, name, role, score')
      .eq('room_id', room.id)
    throwIfError(allPlayersError, 'Failed to fetch players for history')

    const { error: historyError } = await supabase
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
    throwIfError(historyError, 'Failed to write history entry')

    // Update room phase
    const { error: roomPhaseError } = await supabase
      .from('rooms')
      .update({ phase: PHASES.RESULTS })
      .eq('id', room.id)
    throwIfError(roomPhaseError, 'Failed to switch to results phase')

    // Check for game end
    const gameEnd = checkGameEnd(newState, room.current_round, room.max_rounds)
    
    return { results, gameEnd }
  }, [room, gameState])

  const nextRound = useCallback(async () => {
    if (!room) return

    // Check if game should end
    const { data: latestState, error: latestStateError } = await supabase
      .from('game_state')
      .select('*')
      .eq('room_id', room.id)
      .single()
    throwIfError(latestStateError, 'Failed to fetch latest state')

    const gameEnd = checkGameEnd(latestState, room.current_round, room.max_rounds)

    if (gameEnd.ended) {
      const { error: completeError } = await supabase
        .from('rooms')
        .update({ status: 'completed' })
        .eq('id', room.id)
      throwIfError(completeError, 'Failed to complete game')
      return { ended: true, reason: gameEnd.reason }
    }

    // Clear decisions for new round
    // Start new round
    const { error: roundAdvanceError } = await supabase
      .from('rooms')
      .update({
        current_round: room.current_round + 1,
        phase: PHASES.POLICY_SELECTION,
        round_started_at: new Date().toISOString()
      })
      .eq('id', room.id)
    throwIfError(roundAdvanceError, 'Failed to advance to next round')

    // Clear current policy/event
    const { error: resetStateError } = await supabase
      .from('game_state')
      .update({
        current_policy: null,
        current_event: null,
        event_modifier: {}
      })
      .eq('room_id', room.id)
    throwIfError(resetStateError, 'Failed to reset round state')

    return { ended: false }
  }, [room])

  const endGame = useCallback(async () => {
    if (!room) return

    const { error } = await supabase
      .from('rooms')
      .update({ status: 'completed' })
      .eq('id', room.id)
    throwIfError(error, 'Failed to end game')
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
