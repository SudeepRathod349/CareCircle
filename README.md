# CareCircle 💖
### Family Caregiving Coordination Web Application

CareCircle is a family caregiving coordination web application that empowers families to share caregiving responsibilities for aging parents or recovering relatives. It turns complex, fragmented caregiving routines—medication pickups, doctor consultations, physical therapy transport, and nutrition prep—into transparent, synchronized family actions.

---

## 🌟 Key Features

1. **Responsive Caregiving Dashboard**
   - High-level care recipient snapshot (e.g. Robert "Dad" Jenkins, 74, post-op hip recovery).
   - Vitals and emergency info: Primary physician, preferred hospital, emergency contacts, blood type, and known allergies.
   - Live stat cards: Urgent/High Priority tasks, pending tasks count, upcoming visits, and active family caregivers.
   - Quick action shortcuts and an audit feed of recent circle activities.

2. **Care Task Management (Full CRUD)**
   - **Create, View, Edit, Complete, and Delete Tasks**.
   - Attributes: Title, instructions/notes, due date, due time, priority (High, Medium, Low), status (Pending, In Progress, Completed), assignee, and category (Medical, Transport, Nutrition, Home Care, Administrative).
   - Quick one-click checkbox completion directly from the list or dashboard.
   - Deletion safety with accessible confirmation dialogs.

3. **Medical Appointments & Reminders**
   - Calendar schedule tracking doctor consultations, ECG follow-ups, and physical therapy sessions.
   - Detailed fields: Doctor/specialist, location/clinic address, care recipient, appointment time, and medical instructions.
   - Coordinated transport badge: Assigns transport duty to a family member (e.g., Priya or David).
   - Voice and calendar reminder schedules (e.g. "1 day before & 2 hours before").

4. **Alexa+ / Smart Voice Assistant Simulation (Interactive Prototype)**
   - Conversational natural language interface demonstrating hands-free voice coordination.
   - **Local NLP Parser**: Analyzes complex dual-intent requests completely in-browser without paid APIs or external cloud credentials.
   - **Benchmark Demo Request**:
     > *"Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya."*
     - Extracts the medical appointment (Date: Tomorrow, Time: 17:00, Recipient: Dad, Transport: Priya).
     - Generates the linked coordination task (*"Arrange transport for Dad's Medical Appointment"*, assigned to Priya with High Priority).
     - Displays structured preview cards and **asks for user confirmation** before saving to state.
   - **Ambiguity Clarification**: When details are missing (e.g., *"Pick up groceries for Dad"*), the assistant prompts clarifying questions and offers one-click suggestion chips.
   - **Simulated Voice Speech**: Uses the browser's native Web Speech synthesis API (local and offline) with an Audio ON/OFF toggle switch.

5. **Search, Filter & Sort**
   - Instant text search across titles, descriptions, and assignees.
   - Multi-facet filters: Filter by task status, priority level, family assignee, or category.
   - Sort by Due Date, Priority Level, or Alphabetical Title.

6. **Family Circle Directory**
   - Visual profiles for caregivers (Priya, Sarah, David, Alex).
   - Roles, relations, phone numbers, emails, and active assigned task counts.
   - "+ Add Caregiver" modal to invite new family members, neighbors, or visiting nurses.

7. **Persistence & Reset Demo Data**
   - All state changes are persisted locally in `localStorage`.
   - **"Reset Demo"** button resets all tasks, appointments, and caregivers back to the realistic default scenario for easy demonstration and testing.

---

## 🔒 Voice Assistant Simulation Notice

> **IMPORTANT SIMULATION NOTICE:**  
> The Alexa+ / Voice Assistant functionality in this web application is an **interactive local simulation** demonstrating voice-driven caregiving workflows:  
> - It runs **100% locally** using rule-based Natural Language Processing in JavaScript and the browser's built-in Web Speech API.  
> - It does **not** connect to real Alexa+ hardware, Amazon developer accounts, Alexa Skills Kit cloud endpoints, or external cloud LLM APIs.  
> - It requires no API keys, no paid subscriptions, and no backend server to run.

---

## 🚀 Getting Started (Beginner-Friendly Setup)

### Prerequisites
- **Node.js** (v20 LTS or v24 LTS)
- **npm** (v10 or v11+)

### 1. Install Dependencies
Open your terminal or command prompt in the `CareCircle` folder and run:
```bash
npm install
```

### 2. Run the Development Server
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

### 3. Run Automated Tests
Verify all core features, storage schemas, and the benchmark NLP parser:
```bash
npm test
```
*(All 28 unit and integration tests will execute and report live pass/fail results).*

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
The compiled assets will be generated in the `dist/` directory.

---

## 🧪 Step-by-Step Demo Walkthrough

### Test Case 1: Benchmark Voice Assistant Request
1. Click the **Alexa+ Simulator** tab in the navigation header.
2. Click the preset chip:  
   `⭐ Benchmark: Dad's Appointment & Transport to Priya`  
   *(or type: "Create a reminder for Dad's appointment tomorrow at 5 PM and assign arranging transport to Priya.")*
3. Click **Process Voice Request**.
4. Observe the **Proposed Care Actions**:
   - Item 1: Calendar Appointment for Dad at 5:00 PM with transport assigned to Priya.
   - Item 2: Coordinated Care Task assigned to Priya with High Priority.
5. Click **"Confirm & Add to CareCircle"**.
6. Switch to the **Tasks** tab to see Priya's new transport task.
7. Switch to the **Appointments** tab to see Dad's new 5:00 PM appointment.

### Test Case 2: Ambiguity Clarification
1. In the **Alexa+ Simulator** tab, click:  
   `❓ Ambiguous Test (Triggers Clarification)`  
   *(or type: "Pick up groceries for Dad")*
2. Click **Process Voice Request**.
3. Notice that the assistant detects missing timing and assignee details:  
   *Question: "Who in the family should handle this task, and when is it due?"*
4. Click one of the quick resolution options (e.g. *"Assign to David for Today"*).
5. The assistant refines the prompt and presents the confirmed proposal.

### Test Case 3: Task Management & Filtering
1. Go to the **Tasks** tab.
2. Type `Lisinopril` into the search box to find medication refill tasks.
3. Check the circle icon on any task to mark it **Completed**.
4. Click **New Task** to add a custom task.
5. Filter by **Assignee: David** or **Priority: High**.

### Test Case 4: Reset Demo
1. Click **Reset Demo** in the top-right header at any time.
2. Confirm the prompt to restore all original sample data.

---

## 📁 Project Structure

```
CareCircle/
├── index.html                   # HTML entry point with accessible tags & meta
├── package.json                 # Project dependencies and scripts
├── vite.config.js               # Vite configuration (port 5173)
├── verify-app.mjs               # Automated test suite (28 test cases)
├── src/
│   ├── main.jsx                 # Application root mount
│   ├── App.jsx                  # Main application state & modal manager
│   ├── index.css                # Accessible design system & responsive styling
│   ├── components/
│   │   ├── Navbar.jsx           # Top navigation with live count badges
│   │   ├── Dashboard.jsx        # Caregiver overview, vitals, summary stats
│   │   ├── TaskList.jsx         # Task management, search, filters, CRUD
│   │   ├── TaskModal.jsx        # Accessible dialog for creating/editing tasks
│   │   ├── AppointmentList.jsx  # Appointments & reminders schedule
│   │   ├── AppointmentModal.jsx # Appointment creation/edit modal
│   │   ├── FamilyCircle.jsx     # Caregiver directory & member additions
│   │   ├── AlexaAssistant.jsx   # Conversational simulator & confirmation cards
│   │   ├── ConfirmDialog.jsx    # Accessible modal for deletion and resets
│   │   └── NotificationToast.jsx# Action feedback toasts
│   └── services/
│       ├── storage.js           # LocalStorage persistence & reset handling
│       ├── sampleData.js        # Realistic caregiving seed data
│       └── nlpParser.js         # Local rule-based NLP parser & ambiguity resolver
```

---

## ♿ Accessibility & Quality Standards
- **Keyboard Friendly**: Modals support Escape-to-close, focus traps, and logical tab sequences.
- **High Contrast Focus**: Global `:focus-visible` styling for interactive controls.
- **Zero Fake Success**: All create/edit/delete actions modify real state and localStorage.
- **Error Validation**: Clear inline error messages on required form fields.
- **Zero External Secrets**: No hardcoded API keys or cloud credential exposures.

---

## ⚖️ License
MIT License.
