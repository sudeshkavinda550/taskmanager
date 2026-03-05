import { useState, useEffect } from "react";

const STATUSES = ["todo", "in_progress", "done"];
const PRIORITIES = ["low", "medium", "high"];

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      });
    }
  }, [task]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSave({ ...form, due_date: form.due_date || null });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 1.25rem", fontSize: "1.25rem" }}>
          {task ? "Edit Task" : "New Task"}
        </h2>

        {error && <div style={errStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input style={inp} name="title" placeholder="Task title *" value={form.title} onChange={handleChange} required />
          <textarea style={{ ...inp, height: 80, resize: "vertical" }} name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <select style={inp} name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <select style={inp} name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <input style={inp} type="date" name="due_date" value={form.due_date} onChange={handleChange} />

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" style={saveBtn} disabled={loading}>
              {loading ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 };
const modal = { background: "#fff", borderRadius: 12, padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" };
const inp = { padding: "0.7rem 0.9rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: "0.95rem", width: "100%", boxSizing: "border-box", outline: "none" };
const errStyle = { background: "#fee2e2", color: "#dc2626", padding: "0.65rem", borderRadius: 8, marginBottom: "0.5rem", fontSize: "0.9rem" };
const cancelBtn = { flex: 1, padding: "0.75rem", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600 };
const saveBtn = { flex: 2, padding: "0.75rem", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 };
