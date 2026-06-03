import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { parseMasterFile, parseAttendanceFile } from "../utils/excelParser";
import {
  saveMasterData,
  loadMasterMeta,
  loadMasterLookup,
  addSession,
  loadSessionsMeta,
  clearAllSessions,
  sessionExists,
} from "../utils/storage";
import {
  enrichSession,
  extractSessionHeader,
  extractParticipants,
  deriveFacultyType,
} from "../utils/enrichment";
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Users,
  BookOpen,
  Trash2,
  ChevronLeft,
} from "lucide-react";

const IRAN_CATS = [
  "Orientation",
  "Technical",
  "Soft Skills",
  "Management",
  "IT",
  "Safety & Compliance",
  "Leadership",
  "Others",
];
const TRN_TYPES = ["Internal", "External"];
const PLATFORMS = ["Classroom", "Online", "Hybrid"];
const MEDIA_OPTS = [
  "Classroom",
  "Zoom",
  "Microsoft Teams",
  "YouTube",
  "Others",
];
const FACULTY_TPS = ["Internal", "External", "Mixed"];

const dark = {
  bg: "#0f1929",
  card: "#16213e",
  border: "#2a3a5a",
  borderHi: "#4f8ef7",
  text: "#a0b0d0",
  textDim: "#5a6a8a",
  textBr: "#e0e8ff",
  accent: "#4f8ef7",
  success: "#22c55e",
  warn: "#f59e0b",
  error: "#ef4444",
  input: "#0d1525",
};

function DropZone({ onFile, accept, label, hint, disabled }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (!disabled && e.dataTransfer.files[0])
          onFile(e.dataTransfer.files[0]);
      }}
      onClick={() => !disabled && ref.current.click()}
      style={{
        border: `2px dashed ${drag ? dark.borderHi : dark.border}`,
        borderRadius: 10,
        padding: "36px 24px",
        textAlign: "center",
        background: drag ? "#1a2540" : dark.card,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s",
      }}
    >
      <UploadCloud
        size={40}
        color={drag ? dark.accent : "#3a4a6a"}
        style={{ margin: "0 auto 12px" }}
      />
      <p style={{ color: dark.text, fontSize: 14, marginBottom: 6 }}>{label}</p>
      <p style={{ color: dark.textDim, fontSize: 12 }}>{hint}</p>
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
    </div>
  );
}

function StatusMsg({ type, text }) {
  const cfg = {
    success: {
      bg: "#0d2a1a",
      border: "#1a5a30",
      icon: <CheckCircle size={16} color={dark.success} />,
      color: "#86efac",
    },
    error: {
      bg: "#2a0d0d",
      border: "#5a1a1a",
      icon: <AlertCircle size={16} color={dark.error} />,
      color: "#fca5a5",
    },
    warn: {
      bg: "#2a1d00",
      border: "#5a3a00",
      icon: <AlertCircle size={16} color={dark.warn} />,
      color: "#fde68a",
    },
  };
  const c = cfg[type] || cfg.error;
  return (
    <div
      style={{
        marginTop: 12,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ marginTop: 1 }}>{c.icon}</span>
      <span style={{ color: c.color, fontSize: 13 }}>{text}</span>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        style={{
          fontSize: 11,
          color: dark.textDim,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: dark.input,
          border: `1px solid ${dark.border}`,
          color: value ? dark.textBr : dark.textDim,
          borderRadius: 6,
          padding: "7px 10px",
          fontSize: 13,
          outline: "none",
          cursor: "pointer",
        }}
      >
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        fontSize: 13,
        padding: "4px 0",
        borderBottom: `1px solid ${dark.border}`,
      }}
    >
      <span style={{ color: dark.textDim, minWidth: 130, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color: dark.textBr, fontWeight: 600 }}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("master");

  const [masterStatus, setMasterStatus] = useState(null);
  const [masterMsg, setMasterMsg] = useState("");
  const masterMeta = loadMasterMeta();

  const [sessionStep, setSessionStep] = useState(1);
  const [parsed, setParsed] = useState(null);
  const [meta, setMeta] = useState({
    IranCategory: "",
    TrainingType: "Internal",
    Platform: "Classroom",
    Media: "Classroom",
    FacultyType: "Internal",
  });
  const [sessionStatus, setSessionStatus] = useState(null);
  const [sessionMsg, setSessionMsg] = useState("");
  const sessionsMeta = loadSessionsMeta();

  async function handleMasterFile(file) {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setMasterStatus("error");
      setMasterMsg("Please upload a .xlsx, .xls, or .csv file.");
      return;
    }
    setMasterStatus("loading");
    setMasterMsg("Reading file…");
    try {
      const rows = await parseMasterFile(file);
      if (rows.length === 0) {
        setMasterStatus("error");
        setMasterMsg("File is empty.");
        return;
      }
      saveMasterData(rows)
        ? (setMasterStatus("success"),
          setMasterMsg(
            `${rows.length} employee records loaded from "${file.name}"`,
          ))
        : (setMasterStatus("error"),
          setMasterMsg("Failed to save — file may be too large."));
    } catch (err) {
      setMasterStatus("error");
      setMasterMsg(`Error: ${err.message}`);
    }
  }

  async function handleAttendanceFile(file) {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setSessionStatus("error");
      setSessionMsg("Please upload a .xlsx, .xls, or .csv file.");
      return;
    }
    setSessionStatus("loading");
    setSessionMsg("Parsing attendance file…");
    try {
      const rows = await parseAttendanceFile(file);
      if (rows.length === 0) {
        setSessionStatus("error");
        setSessionMsg("File appears to be empty.");
        return;
      }
      const header = extractSessionHeader(rows);
      const participants = extractParticipants(rows);
      if (!header.TrnName) {
        setSessionStatus("error");
        setSessionMsg(
          'Could not detect training name. Ensure the Excel has a "TrnName" column.',
        );
        return;
      }
      if (participants.length === 0) {
        setSessionStatus("error");
        setSessionMsg(
          'No participants found. Ensure the Excel has "EnrollNo" and "EmployeeName" columns.',
        );
        return;
      }
      setParsed({ header, participants });
      const autoFaculty = deriveFacultyType(header.TrainerOrg);
      setMeta((prev) => ({
        ...prev,
        FacultyType: autoFaculty,
        TrainingType: autoFaculty === "Internal" ? "Internal" : "External",
      }));
      setSessionStatus(null);
      setSessionMsg("");
      setSessionStep(2);
    } catch (err) {
      setSessionStatus("error");
      setSessionMsg(`Error: ${err.message}`);
    }
  }

  function confirmSession() {
    if (!meta.IranCategory) {
      setSessionStatus("error");
      setSessionMsg("Please select a Training Category.");
      return;
    }
    const masterLookup = loadMasterLookup();
    const { rows, sessionId } = enrichSession(
      parsed.participants,
      { ...parsed.header, ...meta },
      masterLookup,
    );
    if (sessionExists(sessionId)) {
      setSessionStatus("warn");
      setSessionMsg(
        `This session already exists (${parsed.header.TrnName} · ${parsed.header.Date}). To re-upload, clear sessions first.`,
      );
      return;
    }
    addSession(rows)
      ? (setSessionStatus("success"),
        setSessionMsg(
          `Session saved! ${rows.length} participant records added to dashboard.`,
        ))
      : (setSessionStatus("error"),
        setSessionMsg("Failed to save session. Storage may be full."));
  }

  function resetSession() {
    setSessionStep(1);
    setParsed(null);
    setSessionStatus(null);
    setSessionMsg("");
  }

  const tabStyle = (active) => ({
    padding: "9px 22px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: "6px 6px 0 0",
    background: active ? dark.card : "transparent",
    color: active ? dark.accent : dark.textDim,
    border: active ? `1px solid ${dark.border}` : "1px solid transparent",
    borderBottom: active
      ? `1px solid ${dark.card}`
      : `1px solid ${dark.border}`,
    marginBottom: -1,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: dark.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 580 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <BarChart2 size={26} color={dark.accent} />
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: dark.textBr,
              margin: 0,
            }}
          >
            MIS Report Dashboard
          </h1>
        </div>

        <div
          style={{ display: "flex", borderBottom: `1px solid ${dark.border}` }}
        >
          <button
            style={tabStyle(activeTab === "master")}
            onClick={() => setActiveTab("master")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Users size={14} /> Master Employee Data
            </span>
          </button>
          <button
            style={tabStyle(activeTab === "session")}
            onClick={() => setActiveTab("session")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <BookOpen size={14} /> Training Session
            </span>
          </button>
        </div>

        <div
          style={{
            background: dark.card,
            border: `1px solid ${dark.border}`,
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            padding: 24,
          }}
        >
          {activeTab === "master" && (
            <div>
              <p
                style={{ color: dark.textDim, fontSize: 13, marginBottom: 16 }}
              >
                Upload your employee master CSV/Excel{" "}
                <strong style={{ color: dark.text }}>once</strong>. Used to
                auto-fill Department, Division, and employee type for all
                sessions.
              </p>
              {masterMeta && (
                <div
                  style={{
                    background: "#0d1f0d",
                    border: "1px solid #1a4a1a",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 16,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#86efac" }}>✓ Loaded: </span>
                  <span style={{ color: dark.text }}>
                    {masterMeta.rowCount} employees —{" "}
                    {new Date(masterMeta.uploadedAt).toLocaleString()}
                  </span>
                </div>
              )}
              <DropZone
                onFile={handleMasterFile}
                accept=".xlsx,.xls,.csv"
                label="Drag & drop Employee Master CSV or Excel"
                hint="Requires an 'Enroll' column as unique key"
              />
              {masterStatus === "loading" && (
                <div
                  style={{
                    marginTop: 14,
                    textAlign: "center",
                    color: dark.text,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      width: 18,
                      height: 18,
                      border: `2px solid ${dark.accent}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                  {masterMsg}
                </div>
              )}
              {masterStatus && masterStatus !== "loading" && (
                <StatusMsg type={masterStatus} text={masterMsg} />
              )}
            </div>
          )}

          {activeTab === "session" && sessionStep === 1 && (
            <div>
              {!masterMeta && (
                <StatusMsg
                  type="warn"
                  text="Master data not uploaded yet. Department/Division fields will be empty for participants."
                />
              )}
              {sessionsMeta && (
                <div
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: dark.textDim }}>
                    {sessionsMeta.sessionCount} session(s) ·{" "}
                    {sessionsMeta.totalRows} total rows
                  </span>
                  <button
                    onClick={() =>
                      window.confirm("Clear ALL session data?") &&
                      clearAllSessions()
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "none",
                      border: `1px solid #5a1a1a`,
                      color: dark.error,
                      borderRadius: 5,
                      padding: "4px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={11} /> Clear All Sessions
                  </button>
                </div>
              )}
              <p
                style={{ color: dark.textDim, fontSize: 13, marginBottom: 16 }}
              >
                Required columns:{" "}
                <span style={{ color: dark.text }}>
                  TrnName, Date, Venue, TimeFrom, TimeTo, Trainer, TrainerOrg,
                  EnrollNo, EmployeeName, Designation
                </span>
              </p>
              <DropZone
                onFile={handleAttendanceFile}
                accept=".xlsx,.xls,.csv"
                label="Drag & drop Attendance Session Excel"
                hint="One file = one training session"
              />
              {sessionStatus === "loading" && (
                <div
                  style={{
                    marginTop: 14,
                    textAlign: "center",
                    color: dark.text,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      width: 18,
                      height: 18,
                      border: `2px solid ${dark.accent}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                  {sessionMsg}
                </div>
              )}
              {sessionStatus && sessionStatus !== "loading" && (
                <StatusMsg type={sessionStatus} text={sessionMsg} />
              )}
            </div>
          )}

          {activeTab === "session" && sessionStep === 2 && parsed && (
            <div>
              <button
                onClick={resetSession}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: dark.textDim,
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "0 0 14px 0",
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>

              <div
                style={{
                  background: dark.input,
                  border: `1px solid ${dark.border}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    color: dark.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 10,
                  }}
                >
                  Detected Session
                </p>
                <InfoRow label="Training Name" value={parsed.header.TrnName} />
                <InfoRow label="Date" value={String(parsed.header.Date)} />
                <InfoRow label="Venue" value={parsed.header.Venue} />
                <InfoRow
                  label="Time"
                  value={
                    parsed.header.TimeFrom && parsed.header.TimeTo
                      ? `${parsed.header.TimeFrom} → ${parsed.header.TimeTo}`
                      : ""
                  }
                />
                <InfoRow label="Trainer" value={parsed.header.Trainer} />
                <InfoRow label="Trainer Org" value={parsed.header.TrainerOrg} />
                <InfoRow
                  label="Participants"
                  value={`${parsed.participants.length}`}
                />
              </div>

              {(() => {
                const ml = loadMasterLookup();
                const matched = parsed.participants.filter(
                  (p) => ml[String(p.EnrollNo).trim()],
                ).length;
                const miss = parsed.participants.length - matched;
                return (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: miss > 0 ? "#2a1d00" : "#0d2a1a",
                      border: `1px solid ${miss > 0 ? "#5a3a00" : "#1a5a30"}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: miss > 0 ? "#fde68a" : "#86efac",
                      }}
                    >
                      {miss > 0
                        ? `⚠ ${matched}/${parsed.participants.length} matched in master data. ${miss} enroll(s) not found — those rows will have empty Department/Division.`
                        : `✓ All ${matched} participants matched in master data.`}
                    </span>
                  </div>
                );
              })()}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <Select
                  label="Training Category *"
                  value={meta.IranCategory}
                  onChange={(v) => setMeta((p) => ({ ...p, IranCategory: v }))}
                  options={IRAN_CATS}
                />
                <Select
                  label="Training Type"
                  value={meta.TrainingType}
                  onChange={(v) => setMeta((p) => ({ ...p, TrainingType: v }))}
                  options={TRN_TYPES}
                />
                <Select
                  label="Platform"
                  value={meta.Platform}
                  onChange={(v) => setMeta((p) => ({ ...p, Platform: v }))}
                  options={PLATFORMS}
                />
                <Select
                  label="Media"
                  value={meta.Media}
                  onChange={(v) => setMeta((p) => ({ ...p, Media: v }))}
                  options={MEDIA_OPTS}
                />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Select
                    label="Faculty Type (auto-detected — override if needed)"
                    value={meta.FacultyType}
                    onChange={(v) => setMeta((p) => ({ ...p, FacultyType: v }))}
                    options={FACULTY_TPS}
                  />
                </div>
              </div>

              {sessionStatus && sessionStatus !== "loading" && (
                <StatusMsg type={sessionStatus} text={sessionMsg} />
              )}

              {sessionStatus !== "success" && (
                <button
                  onClick={confirmSession}
                  style={{
                    width: "100%",
                    marginTop: 14,
                    padding: "11px 0",
                    background: dark.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Confirm &amp; Save Session →
                </button>
              )}

              {sessionStatus === "success" && (
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button
                    onClick={resetSession}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      background: "#1a2a3a",
                      color: dark.text,
                      border: `1px solid ${dark.border}`,
                      borderRadius: 7,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Upload Another Session
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      background: dark.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    View Dashboard →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: dark.textDim,
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
