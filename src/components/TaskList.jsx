import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  User,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
  RotateCcw,
  History
} from "lucide-react";

export default function TaskList({
  tasks = [],
  members = [],
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  onOpenHistoryModal
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");

  // Filtering and Sorting
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesAssignee = t.assignee?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesAssignee) return false;
      }

      // Status
      if (statusFilter !== "All" && t.status !== statusFilter) return false;

      // Priority
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;

      // Assignee
      if (assigneeFilter !== "All" && t.assignee !== assigneeFilter) return false;

      // Category
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = `${a.dueDate} ${a.dueTime || "00:00"}`;
        const dateB = `${b.dueDate} ${b.dueTime || "00:00"}`;
        return dateA.localeCompare(dateB);
      }
      if (sortBy === "priority") {
        const weight = { High: 3, Medium: 2, Low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, categoryFilter, sortBy]);

  // Find member helper for avatar color
  function getMember(name) {
    return members.find((m) => m.name === name) || {
      name,
      avatarBg: "#0d9488",
      initials: name ? name.slice(0, 2).toUpperCase() : "??"
    };
  }

  function handleResetFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setAssigneeFilter("All");
    setCategoryFilter("All");
    setSortBy("dueDate");
  }

  const isFiltering =
    searchTerm ||
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    assigneeFilter !== "All" ||
    categoryFilter !== "All";

  return (
    <div className="task-list-view">
      {/* Top Header & New Task Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
            Family Caregiving Tasks
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Coordinate responsibilities, track medication runs, and delegate care duties.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onOpenHistoryModal && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenHistoryModal}
              title="View full audit trail of task changes"
            >
              <History size={16} />
              <span>Activity History</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks, medications, notes, assignees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search care tasks"
          />
        </div>

        {/* Status Filter */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by task status"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filter by task priority"
        >
          <option value="All">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Assignee Filter */}
        <select
          className="filter-select"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          aria-label="Filter by assignee"
        >
          <option value="All">All Family Members</option>
          {members.map((m) => (
            <option key={m.id || m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort tasks by"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
        </select>

        {isFiltering && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            title="Reset active filters"
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Task Count and Feedback */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>
          Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      {/* Task List Items */}
      {filteredTasks.length > 0 ? (
        <div className="tasks-container">
          {filteredTasks.map((task) => {
            const member = getMember(task.assignee);
            const isCompleted = task.status === "Completed";

            return (
              <div
                key={task.id}
                className={`task-item ${isCompleted ? "completed" : ""}`}
              >
                {/* Complete Toggle Checkbox */}
                <button
                  type="button"
                  className={`task-checkbox-btn ${isCompleted ? "checked" : ""}`}
                  onClick={() => onToggleComplete(task.id)}
                  aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as completed`}
                  title={isCompleted ? "Mark incomplete" : "Mark completed"}
                >
                  {isCompleted ? (
                    <CheckCircle size={22} color="var(--primary)" />
                  ) : (
                    <Circle size={22} color="var(--text-subtle)" />
                  )}
                </button>

                {/* Task Details */}
                <div className="task-body">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        padding: "1px 6px",
                        borderRadius: 4
                      }}
                      title={`Permanent Task ID: ${task.id}`}
                    >
                      {task.id}
                    </span>

                    <h3 className="task-title">{task.title}</h3>

                    {/* Priority Badge */}
                    <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                      {task.priority} Priority
                    </span>

                    {/* Status Badge */}
                    <span className={`badge badge-status-${task.status?.toLowerCase().replace(" ", "")}`}>
                      {task.status}
                    </span>

                    {/* Category */}
                    {task.category && (
                      <span className="badge badge-category">
                        {task.category}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}

                  {/* Metadata Row: Date, Time, Assignee */}
                  <div className="task-meta-row">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={14} color="var(--text-subtle)" />
                      {task.dueDate}
                    </span>

                    {task.dueTime && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Clock size={14} color="var(--text-subtle)" />
                        {task.dueTime}
                      </span>
                    )}

                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
                      <span
                        className="avatar avatar-sm"
                        style={{ backgroundColor: member.avatarBg || "var(--primary)" }}
                        title={`Assigned to ${task.assignee}`}
                      >
                        {member.initials || task.assignee?.slice(0, 2).toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Edit & Delete */}
                <div className="task-actions">
                  <button
                    type="button"
                    className="btn-icon-only"
                    onClick={() => onEditTask(task)}
                    aria-label={`Edit task ${task.title}`}
                    title="Edit task"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn-icon-only"
                    onClick={() => onDeleteTask(task.id, task.title)}
                    aria-label={`Delete task ${task.title}`}
                    title="Delete task"
                    style={{ color: "#ef4444" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty-state">
          <Calendar size={42} className="empty-state-icon" />
          <h3>No tasks match your filters</h3>
          <p>
            Try adjusting your search criteria, clearing the active filters, or creating a new task for your care circle.
          </p>
          {isFiltering ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              Clear Active Filters
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenCreateModal}
            >
              <Plus size={16} />
              <span>Create First Task</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
