// LocalStorage persistence service for CareCircle
import {
  INITIAL_CARE_RECIPIENT,
  INITIAL_MEMBERS,
  getSampleTasks,
  getSampleAppointments
} from "./sampleData.js";

const STORAGE_KEY = "carecircle_data_v1";

/**
 * Returns initial application state
 */
export function getDefaultData() {
  return {
    recipient: INITIAL_CARE_RECIPIENT,
    members: INITIAL_MEMBERS,
    tasks: getSampleTasks(),
    appointments: getSampleAppointments(),
    activityLog: [
      {
        id: "act-1",
        text: "Priya created task: Confirm wheelchair transport for cardiology checkup",
        time: new Date(Date.now() - 3600000 * 4).toISOString(),
        type: "task"
      },
      {
        id: "act-2",
        text: "Sarah completed task: Log morning blood pressure & pulse readings",
        time: new Date(Date.now() - 3600000 * 8).toISOString(),
        type: "task"
      },
      {
        id: "act-3",
        text: "Cardiology follow-up appointment scheduled for Dad",
        time: new Date(Date.now() - 3600000 * 24).toISOString(),
        type: "appointment"
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
    const raw = localStorage.getItem(STORAGE_KEY);
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
    return parsed;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
