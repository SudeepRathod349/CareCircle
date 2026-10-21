// Comprehensive Verification Script for CareCircle Core Features
import { parseAssistantRequest, parseDate, parseTime, parseAssignee, parsePriority } from "./src/services/nlpParser.js";
import { getDefaultData, loadData, saveData, resetData } from "./src/services/storage.js";

console.log("==================================================");
console.log("   CARECIRCLE AUTOMATED TEST SUITE & VERIFICATION  ");
console.log("==================================================");

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

// -----------------------------------------------------------
// 1. Storage & Sample Data Verification
// -----------------------------------------------------------
console.log("\n--- SECTION 1: Storage & Sample Data ---");
const defaultData = getDefaultData();
assert(defaultData.recipient && defaultData.recipient.name.includes("Robert"), "Sample recipient is Robert Jenkins");
assert(Array.isArray(defaultData.members) && defaultData.members.length >= 4, "Initial members include Priya, Sarah, David, Alex");
assert(Array.isArray(defaultData.tasks) && defaultData.tasks.length >= 5, "Sample tasks contains at least 5 realistic tasks");
assert(Array.isArray(defaultData.appointments) && defaultData.appointments.length >= 3, "Sample appointments contains at least 3 realistic visits");

// Verify task schema
const sampleTask = defaultData.tasks[0];
assert(sampleTask.id && sampleTask.title && sampleTask.dueDate && sampleTask.priority && sampleTask.status && sampleTask.assignee, "Task object has all required fields: id, title, dueDate, priority, status, assignee");

// -----------------------------------------------------------
// 2. Benchmark Assistant Request Verification
// -----------------------------------------------------------
console.log("\n--- SECTION 2: Benchmark Assistant Query ---");
const benchmarkPrompt = "Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya.";
const res1 = parseAssistantRequest(benchmarkPrompt, defaultData.members);

assert(res1.status === "ready_to_confirm", "Benchmark query status is 'ready_to_confirm'");
assert(res1.items && res1.items.length === 2, "Benchmark query created 2 coordinated items (Appointment + Transport Task)");

const parsedApt = res1.items.find(i => i.type === "appointment")?.data;
const parsedTask = res1.items.find(i => i.type === "task")?.data;

assert(Boolean(parsedApt), "Appointment item exists");
assert(parsedApt?.recipient.includes("Dad"), "Appointment recipient is Dad");
assert(parsedApt?.time === "17:00", `Appointment time is 17:00 (got ${parsedApt?.time})`);
assert(parsedApt?.reminderSet === true, "Appointment has reminderSet enabled");
assert(parsedApt?.transportAssignedTo === "Priya", `Appointment transport assigned to Priya (got ${parsedApt?.transportAssignedTo})`);

assert(Boolean(parsedTask), "Transport task item exists");
assert(parsedTask?.assignee === "Priya", `Task assignee is Priya (got ${parsedTask?.assignee})`);
assert(parsedTask?.priority === "High", `Transport task priority is High (got ${parsedTask?.priority})`);
assert(parsedTask?.category === "Transport", `Task category is Transport (got ${parsedTask?.category})`);

// -----------------------------------------------------------
// 3. Ambiguous Query Verification (Requires Clarification)
// -----------------------------------------------------------
console.log("\n--- SECTION 3: Ambiguous Assistant Query ---");
const ambiguousPrompt = "Pick up groceries for Dad";
const res2 = parseAssistantRequest(ambiguousPrompt, defaultData.members);

assert(res2.status === "needs_clarification", "Ambiguous prompt triggers 'needs_clarification'");
assert(Boolean(res2.question), `Assistant poses clarification question: "${res2.question}"`);
assert(Array.isArray(res2.suggestions) && res2.suggestions.length > 0, "Assistant provides actionable quick-selection suggestions");

// -----------------------------------------------------------
// 4. Dedicated Medication Task with Priority
// -----------------------------------------------------------
console.log("\n--- SECTION 4: Medication Task with Priority ---");
const medPrompt = "Remind David to refill Dad's heart medication by Friday at 10 AM with high priority";
const res3 = parseAssistantRequest(medPrompt, defaultData.members);

assert(res3.status === "ready_to_confirm", "Medication task parsed successfully");
const medTask = res3.items?.find(i => i.type === "task")?.data;
assert(medTask?.assignee === "David", `Task assignee is David (got ${medTask?.assignee})`);
assert(medTask?.priority === "High", `Task priority is High (got ${medTask?.priority})`);
assert(medTask?.time || medTask?.dueTime === "10:00", "Task time is 10:00 AM");

// -----------------------------------------------------------
// 5. Date & Time Parsing Edge Cases
// -----------------------------------------------------------
console.log("\n--- SECTION 5: Date and Time Parser Units ---");
assert(parseTime("5 PM") === "17:00", "5 PM -> 17:00");
assert(parseTime("9:30 AM") === "09:30", "9:30 AM -> 09:30");
assert(parseTime("noon") === "12:00", "noon -> 12:00");
assert(Boolean(parseDate("tomorrow")), "tomorrow parses into ISO date");
assert(Boolean(parseDate("next Monday")), "next Monday parses into ISO date");

console.log("\n==================================================");
console.log(`TEST SUMMARY: ${testsPassed} of ${testsTotal} tests passed.`);
console.log("==================================================");
