// Initial seed data for CareCircle demo
// Scenario: Robert "Dad" Jenkins (74) recovering from hip replacement surgery

export const INITIAL_CARE_RECIPIENT = {
  name: "Robert 'Dad' Jenkins",
  age: 74,
  condition: "Post-op Hip Replacement & Mild Hypertension",
  primaryPhysician: "Dr. Robert Henderson (Cardiology / General)",
  preferredHospital: "St. Jude Medical Pavilion",
  emergencyContact: "Priya Jenkins (+1 555-019-2834)",
  allergies: "Penicillin, Sulfa drugs",
  bloodType: "O+"
};

export const INITIAL_MEMBERS = [
  {
    id: "mem-1",
    name: "Priya",
    fullName: "Priya Jenkins",
    role: "Primary Care Coordinator",
    relation: "Daughter-in-law",
    phone: "+1 (555) 019-2834",
    email: "priya.jenkins@example.com",
    avatarBg: "#0d9488", // Teal
    initials: "PJ",
    isPrimary: true
  },
  {
    id: "mem-2",
    name: "Sarah",
    fullName: "Sarah Jenkins-Miller",
    role: "Medication & Clinical Care",
    relation: "Daughter",
    phone: "+1 (555) 014-9921",
    email: "sarah.m@example.com",
    avatarBg: "#8b5cf6", // Purple
    initials: "SJ",
    isPrimary: false
  },
  {
    id: "mem-3",
    name: "David",
    fullName: "David Jenkins",
    role: "Transport & Errands",
    relation: "Son",
    phone: "+1 (555) 018-7743",
    email: "david.j@example.com",
    avatarBg: "#f59e0b", // Amber
    initials: "DJ",
    isPrimary: false
  },
  {
    id: "mem-4",
    name: "Alex",
    fullName: "Alex Jenkins",
    role: "Tech & Companionship",
    relation: "Grandson",
    phone: "+1 (555) 016-3352",
    email: "alex.j@example.com",
    avatarBg: "#3b82f6", // Blue
    initials: "AJ",
    isPrimary: false
  }
];

// Helper to calculate relative date string YYYY-MM-DD
export function getRelativeDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export function getSampleTasks() {
  const today = getRelativeDateString(0);
  const tomorrow = getRelativeDateString(1);
  const dayAfterTomorrow = getRelativeDateString(2);
  const inThreeDays = getRelativeDateString(3);

  return [
    {
      id: "task-101",
      title: "Confirm wheelchair transport for cardiology checkup",
      description: "Call MediRide to verify accessible van pickup for Dad's 5 PM appointment tomorrow.",
      dueDate: tomorrow,
      dueTime: "11:00",
      priority: "High",
      status: "In Progress",
      assignee: "Priya",
      category: "Transport",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "task-102",
      title: "Pick up Lisinopril & Calcium supplements refill",
      description: "Pick up 30-day prescription refill from CVS on Main St. Prescription #488219.",
      dueDate: today,
      dueTime: "17:30",
      priority: "High",
      status: "Pending",
      assignee: "David",
      category: "Medical",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: "task-103",
      title: "Log morning blood pressure & pulse readings",
      description: "Check Dad's resting BP using the Omron monitor before breakfast. Target < 130/80.",
      dueDate: today,
      dueTime: "08:30",
      priority: "Medium",
      status: "Completed",
      assignee: "Sarah",
      category: "Medical",
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: "task-104",
      title: "Prep low-sodium meal boxes for the weekend",
      description: "Batch cook baked salmon, steamed vegetables, and brown rice portions for Dad's fridge.",
      dueDate: inThreeDays,
      dueTime: "14:00",
      priority: "Medium",
      status: "Pending",
      assignee: "Priya",
      category: "Nutrition",
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: "task-105",
      title: "Setup Amazon Echo Show in Dad's living room",
      description: "Connect to Wi-Fi, test photo sharing, and set up quick one-touch video calls with family.",
      dueDate: dayAfterTomorrow,
      dueTime: "16:00",
      priority: "Low",
      status: "Pending",
      assignee: "Alex",
      category: "Home Care",
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 30).toISOString()
    }
  ];
}

export function getSampleAppointments() {
  const tomorrow = getRelativeDateString(1);
  const inThreeDays = getRelativeDateString(3);
  const nextWeek = getRelativeDateString(7);

  return [
    {
      id: "apt-201",
      title: "Cardiology Follow-Up & ECG",
      recipient: "Dad (Robert Jenkins)",
      doctor: "Dr. Robert Henderson",
      date: tomorrow,
      time: "17:00",
      location: "St. Jude Medical Pavilion, Suite 402",
      notes: "Review post-surgery blood pressure regimen and ECG. Bring recent BP monitor logs.",
      reminderSet: true,
      reminderNotice: "1 day before & 2 hours before",
      transportAssignedTo: "Priya",
      status: "Upcoming",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: "apt-202",
      title: "Physical Therapy & Hip Mobility Session",
      recipient: "Dad (Robert Jenkins)",
      doctor: "Sarah Miller, DPT",
      date: inThreeDays,
      time: "10:30",
      location: "Metro Rehab & Wellness Center",
      notes: "Week 4 mobility assessment. Wear comfortable athletic trousers and walking shoes.",
      reminderSet: true,
      reminderNotice: "2 hours before",
      transportAssignedTo: "David",
      status: "Upcoming",
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
    },
    {
      id: "apt-203",
      title: "At-Home Nurse Wellness Check",
      recipient: "Dad (Robert Jenkins)",
      doctor: "Nurse Elena (VNA Home Care)",
      date: nextWeek,
      time: "14:00",
      location: "Dad's Home (Residence)",
      notes: "Incision healing check, vital signs, and medication reconciliation.",
      reminderSet: true,
      reminderNotice: "1 day before",
      transportAssignedTo: "Not Needed (At Home)",
      status: "Upcoming",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
}
