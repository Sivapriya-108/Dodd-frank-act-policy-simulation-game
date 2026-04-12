// src/lib/constants.js
export const ROLES = {
  GOVERNMENT: 'government',
  BANK: 'bank',
  INVESTOR: 'investor',
  CITIZEN: 'citizen'
}

export const ROLE_DISTRIBUTION = {
  government: 1,
  bank: 6,
  investor: 6,
  citizen: 12
}

export function getBalancedRoleCounts(totalPlayers) {
  const nonGovernmentPlayers = Math.max(0, totalPlayers - 1)
  const baseCount = Math.floor(nonGovernmentPlayers / 3)
  const remainder = nonGovernmentPlayers % 3

  return {
    government: totalPlayers > 0 ? 1 : 0,
    bank: baseCount + (remainder > 0 ? 1 : 0),
    investor: baseCount + (remainder > 1 ? 1 : 0),
    citizen: baseCount
  }
}

export const ROLE_COLORS = {
  government: {
    primary: 'government',
    bg: 'bg-government-900',
    border: 'border-government-500',
    text: 'text-government-100',
    gradient: 'from-government-500 to-government-700'
  },
  bank: {
    primary: 'bank',
    bg: 'bg-bank-900',
    border: 'border-bank-500',
    text: 'text-bank-100',
    gradient: 'from-bank-500 to-bank-700'
  },
  investor: {
    primary: 'investor',
    bg: 'bg-investor-900',
    border: 'border-investor-500',
    text: 'text-investor-100',
    gradient: 'from-investor-500 to-investor-700'
  },
  citizen: {
    primary: 'citizen',
    bg: 'bg-citizen-900',
    border: 'border-citizen-500',
    text: 'text-citizen-100',
    gradient: 'from-citizen-500 to-citizen-700'
  }
}

export const POLICIES = [
  { id: 'tighten_regulation', name: 'Tighten Regulation', description: 'Increase capital requirements and oversight', icon: 'Shield' },
  { id: 'relax_regulation', name: 'Relax Regulation', description: 'Reduce compliance burden on financial institutions', icon: 'Unlock' },
  { id: 'increase_enforcement', name: 'Increase Enforcement', description: 'Crack down on violations and risky behavior', icon: 'Gavel' },
  { id: 'bailout_banks', name: 'Bailout Banks', description: 'Provide emergency financial support', icon: 'Banknote' }
]

export const ACTIONS = {
  bank: [
    { id: 'comply', name: 'Comply', description: 'Follow regulations strictly', risk: 0, reward: 1 },
    { id: 'high_risk_trading', name: 'High-Risk Trading', description: 'Pursue aggressive profits', risk: 3, reward: 4 },
    { id: 'lobby_government', name: 'Lobby Government', description: 'Influence policy decisions', risk: 1, reward: 2 },
    { id: 'shadow_banking', name: 'Shadow Banking', description: 'Operate outside regulations', risk: 4, reward: 5 }
  ],
  investor: [
    { id: 'invest_aggressively', name: 'Invest Aggressively', description: 'High risk, high reward strategy', risk: 3, reward: 4 },
    { id: 'invest_safely', name: 'Invest Safely', description: 'Conservative portfolio approach', risk: 0, reward: 1 },
    { id: 'withdraw_funds', name: 'Withdraw Funds', description: 'Move to cash positions', risk: 1, reward: 0 },
    { id: 'speculate', name: 'Speculate', description: 'Bet on market movements', risk: 4, reward: 5 }
  ],
  citizen: [
    { id: 'borrow_spend', name: 'Borrow & Spend', description: 'Take loans for consumption', risk: 2, reward: 2 },
    { id: 'save_conservatively', name: 'Save Conservatively', description: 'Build emergency fund', risk: 0, reward: 1 },
    { id: 'protest_regulation', name: 'Protest Regulation', description: 'Demand policy changes', risk: 1, reward: 1 },
    { id: 'withdraw_trust', name: 'Withdraw Trust', description: 'Bank run behavior', risk: 3, reward: 0 }
  ]
}

export const EVENTS = [
  { id: 'financial_boom', name: 'Financial Boom', description: 'Markets surge unexpectedly', effects: { economic_growth: 15, market_risk: 10, financial_stability: -5 } },
  { id: 'market_crash_warning', name: 'Market Crash Warning', description: 'Analysts predict downturn', effects: { market_risk: 20, public_trust: -10, economic_growth: -5 } },
  { id: 'election_pressure', name: 'Election Pressure', description: 'Politicians push for popular policies', effects: { public_trust: 10, financial_stability: -5 } },
  { id: 'media_scandal', name: 'Media Scandal', description: 'Banking misconduct exposed', effects: { public_trust: -20, market_risk: 10 } },
  { id: 'tech_innovation', name: 'Technology Innovation', description: 'Fintech disrupts markets', effects: { economic_growth: 10, market_risk: 5, financial_stability: 5 } },
  { id: 'international_crisis', name: 'International Crisis', description: 'Global markets affected', effects: { market_risk: 15, economic_growth: -10, financial_stability: -10 } },
  { id: 'regulatory_success', name: 'Regulatory Success', description: 'Policy shows positive results', effects: { financial_stability: 10, public_trust: 10 } },
  { id: 'none', name: 'Calm Markets', description: 'No significant events', effects: {} }
]

export const PHASES = {
  POLICY_SELECTION: 'policy_selection',
  PLAYER_ACTIONS: 'player_actions',
  RESOLUTION: 'resolution',
  RESULTS: 'results'
}
