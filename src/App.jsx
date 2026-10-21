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
import { loadData, saveData, resetData } from "./services/storage.js";

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

  // Activity Log Helper
  function addActivity(text, type = "task") {
    const item = {
      id: `act-${Date.now()}`,
      text,
      time: new Date().toISOString(),
      type
    };
    setData((prev) => ({
      ...prev,
      activityLog: [item, ...(prev.activityLog || [])].slice(0, 20)
    }));
  }

  // ===================== TASK HANDLERS =====================
  function handleSaveTask(task) {
    setData((prev) => {
      const exists = prev.tasks.some((t) => t.id === task.id);
      let updatedTasks;
      if (exists) {
        updatedTasks = prev.tasks.map((t) => (t.id === task.id ? task : t));
        showToast(`Updated task: "${task.title}"`);
        addActivity(`Updated task: "${task.title}"`, "task");
      } else {
        updatedTasks = [task, ...prev.tasks];
        showToast(`Created task: "${task.title}"`);
        addActivity(`Created task: "${task.title}"`, "task");
      }
      return { ...prev, tasks: updatedTasks };
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

      const msg =
        nextStatus === "Completed"
          ? `Completed task: "${task.title}"`
          : `Re-opened task: "${task.title}"`;
      showToast(msg, nextStatus === "Completed" ? "success" : "info");
      addActivity(msg, "task");

      return { ...prev, tasks: updated };
    });
  }

  function handleDeleteTask(taskId, taskTitle) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Care Task?",
      message: `Are you sure you want to delete "${taskTitle}"? This cannot be undone.`,
      confirmText: "Delete Task",
      isDanger: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId)
        }));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Deleted task: "${taskTitle}"`, "info");
        addActivity(`Deleted task: "${taskTitle}"`, "task");
      }
    });
  }

  // ===================== APPOINTMENT HANDLERS =====================
  function handleSaveAppointment(apt) {
    setData((prev) => {
      const exists = prev.appointments.some((a) => a.id === apt.id);
      let updatedApts;
      if (exists) {
        updatedApts = prev.appointments.map((a) => (a.id === apt.id ? apt : a));
        showToast(`Updated appointment: "${apt.title}"`);
        addActivity(`Updated appointment: "${apt.title}"`, "appointment");
      } else {
        updatedApts = [apt, ...prev.appointments];
        showToast(`Scheduled appointment: "${apt.title}"`);
        addActivity(`Scheduled appointment: "${apt.title}"`, "appointment");
      }
      return { ...prev, appointments: updatedApts };
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
        setData((prev) => ({
          ...prev,
          appointments: prev.appointments.filter((a) => a.id !== aptId)
        }));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Deleted appointment: "${aptTitle}"`, "info");
        addActivity(`Deleted appointment: "${aptTitle}"`, "appointment");
      }
    });
  }

  // ===================== ASSISTANT / ALEXA+ SIMULATION BATCH HANDLER =====================
  function handleConfirmAssistantItems({ appointments = [], tasks = [] }) {
    setData((prev) => {
      return {
        ...prev,
        appointments: [...appointments, ...prev.appointments],
        tasks: [...tasks, ...prev.tasks]
      };
    });
    showToast(
      `Saved ${appointments.length} appointment(s) and ${tasks.length} task(s) via Assistant!`,
      "success"
    );
  }

  // ===================== FAMILY MEMBER HANDLER =====================
  function handleAddMember(newMember) {
    setData((prev) => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    showToast(`Added ${newMember.name} to the Care Circle!`);
    addActivity(`Added ${newMember.name} (${newMember.role}) to family care circle`, "family");
  }

  // ===================== RESET DEMO HANDLER =====================
  function handleTriggerResetDemo() {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Sample Demo Data?",
      message:
        "This will restore all pre-populated family care tasks, appointments, and care circle members to their original demo state.",
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
            onConfirmItems={handleConfirmAssistantItems}
            onAddActivity={(act) => {
              setData((prev) => ({
                ...prev,
                activityLog: [act, ...(prev.activityLog || [])].slice(0, 20)
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
