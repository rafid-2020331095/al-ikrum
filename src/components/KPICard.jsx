export default function KPICard({ value, label, color }) {
  const displayValue = typeof value === 'number'
    ? value >= 1000
      ? (value / 1000).toFixed(value >= 10000 ? 1 : 2).replace(/\.0+$/, '') + 'K'
      : value
    : value

  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${color || '#4f8ef7'}` }}>
      <div className="kpi-value" style={{ color: color || '#4f8ef7' }}>{displayValue}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}
