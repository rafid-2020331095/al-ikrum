import { useState } from 'react'

export default function CheckboxFilter({ title, options, selected, onChange }) {
  const [search, setSearch] = useState('')

  const filtered = options.filter(o =>
    String(o).toLowerCase().includes(search.toLowerCase())
  )

  function toggle(val) {
    const strVal = String(val)
    if (selected.includes(strVal)) {
      onChange(selected.filter(s => s !== strVal))
    } else {
      onChange([...selected, strVal])
    }
  }

  function toggleAll() {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange(options.map(String))
    }
  }

  return (
    <div className="filter-panel">
      <div className="filter-title">{title}</div>
      {options.length > 5 && (
        <input
          className="search-input"
          style={{ marginBottom: 6 }}
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}
      <div style={{ maxHeight: 120, overflowY: 'auto' }}>
        {options.length > 1 && (
          <label className="checkbox-item" style={{ color: '#7090b0', marginBottom: 2 }}>
            <input type="checkbox"
              checked={selected.length === options.length}
              onChange={toggleAll}
            />
            Select all
          </label>
        )}
        {filtered.map(opt => (
          <label key={opt} className="checkbox-item">
            <input
              type="checkbox"
              checked={selected.includes(String(opt))}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}
