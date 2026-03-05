import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import TaskModal from "../components/TaskModal";

const STATUS_COLORS = { todo: "#94a3b8", in_progress: "#f59e0b", done: "#10b981" };
const PRIORITY_COLORS = { low: "#6ee7b7", medium: "#fbbf24", high: "#f87171" };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({});
  const { tasks, stats, loading, error, createTask, updateTask, deleteTask } = useTasks(filters);
  const [modal, setModal] = useState(null); // null | "create" | task object

  const handleSave = async (data) => {
    if (modal === "create") {
      await createTask(data);
    } else {
      await updateTask(modal.id, data);
    }
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.logo}>✅ TaskManager</span>
        <div style={styles.navRight}>
          <span style={styles.greeting}>Hi, {user?.username}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Stats */}
        {stats && (
          <div style={styles.statsRow}>
            {[
              { label: "Total", value: stats.total, color: "#4f46e5" },
              { label: "To Do", value: stats.todo, color: "#94a3b8" },
              { label: "In Progress", value: stats.in_progress, color: "#f59e0b" },
              { label: "Done", value: stats.done, color: "#10b981" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.filters}>
            <select style={styles.select} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}>
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select style={styles.select} onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button style={styles.addBtn} onClick={() => setModal("create")}>+ New Task</button>
        </div>

        {/* Task list */}
        {loading ? (
          <p style={{ color: "#666", textAlign: "center", padding: "3rem" }}>Loading tasks...</p>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>
            <p>No tasks yet. Click <strong>+ New Task</strong> to get started!</p>
          </div>
        ) : (
          <div style={styles.taskGrid}>
            {tasks.map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskHeader}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <div style={styles.taskActions}>
                    <button style={styles.editBtn} onClick={() => setModal(task)}>Edit</button>
                    <button style={styles.delBtn} onClick={() => { if (window.confirm("Delete this task?")) deleteTask(task.id); }}>✕</button>
                  </div>
                </div>
                {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                <div style={styles.taskMeta}>
                  <span style={{ ...styles.badge, background: STATUS_COLORS[task.status] + "30", color: STATUS_COLORS[task.status] }}>
                    {task.status.replace("_", " ")}
                  </span>
                  <span style={{ ...styles.badge, background: PRIORITY_COLORS[task.priority] + "30", color: "#92400e" }}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span style={styles.due}>📅 {new Date(task.due_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <TaskModal
          task={modal === "create" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc" },
  nav: { background: "#fff", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 50 },
  logo: { fontWeight: 700, fontSize: "1.2rem", color: "#1a1a2e" },
  navRight: { display: "flex", alignItems: "center", gap: "1rem" },
  greeting: { color: "#555", fontSize: "0.95rem" },
  logoutBtn: { padding: "0.4rem 0.9rem", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "0.9rem" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" },
  statCard: { background: "#fff", borderRadius: 10, padding: "1.25rem 1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" },
  filters: { display: "flex", gap: "0.75rem" },
  select: { padding: "0.5rem 0.75rem", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "0.9rem", cursor: "pointer" },
  addBtn: { padding: "0.6rem 1.25rem", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" },
  empty: { textAlign: "center", padding: "4rem 2rem", color: "#888", background: "#fff", borderRadius: 12, border: "2px dashed #e2e8f0" },
  taskGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" },
  taskCard: { background: "#fff", borderRadius: 10, padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem" },
  taskTitle: { margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1a1a2e", flex: 1 },
  taskActions: { display: "flex", gap: "0.4rem", flexShrink: 0 },
  editBtn: { padding: "0.25rem 0.6rem", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "0.8rem" },
  delBtn: { padding: "0.25rem 0.6rem", borderRadius: 6, border: "1px solid #fee2e2", background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: "0.8rem" },
  taskDesc: { margin: "0 0 0.75rem", color: "#666", fontSize: "0.9rem", lineHeight: 1.4 },
  taskMeta: { display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" },
  badge: { padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 },
  due: { color: "#888", fontSize: "0.8rem", marginLeft: "auto" },
};
