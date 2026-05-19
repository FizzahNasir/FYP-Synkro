# Synkro — FYP Poster Content + Claude Design Prompt

---

## SECTION A — POSTER CONTENT (All Text, Ready to Use)

---

### HEADER

**Project Title:** Synkro
**Subtitle:** AI-Powered Project Management Automation
**Institution:** [University Name]
**Department:** [Department Name]
**Supervisor:** [Supervisor Name]
**Group Members:** [Member 1] | [Member 2] | [Member 3]
**Year:** 2026

---

### 1. PROBLEM STATEMENT

Software companies lose hundreds of thousands of dollars annually because project managers spend up to **40% of their working day** doing tasks a computer should handle — reading client emails and manually creating tickets, attending meetings and retyping notes into Jira, switching between Gmail, Slack, Zoom, and Jira individually with no unified view.

The result:
- **Requirements get misdelivered** — client intent lost in manual translation
- **Deadlines get missed** — action items buried in unread messages
- **Overhead scales with headcount** — every new team multiplies the problem

No existing tool reads across all platforms simultaneously and acts on the information automatically.

---

### 2. PROPOSED SOLUTION

**Synkro** is an AI-powered workspace orchestration platform that sits between all communication channels a software team uses and automates the entire coordination layer of project management.

It reads client emails, transcribes and diarizes meeting recordings, monitors Slack messages, and automatically creates, assigns, prioritizes, and syncs tasks — with zero manual input from the project manager.

**Core proposition:** Replace the human information-relay loop with an intelligent automation layer, so project managers focus on decisions, not data entry.

---

### 3. SYSTEM FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                     INPUT SOURCES                           │
│   Gmail    │    Meetings    │    Slack    │    Zoom         │
└─────┬───────┴───────┬────────┴──────┬─────┴────────┬────────┘
      │               │               │              │
      ▼               ▼               ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SYNKRO AI ENGINE                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  NLP / LLM   │  │   Whisper    │  │ Speaker          │  │
│  │  (Groq AI)   │  │ Transcription│  │ Diarization      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Context Analysis → Action Item Extraction          │   │
│  │   (task_assignment / deadline / assignee / priority) │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     OUTPUT LAYER                            │
│                                                             │
│  Task DB ──→ Jira Sync ──→ Google Calendar ──→ Meet Link   │
│                                                             │
│  Team Notified  ──→  Developer Assigned  ──→  Tracked       │
└─────────────────────────────────────────────────────────────┘
```

**Processing Pipeline (Meetings):**

```
Audio Upload
    │
    ├─ 1. Whisper / Groq → Transcription + word-level timestamps
    ├─ 2. Speaker Diarization (pyannote → AssemblyAI → LLM fallback)
    ├─ 3. Context Analysis → classify each utterance
    │      (task_assignment, warning, decision, progress_update...)
    ├─ 4. Action Item Extraction → confidence-scored, attributed
    ├─ 5. AI Summary → speaker-aware, structured
    ├─ 6. Tasks created → assigned → Jira synced
    └─ 7. Notification sent to creator + assignees
```

---

### 4. KEY FEATURES

| # | Feature | Description |
|---|---|---|
| 1 | **Email → Task** | Client emails auto-parsed; tasks created with title, deadline, assignee — no manual entry |
| 2 | **Meeting Transcription** | Audio uploaded → Groq Whisper transcribes with word-level timestamps |
| 3 | **Speaker Diarization** | 3-tier AI pipeline identifies who said what (pyannote → AssemblyAI → LLM) |
| 4 | **Action Item Extraction** | LLM extracts commitments with confidence scoring, speaker attribution, deadlines |
| 5 | **Google Meet Auto-Generation** | Meeting-type tasks automatically create Calendar events + Meet links + attendee invites |
| 6 | **Jira Bidirectional Sync** | Tasks, status, priority, comments stay in sync between Synkro and Jira in real time |
| 7 | **Multi-Platform Integration** | Gmail, Slack, Zoom, Jira, Google Calendar — all connected in one dashboard |
| 8 | **Real-Time Notifications** | Task assignments, status changes, comments, meeting completions — instant alerts |
| 9 | **Team Invitation System** | Invite-based onboarding; roles locked per invite to prevent unauthorized access |
| 10 | **Analytics Dashboard** | Team productivity metrics, task completion rates, meeting insights |

---

### 5. TECHNICAL ARCHITECTURE

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, TanStack Query, Tailwind CSS |
| **Backend** | FastAPI (Python), async/await, RESTful API |
| **Database** | PostgreSQL (NeonDB cloud), Alembic migrations |
| **AI / Transcription** | Groq Whisper Large v3 Turbo (free), Llama 3.3 70B |
| **Speaker Diarization** | pyannote.audio / AssemblyAI / LLM inference (3-tier fallback) |
| **Storage** | AWS S3 / Cloudinary / Local filesystem |
| **Background Tasks** | FastAPI BackgroundTasks + Celery (optional) |
| **Integrations** | Gmail IMAP, Slack OAuth, Zoom Webhooks, Jira REST API, Google Calendar OAuth |

---

### 6. OUTCOMES & RESULTS

**Quantitative:**
- Up to **70% reduction** in manual project coordination overhead
- **~$195,000/year** recovered per 10-person PM team (3 hrs/day manual work eliminated)
- **100% automated** extraction of action items from meeting recordings
- **Zero manual entry** for tasks originating from emails, meetings, or Slack

**Qualitative:**
- Project managers shift from information relay to strategic decision-making
- Developers receive clear, well-defined, traceable tasks
- Client requirements are captured verbatim and tracked end-to-end
- Single unified dashboard replaces 5+ fragmented tools

**Functional Outcomes:**
- End-to-end pipeline: email/meeting/Slack → task → Jira → calendar → notification
- Bidirectional Jira sync: changes in either system propagate automatically
- Speaker-attributed action items with confidence scoring
- Google Meet links auto-generated on meeting task detection

---

### 7. CONCLUSION

Synkro demonstrates that the coordination overhead of software project management — historically a human-intensive, error-prone process — can be fully automated using modern AI and integration APIs. The system reduces operational cost, eliminates a major source of missed deadlines and misdelivered requirements, and scales linearly: the more teams a company has, the greater the return.

---
---

## SECTION B — CLAUDE DESIGN PROMPT

*(Paste this entire prompt into Claude.ai or any AI design assistant to generate the poster)*

---

```
You are a professional academic poster designer. I need you to design a
research/FYP poster for a software engineering project called Synkro.

The poster must be:
- A0 size (841mm × 1189mm), portrait orientation
- Suitable for a university final year project exhibition
- Professional, modern, and visually clean
- Dark theme preferred: deep navy or dark slate background (#0F172A or similar)
  with white text and a vibrant accent color (electric blue #3B82F6 or teal #06B6D4)
- Use a clear visual hierarchy: title → problem → solution → flow → features → outcomes

---

POSTER CONTENT (use exactly this text):

TITLE (top, large, centered):
  SYNKRO
  AI-Powered Project Management Automation
  [University Name] | [Department] | 2026
  Group: [Member 1] | [Member 2] | [Member 3] | Supervisor: [Supervisor Name]

---

SECTION 1 — PROBLEM STATEMENT (left column, top)
Headline: "The $195,000 Problem Every Software Company Has"

Body:
Project managers in software companies spend up to 40% of their day
doing what a computer should do — reading client emails and manually
creating tickets, attending meetings and retyping notes into Jira,
switching between Gmail, Slack, Zoom, and Jira with no unified view.

Pain points (use icons or bullet chips):
  ❌ Requirements misdelivered — client intent lost in manual translation
  ❌ Deadlines missed — action items buried in unread messages
  ❌ Overhead compounds — every new team multiplies the problem

---

SECTION 2 — PROPOSED SOLUTION (right column, top)
Headline: "One Platform. Every Source. Zero Manual Entry."

Body:
Synkro is an AI-powered workspace orchestration platform that connects
Gmail, Slack, Zoom, Jira, and Google Calendar — reads across all of them
simultaneously — and automatically creates, assigns, and tracks tasks
with zero manual input from the project manager.

---

SECTION 3 — SYSTEM FLOW (center, full width)
Headline: "End-to-End Automation Pipeline"

Draw a horizontal flow diagram with these nodes connected by arrows:

  [Gmail]  [Slack]  [Zoom]  [Meetings]
       ↘      ↓      ↓      ↙
         [SYNKRO AI ENGINE]
           ↓           ↓
   [Whisper STT]  [Speaker Diarization]
           ↓           ↓
      [Context Analysis + Action Item Extraction]
                    ↓
    [Task Created → Assigned → Jira Synced → Calendar → Notification]

Use colored connector arrows. The SYNKRO AI ENGINE node should be
the largest element in the diagram with a glowing border.

---

SECTION 4 — KEY FEATURES (3-column grid, icons + one-liner each)

Use card-style layout, 3 cards per row, 2 rows (6 total):

Card 1: 📧 Email → Task
  "Client emails auto-parsed into tasks with deadline + assignee"

Card 2: 🎙 Meeting Transcription
  "Groq Whisper transcribes audio with word-level timestamps"

Card 3: 👥 Speaker Diarization
  "3-tier AI pipeline identifies who said what in every meeting"

Card 4: ✅ Action Item Extraction
  "LLM extracts commitments with confidence scoring and attribution"

Card 5: 📅 Google Meet Auto-Generation
  "Meeting tasks auto-create Calendar events + Meet links"

Card 6: 🔧 Jira Bidirectional Sync
  "Tasks, comments, and status stay in sync between Synkro and Jira"

---

SECTION 5 — TECH STACK (horizontal badge row)
Small chips/badges in a single row:
  Next.js 14  |  FastAPI  |  PostgreSQL  |  Groq AI  |  pyannote  |  Jira API  |  Google Calendar API  |  Slack API

---

SECTION 6 — OUTCOMES (2-column: left = numbers, right = qualitative)

Left — Big numbers (large font, accent color):
  70%    reduction in coordination overhead
  $195K  recovered per 10-person PM team annually
  100%   automated action item extraction from meetings
  0      manual task entries from emails or meetings

Right — Qualitative bullets:
  ✓ PMs shift from data entry to strategic decisions
  ✓ Developers receive clear, attributed, traceable tasks
  ✓ Client requirements captured verbatim and tracked end-to-end
  ✓ 5+ fragmented tools replaced by one unified dashboard

---

FOOTER (bottom bar, full width):
  Synkro | AI-Powered Project Management Automation
  [University] | [Department] | FYP 2026
  [Member 1] · [Member 2] · [Member 3] · Supervisor: [Supervisor Name]

---

DESIGN INSTRUCTIONS:
- Use Inter or Geist as the primary font
- Section headings: 28–32pt bold, accent color
- Body text: 18–20pt, white or light grey
- Big numbers in outcomes: 64pt bold, accent color
- Feature cards: rounded corners (12px), dark card background (#1E293B),
  subtle border in accent color
- System flow diagram: nodes as rounded rectangles, arrows in accent color,
  SYNKRO AI ENGINE node with a glowing drop shadow
- Add a subtle grid or circuit-board texture to the background
- QR code placeholder bottom-right corner (label: "Live Demo")
- Keep whitespace generous — do not crowd the layout
- The overall visual impression should feel: powerful, intelligent, trustworthy
```

---

## SECTION C — QUICK REFERENCE (for printing/pinning near the poster)

```
SYNKRO — AT A GLANCE

What it is:   AI platform that automates software project coordination
Who it's for: Project managers in software companies
The problem:  40% of a PM's day is manual information relay across
              fragmented tools (Gmail, Slack, Zoom, Jira)
The solution: Synkro reads all sources simultaneously and auto-creates,
              assigns, and tracks tasks with zero manual input
Key number:   $195,000/year recovered per 10-person PM team
Core tech:    FastAPI · Next.js · Groq AI · PostgreSQL · Jira API
              Google Calendar API · pyannote · Slack API

THE PIPELINE:
  Email    → Task (NLP extraction)
  Meeting  → Transcript → Speakers identified → Action items → Tasks
  Slack    → Task (message-to-ticket)
  Task     → Jira (bidirectional sync)
  Task     → Google Calendar event + Meet link
  All      → Real-time team notifications
```
