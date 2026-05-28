const STORAGE_KEY = 'mis_dashboard_data'
const META_KEY = 'mis_dashboard_meta'

export function saveData(rows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
    localStorage.setItem(META_KEY, JSON.stringify({
      uploadedAt: new Date().toISOString(),
      rowCount: rows.length
    }))
    return true
  } catch (e) {
    console.error('Storage error:', e)
    return false
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(META_KEY)
}
