# MIS Report Dashboard

A dynamic training report dashboard — upload an Excel file and see live charts, filters, KPI cards, and a data table. Data persists in the browser until you upload a new file.

---

## What You Need First

### 1. Install Node.js
- Go to **https://nodejs.org**
- Download the **LTS version** (e.g. 20.x or 22.x)
- Run the installer — keep all default options
- After install, open a new terminal and verify:
  ```
  node -v
  npm -v
  ```
  Both should print a version number.

---

## Project Setup (Do This Once)

### Step 1 — Open terminal in the project folder
- Open **Command Prompt** or **PowerShell**
- Navigate to this folder:
  ```
  cd C:\Users\88013\Desktop\placement\company-projects\al-ikrum
  ```

### Step 2 — Install all dependencies
```
npm install
```
This downloads React, Recharts, SheetJS, TailwindCSS, and everything else.
It will create a `node_modules` folder. Takes ~1–2 minutes.

### Step 3 — Generate the demo Excel file
```
node generate-demo.cjs
```
This creates `demo-training-data.xlsx` in the project folder with 200 rows of realistic dummy data.
Upload this file on the Upload page to test the dashboard.

### Step 4 — Start the development server
```
npm run dev
```
You will see something like:
```
  VITE v5.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 5 — Open in browser
Go to: **http://localhost:5173**

---

## Pages

| URL | Purpose |
|---|---|
| `http://localhost:5173/dashboard` | The main report dashboard |
| `http://localhost:5173/upload` | Upload a new Excel file |

---

## How to Use

1. Go to `/upload`
2. Drag & drop `demo-training-data.xlsx` (or your own Excel file)
3. Click **Go to Dashboard**
4. Use the **checkboxes on the left** to filter by Year, Department, Division, etc.
5. Use the **search boxes at the top** to filter by Trainer name or Training name
6. All charts, KPI cards, and the table update **instantly**
7. **Refresh the page** — data stays (stored in browser localStorage)
8. **Close and reopen** — data still there
9. To update data: go back to `/upload` and drop a new file

---

## Required Excel Column Names

Your Excel file **must have these exact column headers** in row 1:

| Column | Example |
|---|---|
| `Code` | DL213 |
| `Employee Name` | Yamaha Plant |
| `TrnName` | Product Knowledge |
| `Hours` | 42 |
| `Days` | 3 |
| `Date From` | January 14, 2024 |
| `Date To` | January 16, 2024 |
| `TimeFrom` | 9:00 AM |
| `TimeTo` | 5:00 PM |
| `Department` | ACI Agribusiness |
| `SubDeptName` | YAMAHA Service |
| `Division` | Consumer Brands |
| `deptunit` | Agri Businesses |
| `Year` | 2024 |
| `Period` | 202601 |
| `CurrentPeriod` | 202412 |
| `IranCategory` | Basic Orientation |
| `FacultyType` | Internal |
| `TrainingType` | Internal |
| `TrnLocation` | ACI CENTRE, DHAKA |
| `emptype` | Junior |
| `Platform` | Classroom |
| `Media` | Zoom |
| `Trainer` | John Doe |

---

## Project Structure

```
al-ikrum/
├── src/
│   ├── components/
│   │   ├── CheckboxFilter.jsx   # Reusable checkbox filter panel
│   │   ├── DataTable.jsx        # Scrollable data table
│   │   ├── KPICard.jsx          # Individual KPI metric card
│   │   └── PieChartPanel.jsx    # Pie chart wrapper
│   ├── pages/
│   │   ├── DashboardPage.jsx    # Main dashboard (exact clone of reference)
│   │   └── UploadPage.jsx       # Excel drag & drop upload
│   ├── utils/
│   │   ├── excelParser.js       # SheetJS file parsing + filter logic
│   │   └── storage.js           # localStorage read/write helpers
│   ├── App.jsx                  # Routes definition
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles + dark theme
├── generate-demo.cjs            # Script to create demo Excel file
├── demo-training-data.xlsx      # Generated demo file (after running Step 3)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

---

## Tech Stack

| Tool | Purpose | Cost |
|---|---|---|
| React 18 | UI framework | Free |
| Vite | Dev server & bundler | Free |
| TailwindCSS | Styling | Free |
| Recharts | Pie charts | Free |
| SheetJS (xlsx) | Read Excel files | Free |
| React Router | Two-page navigation | Free |
| localStorage | Data persistence | Free (built into browser) |

**Total cost: $0**

---

## Stopping the Server
Press `Ctrl + C` in the terminal where `npm run dev` is running.


git init
git add .
git commit -m "Initial commit — Supabase integration + training session form"
git branch -M main
git remote add origin https://github.com/yourname/al-ikrum-dashboard.git
git push -u origin main