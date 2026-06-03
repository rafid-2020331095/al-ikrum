const MASTER_KEY = 'mis_master_data'
const MASTER_META_KEY = 'mis_master_meta'
const SESSIONS_KEY = 'mis_sessions_data'
const SESSIONS_META_KEY = 'mis_sessions_meta'

// ── Master Employee Data ─────────────────────────────────────────────────────

export function saveMasterData(rows) {
  try {
    const lookup = {}
    rows.forEach(r => {
      const enroll = String(r.Enroll || r.EnrollNo || r['Enroll No'] || '').trim()
      if (enroll) lookup[enroll] = r
    })
    localStorage.setItem(MASTER_KEY, JSON.stringify(lookup))
    localStorage.setItem(MASTER_META_KEY, JSON.stringify({
      uploadedAt: new Date().toISOString(),
      rowCount: rows.length
    }))
    return true
  } catch (e) {
    console.error('Storage error:', e)
    return false
  }
}

export function loadMasterLookup() {
  try {
    const raw = localStorage.getItem(MASTER_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function loadMasterMeta() {
  try {
    const raw = localStorage.getItem(MASTER_META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Training Sessions ─────────────────────────────────────────────────────────

export function addSession(enrichedRows) {
  try {
    const existing = loadAllSessions()
    const combined = [...existing, ...enrichedRows]
    const sessionIds = new Set(combined.map(r => r._sessionId).filter(Boolean))
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(combined))
    localStorage.setItem(SESSIONS_META_KEY, JSON.stringify({
      lastUploadedAt: new Date().toISOString(),
      totalRows: combined.length,
      sessionCount: sessionIds.size
    }))
    return true
  } catch (e) {
    console.error('Storage error:', e)
    return false
  }
}

export function loadAllSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function loadSessionsMeta() {
  try {
    const raw = localStorage.getItem(SESSIONS_META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function sessionExists(sessionId) {
  const sessions = loadAllSessions()
  return sessions.some(r => r._sessionId === sessionId)
}

export function clearAllSessions() {
  localStorage.removeItem(SESSIONS_KEY)
  localStorage.removeItem(SESSIONS_META_KEY)
}

export function clearAllData() {
  localStorage.removeItem(MASTER_KEY)
  localStorage.removeItem(MASTER_META_KEY)
  localStorage.removeItem(SESSIONS_KEY)
  localStorage.removeItem(SESSIONS_META_KEY)
}

// ── Backward-compat aliases (used by DashboardPage) ──────────────────────────

export function loadData() { return loadAllSessions() }
export function loadMeta() { return loadSessionsMeta() }
