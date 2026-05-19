# Synkro — Setup & Deployment Guide

> **Synkro** is an AI-powered team productivity platform that unifies meetings, tasks, emails, and third-party tools (Slack, Jira, Google Calendar, Zoom) into a single workspace.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start — Local Development](#2-quick-start--local-development)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Integration Setup Guides](#4-integration-setup-guides)
   - 4.1 [Gmail](#41-gmail-email-sync)
   - 4.2 [Google Calendar & Google Meet](#42-google-calendar--google-meet)
   - 4.3 [Slack](#43-slack)
   - 4.4 [Jira](#44-jira)
   - 4.5 [Zoom](#45-zoom)
5. [Running with Docker](#5-running-with-docker)
6. [Database Migrations](#6-database-migrations)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 15+ | Local install **or** free cloud (see below) |
| Redis | 7+ | Local install **or** free cloud (see below) |
| FFmpeg | Any recent | Required for audio transcription |
| Git | Any | For cloning the repo |

### Free cloud alternatives (no local install needed)

| Service | Purpose | Free tier |
|---------|---------|-----------|
| [Neon](https://neon.tech) | PostgreSQL | 0.5 GB, always free |
| [Redis Cloud](https://redis.com/try-free/) | Redis | 30 MB, always free |
| [Groq](https://console.groq.com) | AI transcription & summarisation | Generous free tier |

### Install FFmpeg

**Windows (recommended — Chocolatey):**
```powershell
# Open PowerShell as Administrator
choco install ffmpeg
```

**Windows (manual):**
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH
4. Restart your terminal and verify: `ffmpeg -version`

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

---

## 2. Quick Start — Local Development

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd FYP-Synkro-yuhu
```

### Step 2 — Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Create your environment file:**
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `backend/.env` in a text editor and fill in **at minimum**:

```env
SECRET_KEY=<any 32+ character random string>
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>/<dbname>?ssl=require
GROQ_API_KEY=<your Groq key from https://console.groq.com/keys>
```

> **Tip — generate a SECRET_KEY:**
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

**Run database migrations:**
```bash
# Make sure you are in the backend/ directory with venv active
alembic upgrade head
```

**Start the backend server:**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### Step 3 — Frontend setup

Open a **new terminal tab/window**:

```bash
cd frontend

# Install dependencies
npm install
```

**Create your environment file:**
```bash
# Windows
copy .env.local.example .env.local

# macOS / Linux
cp .env.local.example .env.local
```

The default value is already correct for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Start the frontend dev server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Step 4 — Create your first account

1. Open `http://localhost:3000/register`
2. Register with any email and password
3. The first registered user is automatically assigned the **admin** role
4. Log in and explore the dashboard

---

## 3. Environment Variables Reference

All variables live in `backend/.env`. The full template with explanations is at `backend/.env.example`.

### Core (required to run)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key — minimum 32 characters, keep secret |
| `DATABASE_URL` | PostgreSQL async connection string |
| `REDIS_URL` | Redis connection string |
| `CELERY_BROKER_URL` | Same as `REDIS_URL` (copy the value) |
| `CELERY_RESULT_BACKEND` | Same as `REDIS_URL` (copy the value) |

### AI / Transcription (at least one required)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key — free, fast, recommended |
| `OPENAI_API_KEY` | OpenAI key — alternative to Groq, paid |

### Optional integrations

| Variable | Description |
|----------|-------------|
| `GMAIL_EMAIL` | Gmail address for IMAP email sync |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 chars, spaces OK) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (Calendar + Meet) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALENDAR_REDIRECT_URI` | OAuth callback — leave as default for local dev |
| `SLACK_CLIENT_ID` | Slack App client ID |
| `SLACK_CLIENT_SECRET` | Slack App client secret |
| `SLACK_REDIRECT_URI` | Slack OAuth callback URL |
| `SLACK_SIGNING_SECRET` | Slack signing secret for webhook verification |
| `JIRA_WEBHOOK_SECRET` | Random secret for Jira webhook verification |
| `BACKEND_URL` | Public URL of the backend (ngrok URL for local dev) |
| `ZOOM_CLIENT_ID` | Zoom OAuth app client ID |
| `ZOOM_CLIENT_SECRET` | Zoom OAuth app client secret |

---

## 4. Integration Setup Guides

All integrations are **optional**. The core features (meetings, tasks, AI chat, analytics) work without any third-party credentials.

---

### 4.1 Gmail (Email Sync)

Synkro connects to Gmail via IMAP using an **App Password** (your main Google account password is never used).

**Requirements:** A Google account with 2-Step Verification enabled.

**Steps:**

1. Go to your Google Account → Security → [App Passwords](https://myaccount.google.com/apppasswords)
   - If you do not see "App Passwords", enable 2-Step Verification first
2. Select **Mail** from the dropdown → Select your device → Click **Generate**
3. Copy the 16-character password (spaces are fine, e.g. `mmmv fxji mcgq ohih`)
4. Add to `backend/.env`:
   ```env
   GMAIL_EMAIL=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
5. Restart the backend server
6. In the Synkro UI → Settings → Integrations → click **Connect Gmail**

---

### 4.2 Google Calendar & Google Meet

Enables two features:
- **Google Calendar sync** — view and create calendar events from Synkro
- **Google Meet auto-generation** — tasks with meeting dates auto-create Google Meet links

**Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **New Project** (or select an existing one)

2. **Enable APIs** — APIs & Services → Library → search and enable:
   - **Google Calendar API**

3. **Configure OAuth consent screen** — APIs & Services → OAuth consent screen
   - User type: **External**
   - Fill in App name (`Synkro`), your email
   - Add scopes: `../auth/calendar`, `../auth/calendar.events`
   - Add your email as a **Test user** (required while in testing)

4. **Create credentials** — APIs & Services → Credentials → **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `Synkro Local`
   - Authorised redirect URIs:
     ```
     http://localhost:8000/api/integrations/google-calendar/callback
     ```
   - Click **Create** → copy **Client ID** and **Client Secret**

5. Add to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:8000/api/integrations/google-calendar/callback
   ```

6. Restart the backend server

7. In the Synkro UI → Settings → Integrations → click **Connect Google Calendar** → complete the OAuth flow

---

### 4.3 Slack

Enables syncing Slack channel messages and direct messages into Synkro.

**Steps:**

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) → **Create New App → From scratch**
   - App name: `Synkro`
   - Pick your workspace

2. **OAuth & Permissions** (left sidebar):
   - Redirect URLs → Add: `http://localhost:8000/api/integrations/slack/callback`
   - Bot Token Scopes → Add the following scopes:
     ```
     channels:history
     channels:read
     chat:write
     im:history
     im:read
     users:read
     users:read.email
     ```

3. **Event Subscriptions** (left sidebar) → Enable Events:
   - For real-time sync you need a public URL — see [ngrok setup](#ngrok-for-local-webhooks) below
   - Request URL: `https://<your-ngrok-url>/api/slack/events`
   - Subscribe to bot events: `message.channels`, `message.im`

4. **Install to Workspace** — OAuth & Permissions → Install to Workspace

5. **Basic Information** (left sidebar) → copy these values:
   - Client ID
   - Client Secret
   - Signing Secret

6. Add to `backend/.env`:
   ```env
   SLACK_CLIENT_ID=your-client-id
   SLACK_CLIENT_SECRET=your-client-secret
   SLACK_REDIRECT_URI=http://localhost:8000/api/integrations/slack/callback
   SLACK_SIGNING_SECRET=your-signing-secret
   ```

7. Restart the backend server

8. In the Synkro UI → Settings → Integrations → click **Connect Slack** → complete the OAuth flow

---

### 4.4 Jira

Enables two-way sync between Synkro tasks and Jira issues, including comment sync.

**Important:** Jira credentials are entered **per user** in the Synkro UI — no server-side OAuth app is needed. Each user connects with their own Atlassian account.

**Steps — connecting your Jira account:**

1. Log in to [Atlassian](https://id.atlassian.com/manage-profile/security) → **API tokens** → **Create API token**
   - Label: `Synkro`
   - Copy the generated token (it is shown only once)

2. In the Synkro UI → **Settings → Integrations → Jira**:
   - **Jira Domain**: your Atlassian subdomain, e.g. `your-company.atlassian.net`
   - **Atlassian Email**: the email address of your Atlassian account
   - **API Token**: paste the token from step 1
   - Click **Connect**

3. Once connected, you can select which Jira project to sync from the dropdown.

**For real-time Jira → Synkro webhook sync (optional):**

Jira pushes change events to your server. This requires your backend to be publicly accessible. For local development, use [ngrok](#ngrok-for-local-webhooks):

1. Start ngrok: `ngrok http 8000`
2. Copy the `https://` URL shown by ngrok
3. Add to `backend/.env`:
   ```env
   BACKEND_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
   JIRA_WEBHOOK_SECRET=any-random-string-you-choose
   ```
4. Restart the backend — Synkro will automatically register the webhook with Jira on first sync

---

### 4.5 Zoom

Enables Zoom meeting link generation from tasks.

**Steps:**

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/develop/create) → **OAuth app**
2. App name: `Synkro`
3. Account-level app: No (User-managed)
4. Redirect URL: `http://localhost:8000/api/integrations/zoom/callback`
5. Allow list URL: `http://localhost:8000`
6. Scopes: `meeting:write`, `meeting:read`
7. Install the app → copy **Client ID** and **Client Secret**

8. Add to `backend/.env`:
   ```env
   ZOOM_CLIENT_ID=your-client-id
   ZOOM_CLIENT_SECRET=your-client-secret
   ZOOM_REDIRECT_URI=http://localhost:8000/api/integrations/zoom/callback
   ```

---

### ngrok for Local Webhooks

Several integrations (Slack Events, Jira webhooks) require a **publicly reachable URL** to push events to your local machine. ngrok creates a secure tunnel for this.

**Install ngrok:** [https://ngrok.com/download](https://ngrok.com/download)

**Start a tunnel to port 8000:**
```bash
ngrok http 8000
```

ngrok will show output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

Use the `https://` URL wherever a public backend URL is required.

> **Note:** Free ngrok URLs change each time you restart ngrok. Update `BACKEND_URL` in `.env` and restart the backend server when this happens.

---

## 5. Running with Docker

Docker Compose starts all backend services (PostgreSQL, Redis, backend API, Celery worker) with a single command.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
cd backend

# Copy env file
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux

# Edit .env — at minimum fill in GROQ_API_KEY
# DATABASE_URL and REDIS_URL are pre-configured for the Docker network

# Start all services
docker-compose up --build

# In a separate terminal — run migrations
docker-compose exec backend alembic upgrade head
```

The API will be at `http://localhost:8000`. Start the frontend separately (see Step 3 above).

To stop:
```bash
docker-compose down
```

To stop and delete the database volume:
```bash
docker-compose down -v
```

---

## 6. Database Migrations

Synkro uses **Alembic** to manage database schema changes. There are 15 migrations that take the schema from zero to the current state.

**Apply all migrations** (run from `backend/` with venv active):
```bash
alembic upgrade head
```

**Check current migration state:**
```bash
alembic current
```

**Downgrade one step:**
```bash
alembic downgrade -1
```

**Create a new migration** (after changing a model):
```bash
alembic revision --autogenerate -m "describe your change"
```

---

## 7. Troubleshooting

### Backend won't start

**`ModuleNotFoundError`**
```bash
# Make sure venv is active, then reinstall
pip install -r requirements.txt
```

**`Could not connect to database`**
- Verify `DATABASE_URL` in `.env` is correct
- If using Neon, make sure to include `?ssl=require` at the end
- If using local PostgreSQL, make sure the server is running: `pg_ctl status`

**`Redis connection refused`**
- Start Redis: `redis-server` (or via Docker: `docker run -p 6379:6379 redis`)
- Or use Redis Cloud (free) and update `REDIS_URL`

### Transcription not working

**`ffmpeg not found`**
- Install FFmpeg (see [Section 1](#1-prerequisites))
- Verify: `ffmpeg -version`

**`No Groq/OpenAI key`**
- Add `GROQ_API_KEY` to `.env` and restart the server
- Check status at: `http://localhost:8000/api/meetings/whisper-status`

**Transcription stuck at "Processing"**
- Check the backend terminal for error logs
- Transcription takes 2–5 minutes per 10-minute audio file on CPU

### Frontend issues

**`Failed to fetch` / API errors**
- Confirm the backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`

**Build errors**
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Integration OAuth errors

**`redirect_uri_mismatch` (Google)**
- The redirect URI in `.env` must exactly match what you added in Google Cloud Console
- Default: `http://localhost:8000/api/integrations/google-calendar/callback`

**`invalid_client` (Slack/Google)**
- Double-check `CLIENT_ID` and `CLIENT_SECRET` were copied without extra spaces

**Jira `401 Unauthorized`**
- Regenerate your API token at https://id.atlassian.com/manage-profile/security
- Verify the domain is entered without `https://` (e.g. `company.atlassian.net`)

---

## Ports at a Glance

| Service | Port | URL |
|---------|------|-----|
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| Backend (FastAPI) | 8000 | http://localhost:8000 |
| API Docs (Swagger) | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | — |
| Redis | 6379 | — |

---

## Role Hierarchy

Synkro has a 6-level role system. The first registered user is assigned `admin` automatically.

```
admin > project_manager > team_lead > senior_developer > developer > intern
```

Admins can change user roles from **Settings → Admin Panel**.

---

*For questions or issues, refer to the project repository or contact the development team.*
