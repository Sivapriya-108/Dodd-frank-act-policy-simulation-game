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
      <div className="h-48 flex items-center justify-center text-zinc-300">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#4a3325" horizontal={false} />
        <XAxis type="number" stroke="#d7b77c" tick={{ fill: '#d7b77c' }} />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke="#d7b77c" 
          tick={{ fill: '#d7b77c', fontSize: 12 }}
          width={100}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#241813', 
            border: '1px solid #4a3325',
            borderRadius: '0.5rem'
          }}
          labelStyle={{ color: '#f5ead7' }}
        />
        <Bar dataKey="value" fill="#f4a127" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
