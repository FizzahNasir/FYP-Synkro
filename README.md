# Synkro

**AI-Powered Team Productivity Platform**  
Final Year Project — Computer Science

---

## Overview

Synkro is a full-stack web application that centralises the daily workflow of a software development team. It brings together meeting transcription, task management, email sync, third-party integrations (Slack, Jira, Google Calendar, Zoom), and an AI assistant — all behind a role-based access system — so teams spend less time context-switching and more time building.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI 0.110 + SQLAlchemy 2 (async) + PostgreSQL 15 |
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| State / Data fetching | Zustand + TanStack Query (React Query v5) |
| AI / Transcription | Groq API (Whisper + LLaMA) · OpenAI (optional) · Local Whisper (offline) |
| Auth | JWT — 30-min access token + 7-day refresh token |
| Background tasks | Celery + Redis |
| Storage | Local filesystem (default) · AWS S3 · Cloudinary (configurable) |
| Migrations | Alembic |

---

## Features

### Authentication & User Management
- Register with name, email, password, and role selection
- JWT login with automatic token refresh
- Forgot-password flow (token-based, no email server required in dev)
- Role-based access control — 6 levels: `admin > project_manager > team_lead > senior_developer > developer > intern`
- Admin panel: manage users, change roles, activate/deactivate, delete

### Team Invitations
- Admin generates invite links for their team
- New users who register via invite link are automatically added to that team
- Prevents accidental new-team creation at registration

### Meeting Management
- Upload audio/video files (MP3, WAV, M4A, WebM, MP4 — up to 100 MB)
- Automatic transcription via Groq Whisper (or local Whisper — no API key needed)
- AI-generated meeting summaries and action item extraction
- Meeting status lifecycle: `pending → processing → completed / failed`
- Google Meet links auto-generated and attached to tasks with meeting dates

### Task Management
- Full CRUD with status (`todo / in_progress / done / blocked`) and priority (`low / medium / high / urgent`)
- Assign tasks to team members, set due dates
- Filter by status, priority, assignee, date range
- Task statistics: completion rate, overdue count, velocity
- Threaded comments on tasks

### Jira Integration (Bidirectional)
- Connect with Atlassian email + API token (per-user, no server OAuth app)
- Push Synkro tasks to Jira as issues and pull Jira issues back
- Sync task status, priority, assignee, description, due dates
- Bidirectional comment sync — comments created in either system appear in both
- Real-time webhook sync (Jira → Synkro on issue updates)

### Slack Integration
- OAuth 2.0 flow — connect a workspace with one click
- Sync channel messages and direct messages into Synkro
- Real-time incoming webhook processing via Events API

### Google Calendar & Google Meet
- OAuth 2.0 — connect personal Google Calendar
- View and create calendar events from within Synkro
- Tasks with a meeting date automatically generate Google Meet links

### Gmail Integration
- Connect via Gmail App Password (no OAuth app required)
- Sync up to 50 emails from the last 30 days on demand
- Deduplicated by Gmail message ID

### Notifications
- In-app notifications for task assignments, meeting completions, and deadline reminders
- Notification bell with unread badge in the top bar
- REST polling (Phase 1) — WebSocket upgrade ready

### AI Chat Assistant
- Natural-language queries answered using live team data as context
- Example queries: *"Who is working on authentication?"*, *"What's overdue this week?"*
- Returns a natural-language answer plus the raw data context used

### Analytics
- Workload breakdown: tasks by status, priority, and assignee
- Productivity metrics: completion rate, average task age, velocity
- Per-member insights with configurable date range

---

## Repository Structure

```
FYP-Synkro-yuhu/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models (15 tables)
│   │   ├── routers/         # FastAPI route handlers
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── services/        # AI, calendar, Jira, Slack, Zoom services
│   │   ├── tasks/           # Celery background jobs
│   │   ├── utils/           # Storage, security helpers
│   │   ├── config.py        # Pydantic Settings (env var loading)
│   │   ├── database.py      # Async SQLAlchemy session
│   │   └── main.py          # FastAPI app entry point
│   ├── alembic/
│   │   └── versions/        # 15 migration files
│   ├── .env.example         # Environment variable template
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Shared UI components
│   ├── lib/
│   │   ├── api.ts           # All API calls (Axios-based)
│   │   └── stores/          # Zustand state stores
│   ├── types/index.ts       # TypeScript type definitions
│   └── .env.local.example
├── docs/                    # Additional project documentation
├── SETUP_GUIDE.md           # Full setup & integration guide
└── README.md
```

---

## Quick Start

> For a complete walkthrough including all integration setups, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or free cloud: [neon.tech](https://neon.tech))
- Redis 7+ (or free cloud: [redis.com/try-free](https://redis.com/try-free/))
- FFmpeg (required for audio processing)
- Groq API key — free at [console.groq.com/keys](https://console.groq.com/keys)

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate          # macOS / Linux

pip install -r requirements.txt

# Configure environment
copy .env.example .env             # Windows
# cp .env.example .env             # macOS / Linux
# Edit .env — fill in DATABASE_URL, GROQ_API_KEY, SECRET_KEY at minimum

# Run database migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload
```

API: `http://localhost:8000` | Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install

copy .env.local.example .env.local   # Windows
# cp .env.local.example .env.local   # macOS / Linux

npm run dev
```

App: `http://localhost:3000`

### First Login

Register at `http://localhost:3000/register` — the first account created is automatically assigned the **admin** role.

---

## Environment Variables

Minimum required in `backend/.env`:

```env
SECRET_KEY=<32+ character random string>
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>/<db>?ssl=require
GROQ_API_KEY=<your Groq key>
REDIS_URL=redis://localhost:6379/0
```

All variables with descriptions are documented in [`backend/.env.example`](./backend/.env.example).

---

## API Overview

| Prefix | Description |
|--------|-------------|
| `POST /api/auth/register` | Register account |
| `POST /api/auth/login` | Login, returns JWT pair |
| `GET /api/auth/me` | Current user profile |
| `GET/POST /api/tasks` | Task CRUD + statistics |
| `GET /api/tasks/{id}/comments` | Task comment thread |
| `POST /api/meetings/upload` | Upload + transcribe meeting |
| `POST /api/emails/sync` | Sync Gmail inbox |
| `POST /api/chat/query` | AI assistant query |
| `GET /api/analytics/workload` | Workload analytics |
| `GET /api/analytics/productivity` | Productivity metrics |
| `POST /api/integrations/jira/connect` | Connect Jira account |
| `POST /api/integrations/jira/sync` | Sync tasks ↔ Jira issues |
| `GET /api/integrations/slack/start` | Slack OAuth initiation |
| `GET /api/integrations/google-calendar/start` | Google Calendar OAuth |
| `GET /api/notifications` | List notifications |
| `GET /api/admin/users` | List all users (admin) |

Full interactive documentation is available at `http://localhost:8000/docs` when the server is running.

---

## Docker

```bash
cd backend
cp .env.example .env      # fill in GROQ_API_KEY
docker-compose up --build

# Run migrations (separate terminal)
docker-compose exec backend alembic upgrade head
```

Services started: PostgreSQL 15, Redis 7, FastAPI backend (port 8000), Celery worker.

---

## Database Migrations

```bash
# Apply all migrations
alembic upgrade head

# Check current state
alembic current

# Create a new migration after model changes
alembic revision --autogenerate -m "describe change"
```

---

## Role Hierarchy

```
admin  >  project_manager  >  team_lead  >  senior_developer  >  developer  >  intern
```

The first registered user is assigned `admin` automatically. Roles can be changed from **Settings → Admin Panel**.

---

## License

This project is submitted as a Final Year Project for academic evaluation. All rights reserved.
