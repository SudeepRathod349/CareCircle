import React, { useState } from "react";
import { Users, Phone, Mail, Plus, UserPlus, Heart, CheckCircle2, Shield, X } from "lucide-react";

export default function FamilyCircle({
  members = [],
  tasks = [],
  recipient = {},
  onAddMember
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
    role: "",
    phone: "",
    email: "",
    color: "#0d9488"
  });

  function getActiveTaskCount(memberName) {
    return tasks.filter((t) => t.assignee === memberName && t.status !== "Completed").length;
  }

  function handleCreateMember(e) {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    onAddMember({
      id: `mem-${Date.now()}`,
      name: newMember.name.trim(),
      fullName: newMember.name.trim(),
      relation: newMember.relation.trim() || "Caregiver",
      role: newMember.role.trim() || "Family Helper",
      phone: newMember.phone.trim() || "+1 (555) 000-0000",
      email: newMember.email.trim() || `${newMember.name.toLowerCase()}@example.com`,
      avatarBg: newMember.color || "#0d9488",
      initials: newMember.name.slice(0, 2).toUpperCase(),
      isPrimary: false
    });

    setIsAddModalOpen(false);
    setNewMember({
      name: "",
      relation: "",
      role: "",
      phone: "",
      email: "",
      color: "#0d9488"
    });
  }

  return (
    <div className="family-circle-view">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
            Family Care Circle
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            The trusted circle coordinating care for {recipient.name || "Dad"}.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>Add Caregiver</span>
        </button>
      </div>

      {/* Recipient Care Snapshot Card */}
      <div className="recipient-card">
        <div className="recipient-header">
          <div className="recipient-info">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}>
                Care Recipient
              </span>
              <span className="badge" style={{ backgroundColor: "#10b981", color: "white" }}>
                Active At-Home Recovery
              </span>
            </div>
            <h2>{recipient.name}</h2>
            <p style={{ opacity: 0.9, fontSize: "0.9rem" }}>
              Condition: {recipient.condition} • Age {recipient.age}
            </p>
          </div>
          <div style={{ textAlign: "right", minWidth: 200 }}>
            <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>Primary Physician</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{recipient.primaryPhysician}</div>
            <div style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: 4 }}>
              Allergies: <strong>{recipient.allergies}</strong>
            </div>
          </div>
        </div>

        <div className="recipient-meta-tags">
          <span className="meta-pill">
            <Heart size={14} /> Blood Type: {recipient.bloodType}
          </span>
          <span className="meta-pill">
            <Shield size={14} /> Hospital: {recipient.preferredHospital}
          </span>
          <span className="meta-pill">
            <Phone size={14} /> Emergency: {recipient.emergencyContact}
          </span>
        </div>
      </div>

      {/* Caregiver Cards */}
      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 12 }}>
        Active Circle Members ({members.length})
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {members.map((member) => {
          const pendingCount = getActiveTaskCount(member.name);

          return (
            <div key={member.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span
                    className="avatar avatar-lg"
                    style={{ backgroundColor: member.avatarBg || "var(--primary)" }}
                  >
                    {member.initials || member.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{member.fullName || member.name}</h3>
                      {member.isPrimary && (
                        <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#166534", fontSize: "0.68rem" }}>
                          Lead
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600 }}>
                      {member.role}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Relation: {member.relation}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6, margin: "14px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={14} color="var(--text-subtle)" />
                    <span>{member.phone}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={14} color="var(--text-subtle)" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Current Responsibilities
                </span>
                <span className="badge badge-priority-medium">
                  {pendingCount} active {pendingCount === 1 ? "task" : "tasks"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Family Member / Caregiver</h2>
              <button
                type="button"
                className="btn-icon-only"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMember}>
              <div className="form-group">
                <label className="form-label" htmlFor="mem-name">
                  Full Name <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  id="mem-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aunt Clara"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="mem-relation">
                    Relation
                  </label>
                  <input
                    id="mem-relation"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sister, Neighbor, Nurse"
                    value={newMember.relation}
                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mem-role">
                    Role in Care Circle
                  </label>
                  <input
                    id="mem-role"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Weekend Meals, Check-ins"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="mem-phone">
                    Phone Number
                  </label>
                  <input
                    id="mem-phone"
                    type="text"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mem-email">
                    Email Address
                  </label>
                  <input
                    id="mem-email"
                    type="email"
                    className="form-input"
                    placeholder="clara@example.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
