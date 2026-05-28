import * as XLSX from 'xlsx'

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function getUniqueValues(rows, field) {
  const vals = [...new Set(rows.map(r => r[field]).filter(Boolean))]
  return vals.sort()
}

export function applyFilters(rows, filters) {
  return rows.filter(row => {
    for (const [field, selected] of Object.entries(filters)) {
      if (selected.length === 0) continue
      if (!selected.includes(String(row[field]))) return false
    }
    return true
  })
}
