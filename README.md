# Synkro — Project Overview

> AI-powered team productivity platform | Final Year Project

---

## What Is Synkro?

Synkro is a web application that helps software development teams stay productive and organised. It centralises meeting management, task tracking, email integration, team analytics, and an AI chat assistant into a single dashboard — with role-based access so every team member only sees and does what they are supposed to.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + SQLAlchemy (async) + PostgreSQL (asyncpg) |
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| State / Data | Zustand (client state) + TanStack Query (server state) |
| AI | OpenAI Whisper (transcription) + GPT / Groq (summarisation, chat) |
| Auth | JWT — access token 30 min, refresh token 7 days, stored in localStorage |
| Storage | Local filesystem or S3-compatible (configurable via env) |

Backend runs on `localhost:8000`, frontend on `localhost:3000`.

---

## Role Hierarchy

```
admin  >  project_manager  >  team_lead  >  senior_developer  >  developer  >  intern
```

- Role is selected at registration and shown in the sidebar.
- **Admin** is the only role that can upload meetings and access the admin panel.
- All other roles can manage tasks, integrate email, and use the AI chat.

---

## Features Built So Far

### Authentication
- Register with name, email, password, and role selection (dropdown with descriptions).
- Login with JWT; access token auto-refreshed via refresh token.
- **Forgot password** flow — 3 steps on the login page:
  1. Enter email → receive reset token directly in API response (dev mode, no email server needed).
  2. Copy the token shown on screen.
  3. Enter token + new password → password updated.
- Token valid for 1 hour, stored in `users.password_reset_token` + `users.password_reset_expires`.

### Meeting Management (Admin Only)
- Upload audio/video files (`.mp3`, `.wav`, `.m4a`, `.webm`, `.mp4`, `.mpeg`, `.mpga`, up to 100 MB).
- Background transcription via OpenAI Whisper API.
- Automatic AI summarisation after transcription completes.
- Action items extracted from the summary and saved to the database.
- Meeting status lifecycle: `pending → processing → completed / failed`.
- Non-admins see a lock notice and cannot upload.

### Task Management (All Roles)
- Full CRUD — create, read, update, delete tasks.
- Fields: title, description, status (`todo / in_progress / done / blocked`), priority (`low / medium / high / urgent`), assignee, due date.
- Tasks are scoped to the user's team (`team_id`).
- Filters: status, priority, assignee, due date range, pagination (max 100 per page).
- Task statistics endpoint (counts by status/priority, overdue count, completion rate).

### Email Integration (All Roles)
- Connect Gmail via app password (stored encrypted in the `integrations` table).
- Sync up to 50 emails from the last 30 days on demand.
- Deduplicates by `gmail_message_id`.
- View emails in the dashboard with sender, subject, date, and body preview.

### AI Chat Assistant (All Roles)
- Natural language queries answered by the AI using live team data as context.
- Can answer questions like:
  - "What's on my plate this week?"
  - "Who's working on authentication?"
  - "What did we decide about the API redesign?"
- Returns a natural language response, the data context used, and suggested next actions.

### Analytics (All Roles)
- **Workload**: tasks by status, tasks by priority, overdue tasks, per-member task counts.
- **Productivity**: completion rate, average task age, velocity over configurable time window.
- **Team insights**: per-member breakdown of assigned vs completed tasks.
- Configurable date range (1–365 days).

### Admin Panel (Admin Only)
- Full user management in the Settings page:
  - List all users with role, status, and join date.
  - Change any user's role via dropdown.
  - Activate / deactivate users.
  - Delete users.
- User statistics: total users, active users, new this month, breakdown by role.
- Admin shield badge in the top bar and sidebar.

### Dashboard Home
- Admin sees a banner with user count cards (total / new this month / by role) and a "Manage Users" quick action.
- "Upload Meeting" quick action visible to admin only; hidden for all other roles.
- All users see recent tasks and upcoming meetings.

---

## Database Models

| Model | Key Fields |
|---|---|
| `User` | id, email, hashed_password, full_name, role (enum), team_id, is_active, password_reset_token, password_reset_expires |
| `Team` | id, name, created_at |
| `Meeting` | id, title, recording_url, transcript, summary, status, team_id, uploaded_by |
| `ActionItem` | id, meeting_id, description, assignee_id, due_date, is_completed |
| `Task` | id, title, description, status, priority, assignee_id, creator_id, team_id, due_date |
| `Email` | id, user_id, gmail_message_id, sender, subject, body, received_at |
| `Integration` | id, user_id, platform (gmail/slack), access_token, platform_metadata, is_active |
| `Message` | id, user_id, team_id, content, created_at |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with role |
| POST | `/login` | Public | Login, returns JWT pair |
| POST | `/refresh` | Public | Refresh access token |
| POST | `/forgot-password` | Public | Request reset token |
| POST | `/reset-password` | Public | Reset using token |
| GET | `/roles` | Public | List available roles |
| GET | `/me` | Authenticated | Current user profile |

### Meetings — `/api/meetings`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/upload` | Admin only | Upload + process audio |
| GET | `/` | Authenticated | List team meetings |
| GET | `/{id}` | Authenticated | Meeting detail |
| PATCH | `/{id}` | Admin only | Update meeting metadata |
| DELETE | `/{id}` | Admin only | Delete meeting |

### Tasks — `/api/tasks`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | List tasks with filters |
| POST | `/` | Authenticated | Create task |
| GET | `/stats` | Authenticated | Task statistics |
| GET | `/{id}` | Authenticated | Task detail |
| PATCH | `/{id}` | Authenticated | Update task |
| DELETE | `/{id}` | Authenticated | Delete task |

### Emails — `/api/emails`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/sync` | Authenticated | Sync from Gmail |
| GET | `/` | Authenticated | List synced emails |
| GET | `/stats` | Authenticated | Email statistics |
| GET | `/{id}` | Authenticated | Email detail |

### Analytics — `/api/analytics`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/workload` | Authenticated | Workload breakdown |
| GET | `/productivity` | Authenticated | Productivity metrics |
| GET | `/team` | Authenticated | Per-member insights |

### Chat — `/api/chat`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/query` | Authenticated | Send AI query |

### Admin — `/api/admin`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin only | List all users |
| GET | `/users/count` | Admin only | User statistics |
| GET | `/users/team` | Admin only | Team member list |
| PATCH | `/users/{id}/role` | Admin only | Change user role |
| PATCH | `/users/{id}/toggle-active` | Admin only | Activate / deactivate |
| DELETE | `/users/{id}` | Admin only | Delete user |

---

## Frontend Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/register` | Registration with role selector |
| `/login` | Login + forgot password (3-step flow in one page) |
| `/dashboard` | Home — stats, quick actions, recent activity |
| `/dashboard/meetings` | Meeting list; upload for admin only |
| `/dashboard/tasks` | Task board with filters and CRUD |
| `/dashboard/emails` | Email inbox synced from Gmail |
| `/dashboard/chat` | AI chat assistant |
| `/dashboard/analytics` | Charts and productivity insights |
| `/dashboard/settings` | Profile + admin panel (user management for admin) |

---

## Project Structure

```
fyp synkro/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── routers/         # FastAPI route handlers (auth, admin, meetings, tasks, emails, analytics, chat, integrations)
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # AI service (transcription, summarisation, chat)
│   │   ├── utils/           # Storage helpers
│   │   ├── database.py      # Async DB session setup
│   │   └── dependencies.py  # Auth deps (get_current_user, get_current_admin_user)
│   ├── migrate_db.py        # Custom migration script (use this, NOT Alembic)
│   └── main.py
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Shared UI components
│   ├── lib/
│   │   └── api.ts           # All API calls (authApi, adminApi, meetingApi, taskApi, etc.)
│   └── types/
│       └── index.ts         # TypeScript types (UserRole, ROLE_LABELS, USER_ROLES, admin response types)
├── CLAUDE.md                # Dev instructions for Claude Code
└── README.md                # This file
```

---

## Development Setup

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python migrate_db.py        # run schema migrations
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

Environment variables needed in `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/synkro
SECRET_KEY=your-secret-key-min-32-chars
OPENAI_API_KEY=sk-...          # for Whisper transcription + GPT summarisation
# OR
GROQ_API_KEY=gsk_...           # free alternative for summarisation and chat
```

---

## What Still Needs To Be Built

### Core Missing Features
- [ ] **Real-time notifications** — notify team members when a meeting is processed, a task is assigned to them, or a deadline is approaching (WebSockets or SSE).
- [ ] **Action item tracking UI** — extracted action items from meetings need their own page: list view, assign to team member, set due date, mark as done, link back to the source meeting.
- [ ] **Task comments** — threaded comments on tasks so the team can discuss without leaving the platform.
- [ ] **Slack integration** — connect a Slack workspace, post meeting summaries and task updates automatically.
- [ ] **File attachments** — attach files to tasks and meetings.

### Auth & User Management
- [ ] **Email-based password reset** — currently the reset token is returned in the API response (dev mode only). Production needs SMTP or SendGrid to actually email the token.
- [ ] **Team invitation flow** — admin sends an invite link; new users join the existing team rather than auto-creating a new one at registration.
- [ ] **OAuth login** — Google / GitHub sign-in as an alternative to email + password.
- [ ] **Profile picture upload** — user avatars in the sidebar and task cards.

### AI Enhancements
- [ ] **Meeting Q&A** — ask questions about a specific meeting transcript (RAG over transcript text).
- [ ] **One-click task creation from action items** — offer to convert extracted action items into tasks directly from the meeting detail page.
- [ ] **Sentiment / tone analysis** — flag meetings or tasks that appear blocked or have negative sentiment.
- [ ] **Weekly AI digest** — automated summary of team activity emailed to the admin each week.

### Analytics & Reporting
- [ ] **Export reports** — download analytics as PDF or CSV.
- [ ] **Custom date-range picker** — arbitrary start/end dates for all analytics charts.
- [ ] **Individual performance view** — each user can see their own productivity metrics over time.

### Infrastructure
- [ ] **Production deployment** — Docker Compose for production, Nginx reverse proxy, SSL.
- [ ] **S3 storage** — move meeting audio from local filesystem to S3 or Cloudflare R2.
- [ ] **Background job queue** — replace FastAPI `BackgroundTasks` with Celery + Redis for reliable async processing at scale.
- [ ] **Rate limiting** — protect public auth endpoints from brute-force.
- [ ] **Automated tests** — unit tests for routers, integration tests for the AI pipeline.

---

## Dev Notes

- **PostgreSQL enum**: when adding new values to an existing enum type, commit the transaction **before** using the new values in the same session. Use separate `engine.begin()` blocks.
- **Migrations**: always use `python migrate_db.py`, not Alembic.
- **Team isolation**: all queries must be scoped to `current_user.team_id` — never query across teams.
- **Admin guard**: use the `get_current_admin_user` dependency on any endpoint that must be admin-only.
- **API docs**: available at `http://localhost:8000/api/docs` (Swagger UI) when backend is running.
