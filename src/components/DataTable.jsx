function fmt(val) {
  if (!val) return ''
  if (val instanceof Date) return val.toLocaleDateString()
  return String(val)
}

export default function DataTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ color: '#5a6a8a', textAlign: 'center', padding: '24px 0', fontSize: 12 }}>
        No records found.
      </div>
    )
  }

  const uniqueSessions = new Map()
  rows.forEach(r => {
    const sId = r._sessionId || `${String(r.TrnName).trim()}__${r['Date From'] || r.Date || ''}`
    if (!uniqueSessions.has(sId)) {
      uniqueSessions.set(sId, {
        Hours: Number(r.Hours) || 0,
        Days: Number(r.Days) || 0
      })
    }
  })
  let totalHours = 0
  let totalDays = 0
  uniqueSessions.forEach(s => {
    totalHours += s.Hours
    totalDays += s.Days
  })

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 320 }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Employee Name</th>
            <th>TrnName</th>
            <th>Hours</th>
            <th>Days</th>
            <th>Date From</th>
            <th>Date To</th>
            <th>TimeFrom</th>
            <th>TimeTo</th>
            <th>Department</th>
            <th>FacultyType</th>
            <th>TrainingType</th>
            <th>TrnLocation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{fmt(row.Code)}</td>
              <td>{fmt(row['Employee Name'])}</td>
              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmt(row.TrnName)}</td>
              <td>{fmt(row.Hours)}</td>
              <td>{fmt(row.Days)}</td>
              <td>{fmt(row['Date From'])}</td>
              <td>{fmt(row['Date To'])}</td>
              <td>{fmt(row.TimeFrom)}</td>
              <td>{fmt(row.TimeTo)}</td>
              <td>{fmt(row.Department)}</td>
              <td>{fmt(row.FacultyType)}</td>
              <td>{fmt(row.TrainingType)}</td>
              <td>{fmt(row.TrnLocation)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'right' }}>Total</td>
            <td>{totalHours.toFixed(0)}</td>
            <td>{totalDays.toFixed(0)}</td>
            <td colSpan={8}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
