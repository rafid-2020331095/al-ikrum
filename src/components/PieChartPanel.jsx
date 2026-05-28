import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#f97316', '#4f8ef7', '#22c55e', '#a855f7', '#eab308', '#ef4444']

export default function PieChartPanel({ title, data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 6, padding: 12 }}>
        <div className="filter-title">{title}</div>
        <div style={{ color: '#5a6a8a', fontSize: 11, textAlign: 'center', padding: '20px 0' }}>No data</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 6, padding: 12 }}>
      <div className="filter-title">{title}</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={65}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            labelLine={false}
            fontSize={10}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e2a4a', border: '1px solid #2a3a5a', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#a0b0d0' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
