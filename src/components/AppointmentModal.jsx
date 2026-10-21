import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Stethoscope, Bell, AlertCircle } from "lucide-react";

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointmentToEdit = null,
  members = [],
  recipientName = "Dad (Robert Jenkins)"
}) {
  const isEditing = Boolean(appointmentToEdit);

  const [formData, setFormData] = useState({
    title: "",
    recipient: recipientName,
    doctor: "",
    date: "",
    time: "10:00",
    location: "",
    notes: "",
    reminderSet: true,
    reminderNotice: "1 day before & 2 hours before",
    transportAssignedTo: members[0]?.name || "Priya",
    status: "Upcoming"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (appointmentToEdit) {
      setFormData({
        title: appointmentToEdit.title || "",
        recipient: appointmentToEdit.recipient || recipientName,
        doctor: appointmentToEdit.doctor || "",
        date: appointmentToEdit.date || "",
        time: appointmentToEdit.time || "10:00",
        location: appointmentToEdit.location || "",
        notes: appointmentToEdit.notes || "",
        reminderSet: appointmentToEdit.reminderSet ?? true,
        reminderNotice: appointmentToEdit.reminderNotice || "1 day before & 2 hours before",
        transportAssignedTo: appointmentToEdit.transportAssignedTo || members[0]?.name || "Priya",
        status: appointmentToEdit.status || "Upcoming"
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      setFormData({
        title: "",
        recipient: recipientName,
        doctor: "",
        date: tomorrowStr,
        time: "14:00",
        location: "",
        notes: "",
        reminderSet: true,
        reminderNotice: "1 day before & 2 hours before",
        transportAssignedTo: members[0]?.name || "Priya",
        status: "Upcoming"
      });
    }
    setErrors({});
  }, [appointmentToEdit, isOpen, members, recipientName]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = "Appointment title is required.";
    }
    if (!formData.date) {
      errs.date = "Please select an appointment date.";
    }
    if (!formData.time) {
      errs.time = "Please specify the appointment time.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(appointmentToEdit || {}),
      id: appointmentToEdit ? appointmentToEdit.id : `apt-${Date.now()}`,
      title: formData.title.trim(),
      recipient: formData.recipient,
      doctor: formData.doctor.trim(),
      date: formData.date,
      time: formData.time,
      location: formData.location.trim(),
      notes: formData.notes.trim(),
      reminderSet: formData.reminderSet,
      reminderNotice: formData.reminderNotice,
      transportAssignedTo: formData.transportAssignedTo,
      status: formData.status,
      updatedAt: new Date().toISOString(),
      createdAt: appointmentToEdit?.createdAt || new Date().toISOString()
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="apt-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="apt-modal-title" className="modal-title">
            {isEditing ? "Edit Medical Appointment" : "Schedule Medical Appointment"}
          </h2>
          <button type="button" className="btn-icon-only" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="apt-title">
              Appointment Purpose / Specialty <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="apt-title"
              type="text"
              className="form-input"
              placeholder="e.g. Cardiology Follow-Up & ECG"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              autoFocus
            />
            {errors.title && <div className="form-error"><AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />{errors.title}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="apt-doctor">
                Doctor / Specialist / Clinic
              </label>
              <input
                id="apt-doctor"
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Robert Henderson"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apt-recipient">
                Care Recipient
              </label>
              <input
                id="apt-recipient"
                type="text"
                className="form-input"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="apt-date">
                Date <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="apt-date"
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (errors.date) setErrors({ ...errors, date: null });
                }}
              />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apt-time">
                Time <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="apt-time"
                type="time"
                className="form-input"
                value={formData.time}
                onChange={(e) => {
                  setFormData({ ...formData, time: e.target.value });
                  if (errors.time) setErrors({ ...errors, time: null });
                }}
              />
              {errors.time && <div className="form-error">{errors.time}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="apt-location">
              Clinic Location & Address
            </label>
            <input
              id="apt-location"
              type="text"
              className="form-input"
              placeholder="e.g. St. Jude Medical Pavilion, Suite 402"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="apt-transport">
                Assign Transport To
              </label>
              <select
                id="apt-transport"
                className="form-select"
                value={formData.transportAssignedTo}
                onChange={(e) => setFormData({ ...formData, transportAssignedTo: e.target.value })}
              >
                {members.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} ({m.relation || m.role})
                  </option>
                ))}
                <option value="Not Needed (At Home)">Not Needed (At Home/Virtual)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apt-reminder">
                Voice & Calendar Reminder
              </label>
              <select
                id="apt-reminder"
                className="form-select"
                value={formData.reminderNotice}
                onChange={(e) => setFormData({ ...formData, reminderNotice: e.target.value })}
              >
                <option value="1 day before & 2 hours before">1 day before & 2 hours before</option>
                <option value="2 hours before">2 hours before</option>
                <option value="1 day before">1 day before</option>
                <option value="1 hour before">1 hour before</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="apt-notes">
              Medical Notes / Instructions
            </label>
            <textarea
              id="apt-notes"
              className="form-textarea"
              rows={2}
              placeholder="e.g. Bring recent blood pressure logs, wear loose comfortable clothing..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Save Changes" : "Save Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
