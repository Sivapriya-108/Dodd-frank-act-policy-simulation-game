// src/lib/gameEngine.js
import { ACTIONS, EVENTS, POLICIES } from './constants'

// Calculate score changes based on actions, policy, and game state
export function calculateRoundResults(gameState, policy, decisions, event) {
  const results = {
    stateChanges: {
      financial_stability: 0,
      economic_growth: 0,
      market_risk: 0,
      public_trust: 0
    },
    playerScores: {},
    analysis: {
      complianceRate: 0,
      riskLevel: 0,
      decisions: {}
    }
  }

  // Count decisions by type
  const decisionCounts = {}
  decisions.forEach(d => {
    decisionCounts[d.action] = (decisionCounts[d.action] || 0) + 1
  })
  results.analysis.decisions = decisionCounts

  // Apply event effects
  if (event && event.effects) {
    Object.entries(event.effects).forEach(([key, value]) => {
      if (key in results.stateChanges) {
        results.stateChanges[key] += value
      }
    })
  }

  // Apply policy effects
  const policyEffects = getPolicyEffects(policy)
  Object.entries(policyEffects).forEach(([key, value]) => {
    if (key in results.stateChanges) {
      results.stateChanges[key] += value
    }
  })

  // Process each decision
  let compliantCount = 0
  let totalRisk = 0

  decisions.forEach(decision => {
    const { player_id, action, role } = decision
    const actionDef = ACTIONS[role]?.find(a => a.id === action)
    
    if (!actionDef) {
      results.playerScores[player_id] = 0
      return
    }

    // Track compliance and risk
    if (actionDef.risk === 0) compliantCount++
    totalRisk += actionDef.risk

    // Calculate score based on state and policy
    let score = calculateActionScore(actionDef, policy, gameState, event)
    
    results.playerScores[player_id] = score

    // Aggregate effects on game state
    const stateEffects = calculateStateEffects(action, role, policy)
    Object.entries(stateEffects).forEach(([key, value]) => {
      if (key in results.stateChanges) {
        results.stateChanges[key] += value
      }
    })
  })

  // Calculate analysis metrics
  results.analysis.complianceRate = decisions.length > 0 
    ? Math.round((compliantCount / decisions.length) * 100) 
    : 0
  results.analysis.riskLevel = decisions.length > 0
    ? Math.round((totalRisk / (decisions.length * 4)) * 100)
    : 0

  // Normalize state changes
  Object.keys(results.stateChanges).forEach(key => {
    results.stateChanges[key] = Math.round(results.stateChanges[key])
  })

  return results
}

function getPolicyEffects(policy) {
  const effects = {
    tighten_regulation: { financial_stability: 10, economic_growth: -5, market_risk: -10, public_trust: 5 },
    relax_regulation: { financial_stability: -5, economic_growth: 10, market_risk: 10, public_trust: -5 },
    increase_enforcement: { financial_stability: 5, market_risk: -5, public_trust: 10 },
    bailout_banks: { financial_stability: 15, economic_growth: 5, public_trust: -15, market_risk: -5 }
  }
  return effects[policy] || {}
}

function calculateActionScore(actionDef, policy, gameState, event) {
  let baseScore = actionDef.reward * 10
  const riskPenalty = actionDef.risk * 5

  // Policy modifiers
  if (policy === 'tighten_regulation' || policy === 'increase_enforcement') {
    // Risky actions get penalized more
    baseScore -= actionDef.risk * 8
    // Compliant actions get bonus
    if (actionDef.risk === 0) baseScore += 15
  } else if (policy === 'relax_regulation') {
    // Risky actions are more rewarding
    baseScore += actionDef.risk * 5
  }

  // Market state modifiers
  if (gameState.market_risk > 70) {
    // High risk environment penalizes risky actions more
    baseScore -= actionDef.risk * 3
  }
  if (gameState.financial_stability < 30) {
    // Unstable conditions
    baseScore -= actionDef.risk * 5
    if (actionDef.risk === 0) baseScore += 10
  }

  // Event modifiers
  if (event?.id === 'market_crash_warning' && actionDef.risk > 2) {
    baseScore -= 20
  }
  if (event?.id === 'financial_boom' && actionDef.reward > 2) {
    baseScore += 15
  }

  // Random variance
  baseScore += Math.floor(Math.random() * 10) - 5

  return Math.max(-30, Math.min(50, baseScore))
}

function calculateStateEffects(action, role, policy) {
  const effects = {
    // Bank actions
    comply: { financial_stability: 2, market_risk: -2 },
    high_risk_trading: { economic_growth: 3, market_risk: 5, financial_stability: -3 },
    lobby_government: { public_trust: -2 },
    shadow_banking: { market_risk: 8, economic_growth: 2, financial_stability: -5 },
    // Investor actions
    invest_aggressively: { economic_growth: 2, market_risk: 3 },
    invest_safely: { financial_stability: 1 },
    withdraw_funds: { market_risk: 2, economic_growth: -2 },
    speculate: { market_risk: 5, economic_growth: 1 },
    // Citizen actions
    borrow_spend: { economic_growth: 2, market_risk: 1 },
    save_conservatively: { financial_stability: 1, economic_growth: -1 },
    protest_regulation: { public_trust: 2 },
    withdraw_trust: { financial_stability: -5, public_trust: -3, market_risk: 3 }
  }

  return effects[action] || {}
}

export function selectRandomEvent() {
  const random = Math.random()
  // 30% chance of no event
  if (random < 0.3) {
    return EVENTS.find(e => e.id === 'none')
  }
  // Pick random event excluding 'none'
  const events = EVENTS.filter(e => e.id !== 'none')
  return events[Math.floor(Math.random() * events.length)]
}

export function applyStateChanges(currentState, changes) {
  const newState = { ...currentState }
  
  Object.entries(changes).forEach(([key, value]) => {
    if (key in newState && typeof newState[key] === 'number') {
      newState[key] = Math.max(0, Math.min(100, newState[key] + value))
    }
  })

  return newState
}

export function checkGameEnd(gameState, currentRound, maxRounds) {
  // Check if max rounds reached
  if (currentRound >= maxRounds) {
    return { ended: true, reason: 'Max rounds reached' }
  }

  // Check for critical failure states
  if (gameState.financial_stability <= 0) {
    return { ended: true, reason: 'Financial system collapse!' }
  }
  if (gameState.public_trust <= 0) {
    return { ended: true, reason: 'Complete loss of public trust!' }
  }
  if (gameState.market_risk >= 100) {
    return { ended: true, reason: 'Market meltdown!' }
  }

  return { ended: false }
}

export function generateAnalyticsData(history) {
  const analytics = {
    rounds: [],
    compliance: [],
    risk: [],
    stability: [],
    growth: [],
    trust: [],
    marketRisk: [],
    policies: {},
    events: {},
    topActions: {}
  }

  history.forEach((record, index) => {
    analytics.rounds.push(index + 1)
    analytics.stability.push(record.state_snapshot.financial_stability)
    analytics.growth.push(record.state_snapshot.economic_growth)
    analytics.trust.push(record.state_snapshot.public_trust)
    analytics.marketRisk.push(record.state_snapshot.market_risk)
    
    if (record.decisions_summary) {
      analytics.compliance.push(record.decisions_summary.complianceRate || 0)
      analytics.risk.push(record.decisions_summary.riskLevel || 0)
      
      // Track action frequencies
      Object.entries(record.decisions_summary.decisions || {}).forEach(([action, count]) => {
        analytics.topActions[action] = (analytics.topActions[action] || 0) + count
      })
    }

    // Track policies
    if (record.policy) {
      analytics.policies[record.policy] = (analytics.policies[record.policy] || 0) + 1
    }

    // Track events
    if (record.event && record.event !== 'none') {
      analytics.events[record.event] = (analytics.events[record.event] || 0) + 1
    }
  })

  return analytics
}

export function exportAnalytics(analytics, format = 'json') {
  if (format === 'json') {
    return JSON.stringify(analytics, null, 2)
  }
  
  // CSV format
  let csv = 'Round,Stability,Growth,Trust,MarketRisk,Compliance,Risk\n'
  analytics.rounds.forEach((round, i) => {
    csv += `${round},${analytics.stability[i]},${analytics.growth[i]},${analytics.trust[i]},${analytics.marketRisk[i]},${analytics.compliance[i] || 0},${analytics.risk[i] || 0}\n`
  })
  return csv
}
