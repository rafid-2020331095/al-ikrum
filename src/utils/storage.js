// ── Master Employee Data ──────────────────────────────────────────────────────
// Stored as a single JSONB row (id = 1) in the `master_data` table

export async function saveMasterData(rows) {
  try {
    const lookup = {}
    rows.forEach(r => {
      const enroll = String(r.Enroll || r.EnrollNo || r['Enroll No'] || '').trim()
      if (enroll) lookup[enroll] = r
    })
    
    const res = await fetch('/api/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lookup, row_count: rows.length, uploaded_at: new Date().toISOString() })
    });
    if (!res.ok) { console.error('saveMasterData failed'); return false; }
    return true;
  } catch (e) { console.error('saveMasterData:', e); return false }
}

export async function loadMasterLookup() {
  try {
    const res = await fetch('/api/master?action=lookup');
    if (!res.ok) return {};
    const data = await res.json();
    return data.lookup || {};
  } catch { return {} }
}

export async function loadMasterMeta() {
  try {
    const res = await fetch('/api/master?action=meta');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.row_count) return null;
    return { rowCount: data.row_count, uploadedAt: data.uploaded_at };
  } catch { return null }
}

// ── Training Sessions ─────────────────────────────────────────────────────────
// Each enriched row is stored as one record in `training_sessions`

export async function addSession(enrichedRows) {
  try {
    const records = enrichedRows.map(r => ({ session_id: r._sessionId || '', row_data: r }))
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });
    if (!res.ok) { console.error('addSession failed'); return false; }
    return true;
  } catch (e) { console.error('addSession:', e); return false }
}

export async function loadAllSessions() {
  try {
    const res = await fetch('/api/sessions?action=all');
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch { return [] }
}

export async function loadSessionsMeta() {
  try {
    const res = await fetch('/api/sessions?action=meta');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
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
    const res = await fetch(`/api/sessions?action=exists&sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.exists;
  } catch { return false }
}

export async function clearAllSessions() {
  try {
    const res = await fetch('/api/sessions', { method: 'DELETE' });
    return res.ok;
  } catch { return false }
}

export async function clearAllData() {
  await fetch('/api/master', { method: 'DELETE' });
  await fetch('/api/sessions', { method: 'DELETE' });
}

// ── Backward-compat aliases (used by DashboardPage) ──────────────────────────

export async function loadData() { return loadAllSessions() }
export async function loadMeta() { return loadSessionsMeta() }
