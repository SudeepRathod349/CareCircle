import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Plus,
  Bell,
  Car,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AppointmentList({
  appointments = [],
  members = [],
  onEditAppointment,
  onDeleteAppointment,
  onOpenCreateModal,
  onToggleStatus
}) {
  const [filterMode, setFilterMode] = useState("Upcoming");

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredAppointments = appointments.filter((apt) => {
    if (filterMode === "Upcoming") {
      return apt.date >= todayStr && apt.status !== "Completed";
    }
    if (filterMode === "Completed") {
      return apt.status === "Completed" || apt.date < todayStr;
    }
    return true; // All
  }).sort((a, b) => {
    const timeA = `${a.date} ${a.time || "00:00"}`;
    const timeB = `${b.date} ${b.time || "00:00"}`;
    return timeA.localeCompare(timeB);
  });

  function formatDisplayDate(dateStr) {
    try {
      const parts = dateStr.split("-");
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return {
        month: d.toLocaleString("default", { month: "short" }),
        day: d.getDate(),
        year: d.getFullYear(),
        weekday: d.toLocaleString("default", { weekday: "short" })
      };
    } catch {
      return { month: "DATE", day: dateStr, year: "", weekday: "" };
    }
  }

  return (
    <div className="appointment-list-view">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
            Appointments & Care Reminders
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Keep track of doctor consultations, therapy sessions, and automated family reminders.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateModal}
        >
          <Plus size={18} />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["Upcoming", "All", "Completed"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn btn-sm ${filterMode === tab ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterMode(tab)}
          >
            {tab} Appointments
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {filteredAppointments.length > 0 ? (
        <div className="appointments-grid">
          {filteredAppointments.map((apt) => {
            const dateObj = formatDisplayDate(apt.date);
            const isCompleted = apt.status === "Completed";

            return (
              <div key={apt.id} className="appointment-card">
                {/* Big Date Badge */}
                <div className="apt-date-badge">
                  <span className="apt-month">{dateObj.month}</span>
                  <span className="apt-day">{dateObj.day}</span>
                  <span className="apt-time">{apt.time}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {dateObj.weekday}
                  </span>
                </div>

                {/* Details */}
                <div className="apt-details">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <h3 className="apt-title">{apt.title}</h3>
                      {apt.doctor && (
                        <div className="apt-doctor" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Stethoscope size={15} />
                          <span>{apt.doctor}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button
                        type="button"
                        className="btn-icon-only"
                        onClick={() => onEditAppointment(apt)}
                        title="Edit appointment"
                        aria-label={`Edit ${apt.title}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-only"
                        onClick={() => onDeleteAppointment(apt.id, apt.title)}
                        title="Delete appointment"
                        aria-label={`Delete ${apt.title}`}
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0" }}>
                    Patient / Recipient: <strong style={{ color: "var(--text-main)" }}>{apt.recipient}</strong>
                  </div>

                  {/* Location */}
                  {apt.location && (
                    <div className="apt-location">
                      <MapPin size={14} color="var(--primary)" />
                      <span>{apt.location}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {apt.notes && (
                    <p className="apt-notes" style={{ margin: "6px 0", fontStyle: "italic" }}>
                      "{apt.notes}"
                    </p>
                  )}

                  {/* Meta badges: Transport & Reminder */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {apt.transportAssignedTo && (
                      <span className="badge" style={{ backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                        <Car size={13} />
                        Transport: {apt.transportAssignedTo}
                      </span>
                    )}

                    {apt.reminderSet && (
                      <span className="badge" style={{ backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                        <Bell size={13} />
                        Reminder: {apt.reminderNotice || "Active"}
                      </span>
                    )}

                    <span className={`badge badge-status-${apt.status?.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty-state">
          <Calendar size={42} className="empty-state-icon" />
          <h3>No {filterMode.toLowerCase()} appointments scheduled</h3>
          <p>
            Stay ahead of healthcare visits by adding doctor consultations, rehabilitation sessions, or nurse checkups.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Schedule New Appointment</span>
          </button>
        </div>
      )}
    </div>
  );
}
