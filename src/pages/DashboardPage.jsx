import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadData, loadMeta } from '../utils/storage'
import { getUniqueValues, applyFilters } from '../utils/excelParser'
import CheckboxFilter from '../components/CheckboxFilter'
import KPICard from '../components/KPICard'
import PieChartPanel from '../components/PieChartPanel'
import DataTable from '../components/DataTable'
import { BarChart2, Upload, Search } from 'lucide-react'

function groupBy(rows, field) {
  const map = {}
  rows.forEach(r => {
    const key = r[field] || 'Unknown'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

function groupBySum(rows, field, sumField) {
  const map = {}
  rows.forEach(r => {
    const key = r[field] || 'Unknown'
    map[key] = (map[key] || 0) + (Number(r[sumField]) || 0)
  })
  return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }))
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const allRows = useMemo(() => loadData(), [])
  const meta = loadMeta()

  const [filters, setFilters] = useState({
    Year: [],
    CurrentPeriod: [],
    deptunit: [],
    Department: [],
    SubDeptName: [],
    Division: [],
    FacultyType: [],
    TrainingType: [],
    TrnLocation: [],
    IranCategory: [],
  })

  const [trnSearch, setTrnSearch] = useState('')
  const [trainerSearch, setTrainerSearch] = useState('')

  const options = useMemo(() => ({
    Year: getUniqueValues(allRows, 'Year'),
    CurrentPeriod: getUniqueValues(allRows, 'CurrentPeriod'),
    deptunit: getUniqueValues(allRows, 'deptunit'),
    Department: getUniqueValues(allRows, 'Department'),
    SubDeptName: getUniqueValues(allRows, 'SubDeptName'),
    Division: getUniqueValues(allRows, 'Division'),
    FacultyType: getUniqueValues(allRows, 'FacultyType'),
    TrainingType: getUniqueValues(allRows, 'TrainingType'),
    TrnLocation: getUniqueValues(allRows, 'TrnLocation'),
    IranCategory: getUniqueValues(allRows, 'IranCategory'),
  }), [allRows])

  function setFilter(field, val) {
    setFilters(prev => ({ ...prev, [field]: val }))
  }

  const filtered = useMemo(() => {
    let rows = applyFilters(allRows, filters)
    if (trnSearch) rows = rows.filter(r => String(r.TrnName || '').toLowerCase().includes(trnSearch.toLowerCase()))
    if (trainerSearch) rows = rows.filter(r => String(r['Employee Name'] || '').toLowerCase().includes(trainerSearch.toLowerCase()))
    return rows
  }, [allRows, filters, trnSearch, trainerSearch])

  const kpis = useMemo(() => {
    const totalHours = filtered.reduce((s, r) => s + (Number(r.Hours) || 0), 0)
    const totalDays = filtered.reduce((s, r) => s + (Number(r.Days) || 0), 0)
    const uniqueNames = new Set(filtered.map(r => r['Employee Name']).filter(Boolean))
    const uniqueTrn = new Set(filtered.map(r => r.TrnName).filter(Boolean))
    const uniqueTrainers = new Set(filtered.map(r => r.Trainer).filter(Boolean))
    const uniqueCats = new Set(filtered.map(r => r.IranCategory).filter(Boolean))

    const multipleExposure = filtered.filter(r => {
      const name = r['Employee Name']
      return filtered.filter(x => x['Employee Name'] === name).length > 1
    }).length

    return {
      totalHours: Math.round(totalHours),
      multipleExposure,
      uniqueExposure: uniqueNames.size,
      totalTrn: uniqueTrn.size,
      totalDays: Math.round(totalDays),
      trainersInvolved: uniqueTrainers.size || uniqueNames.size,
      categories: uniqueCats.size,
      totalRows: filtered.length,
    }
  }, [filtered])

  const empTypePieData = useMemo(() => groupBy(filtered, 'emptype'), [filtered])
  const hoursEmpTypePie = useMemo(() => groupBySum(filtered, 'emptype', 'Hours'), [filtered])

  const trnNames = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      const k = r.TrnName
      if (!k) return
      if (!map[k]) map[k] = { period: r.Period || r.CurrentPeriod, count: 0 }
      map[k].count++
    })
    return Object.entries(map).map(([name, v]) => ({ name, period: v.period, count: v.count }))
  }, [filtered])

  const hasData = allRows.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f1929', overflow: 'hidden' }}>
      {/* Top Nav */}
      <div style={{ background: '#16213e', borderBottom: '1px solid #2a3a5a', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={18} color="#4f8ef7" />
          <span style={{ color: '#a0b8e0', fontSize: 13, fontWeight: 600 }}>MIS Report Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {meta && <span style={{ color: '#5a6a8a', fontSize: 11 }}>Last updated: {new Date(meta.uploadedAt).toLocaleString()}</span>}
          <button
            onClick={() => navigate('/upload')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
          >
            <Upload size={13} /> Upload New Excel
          </button>
        </div>
      </div>

      {!hasData ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <BarChart2 size={48} color="#2a3a5a" />
          <p style={{ color: '#5a6a8a', fontSize: 14 }}>No data loaded yet.</p>
          <button
            onClick={() => navigate('/upload')}
            style={{ background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}
          >
            Upload Excel to Get Started
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* LEFT SIDEBAR */}
          <div style={{ width: 180, flexShrink: 0, overflowY: 'auto', padding: '8px 6px', borderRight: '1px solid #1e2a3a' }}>
            <CheckboxFilter title="Years" options={options.Year} selected={filters.Year} onChange={v => setFilter('Year', v)} />
            <CheckboxFilter title="CurrentPeriod" options={options.CurrentPeriod} selected={filters.CurrentPeriod} onChange={v => setFilter('CurrentPeriod', v)} />
            <CheckboxFilter title="deptunit" options={options.deptunit} selected={filters.deptunit} onChange={v => setFilter('deptunit', v)} />
            <CheckboxFilter title="Department" options={options.Department} selected={filters.Department} onChange={v => setFilter('Department', v)} />
            <CheckboxFilter title="SubDeptName" options={options.SubDeptName} selected={filters.SubDeptName} onChange={v => setFilter('SubDeptName', v)} />
            <CheckboxFilter title="Division" options={options.Division} selected={filters.Division} onChange={v => setFilter('Division', v)} />
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* TOP ROW: Trainers search + TrnName search + Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 8 }}>
              {/* All Trainers */}
              <div className="filter-panel" style={{ margin: 0 }}>
                <div className="filter-title">All Trainers</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0f1929', border: '1px solid #2a3a5a', borderRadius: 3, padding: '4px 6px' }}>
                  <Search size={11} color="#5a6a8a" />
                  <input
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#c0c8d8', fontSize: 11, width: '100%' }}
                    placeholder="Search..."
                    value={trainerSearch}
                    onChange={e => setTrainerSearch(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: 90, overflowY: 'auto', marginTop: 4 }}>
                  {getUniqueValues(allRows, 'Employee Name').filter(n => n.toLowerCase().includes(trainerSearch.toLowerCase())).slice(0, 20).map(n => (
                    <div key={n} style={{ fontSize: 10, color: '#8090a8', padding: '2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div>
                  ))}
                </div>
              </div>

              {/* TrnName */}
              <div className="filter-panel" style={{ margin: 0 }}>
                <div className="filter-title">TrnName</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0f1929', border: '1px solid #2a3a5a', borderRadius: 3, padding: '4px 6px' }}>
                  <Search size={11} color="#5a6a8a" />
                  <input
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#c0c8d8', fontSize: 11, width: '100%' }}
                    placeholder="Search..."
                    value={trnSearch}
                    onChange={e => setTrnSearch(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: 90, overflowY: 'auto', marginTop: 4 }}>
                  {getUniqueValues(allRows, 'TrnName').filter(n => n.toLowerCase().includes(trnSearch.toLowerCase())).slice(0, 20).map(n => (
                    <div key={n} style={{ fontSize: 10, color: '#8090a8', padding: '2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div>
                  ))}
                </div>
              </div>

              {/* IranCategory */}
              <CheckboxFilter title="IranCategory" options={options.IranCategory} selected={filters.IranCategory} onChange={v => setFilter('IranCategory', v)} />

              {/* FacultyType */}
              <CheckboxFilter title="FacultyType" options={options.FacultyType} selected={filters.FacultyType} onChange={v => setFilter('FacultyType', v)} />

              {/* TrainingType */}
              <CheckboxFilter title="TrainingType" options={options.TrainingType} selected={filters.TrainingType} onChange={v => setFilter('TrainingType', v)} />

              {/* TrnLocation */}
              <CheckboxFilter title="TrnLocation" options={options.TrnLocation} selected={filters.TrnLocation} onChange={v => setFilter('TrnLocation', v)} />
            </div>

            {/* KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
              <KPICard value={kpis.totalHours} label="Hours" color="#4f8ef7" />
              <KPICard value={kpis.multipleExposure} label="Multiple Exposure" color="#f97316" />
              <KPICard value={kpis.uniqueExposure} label="Unique Exposure" color="#22c55e" />
              <KPICard value={filtered.length} label="Total Uniq Rg#" color="#a855f7" />
              <KPICard value={kpis.totalTrn} label="# of Trn" color="#4f8ef7" />
              <KPICard value={Math.round(kpis.totalDays)} label="T.Days" color="#eab308" />
              <KPICard value={kpis.trainersInvolved} label="# of Trainers Involved" color="#ef4444" />
              <KPICard value={kpis.categories} label="# of Cat" color="#06b6d4" />
            </div>

            {/* CHARTS + TrnName Period Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 8 }}>
              <PieChartPanel title="Count of TrnName by emptype" data={empTypePieData} />
              <PieChartPanel title="Hours by emptype" data={hoursEmpTypePie} />

              {/* TrnName Period mini table */}
              <div style={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', background: '#1e2a4a', padding: '5px 8px' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#a0b0d0' }}>TrnName</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#a0b0d0', marginRight: 12 }}>Period</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#a0b0d0' }}># of New TRN</span>
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 190 }}>
                  {trnNames.slice(0, 30).map((t, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '4px 8px', borderBottom: '1px solid #1a2030' }}>
                      <span style={{ fontSize: 10, color: '#8090a8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{t.name}</span>
                      <span style={{ fontSize: 10, color: '#6070a0', marginRight: 12 }}>{t.period || '-'}</span>
                      <span style={{ fontSize: 10, color: '#c0c8d8', textAlign: 'right' }}>{t.count}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#1e2a4a', padding: '4px 8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>Total</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{filtered.length}</span>
                </div>
              </div>
            </div>

            {/* DATA TABLE */}
            <div style={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 6, overflow: 'hidden', flex: 1 }}>
              <div style={{ background: '#1e2a4a', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#a0b4d0' }}>
                  Training Records — {filtered.length} rows
                </span>
              </div>
              <DataTable rows={filtered} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
