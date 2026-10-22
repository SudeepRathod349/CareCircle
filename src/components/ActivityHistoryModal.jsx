import React, { useState, useMemo } from "react";
import {
  X,
  History,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  Search,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function ActivityHistoryModal({ isOpen, onClose, activityLog = [] }) {
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = useMemo(() => {
    return (activityLog || []).filter((log) => {
      // Filter by type
      if (filterType !== "all") {
        if (filterType === "creation" && log.actionType !== "creation") return false;
        if (filterType === "update" && log.actionType !== "update") return false;
        if (filterType === "completion" && log.actionType !== "completion" && log.actionType !== "reopened") return false;
      }

      // Search by text or task ID
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDesc = (log.description || log.text || "").toLowerCase().includes(q);
        const matchesId = (log.taskId || "").toLowerCase().includes(q);
        const matchesActor = (log.actor || "").toLowerCase().includes(q);
        const matchesTitle = (log.taskTitle || "").toLowerCase().includes(q);
        if (!matchesDesc && !matchesId && !matchesActor && !matchesTitle) return false;
      }

      return true;
    });
  }, [activityLog, filterType, searchTerm]);

  if (!isOpen) return null;

  function getActionBadge(type) {
    switch (type) {
      case "creation":
        return <span className="badge" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>Created</span>;
      case "update":
        return <span className="badge" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>Updated</span>;
      case "completion":
        return <span className="badge badge-status-completed">Completed</span>;
      case "reopened":
        return <span className="badge badge-status-pending">Re-opened</span>;
      case "deletion":
        return <span className="badge badge-priority-high">Deleted</span>;
      case "appointment":
        return <span className="badge" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>Appointment</span>;
      default:
        return <span className="badge badge-category">{type || "Action"}</span>;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
      <div className="modal-content" style={{ maxWidth: 650, maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "#ccfbf1",
                color: "#0f766e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <History size={20} />
            </div>
            <div>
              <h2 id="history-modal-title" className="modal-title" style={{ fontSize: "1.2rem" }}>
                Care Circle Activity History
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Audit trail of task creations, updates, and completions
              </span>
            </div>
          </div>
          <button type="button" className="btn-icon-only" onClick={onClose} aria-label="Close activity history">
            <X size={20} />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 32, paddingBottom: 6, paddingTop: 6, fontSize: "0.84rem" }}
              placeholder="Search by task title, ID (e.g. TASK-102)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {["all", "creation", "update", "completion"].map((ft) => (
              <button
                key={ft}
                type="button"
                className={`btn btn-sm ${filterType === ft ? "btn-primary" : "btn-secondary"}`}
                style={{ textTransform: "capitalize", fontSize: "0.78rem" }}
                onClick={() => setFilterType(ft)}
              >
                {ft === "all" ? "All History" : ft}
              </button>
            ))}
          </div>
        </div>

        {/* List of Activity Entries */}
        <div style={{ maxHeight: "55vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const timeFormatted = new Date(log.timestamp || log.time).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={log.id}
                  style={{
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 14px",
                    backgroundColor: "var(--bg-surface)",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {getActionBadge(log.actionType)}
                      {log.taskId && (
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            backgroundColor: "var(--bg-surface-subtle)",
                            padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--text-main)"
                          }}
                        >
                          {log.taskId}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {timeFormatted}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "var(--text-main)", marginBottom: 6, fontWeight: 500 }}>
                    {log.description || log.text}
                  </p>

                  {/* Render Diff Tags for Updates */}
                  {Array.isArray(log.changes) && log.changes.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 10px",
                        margin: "6px 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4
                      }}
                    >
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                        Recorded Value Changes:
                      </span>
                      {log.changes.map((ch, idx) => (
                        <div key={idx} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}>
                          <strong style={{ color: "var(--text-main)" }}>{ch.fieldName || ch.field}:</strong>
                          <span style={{ textDecoration: "line-through", color: "#dc2626", backgroundColor: "#fee2e2", padding: "1px 5px", borderRadius: 3 }}>
                            {String(ch.originalValue || ch.from)}
                          </span>
                          <ArrowRight size={13} color="var(--text-subtle)" />
                          <span style={{ color: "#065f46", backgroundColor: "#d1fae5", padding: "1px 5px", borderRadius: 3, fontWeight: 600 }}>
                            {String(ch.proposedValue || ch.to)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <User size={12} />
                    <span>Actor: <strong>{log.actor || "Caregiver"}</strong></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state" style={{ padding: "30px 10px" }}>
              <History size={32} color="var(--text-subtle)" style={{ margin: "0 auto 8px auto" }} />
              <h3>No activity history found</h3>
              <p>No actions match your search or filter.</p>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
