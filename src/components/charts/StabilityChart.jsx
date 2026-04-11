// src/components/charts/StabilityChart.jsx
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'

export function StabilityChart({ data }) {
  if (!data || data.rounds.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No data available yet
      </div>
    )
  }

  const chartData = data.rounds.map((round, i) => ({
    round,
    stability: data.stability[i],
    growth: data.growth[i],
    trust: data.trust[i],
    risk: data.marketRisk[i]
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="round" 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          domain={[0, 100]} 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: '0.5rem'
          }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="stability" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6' }}
          name="Stability"
        />
        <Line 
          type="monotone" 
          dataKey="growth" 
          stroke="#22c55e" 
          strokeWidth={2}
          dot={{ fill: '#22c55e' }}
          name="Growth"
        />
        <Line 
          type="monotone" 
          dataKey="trust" 
          stroke="#a855f7" 
          strokeWidth={2}
          dot={{ fill: '#a855f7' }}
          name="Trust"
        />
        <Line 
          type="monotone" 
          dataKey="risk" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444' }}
          name="Risk"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
