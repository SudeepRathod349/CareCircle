// Local Natural Language Parser for CareCircle Smart Assistant (Alexa+ Simulation)
// Runs entirely on the client without external APIs or cloud dependencies

/**
 * Resolves natural language date references to YYYY-MM-DD
 */
export function parseDate(text) {
  const lower = text.toLowerCase();
  const now = new Date();

  if (lower.includes("tomorrow")) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }

  if (lower.includes("today") || lower.includes("tonight")) {
    return now.toISOString().split("T")[0];
  }

  if (lower.includes("day after tomorrow")) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }

  // Days of week: "next monday", "this friday", "on friday"
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < days.length; i++) {
    const dayName = days[i];
    if (lower.includes(dayName)) {
      const currentDay = now.getDay();
      let diff = i - currentDay;
      if (diff <= 0 || lower.includes(`next ${dayName}`)) {
        diff += 7;
      }
      const d = new Date();
      d.setDate(d.getDate() + diff);
      return d.toISOString().split("T")[0];
    }
  }

  // Explicit date match like 2026-10-25 or Oct 25
  const isoMatch = text.match(/\b(20\d\d[-/]\d{1,2}[-/]\d{1,2})\b/);
  if (isoMatch) {
    return isoMatch[1].replace(/\//g, "-");
  }

  return null;
}

/**
 * Resolves natural language time references to HH:MM (24-hour format)
 */
export function parseTime(text) {
  const lower = text.toLowerCase();

  if (lower.includes("noon")) return "12:00";
  if (lower.includes("midnight")) return "00:00";
  if (lower.includes("morning")) return "09:00";
  if (lower.includes("evening")) return "18:00";
  if (lower.includes("afternoon")) return "14:00";

  // Regex matches: "5 PM", "5:30 pm", "5pm", "17:00", "9:45 AM"
  const time12Match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (time12Match) {
    let hour = parseInt(time12Match[1], 10);
    const minute = time12Match[2] ? time12Match[2].padStart(2, "0") : "00";
    const meridiem = time12Match[3].toLowerCase();

    if (meridiem === "pm" && hour < 12) {
      hour += 12;
    } else if (meridiem === "am" && hour === 12) {
      hour = 0;
    }
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  // 24-hour regex: "17:00"
  const time24Match = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (time24Match) {
    return `${time24Match[1].padStart(2, "0")}:${time24Match[2]}`;
  }

  return null;
}

/**
 * Identifies assignee from the known family members list or context
 */
export function parseAssignee(text, availableMembers = ["Priya", "Sarah", "David", "Alex"]) {
  const lower = text.toLowerCase();

  // Pattern: "assign ... to [name]" or "to [name]"
  for (const member of availableMembers) {
    const memName = typeof member === "string" ? member : member.name;
    const regex = new RegExp(`\\b${memName}\\b`, "i");
    if (regex.test(lower)) {
      return memName;
    }
  }
  return null;
}

/**
 * Identifies priority from text
 */
export function parsePriority(text) {
  const lower = text.toLowerCase();
  if (lower.includes("urgent") || lower.includes("high priority") || lower.includes("critical") || lower.includes("asap")) {
    return "High";
  }
  if (lower.includes("low priority") || lower.includes("when possible")) {
    return "Low";
  }
  return "Medium";
}

/**
 * Main parser entry point
 * Takes input prompt string and known members, returns structured action result
 */
export function parseAssistantRequest(rawInput, availableMembers = ["Priya", "Sarah", "David", "Alex"]) {
  if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
    return {
      status: "error",
      message: "Please enter or speak a caregiving instruction. For example: 'Create a reminder for Dad\'s appointment tomorrow at 5 PM and assign arranging transport to Priya.'"
    };
  }

  const input = rawInput.trim();
  const lower = input.toLowerCase();

  const detectedDate = parseDate(input);
  const detectedTime = parseTime(input);
  const detectedAssignee = parseAssignee(input, availableMembers);
  const detectedPriority = parsePriority(input);

  // Check benchmark dual-intent:
  // "Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya."
  const isAppointmentReminder =
    lower.includes("appointment") ||
    lower.includes("doctor") ||
    lower.includes("checkup") ||
    lower.includes("clinic") ||
    lower.includes("therapy") ||
    lower.includes("hospital");

  const hasTransportAssignment =
    lower.includes("transport") ||
    lower.includes("ride") ||
    lower.includes("drive") ||
    lower.includes("pickup") ||
    lower.includes("pick up");

  const isReminderIntent = lower.includes("reminder") || lower.includes("remind");

  // CASE 1: Dual intent: Appointment + Transport/Task assignment
  if (isAppointmentReminder && (hasTransportAssignment || detectedAssignee)) {
    // Check if key timing details are missing
    if (!detectedDate && !detectedTime) {
      return {
        status: "needs_clarification",
        originalInput: input,
        clarificationType: "timing",
        question: "I see you'd like to schedule Dad's appointment, but what date and time is it for?",
        suggestions: ["Tomorrow at 5:00 PM", "Friday at 10:00 AM", "Next Monday at 2:00 PM"],
        partialData: {
          assignee: detectedAssignee || "Priya",
          hasTransport: hasTransportAssignment
        }
      };
    }

    const aptDate = detectedDate || new Date().toISOString().split("T")[0];
    const aptTime = detectedTime || "17:00";
    const assignee = detectedAssignee || "Priya";

    // Clean appointment title
    let aptTitle = "Dad's Medical Appointment";
    if (lower.includes("cardiology")) aptTitle = "Dad's Cardiology Appointment";
    else if (lower.includes("therapy")) aptTitle = "Dad's Physical Therapy Appointment";
    else if (lower.includes("checkup")) aptTitle = "Dad's Health Checkup";

    // Calculate prep/transport task time (1 hour prior to appointment)
    let transportTime = "16:00";
    if (aptTime) {
      const [h, m] = aptTime.split(":").map(Number);
      const prepHour = Math.max(0, h - 1);
      transportTime = `${String(prepHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    const proposedAppointment = {
      id: `apt-${Date.now()}`,
      title: aptTitle,
      recipient: "Dad (Robert Jenkins)",
      doctor: "Dr. Robert Henderson",
      date: aptDate,
      time: aptTime,
      location: "St. Jude Medical Pavilion",
      notes: "Follow-up consultation. Transport coordinated within CareCircle.",
      reminderSet: true,
      reminderNotice: "1 day before & 2 hours before",
      transportAssignedTo: assignee,
      status: "Upcoming"
    };

    const proposedTask = {
      id: `task-${Date.now() + 1}`,
      title: `Arrange transport for ${aptTitle}`,
      description: `Coordinate accessible ride and accompany Dad for appointment on ${aptDate} at ${aptTime}.`,
      dueDate: aptDate,
      dueTime: transportTime,
      priority: "High",
      status: "Pending",
      assignee: assignee,
      category: "Transport"
    };

    return {
      status: "ready_to_confirm",
      originalInput: input,
      summary: `I've prepared a calendar appointment for Dad with reminders, plus a coordinated transport task assigned to ${assignee}.`,
      items: [
        { type: "appointment", data: proposedAppointment },
        { type: "task", data: proposedTask }
      ],
      alexaVoiceSpeech: `I've prepared a reminder for Dad's appointment on ${aptDate} at ${aptTime}, and assigned arranging transport to ${assignee}. Please confirm to save this to your CareCircle.`
    };
  }

  // CASE 2: Appointment only without explicit transport task
  if (isAppointmentReminder) {
    if (!detectedDate && !detectedTime) {
      return {
        status: "needs_clarification",
        originalInput: input,
        clarificationType: "timing",
        question: "When is this appointment scheduled? Please specify the date and time.",
        suggestions: ["Tomorrow at 5:00 PM", "Friday at 11:00 AM", "Next Tuesday at 3:30 PM"],
        partialData: {}
      };
    }

    const aptDate = detectedDate || new Date().toISOString().split("T")[0];
    const aptTime = detectedTime || "10:00";

    const proposedAppointment = {
      id: `apt-${Date.now()}`,
      title: "Dad's Healthcare Appointment",
      recipient: "Dad (Robert Jenkins)",
      doctor: "Primary Care Clinic",
      date: aptDate,
      time: aptTime,
      location: "Local Medical Office",
      notes: "Created via CareCircle assistant.",
      reminderSet: true,
      reminderNotice: "2 hours before",
      transportAssignedTo: detectedAssignee || "Family Caregiver",
      status: "Upcoming"
    };

    return {
      status: "ready_to_confirm",
      originalInput: input,
      summary: `I've set up an appointment and reminder for Dad on ${aptDate} at ${aptTime}.`,
      items: [{ type: "appointment", data: proposedAppointment }],
      alexaVoiceSpeech: `I prepared an appointment for Dad on ${aptDate} at ${aptTime}. Would you like me to save it?`
    };
  }

  // CASE 3: General Care Task or Reminder
  if (isReminderIntent || lower.includes("task") || lower.includes("pick up") || lower.includes("refill") || lower.includes("buy") || lower.includes("prep")) {
    // Check if both date and assignee are missing
    if (!detectedDate && !detectedAssignee) {
      return {
        status: "needs_clarification",
        originalInput: input,
        clarificationType: "assignee_and_time",
        question: "Who in the family should handle this task, and when is it due?",
        suggestions: ["Assign to Priya for Tomorrow", "Assign to David for Today", "Assign to Sarah for Friday"],
        partialData: {
          tentativeTitle: input
        }
      };
    }

    // If only date is missing
    if (!detectedDate) {
      return {
        status: "needs_clarification",
        originalInput: input,
        clarificationType: "date_missing",
        question: `When should ${detectedAssignee || "the caregiver"} complete this?`,
        suggestions: ["Today at 5:00 PM", "Tomorrow at 10:00 AM", "This Friday"],
        partialData: {
          assignee: detectedAssignee
        }
      };
    }

    const taskDate = detectedDate;
    const taskTime = detectedTime || "12:00";
    const assignee = detectedAssignee || "Priya";

    // Clean up title
    let taskTitle = input
      .replace(/create a (reminder|task) (for|to)/i, "")
      .replace(/remind \w+ to/i, "")
      .replace(/by \w+ at \w+(?:\s*(am|pm))?/i, "")
      .replace(/with (high|low|medium) priority/i, "")
      .trim();
    if (taskTitle.length < 3) taskTitle = input;
    // Capitalize first letter
    taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

    const proposedTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: `Task logged via CareCircle Assistant: "${input}".`,
      dueDate: taskDate,
      dueTime: taskTime,
      priority: detectedPriority,
      status: "Pending",
      assignee: assignee,
      category: lower.includes("medication") || lower.includes("refill") ? "Medical" : "Home Care"
    };

    return {
      status: "ready_to_confirm",
      originalInput: input,
      summary: `I've prepared a new task "${taskTitle}" assigned to ${assignee} due ${taskDate} at ${taskTime}.`,
      items: [{ type: "task", data: proposedTask }],
      alexaVoiceSpeech: `I've created a task for ${assignee} due on ${taskDate} with ${detectedPriority} priority. Please confirm to save.`
    };
  }

  // Fallback for vague inputs
  return {
    status: "needs_clarification",
    originalInput: input,
    clarificationType: "general",
    question: "I couldn't quite determine if this is an appointment or a care task. Could you specify details like date, time, and assignee?",
    suggestions: [
      "Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya.",
      "Remind David to refill Dad's heart medication by Friday at 10 AM",
      "Schedule physical therapy session for Dad next Monday at 2 PM"
    ]
  };
}
