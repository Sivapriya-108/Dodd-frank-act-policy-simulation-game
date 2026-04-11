// src/components/charts/TrendChart.jsx
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

export function TrendChart({ data, title }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  })).sort((a, b) => b.value - a.value).slice(0, 8)

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke="#94a3b8" 
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          width={100}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: '0.5rem'
          }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
