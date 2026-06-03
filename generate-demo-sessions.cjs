// Generates 2 additional demo attendance session Excel files
// Run: node generate-demo-sessions.cjs

const XLSX = require('xlsx')

// ── Session 2: Leadership & Team Management ───────────────────────────────────
// All enroll numbers taken from Management_Employees_Master_Data.csv
const session2 = {
  TrnName: 'Leadership & Team Management',
  Date: '2026-02-15',
  Venue: 'Akij Conference Hall',
  TimeFrom: '09:00 AM',
  TimeTo: '05:00 PM',
  Trainer: 'Monir Ahmed',
  TrainerDesignation: 'Assistant General Manager, Admin',
  TrainerOrg: 'Akij Food & Beverage Ltd.',
}

const participants2 = [
  { SN: 1, EnrollNo: '43644', EmployeeName: 'Md. Kamrul Hasan', Designation: 'Assistant Manager' },
  { SN: 2, EnrollNo: '42815', EmployeeName: 'Mahabubur Rahman', Designation: 'Deputy Manager' },
  { SN: 3, EnrollNo: '524758', EmployeeName: 'Md. Moklesur Rahman', Designation: 'Manager' },
  { SN: 4, EnrollNo: '1040', EmployeeName: 'Md. Jewel Sharif', Designation: 'Manager' },
  { SN: 5, EnrollNo: '1041', EmployeeName: 'Habibur Rahman', Designation: 'Deputy Manager' },
  { SN: 6, EnrollNo: '525501', EmployeeName: 'Shafrin Sultana Biva', Designation: 'Manager' },
  { SN: 7, EnrollNo: '524938', EmployeeName: 'Md. Lutful Bary Abir', Designation: 'Assistant Manager' },
  { SN: 8, EnrollNo: '536627', EmployeeName: 'Md. Abu Sayed Chowdhary', Designation: 'Assistant Manager' },
  { SN: 9, EnrollNo: '96287', EmployeeName: 'Adnan Shafiq', Designation: 'Senior Manager' },
  { SN: 10, EnrollNo: '155258', EmployeeName: 'Abdul Aziz', Designation: 'Senior Manager' },
  { SN: 11, EnrollNo: '529606', EmployeeName: 'S.M. Mehedi All Sheraji', Designation: 'Senior Manager' },
  { SN: 12, EnrollNo: '1315', EmployeeName: 'Md. Golam Kibria', Designation: 'Deputy Manager' },
  { SN: 13, EnrollNo: '313307', EmployeeName: 'Waliul Nachhir', Designation: 'Deputy Manager' },
  { SN: 14, EnrollNo: '466506', EmployeeName: 'Md. Jahidul Islam', Designation: 'Assistant Manager' },
  { SN: 15, EnrollNo: '496229', EmployeeName: 'Md. Abdul Hai Bhuyan', Designation: 'Assistant General Manager' },
]

// ── Session 3: IT & Digital Transformation ───────────────────────────────────
// All enroll numbers taken from Management_Employees_Master_Data.csv
// External trainer → FacultyType will auto-detect as "External"
const session3 = {
  TrnName: 'IT & Digital Transformation',
  Date: '2026-03-22',
  Venue: 'Online - Zoom',
  TimeFrom: '10:00 AM',
  TimeTo: '12:00 PM',
  Trainer: 'Dr. Arif Hossain',
  TrainerDesignation: 'IT Consultant',
  TrainerOrg: 'TechBridge Solutions Ltd.',
}

const participants3 = [
  { SN: 1, EnrollNo: '415056', EmployeeName: 'Saleh Newaz', Designation: 'Senior Executive' },
  { SN: 2, EnrollNo: '540423', EmployeeName: 'Prince Mahmud', Designation: 'Junior Executive' },
  { SN: 3, EnrollNo: '543696', EmployeeName: 'S A F Md Ahad', Designation: 'Junior Executive' },
  { SN: 4, EnrollNo: '551243', EmployeeName: 'S M Zahid Hasan', Designation: 'Executive' },
  { SN: 5, EnrollNo: '538499', EmployeeName: 'Mohammad Asaduzzaman Riad', Designation: 'Executive' },
  { SN: 6, EnrollNo: '533443', EmployeeName: 'Md. Abdulla Al Mamun Sazal', Designation: 'Executive' },
  { SN: 7, EnrollNo: '549198', EmployeeName: 'Md. Rabbi Rahman', Designation: 'Executive' },
  { SN: 8, EnrollNo: '538840', EmployeeName: 'Md. Shohel Rana', Designation: 'Junior Executive' },
  { SN: 9, EnrollNo: '479219', EmployeeName: 'Estiak Ahmed', Designation: 'Executive' },
  { SN: 10, EnrollNo: '539355', EmployeeName: 'Md Saymum Joynal', Designation: 'Executive' },
  { SN: 11, EnrollNo: '514242', EmployeeName: 'Mohammad Rakib Ahmed', Designation: 'Junior Executive' },
  { SN: 12, EnrollNo: '540689', EmployeeName: 'Imran Kaisar', Designation: 'Senior Executive' },
  { SN: 13, EnrollNo: '529517', EmployeeName: 'Rasel Rana', Designation: 'Executive' },
]

// ── Builder ───────────────────────────────────────────────────────────────────
function buildSheet(session, participants) {
  const rows = participants.map(p => ({
    TrnName: session.TrnName,
    Date: session.Date,
    Venue: session.Venue,
    TimeFrom: session.TimeFrom,
    TimeTo: session.TimeTo,
    Trainer: session.Trainer,
    TrainerDesignation: session.TrainerDesignation,
    TrainerOrg: session.TrainerOrg,
    SN: p.SN,
    EnrollNo: p.EnrollNo,
    EmployeeName: p.EmployeeName,
    Designation: p.Designation,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 40 }, { wch: 14 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
    { wch: 26 }, { wch: 30 }, { wch: 26 }, { wch: 5 },
    { wch: 12 }, { wch: 28 }, { wch: 24 },
  ]
  return ws
}

// ── Write Session 2 ───────────────────────────────────────────────────────────
const wb2 = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb2, buildSheet(session2, participants2), 'Attendance')
XLSX.writeFile(wb2, 'demo-session-2-leadership.xlsx')
console.log('✅ demo-session-2-leadership.xlsx created')
console.log(`   ${session2.TrnName} | ${session2.Date} | ${participants2.length} participants`)
console.log(`   Trainer: ${session2.Trainer} (${session2.TrainerOrg}) → FacultyType: Internal`)

// ── Write Session 3 ───────────────────────────────────────────────────────────
const wb3 = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb3, buildSheet(session3, participants3), 'Attendance')
XLSX.writeFile(wb3, 'demo-session-3-it-digital.xlsx')
console.log('\n✅ demo-session-3-it-digital.xlsx created')
console.log(`   ${session3.TrnName} | ${session3.Date} | ${participants3.length} participants`)
console.log(`   Trainer: ${session3.Trainer} (${session3.TrainerOrg}) → FacultyType: External (auto-detected)`)
console.log(`   NOTE: EnrollNo 999002 is not in master data — tests the unmatched warning.`)
console.log('\nDone. Upload all 3 demo files one by one via the Training Session tab.')
