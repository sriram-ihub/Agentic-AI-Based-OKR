# Agentic AI-Based OKR Action Tracker & Reminder System

## Objective

Develop an AI-driven feature for an OKR platform that enhances student engagement by parsing high-level OKRs, generating micro-tasks, sending intelligent reminders, tracking completion status, and updating progress in MongoDB.

---

## Project Scope

- Full-stack feature integrated into an existing OKR platform.
- Multi-agent architecture for OKR parsing, task generation, reminders, tracking, and database updates.
- Scalable, seamless user experience with dashboard and email notifications.

---

## Architecture Overview

### Agentic AI Workflow

1. **OKR Parser Agent (RAG)**
   - Reads and interprets high-level OKRs entered by users.
   - Extracts objectives, deliverables, and timelines using Retrieval-Augmented Generation (RAG) for context.
   - **Input:** User-submitted OKR text (e.g., "Publish 3 articles on AI by Q4")
   - **Output:** Structured JSON with objectives, deliverables, and deadlines

2. **Micro-Task Generator Agent**
   - Breaks down OKRs into actionable micro-tasks based on the objective and timeline.
   - **Input:** Parsed OKR JSON
   - **Output:** List of micro-tasks with deadlines and priorities

3. **Reminder Agent (RAG)**
   - Sends intelligent reminders via dashboard or email based on task deadlines and user activity patterns.
   - Personalizes reminders using RAG and user context.
   - **Input:** Micro-task list + user activity data
   - **Output:** Scheduled reminders (dashboard notifications or emails)

4. **Task Tracker Agent**
   - Tracks task completion status using user input or external evidence (e.g., GitHub push, LinkedIn post).
   - **Input:** Micro-task list + user input/external evidence URLs
   - **Output:** Task completion status (completed/pending)

5. **Database Updater Agent**
   - Auto-updates MongoDB records with task completion status, OKR progress, and reminder logs.
   - **Input:** Task completion status + reminder logs
   - **Output:** Updated MongoDB records

---

## Layer Responsibilities

| Layer      | Responsibility                                                                 |
|------------|-------------------------------------------------------------------------------|
| Frontend   | UI for OKR submission, task tracking, and reminder display. Dashboard for progress visualization and manual task confirmation. |
| Backend    | API for OKR parsing, agent triggers, and MongoDB integration. Orchestrates agent communication. |
| Database   | MongoDB to store OKR data, task status, progress, and reminder logs.           |
| AI Agents  | Integrates agents using LangChain/Autogen/CrewAI with RAG for context-aware processing. |

---

## Directory Structure

```
.
├── agents/
│   └── okr_parser_agent/
│       ├── app/
│       │   ├── main.py
│       │   ├── parser_agent.py
│       │   ├── micro_task_generator.py
│       │   ├── reminder_agent.py
│       │   ├── vector_store.py
│       │   ├── sample_okrs.txt
│       └── requirements.txt
├── client/
│   └── src/
│       └── pages/
│           ├── okr-submission.tsx
│           ├── dashboard.tsx
│           └── task-completion.tsx
├── server/
│   ├── index.ts
│   ├── routes.ts
│   └── storage.ts
├── shared/
│   └── schema.ts
└── package.json
```

---

## Setup & Installation

### Backend (Node/Express + TypeScript)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend:**
   ```bash
   npm run dev
   ```

### Frontend (React + Vite)

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Start the frontend:**
   ```bash
   npm start
   ```

### Agents (Python, LangChain, Gemini/OpenAI)

1. **Install Python dependencies:**
   ```bash
   cd agents/okr_parser_agent
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   - Create a `.env` file with your API keys:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```

3. **Start the agent server:**
   ```bash
   cd app
   uvicorn main:app --reload --port 8000
   ```

---

## Agent Details

### OKR Parser Agent

- **File:** `parser_agent.py`
- **Tech:** LangChain, RAG, FAISS, OpenAI/Gemini
- **Function:** Extracts objectives, deliverables, and timelines from user OKR input.
- **RAG Source:** `sample_okrs.txt`

### Micro-Task Generator Agent

- **File:** `micro_task_generator.py`
- **Tech:** LangChain, Gemini
- **Function:** Breaks parsed OKRs into actionable micro-tasks with deadlines and priorities.

### Reminder Agent

- **File:** `reminder_agent.py`
- **Tech:** LangChain, Gemini, FAISS, RAG
- **Function:** Sends personalized reminders via dashboard or email, using user context and task deadlines.

---

## Sample Flow

1. **Submit OKR (Frontend)**
2. **OKR Parser Agent → Structured Data**
3. **Micro-Task Generator Agent → Task List**
4. **Reminder Agent → Send Notifications**
5. **Task Tracker Agent → Verify Completion**
6. **Database Updater Agent → Update MongoDB**
7. **UI: Display Progress and Reminders**

---

## Testing

- Test with sample OKRs (e.g., article publishing, coding challenges).
- Validate task generation, reminder delivery, and progress tracking accuracy.

---

## Technologies Used

- **Frontend:** React, Vite, TailwindCSS, Framer Motion
- **Backend:** Express, TypeScript, Drizzle ORM
- **Database:** MongoDB (for OKRs, tasks, reminders)
- **AI/Agents:** LangChain, Gemini, FAISS, RAG, FastAPI (Python microservices)
- **Other:** Email and dashboard notification utilities

---

## Example OKR Input

```
Publish 3 articles on AI by Q4
```

## Example Output (Parsed JSON)

```json
{
  "objective": "Publish AI-related content",
  "deliverables": ["Write 3 AI articles", "Publish on Medium"],
  "timeline": "Q4 2025"
}
```

---

## Example Micro-Tasks Output

```json
[
  {
    "description": "Write 500 words for article 1",
    "deadline": "2025-07-01",
    "priority": "High"
  }
]
```

---

## Example Reminder Output

- Dashboard notification or email sent 24 hours before task deadline, personalized using user history.

---

## License

MIT

---

**This project provides a robust, scalable, and intelligent OKR action tracking and reminder system, leveraging the latest in AI agentic workflows and modern web technologies.**
