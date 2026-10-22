import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Users,
  Heart,
  Shield,
  Plus,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Car,
  Bell
} from "lucide-react";

export default function Dashboard({
  recipient = {},
  members = [],
  tasks = [],
  appointments = [],
  activityLog = [],
  onNavigateTab,
  onOpenCreateTask,
  onOpenCreateAppointment,
  onToggleTaskComplete,
  onOpenHistoryModal
}) {
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === "High");

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingAppointments = appointments
    .filter((a) => a.date >= todayStr && a.status !== "Completed")
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <div className="dashboard-view">
      {/* Care Recipient Hero Card */}
      <div className="recipient-card">
        <div className="recipient-header">
          <div className="recipient-info">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}>
                Active Care Circle
              </span>
              <span className="badge" style={{ backgroundColor: "#10b981", color: "white" }}>
                At-Home Recovery
              </span>
            </div>
            <h2>{recipient.name}</h2>
            <p style={{ opacity: 0.9, fontSize: "0.92rem", maxWidth: 640 }}>
              Primary Condition: <strong>{recipient.condition}</strong> (Age {recipient.age})
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              onClick={() => onNavigateTab("assistant")}
            >
              <Sparkles size={16} />
              <span>Voice Assistant</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: "#ffffff", color: "var(--primary-dark)" }}
              onClick={onOpenCreateTask}
            >
              <Plus size={16} />
              <span>Add Care Task</span>
            </button>
          </div>
        </div>

        <div className="recipient-meta-tags">
          <span className="meta-pill">
            <Stethoscope size={14} /> {recipient.primaryPhysician}
          </span>
          <span className="meta-pill">
            <Shield size={14} /> {recipient.preferredHospital}
          </span>
          <span className="meta-pill">
            <Heart size={14} /> Blood Type: {recipient.bloodType}
          </span>
          <span className="meta-pill">
            Allergies: {recipient.allergies}
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-container">
        <div className="stat-card" onClick={() => onNavigateTab("tasks")} style={{ cursor: "pointer" }}>
          <div className="stat-icon" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-val">{highPriorityTasks.length}</div>
            <div className="stat-label">Urgent / High Priority</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigateTab("tasks")} style={{ cursor: "pointer" }}>
          <div className="stat-icon" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{pendingTasks.length}</div>
            <div className="stat-label">Tasks Pending</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigateTab("appointments")} style={{ cursor: "pointer" }}>
          <div className="stat-icon" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-val">{upcomingAppointments.length}</div>
            <div className="stat-label">Upcoming Visits</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigateTab("family")} style={{ cursor: "pointer" }}>
          <div className="stat-icon" style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{members.length}</div>
            <div className="stat-label">Caregivers in Circle</div>
          </div>
        </div>
      </div>

      {/* Quick Care Assistant Teaser Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(90deg, #022c43 0%, #0d9488 100%)",
          color: "white",
          marginBottom: 24,
          padding: "16px 20px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: 10, borderRadius: "50%" }}>
              <Sparkles size={20} color="#00d2ff" />
            </div>
            <div>
              <strong style={{ fontSize: "1rem" }}>Have a caregiving request?</strong>
              <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                Try: <em>"Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya."</em>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: "white", color: "#022c43", fontWeight: 700 }}
            onClick={() => onNavigateTab("assistant")}
          >
            <span>Open Alexa+ Simulator</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Main Grid: Pending Tasks vs Upcoming Appointments */}
      <div className="dashboard-grid">
        {/* Left Column: Urgent & Pending Tasks */}
        <div className="col-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Clock size={20} color="var(--primary)" />
                <span>Pending Care Tasks</span>
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateTab("tasks")}
              >
                <span>View All Tasks</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {pendingTasks.length > 0 ? (
              <div>
                {pendingTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="task-item">
                    <button
                      type="button"
                      className="task-checkbox-btn"
                      onClick={() => onToggleTaskComplete(task.id)}
                      title="Mark as completed"
                      aria-label={`Mark ${task.title} complete`}
                    >
                      <CheckCircle2 size={20} color="var(--text-subtle)" />
                    </button>

                    <div className="task-body">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            backgroundColor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            color: "#334155",
                            padding: "1px 5px",
                            borderRadius: 4
                          }}
                        >
                          {task.id}
                        </span>
                        <span className="task-title">{task.title}</span>
                        <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <span className="badge badge-category">
                          {task.category}
                        </span>
                      </div>
                      <div className="task-meta-row">
                        <span>Due: <strong>{task.dueDate}</strong> ({task.dueTime})</span>
                        <span>•</span>
                        <span>Assignee: <strong>{task.assignee}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "30px 10px" }}>
                <CheckCircle2 size={36} color="var(--primary)" style={{ margin: "0 auto 8px auto" }} />
                <h3>All tasks completed!</h3>
                <p>Great job! The care circle is currently up to date on all items.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Appointments & Circle Activity */}
        <div className="col-4">
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: "1rem" }}>
                <Calendar size={18} color="var(--primary)" />
                <span>Upcoming Visits</span>
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateTab("appointments")}
              >
                <span>All</span>
              </button>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    style={{
                      border: "1px solid var(--border-light)",
                      borderRadius: "var(--radius-md)",
                      padding: 12,
                      backgroundColor: "#fafafa"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>
                        {apt.date} • {apt.time}
                      </span>
                      <span className="badge badge-status-pending" style={{ fontSize: "0.7rem" }}>
                        {apt.status}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>
                      {apt.title}
                    </div>
                    {apt.doctor && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                        👨‍⚕️ {apt.doctor}
                      </div>
                    )}
                    {apt.transportAssignedTo && (
                      <div style={{ fontSize: "0.78rem", color: "#065f46" }}>
                        🚗 Transport: <strong>{apt.transportAssignedTo}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No appointments scheduled this week.
              </div>
            )}
          </div>

          {/* Activity Log Snapshot */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                Recent Care Activity
              </h3>
              {onOpenHistoryModal && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={onOpenHistoryModal}
                >
                  View Full History
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activityLog.slice(0, 4).map((act) => (
                <div key={act.id} style={{ fontSize: "0.8rem", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor:
                        act.actionType === "creation"
                          ? "#0284c7"
                          : act.actionType === "completion"
                          ? "#10b981"
                          : act.actionType === "update"
                          ? "#f59e0b"
                          : "var(--primary)",
                      marginTop: 6,
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <span style={{ color: "var(--text-main)" }}>{act.description || act.text}</span>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 2 }}>
                      {new Date(act.timestamp || act.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
