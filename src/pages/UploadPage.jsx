import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseExcelFile } from '../utils/excelParser'
import { saveData, loadMeta } from '../utils/storage'
import { UploadCloud, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()
  const meta = loadMeta()

  async function handleFile(file) {
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setStatus('error')
      setMessage('Please upload a valid .xlsx, .xls or .csv file.')
      return
    }
    setStatus('loading')
    setMessage('Parsing file...')
    try {
      const rows = await parseExcelFile(file)
      if (rows.length === 0) {
        setStatus('error')
        setMessage('The file appears to be empty.')
        return
      }
      const saved = saveData(rows)
      if (saved) {
        setStatus('success')
        setMessage(`Successfully loaded ${rows.length} rows from "${file.name}"`)
      } else {
        setStatus('error')
        setMessage('Failed to save data. File may be too large for browser storage.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(`Error: ${err.message}`)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function onInputChange(e) {
    handleFile(e.target.files[0])
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0f1929' }}>
      <div style={{ width: 520 }}>
        <div className="flex items-center gap-3 mb-8">
          <BarChart2 size={28} color="#4f8ef7" />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e0e8ff' }}>MIS Report Dashboard</h1>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? '#4f8ef7' : '#2a3a5a'}`,
            borderRadius: 10,
            padding: '48px 32px',
            textAlign: 'center',
            background: dragging ? '#1a2540' : '#16213e',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <UploadCloud size={48} color={dragging ? '#4f8ef7' : '#3a4a6a'} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#a0b0d0', fontSize: 14, marginBottom: 8 }}>
            Drag & drop your Excel file here
          </p>
          <p style={{ color: '#5a6a8a', fontSize: 12 }}>
            Supports .xlsx, .xls, .csv
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={onInputChange}
          />
        </div>

        {status === 'loading' && (
          <div style={{ marginTop: 16, textAlign: 'center', color: '#a0b0d0' }}>
            <div style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid #4f8ef7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: 8, fontSize: 13 }}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ marginTop: 16, background: '#0d2a1a', border: '1px solid #1a5a30', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} color="#22c55e" />
            <span style={{ color: '#86efac', fontSize: 13 }}>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div style={{ marginTop: 16, background: '#2a0d0d', border: '1px solid #5a1a1a', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#fca5a5', fontSize: 13 }}>{message}</span>
          </div>
        )}

        {meta && (
          <div style={{ marginTop: 12, color: '#5a6a8a', fontSize: 11, textAlign: 'center' }}>
            Last uploaded: {new Date(meta.uploadedAt).toLocaleString()} &mdash; {meta.rowCount} rows
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: '#4f8ef7',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
