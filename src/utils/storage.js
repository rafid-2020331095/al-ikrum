// ── Retry helper for Neon cold starts ─────────────────────────────────────────
async function fetchWithRetry(url, options = {}, retries = 2, delayMs = 2000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) return res;
      const data = await res.json();
      // If we got a non-empty result, return it immediately
      const isEmpty = Array.isArray(data)
        ? data.length === 0
        : !data || Object.keys(data).length === 0;
      if (!isEmpty || i === retries) {
        // Return a fake Response-like object with the data
        return { ok: true, _data: data, json: async () => data };
      }
      // Empty result — Neon might still be waking up, wait and retry
      await new Promise(r => setTimeout(r, delayMs));
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

// ── Master Employee Data ──────────────────────────────────────────────────────
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
    const res = await fetchWithRetry('/api/master?action=lookup');
    if (!res.ok) return {};
    const data = await res.json();
    return data.lookup || {};
  } catch { return {} }
}

export async function loadMasterMeta() {
  try {
    const res = await fetchWithRetry('/api/master?action=meta');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.row_count) return null;
    return { rowCount: data.row_count, uploadedAt: data.uploaded_at };
  } catch { return null }
}

// ── Training Sessions ─────────────────────────────────────────────────────────
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
    const res = await fetchWithRetry('/api/sessions?action=all');
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch { return [] }
}

export async function loadSessionsMeta() {
  try {
    const res = await fetchWithRetry('/api/sessions?action=meta');
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

// ── Backward-compat aliases ───────────────────────────────────────────────────
export async function loadData() { return loadAllSessions() }
export async function loadMeta() { return loadSessionsMeta() }
