import React from "react";
import {
  Heart,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Users,
  Sparkles,
  RotateCcw,
  Plus
} from "lucide-react";

export default function Navbar({
  activeTab,
  onSelectTab,
  pendingTaskCount = 0,
  upcomingAptCount = 0,
  onResetDemoClick,
  onQuickTaskClick
}) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="nav-brand" onClick={() => onSelectTab("dashboard")} style={{ cursor: "pointer" }}>
          <div className="brand-icon">
            <Heart size={22} fill="white" />
          </div>
          <div>
            <div className="brand-title">
              CareCircle
              <span className="brand-badge">2026 Hackathon Demo</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Family Caregiving & Delegation
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => onSelectTab("dashboard")}
            aria-current={activeTab === "dashboard" ? "page" : undefined}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => onSelectTab("tasks")}
            aria-current={activeTab === "tasks" ? "page" : undefined}
          >
            <CheckSquare size={16} />
            <span>Tasks</span>
            {pendingTaskCount > 0 && (
              <span className="tab-badge">{pendingTaskCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => onSelectTab("appointments")}
            aria-current={activeTab === "appointments" ? "page" : undefined}
          >
            <Calendar size={16} />
            <span>Appointments</span>
            {upcomingAptCount > 0 && (
              <span className="tab-badge">{upcomingAptCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "family" ? "active" : ""}`}
            onClick={() => onSelectTab("family")}
            aria-current={activeTab === "family" ? "page" : undefined}
          >
            <Users size={16} />
            <span>Family Circle</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "assistant" ? "active" : ""}`}
            onClick={() => onSelectTab("assistant")}
            aria-current={activeTab === "assistant" ? "page" : undefined}
            style={{
              color: activeTab === "assistant" ? "#0284c7" : undefined,
              fontWeight: 700
            }}
          >
            <Sparkles size={16} color="#0284c7" />
            <span>Alexa+ Simulator</span>
            <span className="tab-badge special">Voice NLP</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetDemoClick}
            title="Reset to fresh demo sample data"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onQuickTaskClick}
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
