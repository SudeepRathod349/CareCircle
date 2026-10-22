import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TaskList from "./components/TaskList.jsx";
import AppointmentList from "./components/AppointmentList.jsx";
import FamilyCircle from "./components/FamilyCircle.jsx";
import AlexaAssistant from "./components/AlexaAssistant.jsx";
import TaskModal from "./components/TaskModal.jsx";
import AppointmentModal from "./components/AppointmentModal.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import NotificationToast from "./components/NotificationToast.jsx";
import ActivityHistoryModal from "./components/ActivityHistoryModal.jsx";
import {
  loadData,
  saveData,
  resetData,
  generateStableTaskId,
  createActivityEntry
} from "./services/storage.js";

export default function App() {
  // Application Data State with LocalStorage
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState("dashboard");

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [aptToEdit, setAptToEdit] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    isDanger: false,
    onConfirm: () => {}
  });

  // Sync to localStorage whenever data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Toast Helper
  function showToast(message, type = "success") {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ===================== TASK HANDLERS =====================
  function handleSaveTask(task) {
    setData((prev) => {
      const exists = prev.tasks.some((t) => t.id === task.id);
      let updatedTasks;
      let activityItem;

      if (exists) {
        const oldTask = prev.tasks.find((t) => t.id === task.id);
        const changes = [];

        ["title", "priority", "status", "assignee", "dueDate", "dueTime"].forEach((f) => {
          if (oldTask && oldTask[f] !== task[f]) {
            changes.push({
              field: f,
              fieldName: f.charAt(0).toUpperCase() + f.slice(1),
              originalValue: oldTask[f],
              proposedValue: task[f]
            });
          }
        });

        updatedTasks = prev.tasks.map((t) => (t.id === task.id ? task : t));
        showToast(`Updated task ${task.id}: "${task.title}"`);

        activityItem = createActivityEntry({
          taskId: task.id,
          taskTitle: task.title,
          actionType: "update",
          actor: "Manual User Action",
          description: `Updated task ${task.id} ("${task.title}")`,
          changes
        });
      } else {
        // Ensure new task has a stable ID
        const stableId = task.id || generateStableTaskId(prev.tasks);
        const finalTask = { ...task, id: stableId };

        updatedTasks = [finalTask, ...prev.tasks];
        showToast(`Created task ${stableId}: "${task.title}"`);

        activityItem = createActivityEntry({
          taskId: stableId,
          taskTitle: task.title,
          actionType: "creation",
          actor: "Manual User Action",
          description: `Created new task ${stableId}: "${task.title}" (assigned to ${task.assignee})`,
          changes: []
        });
      }

      return {
        ...prev,
        tasks: updatedTasks,
        activityLog: [activityItem, ...(prev.activityLog || [])].slice(0, 50)
      };
    });

    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  }

  function handleToggleTaskComplete(taskId) {
    setData((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
      const updated = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t
      );

      const isCompleted = nextStatus === "Completed";
      const msg = isCompleted
        ? `Completed task ${task.id}: "${task.title}"`
        : `Re-opened task ${task.id}: "${task.title}"`;

      showToast(msg, isCompleted ? "success" : "info");

      const activityItem = createActivityEntry({
        taskId: task.id,
        taskTitle: task.title,
        actionType: isCompleted ? "completion" : "reopened",
        actor: "Caregiver (Checkbox)",
        description: msg,
        changes: [{ field: "status", fieldName: "Status", originalValue: task.status, proposedValue: nextStatus }]
      });

      return {
        ...prev,
        tasks: updated,
        activityLog: [activityItem, ...(prev.activityLog || [])].slice(0, 50)
      };
    });
  }

  function handleDeleteTask(taskId, taskTitle) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Care Task?",
      message: `Are you sure you want to delete ${taskId} ("${taskTitle}")? This cannot be undone.`,
      confirmText: "Delete Task",
      isDanger: true,
      onConfirm: () => {
        setData((prev) => {
          const activityItem = createActivityEntry({
            taskId,
            taskTitle,
            actionType: "deletion",
            actor: "Caregiver",
            description: `Deleted task ${taskId}: "${taskTitle}"`,
            changes: []
          });

          return {
            ...prev,
            tasks: prev.tasks.filter((t) => t.id !== taskId),
            activityLog: [activityItem, ...(prev.activityLog || [])].slice(0, 50)
          };
        });

        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Deleted task: "${taskTitle}"`, "info");
      }
    });
  }

  // ===================== ASSISTANT UPDATE CONFIRMATION HANDLER =====================
  function handleUpdateTaskFromAssistant(taskId, changes = [], description = "") {
    setData((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const patch = {};
      changes.forEach((c) => {
        patch[c.field] = c.proposedValue;
      });

      const updatedTask = {
        ...task,
        ...patch,
        updatedAt: new Date().toISOString()
      };

      const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? updatedTask : t));

      const activityItem = createActivityEntry({
        taskId,
        taskTitle: task.title,
        actionType: "update",
        actor: "Alexa+ Simulation (Local Heuristic)",
        description: description || `Updated task ${taskId} via assistant`,
        changes
      });

      showToast(`Updated ${taskId}: "${task.title}"`, "success");

      return {
        ...prev,
        tasks: updatedTasks,
        activityLog: [activityItem, ...(prev.activityLog || [])].slice(0, 50)
      };
    });
  }

  // ===================== APPOINTMENT HANDLERS =====================
  function handleSaveAppointment(apt) {
    setData((prev) => {
      const exists = prev.appointments.some((a) => a.id === apt.id);
      let updatedApts;
      let activityItem;

      if (exists) {
        updatedApts = prev.appointments.map((a) => (a.id === apt.id ? apt : a));
        showToast(`Updated appointment: "${apt.title}"`);
        activityItem = createActivityEntry({
          taskId: null,
          taskTitle: apt.title,
          actionType: "appointment",
          actor: "Caregiver",
          description: `Updated medical appointment: "${apt.title}" on ${apt.date}`,
          changes: []
        });
      } else {
        updatedApts = [apt, ...prev.appointments];
        showToast(`Scheduled appointment: "${apt.title}"`);
        activityItem = createActivityEntry({
          taskId: null,
          taskTitle: apt.title,
          actionType: "appointment",
          actor: "Caregiver",
          description: `Scheduled appointment: "${apt.title}" with ${apt.doctor || "Doctor"} on ${apt.date}`,
          changes: []
        });
      }

      return {
        ...prev,
        appointments: updatedApts,
        activityLog: [activityItem, ...(prev.activityLog || [])].slice(0, 50)
      };
    });

    setIsAptModalOpen(false);
    setAptToEdit(null);
  }

  function handleDeleteAppointment(aptId, aptTitle) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Appointment?",
      message: `Are you sure you want to remove "${aptTitle}" from the calendar?`,
      confirmText: "Delete Appointment",
      isDanger: true,
      onConfirm: () => {
        setData((prev) => {
          const activityItem = createActivityEntry({
            taskId: null,
            taskTitle: aptTitle,
            actionType: "appointment",
            actor: "Caregiver",
            description: `Cancelled appointment: "${aptTitle}"`,
            changes: []
          });

          return {
            ...prev,
            appointments: prev.appointments.filter((a) => a.id !== aptId),
            activityLog: [activityItem, ...(prev.activityLog || [])].slice(0, 50)
          };
        });

        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Deleted appointment: "${aptTitle}"`, "info");
      }
    });
  }

  // ===================== ASSISTANT CREATION BATCH HANDLER =====================
  function handleConfirmAssistantCreation({ appointments = [], tasks = [] }) {
    setData((prev) => {
      const activities = [];

      tasks.forEach((t) => {
        activities.push(
          createActivityEntry({
            taskId: t.id,
            taskTitle: t.title,
            actionType: "creation",
            actor: "Alexa+ Simulation (Local Heuristic)",
            description: `Created task ${t.id}: "${t.title}" (assigned to ${t.assignee})`,
            changes: []
          })
        );
      });

      appointments.forEach((a) => {
        activities.push(
          createActivityEntry({
            taskId: null,
            taskTitle: a.title,
            actionType: "appointment",
            actor: "Alexa+ Simulation (Local Heuristic)",
            description: `Scheduled appointment: "${a.title}" for ${a.recipient} on ${a.date}`,
            changes: []
          })
        );
      });

      return {
        ...prev,
        appointments: [...appointments, ...prev.appointments],
        tasks: [...tasks, ...prev.tasks],
        activityLog: [...activities, ...(prev.activityLog || [])].slice(0, 50)
      };
    });

    showToast(
      `Saved ${appointments.length} appointment(s) and ${tasks.length} task(s) via Assistant!`,
      "success"
    );
  }

  // ===================== FAMILY MEMBER HANDLER =====================
  function handleAddMember(newMember) {
    setData((prev) => {
      const activityItem = createActivityEntry({
        taskId: null,
        taskTitle: newMember.name,
        actionType: "creation",
        actor: "Care Coordinator",
        description: `Added caregiver ${newMember.name} (${newMember.role}) to Care Circle`,
        changes: []
      });

      return {
        ...prev,
        members: [...prev.members, newMember],
        activityLog: [activityItem, ...(prev.activityLog || [])].slice(0, 50)
      };
    });

    showToast(`Added ${newMember.name} to the Care Circle!`);
  }

  // ===================== RESET DEMO HANDLER =====================
  function handleTriggerResetDemo() {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Sample Demo Data?",
      message:
        "This will restore all pre-populated family care tasks, stable IDs (TASK-101 to TASK-105), appointments, and activity history to their default clean state.",
      confirmText: "Reset to Demo Data",
      isDanger: false,
      onConfirm: () => {
        const fresh = resetData();
        setData(fresh);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast("Demo data successfully reset to initial state!", "info");
      }
    });
  }

  const pendingCount = data.tasks.filter((t) => t.status !== "Completed").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingCount = data.appointments.filter(
    (a) => a.date >= todayStr && a.status !== "Completed"
  ).length;

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingTaskCount={pendingCount}
        upcomingAptCount={upcomingCount}
        onResetDemoClick={handleTriggerResetDemo}
        onQuickTaskClick={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenHistoryClick={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content" role="main">
        {activeTab === "dashboard" && (
          <Dashboard
            recipient={data.recipient}
            members={data.members}
            tasks={data.tasks}
            appointments={data.appointments}
            activityLog={data.activityLog || []}
            onNavigateTab={setActiveTab}
            onOpenCreateTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onOpenCreateAppointment={() => {
              setAptToEdit(null);
              setIsAptModalOpen(true);
            }}
            onToggleTaskComplete={handleToggleTaskComplete}
            onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          />
        )}

        {activeTab === "tasks" && (
          <TaskList
            tasks={data.tasks}
            members={data.members}
            onToggleComplete={handleToggleTaskComplete}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          />
        )}

        {activeTab === "appointments" && (
          <AppointmentList
            appointments={data.appointments}
            members={data.members}
            onEditAppointment={(apt) => {
              setAptToEdit(apt);
              setIsAptModalOpen(true);
            }}
            onDeleteAppointment={handleDeleteAppointment}
            onOpenCreateModal={() => {
              setAptToEdit(null);
              setIsAptModalOpen(true);
            }}
          />
        )}

        {activeTab === "family" && (
          <FamilyCircle
            members={data.members}
            tasks={data.tasks}
            recipient={data.recipient}
            onAddMember={handleAddMember}
          />
        )}

        {activeTab === "assistant" && (
          <AlexaAssistant
            members={data.members}
            existingTasks={data.tasks}
            onConfirmItems={handleConfirmAssistantCreation}
            onUpdateTask={handleUpdateTaskFromAssistant}
            onAddActivity={(act) => {
              setData((prev) => ({
                ...prev,
                activityLog: [act, ...(prev.activityLog || [])].slice(0, 50)
              }));
            }}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        members={data.members}
      />

      {/* Appointment Creation & Edit Modal */}
      <AppointmentModal
        isOpen={isAptModalOpen}
        onClose={() => {
          setIsAptModalOpen(false);
          setAptToEdit(null);
        }}
        onSave={handleSaveAppointment}
        appointmentToEdit={aptToEdit}
        members={data.members}
        recipientName={data.recipient?.name || "Dad (Robert Jenkins)"}
      />

      {/* Activity History Audit Modal */}
      <ActivityHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        activityLog={data.activityLog || []}
      />

      {/* Confirm Deletion / Reset Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
