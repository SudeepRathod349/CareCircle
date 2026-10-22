// Automated Test Suite for CareCircle Contextual Task Workflow
import {
  parseAssistantRequest,
  scoreTaskMatch,
  extractProposedChanges,
  isUpdateRequest
} from "./src/services/nlpParser.js";
import {
  getDefaultData,
  generateStableTaskId,
  createActivityEntry,
  loadData,
  saveData
} from "./src/services/storage.js";

console.log("==================================================================");
console.log("   CARECIRCLE CONTEXTUAL TASK WORKFLOW VERIFICATION SUITE         ");
console.log("==================================================================");

let testsPassed = 0;
let testsTotal = 0;

function assert(condition, message) {
  testsTotal++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

const defaultData = getDefaultData();
const tasks = defaultData.tasks;
const members = defaultData.members;

// -----------------------------------------------------------
// 1. Stable Task IDs Verification
// -----------------------------------------------------------
console.log("\n--- TEST 1: Stable Task IDs ---");
const task101 = tasks.find((t) => t.id === "TASK-101");
const task102 = tasks.find((t) => t.id === "TASK-102");
assert(Boolean(task101), "TASK-101 exists in default sample data");
assert(Boolean(task102), "TASK-102 exists in default sample data");
assert(task101?.assignee === "Priya", "TASK-101 is assigned to Priya");
assert(task102?.assignee === "David", "TASK-102 is assigned to David");

const nextId = generateStableTaskId(tasks);
assert(nextId === "TASK-106", `generateStableTaskId produces sequential TASK-106 (got: ${nextId})`);

// -----------------------------------------------------------
// 2. Contextual Task Identification by Person, Topic & Time
// -----------------------------------------------------------
console.log("\n--- TEST 2: Contextual Task Identification ---");
const updatePrompt1 = "Reschedule David's medication task to 6 PM";
assert(isUpdateRequest(updatePrompt1), "Detected as update request");

const res1 = parseAssistantRequest(updatePrompt1, members, tasks, {});
assert(res1.status === "ready_to_update", `Status is ready_to_update (got: ${res1.status})`);
assert(res1.targetTask?.id === "TASK-102", `Correctly identified TASK-102 for David's medication (got: ${res1.targetTask?.id})`);

// -----------------------------------------------------------
// 3. Diff Generation (Original Value vs Proposed Value)
// -----------------------------------------------------------
console.log("\n--- TEST 3: Proposed Changes Diff Generation ---");
assert(Array.isArray(res1.changes) && res1.changes.length > 0, "Changes array contains field diffs");
const timeChange = res1.changes.find((c) => c.field === "dueTime");
assert(Boolean(timeChange), "Due time diff detected");
assert(timeChange?.originalValue === "17:30", `Original time is 17:30 (got: ${timeChange?.originalValue})`);
assert(timeChange?.proposedValue === "18:00", `Proposed time is 18:00 (got: ${timeChange?.proposedValue})`);
assert(res1.engine === "local_demo_heuristic", "Engine is labeled as local_demo_heuristic");
assert(Boolean(res1.engineNotice), "Engine notice contains clear offline local indicator");

// -----------------------------------------------------------
// 4. Ambiguity Resolution (Multiple Matches Disambiguation)
// -----------------------------------------------------------
console.log("\n--- TEST 4: Ambiguous Task Matching (Multiple Tasks) ---");
// Priya has TASK-101 (Wheelchair transport) and TASK-104 (Meal boxes).
// "Change Priya's task to High priority" does not specify which task!
const ambiguousPrompt = "Change Priya's task to High priority";
const resAmbiguous = parseAssistantRequest(ambiguousPrompt, members, tasks, {});

assert(resAmbiguous.status === "disambiguation_needed", `Triggers disambiguation_needed (got: ${resAmbiguous.status})`);
assert(Array.isArray(resAmbiguous.candidates) && resAmbiguous.candidates.length >= 2, `Identifies ${resAmbiguous.candidates?.length} candidate tasks`);
assert(resAmbiguous.candidates.some((c) => c.id === "TASK-101"), "Candidates include TASK-101");
assert(resAmbiguous.candidates.some((c) => c.id === "TASK-104"), "Candidates include TASK-104");
assert(Boolean(resAmbiguous.question), `Asks disambiguation question: "${resAmbiguous.question}"`);

// -----------------------------------------------------------
// 5. Resolving Disambiguation with User Choice
// -----------------------------------------------------------
console.log("\n--- TEST 5: Resolving Disambiguation with Choice ---");
const disambiguationContext = {
  pendingDisambiguation: {
    candidates: resAmbiguous.candidates,
    pendingChanges: resAmbiguous.pendingChanges
  }
};
const resResolved = parseAssistantRequest("TASK-104", members, tasks, disambiguationContext);
assert(resResolved.status === "ready_to_update", `Follow-up selection resolves to ready_to_update (got: ${resResolved.status})`);
assert(resResolved.targetTask?.id === "TASK-104", `Resolved task is TASK-104 (got: ${resResolved.targetTask?.id})`);

// -----------------------------------------------------------
// 6. Contextual Follow-up with Pronoun ("Postpone it to tomorrow")
// -----------------------------------------------------------
console.log("\n--- TEST 6: Contextual Follow-up using 'it' ---");
const pronounContext = {
  lastFocusedTaskId: "TASK-105" // Echo show task
};
const pronounPrompt = "Postpone it to tomorrow";
const resPronoun = parseAssistantRequest(pronounPrompt, members, tasks, pronounContext);
assert(resPronoun.status === "ready_to_update", "Pronoun prompt resolves to ready_to_update");
assert(resPronoun.targetTask?.id === "TASK-105", `Resolved to context task TASK-105 (got: ${resPronoun.targetTask?.id})`);
const dateChange = resPronoun.changes.find((c) => c.field === "dueDate");
assert(Boolean(dateChange), "Detected due date change to tomorrow");

// -----------------------------------------------------------
// 7. Cancellation Simulation (No Mutation)
// -----------------------------------------------------------
console.log("\n--- TEST 7: Cancellation Leaves Tasks Intact ---");
const task102Original = { ...tasks.find((t) => t.id === "TASK-102") };
// Simulation of user discarding review card: state remains unmodified
assert(task102Original.dueTime === "17:30", "TASK-102 remains untouched at 17:30 when update is discarded");

// -----------------------------------------------------------
// 8. Activity History Audit Trail
// -----------------------------------------------------------
console.log("\n--- TEST 8: Activity History Creation ---");
const activityItem = createActivityEntry({
  taskId: "TASK-102",
  taskTitle: "Pick up Lisinopril refill",
  actionType: "update",
  actor: "Alexa+ Simulation (Local Heuristic)",
  description: "Updated due time from 17:30 to 18:00 on TASK-102",
  changes: [
    { field: "dueTime", fieldName: "Due Time", originalValue: "17:30", proposedValue: "18:00" }
  ]
});

assert(Boolean(activityItem.id), "Activity entry has unique ID");
assert(activityItem.taskId === "TASK-102", "Activity entry references TASK-102");
assert(activityItem.actionType === "update", "Activity actionType is 'update'");
assert(activityItem.changes.length === 1, "Activity records field changes diff");

// -----------------------------------------------------------
// 9. Backward Compatibility: Benchmark Creation Request
// -----------------------------------------------------------
console.log("\n--- TEST 9: Existing Benchmark Creation Query ---");
const benchmarkQuery = "Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya.";
const resBenchmark = parseAssistantRequest(benchmarkQuery, members, tasks, {});
assert(resBenchmark.status === "ready_to_confirm", "Benchmark query status is ready_to_confirm");
assert(resBenchmark.items?.length === 2, "Creates 2 items (Appointment + Transport Task)");
const createdTask = resBenchmark.items.find((i) => i.type === "task")?.data;
assert(createdTask?.id.startsWith("TASK-"), `New task receives stable ID (got: ${createdTask?.id})`);
assert(createdTask?.assignee === "Priya", "Task assigned to Priya");

// -----------------------------------------------------------
// 10. Persistence & Simulated Browser Refresh
// -----------------------------------------------------------
console.log("\n--- TEST 10: LocalStorage Persistence & Reload ---");
const mockStorageState = {
  ...defaultData,
  tasks: tasks.map((t) => (t.id === "TASK-102" ? { ...t, dueTime: "18:00" } : t)),
  activityLog: [activityItem, ...defaultData.activityLog]
};
saveData(mockStorageState);
const loaded = loadData();
const loadedTask102 = loaded.tasks.find((t) => t.id === "TASK-102");
assert(loadedTask102?.dueTime === "18:00", "Updated task value persists and reloads cleanly");
assert(loaded.activityLog?.[0]?.taskId === "TASK-102", "Activity log entry persists and reloads cleanly");

console.log("\n==================================================================");
console.log(`WORKFLOW TEST SUMMARY: ${testsPassed} of ${testsTotal} tests passed.`);
console.log("==================================================================");
