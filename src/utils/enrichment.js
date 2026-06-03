// ── Time helpers ─────────────────────────────────────────────────────────────

function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const str = String(timeStr).trim().toUpperCase().replace(/\./g, ':')
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/)
  if (!match) return 0
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const period = match[3]
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60 + m
}

export function calcHours(timeFrom, timeTo) {
  const start = timeToMinutes(timeFrom)
  const end = timeToMinutes(timeTo)
  const diff = end - start
  return diff > 0 ? Math.round((diff / 60) * 10) / 10 : 0
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function extractYear(dateVal) {
  if (!dateVal) return ''
  const d = new Date(dateVal)
  if (!isNaN(d.getTime())) return String(d.getFullYear())
  const m = String(dateVal).match(/\d{4}/)
  return m ? m[0] : ''
}

export function extractPeriod(dateVal) {
  if (!dateVal) return ''
  const d = new Date(dateVal)
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}${mo}`
  }
  return ''
}

export function formatDate(dateVal) {
  if (!dateVal) return ''
  const d = new Date(dateVal)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return String(dateVal)
}

// ── Derivation logic ──────────────────────────────────────────────────────────

export function deriveEmpType(designationStatus, designation) {
  const ds = String(designationStatus || '').toLowerCase()
  const d = String(designation || '').toLowerCase()
  if (ds.includes('agm') || ds.includes('above')) return 'Senior'
  if (d.includes('general manager') || d.includes('agm') || d.includes('dgm') || d.includes('ceo') || d.includes('director')) return 'Senior'
  if (d.includes('manager')) return 'Mid'
  if (d.includes('executive') || d.includes('officer')) return 'Junior'
  return 'Junior'
}

export function deriveFacultyType(trainerOrg) {
  const org = String(trainerOrg || '').toLowerCase()
  if (org.includes('akij')) return 'Internal'
  if (!org || org === '') return 'Internal'
  return 'External'
}

// ── Session ID ────────────────────────────────────────────────────────────────

export function makeSessionId(trnName, date) {
  const d = formatDate(date) || String(date)
  return `${String(trnName).trim()}__${d}`
}

// ── Main enrichment function ──────────────────────────────────────────────────

export function enrichSession(participants, sessionMeta, masterLookup) {
  const sessionId = makeSessionId(sessionMeta.TrnName, sessionMeta.Date)
  const hours = calcHours(sessionMeta.TimeFrom, sessionMeta.TimeTo)
  const year = extractYear(sessionMeta.Date)
  const period = extractPeriod(sessionMeta.Date)
  const dateStr = formatDate(sessionMeta.Date)
  const unmatched = []

  const rows = participants.map(p => {
    const enroll = String(p.EnrollNo || p['Enroll No'] || p.Enroll || '').trim()
    const master = enroll ? (masterLookup[enroll] || null) : null
    if (enroll && !master) unmatched.push({ enroll, name: p.EmployeeName || p.Name || '' })

    const designation = p.Designation || (master ? master.Designation : '')

    return {
      _sessionId: sessionId,
      Code: enroll,
      'Employee Name': p.EmployeeName || p.Name || (master ? master.Name : ''),
      TrnName: sessionMeta.TrnName,
      Hours: hours,
      Days: 1,
      'Date From': dateStr,
      'Date To': dateStr,
      TimeFrom: sessionMeta.TimeFrom,
      TimeTo: sessionMeta.TimeTo,
      Department: master ? master.Department : '',
      SubDeptName: master ? master.Department : '',
      Division: master ? master.Unit : '',
      deptunit: master ? master.Unit : '',
      Year: year,
      Period: period,
      CurrentPeriod: period,
      IranCategory: sessionMeta.IranCategory,
      FacultyType: sessionMeta.FacultyType,
      TrainingType: sessionMeta.TrainingType,
      TrnLocation: sessionMeta.Venue,
      emptype: master
        ? deriveEmpType(master['Designation Status'], designation)
        : deriveEmpType('', designation),
      Platform: sessionMeta.Platform,
      Media: sessionMeta.Media,
      Trainer: sessionMeta.Trainer,
      Designation: designation,
    }
  })

  return { rows, unmatched, sessionId }
}

// ── Parse session header from flat attendance rows ────────────────────────────

export function extractSessionHeader(rows) {
  if (!rows || rows.length === 0) return null
  const first = rows[0]
  return {
    TrnName:            String(first.TrnName || first['Training Name'] || first.Subject || '').trim(),
    Date:               first.Date || first['Training Date'] || '',
    Venue:              String(first.Venue || first.Location || '').trim(),
    TimeFrom:           String(first.TimeFrom || first['Time From'] || first['Start Time'] || '').trim(),
    TimeTo:             String(first.TimeTo || first['Time To'] || first['End Time'] || '').trim(),
    Trainer:            String(first.Trainer || first['Trainer Name'] || '').trim(),
    TrainerDesignation: String(first.TrainerDesignation || first['Trainer Designation'] || '').trim(),
    TrainerOrg:         String(first.TrainerOrg || first['Trainer Organization'] || first['Trainer Org'] || '').trim(),
  }
}

export function extractParticipants(rows) {
  return rows.map(r => ({
    SN:           r.SN || r['S/N'] || r['Serial No'] || '',
    EnrollNo:     String(r.EnrollNo || r['Enroll No'] || r.Enroll || '').trim(),
    EmployeeName: String(r.EmployeeName || r['Employee Name'] || r.Name || '').trim(),
    Designation:  String(r.Designation || '').trim(),
  })).filter(p => p.EnrollNo || p.EmployeeName)
}
