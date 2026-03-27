import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";

// SVG Icon components
const IconX = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
const IconPencil = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M11.5 2.5l2 2-8.5 8.5H3v-2l8.5-8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClock = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v3.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 8.5l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconAlert = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 6.5v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconBoard = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const IconCalendar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1 7h14M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconTimer = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 6v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M6 1h4M8 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
const IconUsers = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13 7c1.1 0 2 .9 2 2s-.9 2-2 2M15 14c0-1.66-1.34-3-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const CLIENT_COLORS = [
  { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8", dot: "#3B82F6" },
  { bg: "#F0FDF4", border: "#22C55E", text: "#15803D", dot: "#22C55E" },
  { bg: "#FFF7ED", border: "#F97316", text: "#C2410C", dot: "#F97316" },
  { bg: "#FAF5FF", border: "#A855F7", text: "#7E22CE", dot: "#A855F7" },
  { bg: "#FFF1F2", border: "#F43F5E", text: "#BE123C", dot: "#F43F5E" },
  { bg: "#ECFEFF", border: "#06B6D4", text: "#0E7490", dot: "#06B6D4" },
];
const PRIORITY_STYLES = {
  High: { bg: "#FEF2F2", text: "#DC2626", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
  Low: { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E" },
};
const COLUMNS = ["To Do", "In Progress", "Done"];
const COL_STYLES = {
  "To Do": { accent: "#6366F1", lightBg: "#EEF2FF", label: "#4338CA" },
  "In Progress": { accent: "#F59E0B", lightBg: "#FFFBEB", label: "#B45309" },
  Done: { accent: "#10B981", lightBg: "#ECFDF5", label: "#047857" },
};
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyForm = {
  title: "",
  client: "",
  assignee: "",
  priority: "Medium",
  due: "",
  col: "To Do",
  hours: "",
  description: "",
};

function clientColor(name, clients) {
  const idx = clients.indexOf(name);
  return CLIENT_COLORS[Math.max(0, idx) % CLIENT_COLORS.length];
}
function toNum(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
function isOverdue(due, col) {
  if (!due || col === "Done") return false;
  return new Date(due) < new Date(new Date().toDateString());
}
function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(2)}`;
}
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function TaskSummary({ task, clients, onEdit, onClose }) {
  const cc = clientColor(task.client, clients);
  const pr = PRIORITY_STYLES[task.priority];
  const cs = COL_STYLES[task.col];
  const od = isOverdue(task.due, task.col);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
          animation: "slideUp .18s ease",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 4, background: `linear-gradient(90deg, ${cc.border}, ${cc.dot})` }} />
        <div style={{ padding: "24px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: cc.dot,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{task.client}</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0, lineHeight: 1.3 }}>
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#F1F5F9",
                border: "none",
                borderRadius: 8,
                width: 30,
                height: 30,
                cursor: "pointer",
                fontSize: 14,
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background .15s,color .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E2E8F0"; e.currentTarget.style.color = "#334155"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#64748B"; }}
            >
              <IconX size={12} />
            </button>
          </div>
          {task.description && (
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 16,
                borderLeft: `3px solid ${cc.border}`,
              }}
            >
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{task.description}</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 500 }}>Priority</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{ width: 7, height: 7, borderRadius: "50%", background: pr.dot, display: "inline-block" }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: pr.text }}>{task.priority}</span>
              </div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 500 }}>Status</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: cs?.label || "#475569" }}>{task.col}</span>
            </div>
            {task.assignee && (
              <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 500 }}>Assignee</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: cc.bg,
                      border: `1.5px solid ${cc.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 700,
                      color: cc.text,
                    }}
                  >
                    {getInitials(task.assignee)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{task.assignee}</span>
                </div>
              </div>
            )}
            {task.hours > 0 && (
              <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 500 }}>Hours</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 4 }}><IconClock size={12} />{task.hours}h</span>
              </div>
            )}
            {task.due && (
              <div style={{ background: od ? "#FEF2F2" : "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 500 }}>Due date</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: od ? "#DC2626" : "#334155", display: "flex", alignItems: "center", gap: 4 }}>
                  {od && <IconAlert size={12} />}
                  {formatDate(task.due)}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onEdit}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.3)"}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            Edit task
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: wide ? 560 : 420,
          boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
          animation: "slideUp .18s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              borderRadius: 8,
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 14,
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .15s,color .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#E2E8F0"; e.currentTarget.style.color = "#334155"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#64748B"; }}
          >
            <IconX size={11} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

const TASK_FORM_CSS = `.tf-input{width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid #E2E8F0;font-size:14px;color:#0F172A;background:#F8FAFC;box-sizing:border-box;outline:none;transition:border .15s,box-shadow .15s,background .15s;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-weight:500}.tf-input:focus{border-color:#6366F1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,0.1)}.tf-input:hover:not(:focus){border-color:#CBD5E1}.tf-label{font-size:11.5px;font-weight:600;color:#64748B;margin-bottom:5px;display:block;letter-spacing:0.02em;text-transform:uppercase}.tf-field{margin-bottom:14px}.tf-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.tf-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}`;

function TaskForm({ form, setForm, clients, onSave, onCancel, saveLabel }) {
  return (
    <div>
      <style>{TASK_FORM_CSS}</style>
      <div className="tf-field">
        <label className="tf-label">Title</label>
        <input
          className="tf-input"
          placeholder="Task name"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>
      <div className="tf-field">
        <label className="tf-label">Description</label>
        <textarea
          className="tf-input"
          placeholder="Optional notes or context..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          style={{ resize: "vertical", minHeight: 72 }}
        />
      </div>
      <div className="tf-field">
        <label className="tf-label">Client</label>
        <select
          className="tf-input"
          value={form.client}
          onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
        >
          <option value="">— Select client —</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-grid3">
        <div className="tf-field">
          <label className="tf-label">Assignee</label>
          <input
            className="tf-input"
            placeholder="Name"
            value={form.assignee}
            onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
          />
        </div>
        <div className="tf-field">
          <label className="tf-label">Priority</label>
          <select
            className="tf-input"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="tf-field">
          <label className="tf-label">Hours</label>
          <input
            className="tf-input"
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
            value={form.hours}
            onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
          />
        </div>
      </div>
      <div className="tf-grid">
        <div className="tf-field">
          <label className="tf-label">Due date</label>
          <input
            type="date"
            className="tf-input"
            value={form.due}
            onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
          />
        </div>
        <div className="tf-field">
          <label className="tf-label">Status</label>
          <select
            className="tf-input"
            value={form.col}
            onChange={(e) => setForm((f) => ({ ...f, col: e.target.value }))}
          >
            {COLUMNS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border: "1.5px solid #E2E8F0",
            background: "#F8FAFC",
            color: "#64748B",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          style={{
            flex: 2,
            padding: "10px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
          }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

// Dedicated client management modal
function ManageClientsModal({ clients, onAdd, onRemove, onClose }) {
  const [input, setInput] = useState("");
  function handleAdd() {
    const name = input.trim();
    if (!name || clients.includes(name)) return;
    onAdd(name);
    setInput("");
  }
  return (
    <Modal title="Manage clients" onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          style={{
            flex: 1,
            padding: "9px 12px",
            borderRadius: 8,
            border: "1.5px solid #E2E8F0",
            fontSize: 14,
            color: "#0F172A",
            background: "#F8FAFC",
            outline: "none",
            fontFamily: "inherit",
          }}
          placeholder="New client name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          + Add
        </button>
      </div>
      {clients.length === 0 && (
        <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", padding: "16px 0", margin: 0 }}>
          No clients yet. Add one above.
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {clients.map((c, i) => {
          const cc = CLIENT_COLORS[i % CLIENT_COLORS.length];
          return (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                background: cc.bg,
                border: `1px solid ${cc.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{ width: 8, height: 8, borderRadius: "50%", background: cc.dot, display: "inline-block" }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: cc.text }}>{c}</span>
              </div>
              <button
                onClick={() => onRemove(c)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: "none",
                  background: "#FEF2F2",
                  cursor: "pointer",
                  fontSize: 11,
                  color: "#F87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background .15s,color .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#DC2626"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#F87171"; }}
              >
                <IconX size={9} />
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function TaskCard({
  t,
  clients,
  showDescription,
  onSummary,
  onEdit,
  onDelete,
  draggable: isDraggable,
  onDragStart,
  onDragEnd,
  isDragging,
}) {
  const cc = clientColor(t.client, clients);
  const pr = PRIORITY_STYLES[t.priority];
  const cs = COL_STYLES[t.col];
  const od = isOverdue(t.due, t.col);
  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSummary}
      className={isDragging ? "" : "task-card-hover"}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "12px 12px 10px",
        marginBottom: 8,
        cursor: "pointer",
        boxShadow: isDragging ? "0 12px 32px rgba(99,102,241,0.18)" : "0 1px 3px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.03)",
        border: "1px solid #F1F5F9",
        borderLeft: `3px solid ${cc.border}`,
        transform: isDragging ? "rotate(2deg) scale(1.03)" : "none",
        transition: "box-shadow .15s, transform .15s",
        opacity: isDragging ? 0.88 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ flex: 1, paddingRight: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: cc.dot,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{t.client}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.4 }}>{t.title}</div>
        </div>
        {(onEdit || onDelete) && (
          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: "none",
                  background: "#F1F5F9",
                  cursor: "pointer",
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background .15s,color .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#E0E7FF"; e.currentTarget.style.color = "#6366F1"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#94A3B8"; }}
              >
                <IconPencil size={11} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: "none",
                  background: "#FEF2F2",
                  cursor: "pointer",
                  color: "#F87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background .15s,color .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#DC2626"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#F87171"; }}
              >
                <IconX size={9} />
              </button>
            )}
          </div>
        )}
      </div>
      {showDescription && t.description && (
        <p
          style={{
            fontSize: 12,
            color: "#64748B",
            margin: "0 0 8px",
            lineHeight: 1.5,
            borderLeft: `2px solid ${cc.border}`,
            paddingLeft: 7,
          }}
        >
          {t.description}
        </p>
      )}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            padding: "2px 7px",
            borderRadius: 20,
            background: pr.bg,
            color: pr.text,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: pr.dot, display: "inline-block" }} />
          {t.priority}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            padding: "2px 7px",
            borderRadius: 20,
            background: cs?.lightBg || "#F1F5F9",
            color: cs?.label || "#475569",
          }}
        >
          {t.col}
        </span>
        {t.hours > 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 7px",
              borderRadius: 20,
              background: "#F1F5F9",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <IconClock size={9} />{t.hours}h
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {t.assignee && (
            <>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: cc.bg,
                  border: `1.5px solid ${cc.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  fontWeight: 700,
                  color: cc.text,
                }}
              >
                {getInitials(t.assignee)}
              </div>
              <span style={{ fontSize: 11, color: "#64748B" }}>{t.assignee}</span>
            </>
          )}
        </div>
        {t.due && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 6px",
              borderRadius: 5,
              background: od ? "#FEF2F2" : "#F1F5F9",
              color: od ? "#DC2626" : "#64748B",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {od && <IconAlert size={9} />}
            {formatDate(t.due)}
          </span>
        )}
      </div>
    </div>
  );
}

function HoursSummary({ tasks, clients }) {
  const summary = useMemo(() => {
    return clients.map((c, i) => {
      const clientTasks = tasks.filter((t) => t.client === c);
      const total = clientTasks.reduce((sum, t) => sum + toNum(t.hours), 0);
      const byStatus = {};
      COLUMNS.forEach((col) => {
        byStatus[col] = clientTasks.filter((t) => t.col === col).reduce((s, t) => s + toNum(t.hours), 0);
      });
      return { name: c, color: CLIENT_COLORS[i % CLIENT_COLORS.length], total, byStatus, count: clientTasks.length };
    });
  }, [tasks, clients]);
  const grandTotal = summary.reduce((s, c) => s + c.total, 0);
  return (
    <div style={{ padding: "0 32px 32px" }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Hours by client</span>
        <span style={{ fontSize: 13, color: "#94A3B8", marginLeft: 10 }}>{grandTotal.toFixed(1)}h total</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
        {summary.map((c) => {
          const pct = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;
          return (
            <div
              key={c.name}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #F1F5F9",
                padding: "16px 18px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: c.color.dot,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{c.name}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: c.color.text }}>{c.total.toFixed(1)}h</span>
              </div>
              <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: c.color.border,
                    borderRadius: 3,
                    transition: "width .4s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {COLUMNS.map((col) => {
                  const cs = COL_STYLES[col];
                  return (
                    <div
                      key={col}
                      style={{
                        flex: 1,
                        background: cs.lightBg,
                        borderRadius: 6,
                        padding: "5px 6px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: cs.label }}>
                        {c.byStatus[col].toFixed(1)}h
                      </div>
                      <div style={{ fontSize: 9, color: cs.label, opacity: 0.7, marginTop: 1 }}>{col}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#94A3B8" }}>
                {c.count} task{c.count !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const today = toYMD(new Date());

  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("board");
  const [filterClient, setFilterClient] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showManageClients, setShowManageClients] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({});
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [calDragging, setCalDragging] = useState(null);
  const [calDragOver, setCalDragOver] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: tasksData }, { data: clientsData }] = await Promise.all([
        supabase.from("tasks").select("*").order("created_at"),
        supabase.from("clients").select("*").order("created_at"),
      ]);
      if (tasksData) setTasks(tasksData);
      if (clientsData) setClients(clientsData.map((c) => c.name));
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const tasksSub = supabase
      .channel("tasks-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        if (payload.eventType === "INSERT") setTasks((ts) => [...ts, payload.new]);
        if (payload.eventType === "UPDATE")
          setTasks((ts) => ts.map((t) => (t.id === payload.new.id ? payload.new : t)));
        if (payload.eventType === "DELETE") setTasks((ts) => ts.filter((t) => t.id !== payload.old.id));
      })
      .subscribe();
    const clientsSub = supabase
      .channel("clients-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, (payload) => {
        if (payload.eventType === "INSERT") setClients((cs) => [...cs, payload.new.name]);
        if (payload.eventType === "DELETE") setClients((cs) => cs.filter((c) => c !== payload.old.name));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(tasksSub);
      supabase.removeChannel(clientsSub);
    };
  }, []);

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (filterClient === "All" || t.client === filterClient) &&
          (filterPriority === "All" || t.priority === filterPriority),
      ),
    [tasks, filterClient, filterPriority],
  );

  const taskCount = tasks.length;
  const done = tasks.filter((t) => t.col === "Done").length;
  const pct = taskCount === 0 ? 0 : Math.round((done / taskCount) * 100);
  const monthGrid = useMemo(() => getMonthGrid(calMonth.year, calMonth.month), [calMonth]);
  const unscheduled = useMemo(() => filtered.filter((t) => !t.due), [filtered]);

  async function addClient(name) {
    if (!name || clients.includes(name)) return;
    setClients((cs) => [...cs, name]);
    await supabase.from("clients").insert({ name });
  }
  async function removeClient(name) {
    setClients((cs) => cs.filter((c) => c !== name));
    setTasks((ts) => ts.map((t) => (t.client === name ? { ...t, client: "" } : t)));
    await supabase.from("clients").delete().eq("name", name);
    await supabase.from("tasks").update({ client: "" }).eq("client", name);
    if (filterClient === name) setFilterClient("All");
  }
  async function addTask() {
    if (!form.title.trim()) return;
    await supabase.from("tasks").insert({ ...form, hours: parseFloat(form.hours) || 0 });
    setForm({ ...emptyForm });
    setShowAdd(false);
  }
  function openEdit(t) {
    setSummary(null);
    setEditing(t.id);
    setEditForm({
      title: t.title,
      client: t.client || "",
      assignee: t.assignee || "",
      priority: t.priority,
      due: t.due || "",
      col: t.col,
      hours: t.hours || "",
      description: t.description || "",
    });
  }
  async function saveEdit() {
    if (!editForm.title.trim()) return;
    await supabase
      .from("tasks")
      .update({ ...editForm, hours: parseFloat(editForm.hours) || 0 })
      .eq("id", editing);
    setEditing(null);
  }
  async function deleteTask(id) {
    await supabase.from("tasks").delete().eq("id", id);
  }
  async function moveTask(id, col) {
    await supabase.from("tasks").update({ col }).eq("id", id);
  }
  async function rescheduleTask(id, due) {
    await supabase.from("tasks").update({ due }).eq("id", id);
  }
  function prevMonth() {
    setCalMonth(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }));
  }
  function nextMonth() {
    setCalMonth(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }));
  }
  function goToday() {
    const d = new Date();
    setCalMonth({ year: d.getFullYear(), month: d.getMonth() });
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg,#F5F3FF 0%,#F8FAFC 40%,#F0F9FF 100%)",
          fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".3" />
            </svg>
          </div>
          <div style={{ fontSize: 14, color: "#94A3B8" }}>Loading your board...</div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#F5F3FF 0%,#F8FAFC 40%,#F0F9FF 100%)",
        fontFamily: "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:#94A3B8}
        button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid #6366F1;outline-offset:2px}
        .task-card-hover{transition:box-shadow .18s,transform .18s,border-color .18s}
        .task-card-hover:hover{box-shadow:0 4px 16px rgba(99,102,241,0.10);transform:translateY(-1px);border-color:#E0E7FF!important}
        .btn-ghost{transition:background .15s,color .15s}
        .btn-ghost:hover{background:#F1F5F9!important;color:#334155!important}
        .nav-tab{transition:background .15s,color .15s,box-shadow .15s}
        .chip-filter{transition:all .15s}
        .chip-filter:hover{border-color:#6366F1!important}
        .col-card{transition:background .15s,border-color .15s}
        .cal-day{transition:background .12s,border-color .12s}
        .cal-day:hover{background:#F5F3FF!important;border-color:#C7D2FE!important}
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226,232,240,0.8)",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".3" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em" }}>Task Board</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 3, gap: 2 }}>
            {[
              { v: "board", label: "Board", icon: IconBoard },
              { v: "calendar", label: "Calendar", icon: IconCalendar },
              { v: "hours", label: "Hours", icon: IconTimer },
            ].map(({ v, label, icon }) => {
              const TabIcon = icon;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="nav-tab"
                  style={{
                    padding: "5px 14px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: view === v ? "#fff" : "transparent",
                    color: view === v ? "#6366F1" : "#64748B",
                    boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  <TabIcon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 20,
              padding: "5px 12px",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 2px #D1FAE5" }} />
            <span style={{ fontSize: 12, color: "#047857", fontWeight: 600 }}>{pct}%</span>
            <span style={{ fontSize: 11, color: "#6EE7B7", fontWeight: 500 }}>
              {done}/{taskCount}
            </span>
          </div>
          <button
            onClick={() => setShowManageClients(true)}
            className="btn-ghost"
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "1.5px solid #E2E8F0",
              background: "#fff",
              color: "#475569",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconUsers size={14} />
            Clients
          </button>
          <button
            onClick={() => {
              setForm({ ...emptyForm });
              setShowAdd(true);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              transition: "box-shadow .18s,opacity .18s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)"}
          >
            <IconPlus size={13} />
            Add task
          </button>
        </div>
      </div>

      <div style={{ height: 3, background: "#E2E8F0" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#6366F1,#10B981)",
            transition: "width .4s ease",
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ padding: "14px 32px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1.5px solid #E2E8F0",
            background: "#fff",
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
            fontFamily: "inherit",
            outline: "none",
            fontWeight: 500,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <option>All</option>
          {clients.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1.5px solid #E2E8F0",
            background: "#fff",
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
            fontFamily: "inherit",
            outline: "none",
            fontWeight: 500,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <div style={{ display: "flex", gap: 8, marginLeft: 4, flexWrap: "wrap" }}>
          {clients.map((c, i) => {
            const cc = CLIENT_COLORS[i % CLIENT_COLORS.length];
            const isActive = filterClient === c;
            return (
              <div
                key={c}
                onClick={() => setFilterClient(isActive ? "All" : c)}
                className="chip-filter"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 20,
                  background: isActive ? cc.bg : "#fff",
                  border: `1.5px solid ${isActive ? cc.border : "#E2E8F0"}`,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <span
                  style={{ width: 7, height: 7, borderRadius: "50%", background: cc.dot, display: "inline-block" }}
                />
                <span style={{ fontSize: 12, fontWeight: 500, color: isActive ? cc.text : "#64748B" }}>{c}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board view */}
      {view === "board" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20, padding: "0 32px 32px" }}
        >
          {COLUMNS.map((col) => {
            const cs = COL_STYLES[col];
            const colTasks = filtered.filter((t) => t.col === col);
            const isDragTarget = dragOver === col;
            return (
              <div
                key={col}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging !== null) moveTask(dragging, col);
                  setDragging(null);
                  setDragOver(null);
                }}
                className="col-card"
                style={{
                  background: isDragTarget ? cs.lightBg : "rgba(241,245,249,0.8)",
                  borderRadius: 16,
                  padding: 16,
                  minHeight: 300,
                  border: `2px dashed ${isDragTarget ? cs.accent : "transparent"}`,
                  transition: "all .15s",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cs.accent, boxShadow: `0 0 0 3px ${cs.lightBg}` }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", letterSpacing: "-0.01em" }}>{col}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: cs.lightBg,
                      color: cs.label,
                      border: `1px solid ${cs.accent}33`,
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>
                {colTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    t={t}
                    clients={clients}
                    showDescription
                    onSummary={() => setSummary(t)}
                    onEdit={() => openEdit(t)}
                    onDelete={() => deleteTask(t.id)}
                    draggable
                    isDragging={dragging === t.id}
                    onDragStart={() => setDragging(t.id)}
                    onDragEnd={() => {
                      setDragging(null);
                      setDragOver(null);
                    }}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#CBD5E1", fontSize: 12, fontWeight: 500, letterSpacing: "0.02em" }}>
                    Drop tasks here
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar view */}
      {view === "calendar" && (
        <div style={{ padding: "0 32px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              onClick={prevMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1.5px solid #E2E8F0",
                background: "#fff",
                cursor: "pointer",
                fontSize: 16,
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
            <button
              onClick={goToday}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "1.5px solid #E2E8F0",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: "#6366F1",
                fontFamily: "inherit",
              }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1.5px solid #E2E8F0",
                background: "#fff",
                cursor: "pointer",
                fontSize: 16,
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
              {MONTH_NAMES[calMonth.month]} {calMonth.year}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4, marginBottom: 4 }}>
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#94A3B8", padding: "4px 0" }}
              >
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4 }}>
            {monthGrid.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const ymd = toYMD(day);
              const isToday = ymd === today;
              const dayTasks = filtered.filter((t) => t.due === ymd);
              const isDragTarget = calDragOver === ymd;
              return (
                <div
                  key={ymd}
                  onClick={() => {
                    setForm({ ...emptyForm, due: ymd });
                    setShowAdd(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setCalDragOver(ymd);
                  }}
                  onDragLeave={() => setCalDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (calDragging !== null) {
                      rescheduleTask(calDragging, ymd);
                      setCalDragging(null);
                    }
                    setCalDragOver(null);
                  }}
                  style={{
                    background: isDragTarget ? "#EEF2FF" : isToday ? "#F5F3FF" : "#fff",
                    borderRadius: 10,
                    border: `1.5px solid ${isDragTarget ? "#6366F1" : isToday ? "#A5B4FC" : "#E2E8F0"}`,
                    minHeight: 100,
                    padding: "6px 6px 4px",
                    cursor: "pointer",
                    transition: "background .12s,border-color .12s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 500,
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: isToday ? "#6366F1" : "transparent",
                      color: isToday ? "#fff" : "#334155",
                    }}
                  >
                    {day.getDate()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayTasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => e.stopPropagation()}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setCalDragging(t.id);
                        }}
                        onDragEnd={() => {
                          setCalDragging(null);
                          setCalDragOver(null);
                        }}
                      >
                        <TaskCard
                          t={t}
                          clients={clients}
                          showDescription={false}
                          onSummary={() => setSummary(t)}
                          isDragging={calDragging === t.id}
                        />
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div style={{ fontSize: 9, fontWeight: 600, color: "#94A3B8", paddingLeft: 4 }}>
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {unscheduled.length > 0 && (
            <div
              style={{
                marginTop: 16,
                background: "#fff",
                borderRadius: 12,
                border: "1.5px solid #E2E8F0",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 10 }}>UNSCHEDULED</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {unscheduled.map((t) => {
                  const cc = clientColor(t.client, clients);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSummary(t)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: cc.bg,
                        border: `1px solid ${cc.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: cc.dot,
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 500, color: cc.text }}>{t.title}</span>
                      {t.hours > 0 && <span style={{ fontSize: 11, color: cc.text, opacity: 0.7, display: "flex", alignItems: "center", gap: 2 }}><IconClock size={9} />{t.hours}h</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {view === "hours" && <HoursSummary tasks={tasks} clients={clients} />}

      {summary && (
        <TaskSummary
          task={summary}
          clients={clients}
          onEdit={() => openEdit(summary)}
          onClose={() => setSummary(null)}
        />
      )}

      {showManageClients && (
        <ManageClientsModal
          clients={clients}
          onAdd={addClient}
          onRemove={removeClient}
          onClose={() => setShowManageClients(false)}
        />
      )}

      {showAdd && (
        <Modal title="New task" wide onClose={() => setShowAdd(false)}>
          <TaskForm
            form={form}
            setForm={setForm}
            clients={clients}
            onSave={addTask}
            onCancel={() => setShowAdd(false)}
            saveLabel="Add task"
          />
        </Modal>
      )}
      {editing !== null && (
        <Modal title="Edit task" wide onClose={() => setEditing(null)}>
          <TaskForm
            form={editForm}
            setForm={setEditForm}
            clients={clients}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
            saveLabel="Save changes"
          />
        </Modal>
      )}
    </div>
  );
}
