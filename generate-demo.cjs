const XLSX = require('xlsx')

const departments = ['ACI Agribusiness', 'ACI Agrovet Factory', 'ACI CORO - Marketing', 'ACI Edible Oils Marketing', 'ACI ELECTRICAL', 'ACI Electrical Factory']
const subDepts = ['YAMAHA Service', 'YAMAHA Sales', 'YAMAHA Marketing', 'YAMAHA Manufacture']
const divisions = ['Support Division', 'Pharma', 'Creative Communications', 'Consumer Brands']
const deptunits = ['Support / Service', 'Consumer Brands', 'All Factories', 'Agri Businesses', 'ACI Pharma', 'ACI Logistics']
const trnNames = [
  'Bangladesh Labor Law', 'BASIC ENGINE & ITS PARTS', 'BASIC FUNCTION OF FMF',
  'BASIC MEDICAL SCIENCE', 'Behavior Modeling for Professional Success',
  'Cash Management', 'CISCO CERTIFIED NETWORK ASSOCIATE CCNA - 200 - 301',
  'Communication Skills at workplace', 'Product Knowledge', 'Electrical Safety, Wiring, and Troubleshooting',
  'HAZARD IDENTIFICATION & RISK ASSESSMENT', 'HACCP, GMP, Basic Food Safety',
  'HEALTH SAFETY & ENVIRONMENT', 'Smart Warehouse Management', 'Training of Trainers (TOT)',
  'FIRST AID', 'MS Excel - Mastering INDEX - MATCH', 'Quality Control Tools & Techniques'
]
const iranCategories = ['Basic Orientation', 'IT Training', 'Knowledge Sharing', 'Technical Skills', 'Soft Skills']
const facultyTypes = ['Training Department', 'Internal', 'External']
const trainingTypes = ['Internal', 'External']
const trnLocations = ['ACI CENTRE, DHAKA', 'BARSHAL', 'BOGURA', 'CFR1 Factory', 'Online']
const emptypes = ['Junior', 'Mid', 'Senior']
const platforms = ['Classroom', 'Online']
const medias = ['Classroom', 'Zoom', 'Teams']
const codes = ['DL213', 'DL211', 'DL210', 'DL209', 'DL208', 'DL006', 'CLR001', 'CLR002', 'CLR003']
const names = [
  'Yamaha Service', 'Yamaha Plant', 'Agri Machineries', 'Premio Plastics Factory',
  'Customer - Motors Sales', 'ACI Agribusiness Team', 'Pharma Division Staff',
  'Consumer Brands Group', 'Logistics Unit Alpha', 'ELECTRICAL Dept Team'
]
const periods = ['202605', '202604', '202603', '202602', '202601', '202512', '202511', '202510']
const currentPeriods = ['202412', '202411']
const years = ['2024', '2025', '2026']
const times = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM']
const endTimes = ['1:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '6:30 PM']

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function fmtDate(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const rows = []
for (let i = 0; i < 200; i++) {
  const dept = rand(departments)
  const year = rand(years)
  const month = randNum(1, 12)
  const day = randNum(1, 28)
  const dateFrom = new Date(parseInt(year), month - 1, day)
  const dateTo = new Date(parseInt(year), month - 1, day + randNum(0, 3))
  const hours = randNum(2, 40)
  const days = Math.ceil(hours / 8)

  rows.push({
    Code: rand(codes),
    'Employee Name': rand(names),
    TrnName: rand(trnNames),
    Hours: hours,
    Days: days,
    'Date From': fmtDate(dateFrom),
    'Date To': fmtDate(dateTo),
    TimeFrom: rand(times),
    TimeTo: rand(endTimes),
    Department: dept,
    SubDeptName: rand(subDepts),
    Division: rand(divisions),
    deptunit: rand(deptunits),
    Year: year,
    Period: rand(periods),
    CurrentPeriod: rand(currentPeriods),
    IranCategory: rand(iranCategories),
    FacultyType: rand(facultyTypes),
    TrainingType: rand(trainingTypes),
    TrnLocation: rand(trnLocations),
    emptype: rand(emptypes),
    Platform: rand(platforms),
    Media: rand(medias),
    Trainer: rand(names),
  })
}

const wb = XLSX.utils.book_new()
const ws = XLSX.utils.json_to_sheet(rows)
XLSX.utils.book_append_sheet(wb, ws, 'TrainingData')
XLSX.writeFile(wb, 'demo-training-data.xlsx')
console.log('demo-training-data.xlsx created with', rows.length, 'rows')
