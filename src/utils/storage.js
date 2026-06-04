import { supabase } from './supabase.js'

// ── Master Employee Data ──────────────────────────────────────────────────────
// Stored as a single JSONB row (id = 1) in the `master_data` table

export async function saveMasterData(rows) {
  try {
    const lookup = {}
    rows.forEach(r => {
      const enroll = String(r.Enroll || r.EnrollNo || r['Enroll No'] || '').trim()
      if (enroll) lookup[enroll] = r
    })
    const { error } = await supabase
      .from('master_data')
      .upsert({ id: 1, lookup, row_count: rows.length, uploaded_at: new Date().toISOString() })
    if (error) { console.error('saveMasterData:', error); return false }
    return true
  } catch (e) { console.error('saveMasterData:', e); return false }
}

export async function loadMasterLookup() {
  try {
    const { data, error } = await supabase
      .from('master_data').select('lookup').eq('id', 1).maybeSingle()
    if (error || !data) return {}
    return data.lookup || {}
  } catch { return {} }
}

export async function loadMasterMeta() {
  try {
    const { data, error } = await supabase
      .from('master_data').select('row_count, uploaded_at').eq('id', 1).maybeSingle()
    if (error || !data) return null
    return { rowCount: data.row_count, uploadedAt: data.uploaded_at }
  } catch { return null }
}

// ── Training Sessions ─────────────────────────────────────────────────────────
// Each enriched row is stored as one record in `training_sessions`

export async function addSession(enrichedRows) {
  try {
    const records = enrichedRows.map(r => ({ session_id: r._sessionId || '', row_data: r }))
    const { error } = await supabase.from('training_sessions').insert(records)
    if (error) { console.error('addSession:', error); return false }
    return true
  } catch (e) { console.error('addSession:', e); return false }
}

export async function loadAllSessions() {
  try {
    const { data, error } = await supabase
      .from('training_sessions').select('row_data').order('created_at', { ascending: true })
    if (error || !data) return []
    return data.map(r => r.row_data)
  } catch { return [] }
}

export async function loadSessionsMeta() {
  try {
    const { data, error } = await supabase
      .from('training_sessions').select('session_id, created_at')
    if (error || !data || data.length === 0) return null
    const sessionIds = new Set(data.map(r => r.session_id))
    return {
      lastUploadedAt: data[data.length - 1].created_at,
      totalRows: data.length,
      sessionCount: sessionIds.size,
    }
  } catch { return null }
}

export async function sessionExists(sessionId) {
  try {
    const { data, error } = await supabase
      .from('training_sessions').select('id').eq('session_id', sessionId).limit(1)
    return !error && data && data.length > 0
  } catch { return false }
}

export async function clearAllSessions() {
  try {
    const { error } = await supabase.from('training_sessions').delete().gt('id', 0)
    return !error
  } catch { return false }
}

export async function clearAllData() {
  await supabase.from('master_data').delete().eq('id', 1)
  await supabase.from('training_sessions').delete().gt('id', 0)
}

// ── Backward-compat aliases (used by DashboardPage) ──────────────────────────

export async function loadData() { return loadAllSessions() }
export async function loadMeta() { return loadSessionsMeta() }
