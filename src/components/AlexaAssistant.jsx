import React, { useState } from "react";
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
  ArrowRight,
  Cpu,
  RotateCcw,
  Tag,
  Check,
  XCircle
} from "lucide-react";
import { parseAssistantRequest, extractProposedChanges } from "../services/nlpParser.js";

export default function AlexaAssistant({
  members = [],
  existingTasks = [],
  onConfirmItems,
  onUpdateTask,
  onAddActivity
}) {
  const [inputText, setInputText] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const [isVoiceAudioEnabled, setIsVoiceAudioEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState(null);

  // Conversation context for tracking multi-turn dialogue & follow-ups
  const [conversationContext, setConversationContext] = useState({
    lastFocusedTaskId: existingTasks[0]?.id || "TASK-101",
    pendingDisambiguation: null
  });

  // Presets demonstrating both creation and contextual modification workflows
  const DEMO_PRESETS = [
    {
      label: "⭐ Benchmark: Dad's Appointment & Transport to Priya",
      text: "Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya."
    },
    {
      label: "🔄 Contextual Update: Reschedule David's medication task to 6 PM",
      text: "Reschedule David's medication task to 6 PM"
    },
    {
      label: "❓ Ambiguous Update: Change Priya's task to High priority",
      text: "Change Priya's task to High priority"
    },
    {
      label: "🗣️ Pronoun Follow-up: Postpone it to tomorrow",
      text: "Postpone it to tomorrow"
    },
    {
      label: "✓ Status Update: Mark Lisinopril refill as completed",
      text: "Mark Lisinopril refill as completed"
    },
    {
      label: "❓ Ambiguous Creation: Pick up groceries for Dad",
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

    setTimeout(() => {
      const result = parseAssistantRequest(
        text,
        members,
        existingTasks,
        conversationContext
      );
      setParseResult(result);
      setIsProcessing(false);

      if (result.status === "ready_to_update" && result.targetTask) {
        setConversationContext((prev) => ({
          ...prev,
          lastFocusedTaskId: result.targetTask.id,
          pendingDisambiguation: null
        }));
      } else if (result.status === "disambiguation_needed") {
        setConversationContext((prev) => ({
          ...prev,
          pendingDisambiguation: {
            candidates: result.candidates,
            pendingChanges: result.pendingChanges
          }
        }));
      }

      if (result.alexaVoiceSpeech) {
        speakSimulation(result.alexaVoiceSpeech);
      } else if (result.question) {
        speakSimulation(result.question);
      }
    }, 250);
  }

  function handleSelectPreset(presetText) {
    setInputText(presetText);
    handleProcessInput(presetText);
  }

  // Confirming creation of new appointment and/or task
  function handleConfirmCreation() {
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

    if (tasksToAdd.length > 0) {
      setConversationContext((prev) => ({
        ...prev,
        lastFocusedTaskId: tasksToAdd[0].id,
        pendingDisambiguation: null
      }));
    }

    const successMsg = `Saved ${appointmentsToAdd.length ? "appointment" : ""} ${
      appointmentsToAdd.length && tasksToAdd.length ? "and" : ""
    } ${tasksToAdd.length ? "coordinated task" : ""} to CareCircle!`;

    setConfirmedMessage(successMsg);
    speakSimulation("All set! I've updated your CareCircle calendar and assigned the tasks.");
    setParseResult(null);
    setInputText("");
  }

  // Confirming updates to an existing task
  function handleConfirmUpdate() {
    if (!parseResult || parseResult.status !== "ready_to_update" || !parseResult.targetTask) return;

    const { targetTask, changes } = parseResult;

    // Apply the update via parent handler
    onUpdateTask(targetTask.id, changes, parseResult.summary);

    const changeSummary = changes
      .map((c) => `${c.fieldName} (${c.originalValue} ➡️ ${c.proposedValue})`)
      .join(", ");

    const successMsg = `Successfully updated ${targetTask.id} ("${targetTask.title}"): ${changeSummary}`;
    setConfirmedMessage(successMsg);
    speakSimulation(`Done! Task ${targetTask.id} has been updated.`);

    setConversationContext((prev) => ({
      ...prev,
      lastFocusedTaskId: targetTask.id,
      pendingDisambiguation: null
    }));

    setParseResult(null);
    setInputText("");
  }

  // Cancelling an update without modifying state
  function handleCancelAction() {
    setParseResult(null);
    setConfirmedMessage("Action cancelled. No changes were made to any tasks.");
    speakSimulation("Action cancelled.");
  }

  // Choosing a candidate during disambiguation
  function handleChooseDisambiguationCandidate(candidate) {
    const pendingChanges = conversationContext.pendingDisambiguation?.pendingChanges || [];
    const updatedResult = {
      status: "ready_to_update",
      engine: "local_demo_heuristic",
      engineNotice: "Generated by CareCircle Local Heuristic Engine (rule-based pattern matching, no external AI model).",
      originalInput: parseResult?.originalInput || "",
      targetTask: candidate,
      changes: pendingChanges.length > 0 ? pendingChanges : extractProposedChanges(candidate, parseResult?.originalInput || "", members),
      summary: `Identified ${candidate.id}: "${candidate.title}". Please review the proposed changes before saving.`,
      alexaVoiceSpeech: `I selected task ${candidate.id}. Please review the proposed changes.`
    };

    setParseResult(updatedResult);
    setConversationContext((prev) => ({
      ...prev,
      lastFocusedTaskId: candidate.id,
      pendingDisambiguation: null
    }));

    if (updatedResult.alexaVoiceSpeech) {
      speakSimulation(updatedResult.alexaVoiceSpeech);
    }
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

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Local Heuristic Indicator */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                color: "#93c5fd"
              }}
              title="Runs offline rule-based heuristic parsing without external cloud models"
            >
              <Cpu size={13} color="#00d2ff" />
              <span>Local Demo Logic</span>
            </span>

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
              <span>{isVoiceAudioEnabled ? "Voice: ON" : "Voice: OFF"}</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div style={{ margin: "16px 0 10px 0" }}>
          <div style={{ fontSize: "0.8rem", color: "#93c5fd", marginBottom: 8, fontWeight: 600 }}>
            Quick Demo Presets (Creation, Updates, Ambiguity & Follow-ups):
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
            placeholder="Tell CareCircle what you'd like to coordinate... (e.g. 'Reschedule David\'s medication task to 6 PM' or 'Create a reminder for Dad\'s appointment tomorrow at 5 PM and assign arranging transport to Priya.')"
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
          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            {conversationContext.lastFocusedTaskId && (
              <span>
                Active Context Task: <strong style={{ color: "#00d2ff" }}>{conversationContext.lastFocusedTaskId}</strong>
              </span>
            )}
          </div>

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
              Action Result
            </strong>
            <span style={{ fontSize: "0.85rem", color: "#047857" }}>
              {confirmedMessage}
            </span>
          </div>
        </div>
      )}

      {/* Local Demo Logic Indicator Banner for Parse Results */}
      {parseResult && (
        <div
          style={{
            marginTop: 16,
            padding: "8px 14px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            flexWrap: "wrap",
            gap: 6
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Cpu size={14} color="#0284c7" />
            <strong style={{ color: "var(--text-main)" }}>Local Rule-Based Demo Logic:</strong>
            <span>Client-side heuristic NLP parser (Offline pattern matching, not a cloud AI model)</span>
          </div>
          {parseResult.targetTask && (
            <span className="badge" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>
              Target: {parseResult.targetTask.id}
            </span>
          )}
        </div>
      )}

      {/* No Changes Needed Notice */}
      {parseResult && parseResult.status === "no_changes_needed" && (
        <div
          className="card"
          style={{
            marginTop: 16,
            borderColor: "#bfdbfe",
            backgroundColor: "#f0f9ff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={20} color="#0284c7" />
            <div style={{ flex: 1, color: "#0369a1", fontSize: "0.9rem" }}>
              {parseResult.message}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCancelAction}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Disambiguation Needed State (Multiple Matches) */}
      {parseResult && parseResult.status === "disambiguation_needed" && (
        <div
          className="card"
          style={{
            marginTop: 16,
            borderColor: "#f59e0b",
            backgroundColor: "#fffbeb"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <HelpCircle size={26} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="badge" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                  Ambiguity Detected
                </span>
                <span style={{ fontSize: "0.78rem", color: "#b45309" }}>
                  Multiple tasks match your request
                </span>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
                {parseResult.question}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#78350f", marginBottom: 14 }}>
                Please select which task you would like to apply this change to:
              </p>

              {/* Candidate Tasks Choice Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                {parseResult.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    style={{
                      border: "1px solid #fcd34d",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "white",
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "var(--shadow-sm)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            padding: "2px 6px",
                            borderRadius: 4
                          }}
                        >
                          {candidate.id}
                        </span>
                        <span className={`badge badge-priority-${candidate.priority?.toLowerCase()}`}>
                          {candidate.priority}
                        </span>
                      </div>
                      <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                        {candidate.title}
                      </h4>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Assignee: <strong>{candidate.assignee}</strong> • Due: {candidate.dueDate}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 10, width: "100%", fontSize: "0.8rem" }}
                      onClick={() => handleChooseDisambiguationCandidate(candidate)}
                    >
                      <Check size={14} />
                      <span>Select {candidate.id}</span>
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, textAlign: "right" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ backgroundColor: "white" }}
                  onClick={handleCancelAction}
                >
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Card for Task Update (Diff: Original Value vs Proposed Value) */}
      {parseResult && parseResult.status === "ready_to_update" && parseResult.targetTask && (
        <div
          className="card"
          style={{
            marginTop: 16,
            borderColor: "#0284c7",
            boxShadow: "var(--shadow-md)"
          }}
        >
          <div className="card-header" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="badge" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                  Task Change Review
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    backgroundColor: "#f1f5f9",
                    color: "var(--text-main)",
                    padding: "2px 8px",
                    borderRadius: 4
                  }}
                >
                  {parseResult.targetTask.id}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  (Current Assignee: {parseResult.targetTask.assignee})
                </span>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                {parseResult.targetTask.title}
              </h3>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancelAction}
              >
                <XCircle size={15} />
                <span>Cancel / Discard</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: "#0284c7" }}
                onClick={handleConfirmUpdate}
              >
                <Check size={16} />
                <span>Confirm & Apply Change</span>
              </button>
            </div>
          </div>

          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "12px 0 16px 0" }}>
            {parseResult.summary}
          </p>

          {/* Diff Box: Original Value vs Proposed Value */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr auto 1fr",
                padding: "8px 14px",
                backgroundColor: "#f1f5f9",
                borderBottom: "1px solid #e2e8f0",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase"
              }}
            >
              <span>Field</span>
              <span>Original Value</span>
              <span style={{ width: 30, textAlign: "center" }}></span>
              <span>Proposed Value</span>
            </div>

            {parseResult.changes.map((change, cIdx) => (
              <div
                key={cIdx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr auto 1fr",
                  padding: "12px 14px",
                  alignItems: "center",
                  borderBottom: cIdx < parseResult.changes.length - 1 ? "1px solid #e2e8f0" : "none",
                  backgroundColor: "white"
                }}
              >
                <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                  {change.fieldName}
                </strong>

                {/* Original Value */}
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textDecoration: "line-through"
                    }}
                  >
                    {String(change.originalValue)}
                  </span>
                </div>

                {/* Arrow */}
                <div style={{ width: 30, textAlign: "center", color: "var(--text-subtle)" }}>
                  <ArrowRight size={16} />
                </div>

                {/* Proposed Value */}
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      boxShadow: "0 1px 3px rgba(16, 185, 129, 0.2)"
                    }}
                  >
                    {String(change.proposedValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Changes will only take effect after you click <strong>Confirm & Apply Change</strong>.
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancelAction}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmUpdate}
              >
                <Check size={16} />
                <span>Confirm & Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Needed State (Creation) */}
      {parseResult && parseResult.status === "needs_clarification" && (
        <div
          className="card"
          style={{
            marginTop: 16,
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

      {/* Ready To Confirm Proposed New Items (Creation) */}
      {parseResult && parseResult.status === "ready_to_confirm" && (
        <div className="card" style={{ marginTop: 16, borderColor: "#0284c7", boxShadow: "var(--shadow-md)" }}>
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
                onClick={handleCancelAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmCreation}
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="badge" style={{ backgroundColor: "#059669", color: "white" }}>
                          <CheckCircle2 size={13} />
                          Coordinated Care Task
                        </span>
                        <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, backgroundColor: "#d1fae5", color: "#065f46", padding: "1px 6px", borderRadius: 3 }}>
                          {task.id}
                        </span>
                      </div>
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
              onClick={handleConfirmCreation}
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
