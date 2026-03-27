import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

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

const initClients = ["Acme Corp", "BrightSpark", "Novo Agency"];

const initTasks = [
  {
    id: 1,
    title: "Brand audit",
    client: "Acme Corp",
    assignee: "Sarah",
    priority: "High",
    due: "2026-03-28",
    col: "To Do",
  },
  {
    id: 2,
    title: "Q2 campaign brief",
    client: "BrightSpark",
    assignee: "Tom",
    priority: "Medium",
    due: "2026-04-05",
    col: "To Do",
  },
  {
    id: 3,
    title: "Wireframes v2",
    client: "Novo Agency",
    assignee: "Maya",
    priority: "High",
    due: "2026-03-30",
    col: "In Progress",
  },
  {
    id: 4,
    title: "Content calendar",
    client: "Acme Corp",
    assignee: "Tom",
    priority: "Low",
    due: "2026-04-10",
    col: "In Progress",
  },
  {
    id: 5,
    title: "Social assets",
    client: "BrightSpark",
    assignee: "Sarah",
    priority: "Medium",
    due: "2026-03-27",
    col: "Done",
  },
  {
    id: 6,
    title: "Logo refresh",
    client: "Novo Agency",
    assignee: "Maya",
    priority: "Low",
    due: "2026-04-15",
    col: "Done",
  },
];

let nextId = 7;

const emptyForm = { title: "", client: initClients[0], assignee: "", priority: "Medium", due: "", col: "To Do" };

function clientColor(name, clients) {
  const idx = clients.indexOf(name);
  return CLIENT_COLORS[idx % CLIENT_COLORS.length];
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

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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
          maxWidth: 420,
          boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
          animation: "slideUp .18s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>{title}</span>
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
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function TaskForm({
  form,
  setForm,
  clients,
  onSave,
  onCancel,
  saveLabel,
  newClientInput,
  setNewClientInput,
  onAddClient,
}) {
  return (
    <div>
      <style>{`
        .tf-input { width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #E2E8F0;
          font-size:14px; color:#0F172A; background:#F8FAFC; box-sizing:border-box;
          outline:none; transition:border .15s; font-family:inherit; }
        .tf-input:focus { border-color:#6366F1; background:#fff; }
        .tf-label { font-size:12px; font-weight:500; color:#64748B; margin-bottom:4px; display:block; }
        .tf-field { margin-bottom:14px; }
        .tf-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      `}</style>

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
        <label className="tf-label">Client</label>
        <select
          className="tf-input"
          value={form.client}
          onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
        >
          {clients.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="tf-field" style={{ display: "flex", gap: 8 }}>
        <input
          className="tf-input"
          style={{ flex: 1, marginBottom: 0 }}
          placeholder="New client..."
          value={newClientInput}
          onChange={(e) => setNewClientInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddClient()}
        />
        <button
          onClick={onAddClient}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "1.5px solid #E2E8F0",
            background: "#F8FAFC",
            fontSize: 13,
            color: "#6366F1",
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          + Add
        </button>
      </div>

      <div className="tf-grid">
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
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
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

export default function App() {
  const [tasks, setTasks] = useState(initTasks);
  const [clients, setClients] = useState(initClients);
  const [filterClient, setFilterClient] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({});
  const [newClientInput, setNewClientInput] = useState("");
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (filterClient === "All" || t.client === filterClient) &&
          (filterPriority === "All" || t.priority === filterPriority),
      ),
    [tasks, filterClient, filterPriority],
  );

  const total = tasks.length;
  const done = tasks.filter((t) => t.col === "Done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  function addClient(input, setInput, setF) {
    const name = input.trim();
    if (!name || clients.includes(name)) return;
    setClients((c) => [...c, name]);
    setF((f) => ({ ...f, client: name }));
    setInput("");
  }

  function addTask() {
    if (!form.title.trim()) return;
    setTasks((t) => [...t, { ...form, id: nextId++ }]);
    setForm({ ...emptyForm, client: clients[0] });
    setShowAdd(false);
  }

  function openEdit(t) {
    setEditing(t.id);
    setEditForm({
      title: t.title,
      client: t.client,
      assignee: t.assignee,
      priority: t.priority,
      due: t.due,
      col: t.col,
    });
  }

  function saveEdit() {
    if (!editForm.title.trim()) return;
    setTasks((ts) => ts.map((t) => (t.id === editing ? { ...t, ...editForm } : t)));
    setEditing(null);
  }

  function deleteTask(id) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
  }
  function moveTask(id, col) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, col } : t)));
  }

  const [newClientInputEdit, setNewClientInputEdit] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:3px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E2E8F0",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          <span style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Task Board</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F1F5F9",
              borderRadius: 8,
              padding: "6px 12px",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{pct}% complete</span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              {done}/{total} tasks
            </span>
          </div>
          <button
            onClick={() => {
              setForm({ ...emptyForm, client: clients[0] });
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
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add task
          </button>
        </div>
      </div>

      {/* Progress bar */}
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
      <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1.5px solid #E2E8F0",
            background: "#fff",
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
            fontFamily: "inherit",
            outline: "none",
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
            padding: "7px 12px",
            borderRadius: 8,
            border: "1.5px solid #E2E8F0",
            background: "#fff",
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
            fontFamily: "inherit",
            outline: "none",
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
            return (
              <div
                key={c}
                onClick={() => setFilterClient(filterClient === c ? "All" : c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 20,
                  background: filterClient === c ? cc.bg : "#fff",
                  border: `1.5px solid ${filterClient === c ? cc.border : "#E2E8F0"}`,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <span
                  style={{ width: 7, height: 7, borderRadius: "50%", background: cc.dot, display: "inline-block" }}
                />
                <span style={{ fontSize: 12, fontWeight: 500, color: filterClient === c ? cc.text : "#64748B" }}>
                  {c}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 20, padding: "0 32px 32px" }}
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
              style={{
                background: isDragTarget ? cs.lightBg : "#F1F5F9",
                borderRadius: 14,
                padding: 16,
                minHeight: 300,
                border: `2px dashed ${isDragTarget ? cs.accent : "transparent"}`,
                transition: "all .15s",
              }}
            >
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: cs.accent }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{col}</span>
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

              {/* Tasks */}
              {colTasks.map((t) => {
                const cc = clientColor(t.client, clients);
                const pr = PRIORITY_STYLES[t.priority];
                const od = isOverdue(t.due, t.col);
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragging(t.id)}
                    onDragEnd={() => {
                      setDragging(null);
                      setDragOver(null);
                    }}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "14px 14px 10px",
                      marginBottom: 10,
                      cursor: "grab",
                      boxShadow: dragging === t.id ? "0 8px 24px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.06)",
                      border: "1px solid #F1F5F9",
                      borderLeft: `3px solid ${cc.border}`,
                      transform: dragging === t.id ? "rotate(1.5deg) scale(1.02)" : "none",
                      transition: "box-shadow .15s, transform .15s",
                      opacity: dragging === t.id ? 0.85 : 1,
                    }}
                  >
                    {/* Card top row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#0F172A",
                          lineHeight: 1.4,
                          flex: 1,
                          paddingRight: 8,
                        }}
                      >
                        {t.title}
                      </span>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button
                          onClick={() => openEdit(t)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: "none",
                            background: "#F1F5F9",
                            cursor: "pointer",
                            fontSize: 11,
                            color: "#94A3B8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: "none",
                            background: "#FEF2F2",
                            cursor: "pointer",
                            fontSize: 11,
                            color: "#FDA4AF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Pills */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: cc.bg,
                          color: cc.text,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: cc.dot,
                            display: "inline-block",
                          }}
                        />
                        {t.client}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: pr.bg,
                          color: pr.text,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: pr.dot,
                            display: "inline-block",
                          }}
                        />
                        {t.priority}
                      </span>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {t.assignee && (
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: `${cc.bg}`,
                              border: `1.5px solid ${cc.border}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              fontWeight: 700,
                              color: cc.text,
                            }}
                          >
                            {getInitials(t.assignee)}
                          </div>
                        )}
                        {t.assignee && <span style={{ fontSize: 12, color: "#64748B" }}>{t.assignee}</span>}
                      </div>
                      {t.due && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "2px 7px",
                            borderRadius: 6,
                            background: od ? "#FEF2F2" : "#F1F5F9",
                            color: od ? "#DC2626" : "#64748B",
                          }}
                        >
                          {od ? "⚠ " : ""}
                          {formatDate(t.due)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#CBD5E1", fontSize: 13 }}>
                  Drop tasks here
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="New task" onClose={() => setShowAdd(false)}>
          <TaskForm
            form={form}
            setForm={setForm}
            clients={clients}
            onSave={addTask}
            onCancel={() => setShowAdd(false)}
            saveLabel="Add task"
            newClientInput={newClientInput}
            setNewClientInput={setNewClientInput}
            onAddClient={() => addClient(newClientInput, setNewClientInput, setForm)}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editing !== null && (
        <Modal title="Edit task" onClose={() => setEditing(null)}>
          <TaskForm
            form={editForm}
            setForm={setEditForm}
            clients={clients}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
            saveLabel="Save changes"
            newClientInput={newClientInputEdit}
            setNewClientInput={setNewClientInputEdit}
            onAddClient={() => addClient(newClientInputEdit, setNewClientInputEdit, setEditForm)}
          />
        </Modal>
      )}
    </div>
  );
}
