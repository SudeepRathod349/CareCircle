import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, AlertCircle } from "lucide-react";

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit = null,
  members = []
}) {
  const isEditing = Boolean(taskToEdit);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "12:00",
    priority: "Medium",
    status: "Pending",
    assignee: members[0]?.name || "Priya",
    category: "Medical"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        dueDate: taskToEdit.dueDate || "",
        dueTime: taskToEdit.dueTime || "12:00",
        priority: taskToEdit.priority || "Medium",
        status: taskToEdit.status || "Pending",
        assignee: taskToEdit.assignee || members[0]?.name || "Priya",
        category: taskToEdit.category || "Medical"
      });
    } else {
      // Default new task date to today
      const todayStr = new Date().toISOString().split("T")[0];
      setFormData({
        title: "",
        description: "",
        dueDate: todayStr,
        dueTime: "12:00",
        priority: "Medium",
        status: "Pending",
        assignee: members[0]?.name || "Priya",
        category: "Medical"
      });
    }
    setErrors({});
  }, [taskToEdit, isOpen, members]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = "Task title is required.";
    }
    if (!formData.dueDate) {
      errs.dueDate = "Please select a due date.";
    }
    if (!formData.assignee) {
      errs.assignee = "Please select a family member to assign.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(taskToEdit || {}),
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      dueTime: formData.dueTime || "12:00",
      priority: formData.priority,
      status: formData.status,
      assignee: formData.assignee,
      category: formData.category,
      updatedAt: new Date().toISOString(),
      createdAt: taskToEdit?.createdAt || new Date().toISOString()
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="task-modal-title" className="modal-title">
            {isEditing ? "Edit Care Task" : "Create New Care Task"}
          </h2>
          <button type="button" className="btn-icon-only" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Pick up Lisinopril refill from pharmacy"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              autoFocus
            />
            {errors.title && <div className="form-error"><AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Instructions & Notes
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              rows={3}
              placeholder="Provide specific directions, dosages, or checklist items..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">
                Assignee <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                id="task-assignee"
                className="form-select"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              >
                {members.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} ({m.relation || m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-category">
                Category
              </label>
              <select
                id="task-category"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Medical">Medical & Rx</option>
                <option value="Transport">Transport & Mobility</option>
                <option value="Nutrition">Nutrition & Meals</option>
                <option value="Home Care">Home Care & Safety</option>
                <option value="Administrative">Administrative & Insurance</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-date">
                Due Date <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="task-date"
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => {
                  setFormData({ ...formData, dueDate: e.target.value });
                  if (errors.dueDate) setErrors({ ...errors, dueDate: null });
                }}
              />
              {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-time">
                Due Time
              </label>
              <input
                id="task-time"
                type="time"
                className="form-input"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority Level
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High Priority (Urgent)</option>
                <option value="Medium">Medium Priority (Routine)</option>
                <option value="Low">Low Priority (Flexible)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
