import { useState, useMemo } from "react";

const CLIENT_COLORS = [
  { bg: "#E6F1FB", border: "#378ADD", text: "#0C447C", dot: "#378ADD" },
  { bg: "#E1F5EE", border: "#1D9E75", text: "#085041", dot: "#1D9E75" },
  { bg: "#FAEEDA", border: "#BA7517", text: "#633806", dot: "#EF9F27" },
  { bg: "#EEEDFE", border: "#7F77DD", text: "#3C3489", dot: "#7F77DD" },
  { bg: "#FBEAF0", border: "#D4537E", text: "#72243E", dot: "#D4537E" },
  { bg: "#FAECE7", border: "#D85A30", text: "#712B13", dot: "#D85A30" },
];

const PRIORITY = {
  High: { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  Medium: { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" },
  Low: { bg: "#EAF3DE", text: "#3B6D11", border: "#C0DD97" },
};

const COLUMNS = ["To Do", "In Progress", "Done"];

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

function clientColor(name, clients) {
  const idx = clients.indexOf(name);
  return CLIENT_COLORS[idx % CLIENT_COLORS.length];
}

function isOverdue(due) {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(2)}`;
}

export default function App() {
  const [tasks, setTasks] = useState(initTasks);
  const [clients, setClients] = useState(initClients);
  const [filterClient, setFilterClient] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newClientInput, setNewClientInput] = useState("");
  const [form, setForm] = useState({ title: "", client: initClients[0], assignee: "", priority: "Medium", due: "" });
  const [dragging, setDragging] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  function addTask() {
    if (!form.title.trim()) return;
    setTasks((t) => [...t, { ...form, id: nextId++ }]);
    setForm({ title: "", client: clients[0], assignee: "", priority: "Medium", due: "" });
    setShowAdd(false);
  }

  function addClient() {
    const name = newClientInput.trim();
    if (!name || clients.includes(name)) return;
    setClients((c) => [...c, name]);
    setForm((f) => ({ ...f, client: name }));
    setNewClientInput("");
  }

  function moveTask(id, col) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, col } : t)));
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

  const s = {
    root: {
      fontFamily: "var(--font-sans)",
      padding: "1.25rem 1rem",
      maxWidth: 900,
      margin: "0 auto",
      position: "relative",
    },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    h1: { fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 },
    progressBar: {
      background: "var(--color-border-tertiary)",
      borderRadius: 4,
      height: 6,
      flex: 1,
      margin: "0 12px",
      overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 4, background: "#1D9E75", transition: "width .3s" },
    pct: { fontSize: 13, color: "var(--color-text-secondary)", minWidth: 32, textAlign: "right" },
    filters: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
    select: {
      fontSize: 13,
      padding: "4px 8px",
      borderRadius: "var(--border-radius-md)",
      border: "0.5px solid var(--color-border-secondary)",
      background: "var(--color-background-primary)",
      color: "var(--color-text-primary)",
      cursor: "pointer",
    },
    addBtn: {
      fontSize: 13,
      padding: "4px 12px",
      borderRadius: "var(--border-radius-md)",
      border: "0.5px solid var(--color-border-secondary)",
      background: "var(--color-background-primary)",
      color: "var(--color-text-primary)",
      cursor: "pointer",
      marginLeft: "auto",
    },
    board: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 },
    col: {
      background: "var(--color-background-secondary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "10px 10px",
      minHeight: 200,
    },
    colHead: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--color-text-secondary)",
      marginBottom: 10,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    badge: {
      fontSize: 11,
      fontWeight: 500,
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 10,
      padding: "1px 7px",
      color: "var(--color-text-secondary)",
    },
    card: {
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-md)",
      padding: "10px 12px",
      marginBottom: 8,
      cursor: "grab",
      position: "relative",
    },
    cardTitle: { fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 },
    cardRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
    clientPill: {
      fontSize: 11,
      fontWeight: 500,
      borderRadius: 10,
      padding: "2px 8px",
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    dot: { width: 6, height: 6, borderRadius: "50%", display: "inline-block", flexShrink: 0 },
    priPill: { fontSize: 11, fontWeight: 500, borderRadius: 10, padding: "2px 8px" },
    meta: { fontSize: 11, color: "var(--color-text-secondary)", marginTop: 6, display: "flex", gap: 8 },
    overdue: { color: "#A32D2D", fontWeight: 500 },
    del: {
      position: "absolute",
      top: 6,
      right: 8,
      fontSize: 13,
      color: "var(--color-text-secondary)",
      cursor: "pointer",
      opacity: 0.5,
      lineHeight: 1,
    },
    modal: {
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      minHeight: "100%",
    },
    modalBox: {
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-primary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1.25rem",
      width: 320,
      boxSizing: "border-box",
    },
    label: { fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 3, display: "block" },
    input: {
      width: "100%",
      fontSize: 13,
      padding: "6px 8px",
      borderRadius: "var(--border-radius-md)",
      border: "0.5px solid var(--color-border-secondary)",
      background: "var(--color-background-secondary)",
      color: "var(--color-text-primary)",
      boxSizing: "border-box",
      marginBottom: 10,
    },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
    modalBtns: { display: "flex", gap: 8, marginTop: 4 },
    cancelBtn: {
      flex: 1,
      fontSize: 13,
      padding: "6px",
      borderRadius: "var(--border-radius-md)",
      border: "0.5px solid var(--color-border-secondary)",
      background: "transparent",
      color: "var(--color-text-primary)",
      cursor: "pointer",
    },
    saveBtn: {
      flex: 1,
      fontSize: 13,
      padding: "6px",
      borderRadius: "var(--border-radius-md)",
      border: "none",
      background: "#1D9E75",
      color: "#fff",
      fontWeight: 500,
      cursor: "pointer",
    },
    newClientRow: { display: "flex", gap: 6, marginBottom: 10 },
    newClientInput: {
      flex: 1,
      fontSize: 13,
      padding: "6px 8px",
      borderRadius: "var(--border-radius-md)",
      border: "0.5px solid var(--color-border-secondary)",
      background: "var(--color-background-primary)",
      color: "var(--color-text-primary)",
      boxSizing: "border-box",
    },
    newClientBtn: {
      fontSize: 12,
      padding: "6px 10px",
      borderRadius: "var(--border-radius-md)",
      border: "0.5px solid var(--color-border-secondary)",
      background: "var(--color-background-secondary)",
      color: "var(--color-text-primary)",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    moveSelect: {
      fontSize: 11,
      border: "none",
      background: "transparent",
      color: "var(--color-text-secondary)",
      cursor: "pointer",
      padding: 0,
      marginTop: 4,
    },
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.h1}>Team tasks</span>
        <div style={{ display: "flex", alignItems: "center", flex: 1, margin: "0 16px" }}>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${pct}%` }} />
          </div>
          <span style={s.pct}>{pct}%</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {done}/{total} done
        </span>
      </div>

      <div style={s.filters}>
        <select style={s.select} value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
          <option>All</option>
          {clients.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select style={s.select} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        {/* Client colour legend */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 4 }}>
          {clients.map((c, i) => {
            const col = CLIENT_COLORS[i % CLIENT_COLORS.length];
            return (
              <div
                key={c}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                }}
              >
                <span
                  style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot, display: "inline-block" }}
                />
                {c}
              </div>
            );
          })}
        </div>
        <button style={s.addBtn} onClick={() => setShowAdd(true)}>
          + Add task
        </button>
      </div>

      <div style={s.board}>
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.col === col);
          return (
            <div
              key={col}
              style={s.col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging !== null) moveTask(dragging, col);
                setDragging(null);
              }}
            >
              <div style={s.colHead}>
                <span>{col}</span>
                <span style={s.badge}>{colTasks.length}</span>
              </div>
              {colTasks.map((t) => {
                const cc = clientColor(t.client, clients);
                const pr = PRIORITY[t.priority];
                const od = isOverdue(t.due) && t.col !== "Done";
                return (
                  <div
                    key={t.id}
                    style={{ ...s.card, borderLeft: `3px solid ${cc.border}` }}
                    draggable
                    onDragStart={() => setDragging(t.id)}
                    onDragEnd={() => setDragging(null)}
                  >
                    <span style={s.del} onClick={() => deleteTask(t.id)}>
                      ✕
                    </span>
                    <span style={{ ...s.del, right: 24, opacity: 0.4 }} onClick={() => openEdit(t)}>
                      ✎
                    </span>
                    <div style={s.cardTitle}>{t.title}</div>
                    <div style={s.cardRow}>
                      <span style={{ ...s.clientPill, background: cc.bg, color: cc.text }}>
                        <span style={{ ...s.dot, background: cc.dot }} />
                        {t.client}
                      </span>
                      <span
                        style={{ ...s.priPill, background: pr.bg, color: pr.text, border: `0.5px solid ${pr.border}` }}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <div style={s.meta}>
                      {t.assignee && <span>👤 {t.assignee}</span>}
                      {t.due && (
                        <span style={od ? s.overdue : {}}>
                          {od ? "⚠ " : ""}
                          {formatDate(t.due)}
                        </span>
                      )}
                    </div>
                    <select style={s.moveSelect} value={col} onChange={(e) => moveTask(t.id, e.target.value)}>
                      {COLUMNS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {editing !== null && (
        <div
          style={s.modal}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div style={s.modalBox}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 14px", color: "var(--color-text-primary)" }}>
              Edit task
            </p>
            <label style={s.label}>Title</label>
            <input
              style={s.input}
              value={editForm.title}
              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
            />
            <label style={s.label}>Client</label>
            <select
              style={s.input}
              value={editForm.client}
              onChange={(e) => setEditForm((f) => ({ ...f, client: e.target.value }))}
            >
              {clients.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Assignee</label>
                <input
                  style={s.input}
                  value={editForm.assignee}
                  onChange={(e) => setEditForm((f) => ({ ...f, assignee: e.target.value }))}
                />
              </div>
              <div>
                <label style={s.label}>Priority</label>
                <select
                  style={s.input}
                  value={editForm.priority}
                  onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Due date</label>
                <input
                  type="date"
                  style={s.input}
                  value={editForm.due}
                  onChange={(e) => setEditForm((f) => ({ ...f, due: e.target.value }))}
                />
              </div>
              <div>
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  value={editForm.col}
                  onChange={(e) => setEditForm((f) => ({ ...f, col: e.target.value }))}
                >
                  {COLUMNS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button style={s.saveBtn} onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div
          style={s.modal}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAdd(false);
          }}
        >
          <div style={s.modalBox}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 14px", color: "var(--color-text-primary)" }}>
              New task
            </p>
            <label style={s.label}>Title</label>
            <input
              style={s.input}
              placeholder="Task name"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <label style={s.label}>Client</label>
            <select
              style={{ ...s.input, marginBottom: 6 }}
              value={form.client}
              onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
            >
              {clients.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div style={s.newClientRow}>
              <input
                style={s.newClientInput}
                placeholder="New client name..."
                value={newClientInput}
                onChange={(e) => setNewClientInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addClient()}
              />
              <button style={s.newClientBtn} onClick={addClient}>
                + Add
              </button>
            </div>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Assignee</label>
                <input
                  style={s.input}
                  placeholder="Name"
                  value={form.assignee}
                  onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                />
              </div>
              <div>
                <label style={s.label}>Priority</label>
                <select
                  style={s.input}
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <label style={s.label}>Due date</label>
            <input
              type="date"
              style={s.input}
              value={form.due}
              onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
            />
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button style={s.saveBtn} onClick={addTask}>
                Add task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
