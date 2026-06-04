// Generates a demo attendance session Excel file
// Run: node generate-attendance-template.cjs

const XLSX = require('xlsx')

// All enroll numbers taken from Management_Employees_Master_Data.csv
const session = {
  TrnName: 'Communication Skills at the Workplace',
  Date: '2026-01-07',
  Venue: 'Akij House',
  TimeFrom: '10:00 AM',
  TimeTo: '01:00 PM',
  Trainer: 'Md. Al-Ikrum',
  TrainerDesignation: 'Manager, HR',
  TrainerOrg: 'Akij Venture Group',
}

const participants = [
  { SN: 1, EnrollNo: '43644', EmployeeName: 'Md. Kamrul Hasan', Designation: 'Assistant Manager' },
  { SN: 2, EnrollNo: '415056', EmployeeName: 'Saleh Newaz', Designation: 'Senior Executive' },
  { SN: 3, EnrollNo: '540423', EmployeeName: 'Prince Mahmud', Designation: 'Junior Executive' },
  { SN: 4, EnrollNo: '1048', EmployeeName: 'Nazmun Nahar', Designation: 'Assistant Manager' },
  { SN: 5, EnrollNo: '42815', EmployeeName: 'Mahabubur Rahman', Designation: 'Deputy Manager' },
  { SN: 6, EnrollNo: '1312', EmployeeName: 'Mantu Halder', Designation: 'Senior Executive' },
  { SN: 7, EnrollNo: '524938', EmployeeName: 'Md. Lutful Bary Abir', Designation: 'Assistant Manager' },
  { SN: 8, EnrollNo: '533443', EmployeeName: 'Md. Abdulla Al Mamun Sazal', Designation: 'Executive' },
  { SN: 9, EnrollNo: '529230', EmployeeName: 'Md. Shahriar Reza', Designation: 'Manager' },
  { SN: 10, EnrollNo: '529343', EmployeeName: 'Mohd. Tasneem Choudhury', Designation: 'Deputy Manager' },
  { SN: 11, EnrollNo: '550155', EmployeeName: 'Fauzia Sultana', Designation: 'Assistant Manager' },
  { SN: 12, EnrollNo: '557779', EmployeeName: 'S. M. Muqtadirul Huq', Designation: 'Assistant Manager' },
  { SN: 13, EnrollNo: '154525', EmployeeName: 'Md. Sultanul Arafin', Designation: 'Senior Executive' },
  { SN: 14, EnrollNo: '513453', EmployeeName: 'Md. Obaidullah', Designation: 'Junior Executive' },
  { SN: 15, EnrollNo: '1315', EmployeeName: 'Md. Golam Kibria', Designation: 'Deputy Manager' },
  { SN: 16, EnrollNo: '313307', EmployeeName: 'Waliul Nachhir', Designation: 'Deputy Manager' },
  { SN: 17, EnrollNo: '466506', EmployeeName: 'Md. Jahidul Islam', Designation: 'Assistant Manager' },
  { SN: 18, EnrollNo: '525501', EmployeeName: 'Shafrin Sultana Biva', Designation: 'Manager' },
  { SN: 19, EnrollNo: '514242', EmployeeName: 'Mohammad Rakib Ahmed', Designation: 'Junior Executive' },
  { SN: 20, EnrollNo: '529517', EmployeeName: 'Rasel Rana', Designation: 'Executive' },
]

// Participant-only rows — session details are entered via the upload form
const rows = participants.map(p => ({
  SN: p.SN,
  EnrollNo: p.EnrollNo,
  EmployeeName: p.EmployeeName,
  Designation: p.Designation,
}))

const wb = XLSX.utils.book_new()
const ws = XLSX.utils.json_to_sheet(rows)

// Column widths
ws['!cols'] = [
  { wch: 6 },  // SN
  { wch: 12 }, // EnrollNo
  { wch: 30 }, // EmployeeName
  { wch: 24 }, // Designation
]

XLSX.utils.book_append_sheet(wb, ws, 'Attendance')
XLSX.writeFile(wb, 'demo-attendance-session.xlsx')
console.log('✅ demo-attendance-session.xlsx created with', rows.length, 'participants')
console.log('   Session:', session.TrnName)
console.log('   (Session details will be entered via form on upload)')
