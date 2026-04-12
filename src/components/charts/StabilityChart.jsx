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
      <div className="h-64 flex items-center justify-center text-zinc-300">
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
        <CartesianGrid strokeDasharray="3 3" stroke="#4a3325" />
        <XAxis 
          dataKey="round" 
          stroke="#d7b77c"
          tick={{ fill: '#d7b77c' }}
        />
        <YAxis 
          domain={[0, 100]} 
          stroke="#d7b77c"
          tick={{ fill: '#d7b77c' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#241813', 
            border: '1px solid #4a3325',
            borderRadius: '0.5rem'
          }}
          labelStyle={{ color: '#f5ead7' }}
        />
        <Legend wrapperStyle={{ color: '#f5ead7' }} />
        <Line 
          type="monotone" 
          dataKey="stability" 
          stroke="#e6c15c" 
          strokeWidth={2}
          dot={{ fill: '#e6c15c' }}
          name="Stability"
        />
        <Line 
          type="monotone" 
          dataKey="growth" 
          stroke="#758c32" 
          strokeWidth={2}
          dot={{ fill: '#758c32' }}
          name="Growth"
        />
        <Line 
          type="monotone" 
          dataKey="trust" 
          stroke="#d86a72" 
          strokeWidth={2}
          dot={{ fill: '#d86a72' }}
          name="Trust"
        />
        <Line 
          type="monotone" 
          dataKey="risk" 
          stroke="#e5771e" 
          strokeWidth={2}
          dot={{ fill: '#e5771e' }}
          name="Risk"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
