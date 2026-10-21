import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Mic,
  Volume2,
  VolumeX,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  MapPin,
  Car,
  Bell,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { parseAssistantRequest } from "../services/nlpParser.js";

export default function AlexaAssistant({
  members = [],
  onConfirmItems,
  onAddActivity
}) {
  const [inputText, setInputText] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const [isVoiceAudioEnabled, setIsVoiceAudioEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState(null);

  // Standard benchmark queries for users and evaluation
  const DEMO_PRESETS = [
    {
      label: "⭐ Benchmark: Dad's Appointment & Transport to Priya",
      text: "Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya."
    },
    {
      label: "💊 Medication Refill with High Priority",
      text: "Remind David to refill Dad's heart medication by Friday at 10 AM with high priority"
    },
    {
      label: "🏃 Schedule Physical Therapy",
      text: "Schedule physical therapy session for Dad next Monday at 2 PM"
    },
    {
      label: "❓ Ambiguous Test (Triggers Clarification)",
      text: "Pick up groceries for Dad"
    }
  ];

  // Browser speech synthesis helper (100% local, no API keys)
  function speakSimulation(text) {
    if (!isVoiceAudioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis unavailable:", e);
    }
  }

  function handleProcessInput(textToParse) {
    const text = textToParse || inputText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setConfirmedMessage(null);

    // Simulate natural processing delay (250ms)
    setTimeout(() => {
      const result = parseAssistantRequest(text, members);
      setParseResult(result);
      setIsProcessing(false);

      if (result.status === "ready_to_confirm" && result.alexaVoiceSpeech) {
        speakSimulation(result.alexaVoiceSpeech);
      } else if (result.status === "needs_clarification") {
        speakSimulation(result.question);
      }
    }, 250);
  }

  function handleSelectPreset(presetText) {
    setInputText(presetText);
    handleProcessInput(presetText);
  }

  function handleConfirm() {
    if (!parseResult || parseResult.status !== "ready_to_confirm") return;

    const appointmentsToAdd = [];
    const tasksToAdd = [];

    parseResult.items.forEach((item) => {
      if (item.type === "appointment") {
        appointmentsToAdd.push(item.data);
      } else if (item.type === "task") {
        tasksToAdd.push(item.data);
      }
    });

    onConfirmItems({
      appointments: appointmentsToAdd,
      tasks: tasksToAdd
    });

    onAddActivity({
      id: `act-${Date.now()}`,
      text: `Alexa+ Simulation parsed & saved: "${parseResult.originalInput}"`,
      time: new Date().toISOString(),
      type: "assistant"
    });

    const successMsg = `Saved ${appointmentsToAdd.length ? "appointment" : ""} ${
      appointmentsToAdd.length && tasksToAdd.length ? "and" : ""
    } ${tasksToAdd.length ? "coordinated task" : ""} to CareCircle!`;

    setConfirmedMessage(successMsg);
    speakSimulation("All set! I've updated your CareCircle calendar and assigned the tasks.");
    setParseResult(null);
    setInputText("");
  }

  function handleCancelPreview() {
    setParseResult(null);
  }

  return (
    <div className="alexa-assistant-view">
      {/* Simulation Disclaimer */}
      <div className="simulation-banner alexa-theme" role="note">
        <ShieldAlert size={22} style={{ flexShrink: 0, color: "#00d2ff", marginTop: 2 }} />
        <div>
          <strong style={{ color: "#ffffff", display: "block", marginBottom: 2 }}>
            Alexa+ / Voice Assistant Simulation Notice
          </strong>
          <span>
            This feature is an <strong>interactive local simulation</strong> demonstrating how conversational voice commands can orchestrate family caregiving. All NLP parsing runs 100% locally in your browser. It does not connect to real Alexa devices, Amazon accounts, or commercial cloud APIs.
          </span>
        </div>
      </div>

      {/* Assistant Command Console Card */}
      <div className="alexa-card-container">
        <div className="alexa-header-row">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="brand-icon" style={{ background: "linear-gradient(135deg, #0284c7, #00d2ff)" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>
                CareCircle Smart Assistant
              </h2>
              <span style={{ fontSize: "0.8rem", color: "#93c5fd" }}>
                Voice & Conversational Care Coordination Simulator
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Audio Voice Simulation Toggle */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{
                backgroundColor: isVoiceAudioEnabled ? "rgba(0, 210, 255, 0.2)" : "rgba(255,255,255,0.08)",
                color: isVoiceAudioEnabled ? "#00d2ff" : "#cbd5e1",
                borderColor: isVoiceAudioEnabled ? "#00d2ff" : "rgba(255,255,255,0.2)"
              }}
              onClick={() => {
                const nextState = !isVoiceAudioEnabled;
                setIsVoiceAudioEnabled(nextState);
                if (nextState) {
                  speakSimulation("Voice assistant audio simulation enabled.");
                }
              }}
              title="Toggle browser speech synthesis voice responses"
            >
              {isVoiceAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{isVoiceAudioEnabled ? "Simulated Voice: ON" : "Simulated Voice: OFF"}</span>
            </button>

            <span className="alexa-brand-badge">
              <Mic size={14} /> Alexa+ Simulation Mode
            </span>
          </div>
        </div>

        {/* Quick Demo Benchmark Chips */}
        <div style={{ margin: "16px 0 10px 0" }}>
          <div style={{ fontSize: "0.8rem", color: "#93c5fd", marginBottom: 8, fontWeight: 600 }}>
            Quick Demo Presets (Click to test):
          </div>
          <div className="quick-prompt-chips">
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`prompt-chip ${idx === 0 ? "highlight" : ""}`}
                onClick={() => handleSelectPreset(preset.text)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="alexa-input-row">
          <textarea
            className="alexa-textarea"
            placeholder="Tell CareCircle what you'd like to coordinate... (e.g. 'Create a reminder for Dad\'s appointment tomorrow at 5 PM and assign arranging transport to Priya.')"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleProcessInput();
              }
            }}
          />
        </div>

        <div className="alexa-action-bar">
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Press <strong>Enter</strong> to process or choose a preset above
          </span>

          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: "#0284c7", color: "white" }}
            onClick={() => handleProcessInput()}
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? (
              <span>Analyzing Request...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Process Voice Request</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Success Message */}
      {confirmedMessage && (
        <div
          className="card"
          style={{
            marginTop: 20,
            backgroundColor: "#ecfdf5",
            borderColor: "#a7f3d0",
            display: "flex",
            alignItems: "center",
            gap: 12
          }}
        >
          <CheckCircle2 size={24} color="#059669" />
          <div>
            <strong style={{ color: "#065f46", display: "block" }}>
              Successfully Confirmed & Saved!
            </strong>
            <span style={{ fontSize: "0.85rem", color: "#047857" }}>
              {confirmedMessage} You can inspect it right now in the Tasks and Appointments tabs.
            </span>
          </div>
        </div>
      )}

      {/* Clarification Needed State */}
      {parseResult && parseResult.status === "needs_clarification" && (
        <div
          className="card"
          style={{
            marginTop: 20,
            borderColor: "#f59e0b",
            backgroundColor: "#fffbeb"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <HelpCircle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
                CareCircle Assistant Needs Clarification
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#78350f", marginBottom: 12 }}>
                {parseResult.question}
              </p>

              {parseResult.suggestions && parseResult.suggestions.length > 0 && (
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>
                    Select an option to clarify:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {parseResult.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ backgroundColor: "white", borderColor: "#fcd34d", color: "#92400e" }}
                        onClick={() => {
                          const updated = `${parseResult.originalInput} ${suggestion}`;
                          setInputText(updated);
                          handleProcessInput(updated);
                        }}
                      >
                        <ArrowRight size={14} />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ready To Confirm Proposed Actions */}
      {parseResult && parseResult.status === "ready_to_confirm" && (
        <div className="card" style={{ marginTop: 20, borderColor: "#0284c7", boxShadow: "var(--shadow-md)" }}>
          <div className="card-header" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                  Parsed via Natural Language
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Review proposed items before saving
                </span>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>
                Proposed Care Actions ({parseResult.items.length})
              </h3>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancelPreview}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirm}
              >
                <CheckCircle2 size={16} />
                <span>Confirm & Add to CareCircle</span>
              </button>
            </div>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "14px 0" }}>
            {parseResult.summary}
          </p>

          {/* Cards for each parsed item */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {parseResult.items.map((item, idx) => {
              if (item.type === "appointment") {
                const apt = item.data;
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #bfdbfe",
                      borderRadius: "var(--radius-md)",
                      padding: 16,
                      backgroundColor: "#f0f9ff"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span className="badge" style={{ backgroundColor: "#0284c7", color: "white" }}>
                        <Calendar size={13} />
                        Calendar Appointment
                      </span>
                      <span className="badge badge-status-pending">
                        {apt.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0c4a6e", marginBottom: 6 }}>
                      {apt.title}
                    </h4>

                    <div style={{ fontSize: "0.85rem", color: "#0369a1", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={14} />
                        <span>Date: <strong>{apt.date}</strong> at <strong>{apt.time}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <User size={14} />
                        <span>Recipient: <strong>{apt.recipient}</strong></span>
                      </div>
                      {apt.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <MapPin size={14} />
                          <span>Location: {apt.location}</span>
                        </div>
                      )}
                      {apt.transportAssignedTo && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Car size={14} />
                          <span>Transport Arranged: <strong>{apt.transportAssignedTo}</strong></span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Bell size={14} />
                        <span>Reminders: {apt.reminderNotice}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.type === "task") {
                const task = item.data;
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #a7f3d0",
                      borderRadius: "var(--radius-md)",
                      padding: 16,
                      backgroundColor: "#f0fdf4"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span className="badge" style={{ backgroundColor: "#059669", color: "white" }}>
                        <CheckCircle2 size={13} />
                        Coordinated Care Task
                      </span>
                      <span className="badge badge-priority-high">
                        {task.priority} Priority
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#064e3b", marginBottom: 6 }}>
                      {task.title}
                    </h4>

                    <p style={{ fontSize: "0.82rem", color: "#047857", marginBottom: 8 }}>
                      {task.description}
                    </p>

                    <div style={{ fontSize: "0.85rem", color: "#065f46", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <User size={14} />
                        <span>Assigned to: <strong>{task.assignee}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={14} />
                        <span>Due Date: <strong>{task.dueDate}</strong> ({task.dueTime})</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} />
                        <span>Category: {task.category}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          <div style={{ marginTop: 20, textAlign: "right" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
            >
              <CheckCircle2 size={18} />
              <span>Confirm & Save All Items to Circle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
