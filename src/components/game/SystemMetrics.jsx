// src/components/game/SystemMetrics.jsx
import { Activity, TrendingUp, AlertTriangle, Heart } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import { Progress } from '../ui/Progress'
import { cn, getMetricColor } from '../../lib/utils'

const metrics = [
  { key: 'financial_stability', label: 'Financial Stability', icon: Activity, inverted: false },
  { key: 'economic_growth', label: 'Economic Growth', icon: TrendingUp, inverted: false },
  { key: 'market_risk', label: 'Market Risk', icon: AlertTriangle, inverted: true },
  { key: 'public_trust', label: 'Public Trust', icon: Heart, inverted: false }
]

export function SystemMetrics({ gameState, compact = false }) {
  if (!gameState) return null

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ key, label, icon: Icon, inverted }) => (
          <div key={key} className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn('w-4 h-4', getMetricColor(gameState[key], inverted))} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-xl font-bold', getMetricColor(gameState[key], inverted))}>
                {gameState[key]}
              </span>
              <Progress value={gameState[key]} inverted={inverted} className="flex-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map(({ key, label, icon: Icon, inverted }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={cn('w-4 h-4', getMetricColor(gameState[key], inverted))} />
                <span className="text-sm text-slate-300">{label}</span>
              </div>
              <span className={cn('text-lg font-bold', getMetricColor(gameState[key], inverted))}>
                {gameState[key]}
              </span>
            </div>
            <Progress value={gameState[key]} inverted={inverted} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
