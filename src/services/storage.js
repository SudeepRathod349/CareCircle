// LocalStorage persistence service for CareCircle
import {
  INITIAL_CARE_RECIPIENT,
  INITIAL_MEMBERS,
  getSampleTasks,
  getSampleAppointments
} from "./sampleData.js";

const STORAGE_KEY = "carecircle_data_v1";

// Safe in-memory storage fallback for Node.js test environments
const memoryStore = {};
function getStorage() {
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return {
    getItem: (key) => memoryStore[key] || null,
    setItem: (key, val) => {
      memoryStore[key] = String(val);
    },
    removeItem: (key) => {
      delete memoryStore[key];
    },
    clear: () => {
      Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
    }
  };
}

/**
 * Generates a stable, sequential task ID (e.g. TASK-106)
 * Never alters existing task IDs.
 */
export function generateStableTaskId(existingTasks = []) {
  let maxNum = 100;
  existingTasks.forEach((t) => {
    if (t && t.id) {
      const match = String(t.id).match(/TASK-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });
  return `TASK-${maxNum + 1}`;
}

/**
 * Creates an activity history entry
 */
export function createActivityEntry({
  taskId = null,
  taskTitle = "",
  actionType = "update", // "creation" | "update" | "completion" | "reopened" | "deletion" | "appointment"
  actor = "Caregiver",
  description = "",
  changes = [] // Array of { field, fieldName, from, to }
}) {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskId,
    taskTitle,
    actionType,
    actor,
    description: description || `Task ${taskId || ""}: ${actionType}`,
    changes: changes || [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Returns initial application state
 */
export function getDefaultData() {
  const sampleTasks = getSampleTasks();
  const sampleApts = getSampleAppointments();

  return {
    recipient: INITIAL_CARE_RECIPIENT,
    members: INITIAL_MEMBERS,
    tasks: sampleTasks,
    appointments: sampleApts,
    activityLog: [
      {
        id: "act-1",
        taskId: "TASK-101",
        taskTitle: "Confirm wheelchair transport for cardiology checkup",
        actionType: "creation",
        actor: "Priya (Care Coordinator)",
        description: "Created task TASK-101: Confirm wheelchair transport for cardiology checkup",
        changes: [],
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "act-2",
        taskId: "TASK-103",
        taskTitle: "Log morning blood pressure & pulse readings",
        actionType: "completion",
        actor: "Sarah (Clinical Care)",
        description: "Marked task TASK-103 as Completed: Log morning blood pressure & pulse readings",
        changes: [{ field: "status", fieldName: "Status", from: "Pending", to: "Completed" }],
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: "act-3",
        taskId: null,
        taskTitle: "Cardiology Follow-Up & ECG",
        actionType: "appointment",
        actor: "Priya (Care Coordinator)",
        description: "Scheduled cardiology appointment with Dr. Robert Henderson",
        changes: [],
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ],
    lastReset: new Date().toISOString()
  };
}

/**
 * Loads data from localStorage, or seeds default data if absent or corrupt
 */
export function loadData() {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultData();
      saveData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.appointments)) {
      console.warn("Storage structure mismatch, falling back to default sample data.");
      const initial = getDefaultData();
      saveData(initial);
      return initial;
    }

    // Ensure all tasks have stable IDs (standardize if legacy task-xxx format)
    const normalizedTasks = parsed.tasks.map((t) => {
      if (t.id && t.id.startsWith("task-")) {
        return { ...t, id: t.id.replace("task-", "TASK-") };
      }
      return t;
    });

    return {
      ...parsed,
      tasks: normalizedTasks
    };
  } catch (err) {
    console.error("Failed to read from localStorage:", err);
    return getDefaultData();
  }
}

/**
 * Saves current data to localStorage
 */
export function saveData(data) {
  try {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
    return false;
  }
}

/**
 * Resets data back to fresh sample demo state
 */
export function resetData() {
  const fresh = getDefaultData();
  saveData(fresh);
  return fresh;
}
