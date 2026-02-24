# Synkro - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Authentication & Security](#authentication--security)
6. [Feature Deep Dive](#feature-deep-dive)
7. [AI Integration](#ai-integration)
8. [Data Flow & Architecture](#data-flow--architecture)
9. [Database Schema](#database-schema)
10. [API Documentation](#api-documentation)
11. [Frontend Architecture](#frontend-architecture)
12. [Setup & Deployment](#setup--deployment)

---

## Project Overview

**Synkro** is an **AI-Powered Workspace Orchestration System** designed for software development teams. It's a Final Year Project (FYP) that integrates multiple productivity tools into a unified platform, leveraging AI to automate transcription, summarization, task extraction, and intelligent insights.

### What Problem Does Synkro Solve?

Software development teams face several challenges:
- **Meeting overload**: Hours spent in meetings with poor documentation
- **Task fragmentation**: Tasks scattered across emails, meetings, and chat
- **Context switching**: Jumping between multiple tools (Slack, Gmail, task managers)
- **Lost decisions**: Important decisions buried in meeting notes
- **Workload imbalance**: Unclear team capacity and distribution

### How Synkro Solves It

Synkro acts as a central hub that:
1. **Transcribes meetings** automatically using AI (Whisper API)
2. **Extracts action items** from meetings and creates tasks
3. **Integrates emails** (Gmail) to capture communication
4. **Provides AI chat** for natural language queries ("What's on my plate?")
5. **Visualizes analytics** for team workload and productivity
6. **Unifies everything** in one dashboard with intelligent orchestration

---

## Architecture Overview

Synkro follows a **modern full-stack architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │Dashboard │  Tasks   │ Meetings │   Chat   │Analytics │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
│                   Axios API Client + Types                   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth │ Tasks │ Meetings │ Chat │ Integrations │...  │   │
│  └──────────────────────────────────────────────────────┘   │
│           ┌──────────┬──────────┬──────────────┐           │
│           │AI Service│Storage   │Gmail Service │           │
│           └──────────┴──────────┴──────────────┘           │
└───┬──────────────────┬─────────────────────┬───────────────┘
    │                  │                     │
┌───▼─────┐  ┌────────▼────────┐  ┌────────▼────────┐
│PostgreSQL│  │Redis + Celery   │  │S3/Cloudinary    │
│(Main DB) │  │(Background Jobs)│  │(File Storage)   │
└──────────┘  └─────────────────┘  └─────────────────┘

┌───────────────────────────────────────────────────────────┐
│              EXTERNAL AI SERVICES                          │
│  ┌─────────────────┐         ┌─────────────────┐         │
│  │  Groq (FREE)    │   OR    │  OpenAI (Paid)  │         │
│  │ - Whisper API   │         │ - Whisper API   │         │
│  │ - Llama 3.3 70B │         │ - GPT-4         │         │
│  └─────────────────┘         └─────────────────┘         │
└───────────────────────────────────────────────────────────┘
```

### Multi-Tenant Architecture

Synkro is **multi-tenant** at the team level:
- Every user belongs to a **Team**
- All data (tasks, meetings, emails) is scoped to `team_id`
- Users can only access data from their own team
- Database queries automatically filter by team

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL (async with SQLAlchemy 2.0)
- **ORM**: SQLAlchemy with async support (asyncpg driver)
- **Caching**: Redis
- **Background Jobs**: Celery (for async tasks)
- **AI Services**:
  - Groq (FREE - Whisper + Llama 3.3)
  - OpenAI (Paid fallback - Whisper + GPT-4)
- **Storage**: AWS S3 / Cloudinary / Local filesystem
- **Validation**: Pydantic v2
- **Authentication**: JWT (access + refresh tokens)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (optional)
- **Environment**: .env for configuration

---

## Core Features

### 1. **Authentication System**
- User registration with email/password
- JWT-based authentication (access + refresh tokens)
- Automatic token refresh on 401 errors
- Team-based multi-tenancy
- Profile management

### 2. **Task Management**
- Create, read, update, delete tasks (CRUD)
- Status tracking: Todo → In Progress → Done → Blocked
- Priority levels: Low, Medium, High, Urgent
- Assignee assignment (team members)
- Due dates and estimated hours
- Task source tracking (manual, meeting, email, chat)
- Filtering and pagination
- Task statistics dashboard

### 3. **Meeting Transcription & Summarization**
- Upload audio files (MP3, WAV, M4A, WebM, MP4)
- Automatic transcription using Whisper API
- AI-powered summarization with structured sections:
  - Key Topics
  - Decisions Made
  - Action Items
  - Blockers
  - Next Steps
- Action item extraction with confidence scores
- Convert action items to tasks with one click
- Meeting status tracking (Processing → Transcribed → Completed)

### 4. **AI Chat Assistant**
- Natural language queries about work
- Context-aware responses using team data
- Query types supported:
  - "What's on my plate this week?"
  - "Who's working on authentication?"
  - "What did we decide about the API redesign?"
- Suggested actions based on context
- Intelligent data gathering (tasks, meetings, team info)

### 5. **Email Integration (Gmail)**
- IMAP connection with App Password (no OAuth needed)
- Fetch and sync emails from Gmail
- Email classification with AI
- Search, filter, and pagination
- Email statistics (total, unread, flagged)
- Deduplicated storage by message ID

### 6. **Analytics & Insights**
- **Workload Analytics**:
  - Tasks by status and priority
  - Completion rates
  - Overdue task tracking
- **Team Workload Distribution**:
  - Active tasks per member
  - Completed tasks (30-day window)
  - Estimated hours remaining
- **Meeting Insights**:
  - Total meetings
  - Action item conversion rate
  - Average meeting duration
- **Productivity Trends**:
  - Daily task creation vs. completion
  - Trend visualization

### 7. **Integrations**
- Gmail (IMAP sync)
- Extensible architecture for future integrations (Slack, etc.)
- Integration status tracking
- Last sync timestamps

---

## Authentication & Security

### How Authentication Works

#### 1. **Registration Flow**
```
User submits email + password + name
    ↓
Backend validates email uniqueness
    ↓
Password hashed with bcrypt
    ↓
Auto-create personal team OR join existing team
    ↓
User record created in database
    ↓
Return user profile (no auto-login)
```

#### 2. **Login Flow**
```
User submits email + password
    ↓
Backend finds user by email
    ↓
Verify password hash with bcrypt
    ↓
Generate JWT access token (30 min expiry)
Generate JWT refresh token (7 day expiry)
    ↓
Return both tokens to frontend
    ↓
Frontend stores in localStorage:
  - access_token
  - refresh_token
```

#### 3. **Token Management**
- **Access Token**: Short-lived (30 minutes), included in every API request
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- **Automatic Refresh**: Axios interceptor catches 401 errors and refreshes token

```typescript
// Frontend: Axios Interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.status === 401 && !retry) {
      // Get new access token using refresh token
      const newToken = await refreshAccessToken();
      // Retry original request with new token
      return api.request(originalRequest);
    }
  }
);
```

#### 4. **Protected Routes**
Every backend endpoint (except auth) requires valid JWT:
```python
@router.get("/api/tasks")
async def get_tasks(
    current_user: User = Depends(get_current_user),  # JWT validation
    db: AsyncSession = Depends(get_db)
):
    # Only show tasks from user's team
    tasks = await db.execute(
        select(Task).where(Task.team_id == current_user.team_id)
    )
```

### Security Features
- **Password Hashing**: Bcrypt with salt
- **JWT Signatures**: HS256 algorithm with secret key
- **CORS Protection**: Configurable allowed origins
- **Team Isolation**: All queries scoped to user's team
- **SQL Injection Protection**: SQLAlchemy parameterized queries
- **Token Expiry**: Short-lived access tokens
- **HTTPS Support**: Production-ready

---

## Feature Deep Dive

### Feature 1: Meeting Transcription Pipeline

This is the most complex feature in Synkro. Here's how it works end-to-end:

#### Step 1: File Upload
```
User selects audio file in frontend
    ↓
FormData created with file + title
    ↓
POST /api/meetings/upload
    ↓
Backend validates:
  - File extension (mp3, wav, m4a, etc.)
  - File size (max 100MB for Whisper API)
  - User authentication
```

#### Step 2: Storage
```
Temporary file created on server
    ↓
Upload to storage:
  - AWS S3 (if configured)
  - Cloudinary (alternative)
  - Local filesystem (development)
    ↓
Get public URL to recording
    ↓
Create Meeting record in database:
  - status: PROCESSING
  - recording_url: <storage_url>
  - team_id: <user's team>
```

#### Step 3: Background Processing
```
FastAPI BackgroundTasks.add_task(process_meeting_background)
    ↓
Background function runs asynchronously:
  1. Download audio from storage
  2. Transcribe with Whisper API
  3. Save transcript to database
  4. Update status: TRANSCRIBED
  5. Summarize with Groq/OpenAI
  6. Extract action items
  7. Save summary and action items
  8. Update status: COMPLETED
```

#### Step 4: Transcription (Whisper API)
```python
async def transcribe_meeting(audio_file_path: str):
    client, model = _get_transcription_client()
    # Use Groq (free) or OpenAI (paid)

    with open(audio_file_path, "rb") as audio:
        transcript = await client.audio.transcriptions.create(
            model="whisper-large-v3-turbo",  # Groq
            file=audio,
            response_format="verbose_json",  # Get timestamps
            language="en"
        )

    # Format with timestamps
    return "[00:15] Speaker: Discussion about API...\n[00:42] ..."
```

#### Step 5: Summarization (Llama 3.3 / GPT-4)
```python
async def summarize_meeting(transcript: str, title: str):
    client, model = _get_chat_client()

    prompt = """
    Analyze this meeting and provide:
    - Key Topics
    - Decisions Made
    - Action Items (with assignee/deadline)
    - Blockers
    - Next Steps
    """

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # Groq
        messages=[
            {"role": "system", "content": "Meeting summarizer"},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content
```

#### Step 6: Action Item Extraction
```python
async def extract_action_items_from_summary(summary: str):
    # Use AI to parse summary and extract structured data
    prompt = "Extract action items as JSON array"

    # Returns:
    [
        {
            "description": "Review API documentation",
            "assignee": "John Doe",
            "deadline": "2024-03-15",
            "confidence": 0.9
        }
    ]
```

#### Step 7: Action Item Storage
```python
# Only save high-confidence action items
for item in action_items:
    if item["confidence"] >= 0.6:
        action_item = ActionItem(
            meeting_id=meeting.id,
            description=item["description"],
            assignee_mentioned=item["assignee"],
            deadline_mentioned=item["deadline"],
            confidence_score=item["confidence"],
            status="pending"
        )
        db.add(action_item)
```

#### Step 8: Frontend Display
```
User navigates to /dashboard/meetings
    ↓
Frontend polls GET /api/meetings periodically
    ↓
Meeting status updates:
  PROCESSING → TRANSCRIBED → COMPLETED
    ↓
User clicks meeting to view details
    ↓
Display:
  - Full transcript with timestamps
  - AI-generated summary with sections
  - Action items with confidence scores
  - Buttons: "Convert to Task" | "Reject"
```

#### Converting Action Items to Tasks
```
User clicks "Convert to Task" on action item
    ↓
POST /api/meetings/{id}/action-items/{id}/convert
    ↓
Backend creates Task from action item:
  - title: action_item.description
  - status: TODO
  - priority: MEDIUM
  - due_date: action_item.deadline_mentioned
  - source_type: MEETING
  - source_id: meeting.id
    ↓
Try to match assignee by name/email
    ↓
Update action_item.status = "converted"
Link action_item.task_id = new_task.id
    ↓
Return task_id to frontend
```

---

### Feature 2: AI Chat Assistant

The chat system provides natural language querying of team data.

#### Query Processing Pipeline

```
User types: "What tasks are due this week?"
    ↓
Frontend: POST /api/chat/query {"message": "..."}
    ↓
Backend: Classify query intent
    ↓
Gather relevant context:
  - Analyze keywords (task, week, due)
  - Fetch tasks due within 7 days
  - Get task statistics
  - Load team member info if needed
    ↓
Build context object:
{
  "user": {"name": "Alice", "role": "developer"},
  "tasks": {
    "tasks": [...],
    "count": 5,
    "statistics": {"todo": 3, "in_progress": 2}
  }
}
    ↓
Send to AI (Groq Llama 3.3):
  System: "You are Synkro AI Assistant"
  Context: <JSON context>
  Query: "What tasks are due this week?"
    ↓
AI generates conversational response:
"You have 5 tasks due this week:
 1. Fix login bug (High priority, due Thu)
 2. Review API docs (Medium, due Fri)
 ..."
    ↓
Generate suggested actions:
[
  {"action": "view_tasks", "url": "/dashboard/tasks"},
  {"action": "create_task", "url": "/dashboard/tasks?action=create"}
]
    ↓
Return to frontend:
{
  "response": "<AI answer>",
  "context_used": {...},
  "suggested_actions": [...]
}
```

#### Context Gathering Logic

The chat system intelligently gathers context based on query keywords:

```python
# Task queries
if "task" in query or "plate" in query:
    - Fetch tasks from database
    - Filter by time if mentioned ("this week", "today")
    - Filter by assignee if "my" mentioned
    - Include statistics

# Team queries
if "team" in query or "who" in query:
    - Fetch all team members
    - Calculate task distribution per member
    - Count active tasks per person

# Meeting queries
if "meeting" in query or "decided" in query:
    - Fetch recent completed meetings
    - Search summaries for keywords
    - Rank by relevance
```

---

### Feature 3: Email Integration

Gmail integration uses IMAP (no OAuth needed).

#### Setup Process

1. **Enable 2FA on Gmail account**
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Configure .env**:
   ```
   GMAIL_EMAIL=your-email@gmail.com
   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```

#### Connection Flow

```
User clicks "Connect Gmail" in Settings
    ↓
POST /api/integrations/gmail/connect
    ↓
Backend reads credentials from .env
    ↓
Test IMAP connection:
  - Connect to imap.gmail.com:993
  - Login with email + app password
  - Select INBOX
  - Logout
    ↓
If successful:
  Create/Update Integration record:
    - platform: GMAIL
    - access_token: <app_password>
    - is_active: true
    - platform_metadata: {"email": "..."}
    ↓
Return success message
```

#### Email Sync Flow

```
User clicks "Sync Emails" OR cron job triggers
    ↓
POST /api/emails/sync?limit=30&days=7
    ↓
Backend:
  1. Verify Gmail integration exists
  2. Connect to IMAP server
  3. Search emails from last N days
  4. Fetch message metadata + body
  5. Parse email fields:
     - gmail_message_id (for deduplication)
     - subject, sender, to
     - body (text only)
     - received_at (timestamp)
     - is_read, is_flagged
  6. Check existing gmail_message_ids
  7. Insert only new emails
  8. Update integration.last_synced_at
    ↓
Return: {new_count: 15, total_fetched: 30}
```

#### Email Classification (Future Enhancement)

Emails can be classified using AI:
```python
async def classify_email(subject: str, body: str):
    # Use Groq to classify email intent
    categories = [
        "action_required",  # Needs response/action
        "urgent",           # High priority
        "fyi",              # Information only
        "billing",          # Invoice/payment
        "needs_reply"       # Question requiring answer
    ]
```

---

### Feature 4: Analytics System

#### Workload Analytics

Provides team-wide task metrics:

```python
@router.get("/api/analytics/workload")
async def get_workload_analytics(days: int = 30):
    # Tasks by status (last N days)
    SELECT status, COUNT(*)
    FROM tasks
    WHERE team_id = ? AND created_at >= ?
    GROUP BY status

    # Tasks by priority
    SELECT priority, COUNT(*)
    FROM tasks
    WHERE team_id = ?
    GROUP BY priority

    # Overdue tasks (currently not done)
    SELECT COUNT(*)
    FROM tasks
    WHERE team_id = ?
      AND due_date < NOW()
      AND status != 'done'

    # Completion rate
    completion_rate = (done / total) * 100

    return {
        "tasks_by_status": {"todo": 10, "done": 25, ...},
        "tasks_by_priority": {"high": 5, "medium": 15, ...},
        "completion_rate": 72.5,
        "overdue_tasks": 3
    }
```

#### Team Workload Distribution

Shows how work is distributed across team members:

```python
@router.get("/api/analytics/team-workload")
async def get_team_workload():
    for each member in team:
        # Active tasks (not done)
        active = COUNT where assignee = member AND status != done

        # Completed in last 30 days
        done = COUNT where assignee = member
               AND status = done
               AND updated_at >= 30 days ago

        # Overdue tasks
        overdue = COUNT where assignee = member
                  AND due_date < NOW()
                  AND status != done

        # Total estimated hours
        hours = SUM(estimated_hours)
                where assignee = member
                AND status != done

    return sorted by active_tasks descending
```

#### Productivity Trend

Daily breakdown of task creation vs. completion:

```python
@router.get("/api/analytics/productivity-trend")
async def get_productivity_trend(days: int = 30):
    trend = []

    for each day in last N days:
        # Tasks created on this day
        created = COUNT where created_at between day_start and day_end

        # Tasks completed on this day
        completed = COUNT where status = done
                    AND updated_at between day_start and day_end

        trend.append({
            "date": "2024-02-12",
            "created": 8,
            "completed": 5
        })

    return {"trend": trend}
```

Frontend displays this as a line chart showing two lines (created vs. completed).

---

## AI Integration

Synkro uses AI extensively. Here's how each AI feature works:

### AI Provider: Groq (Preferred) vs. OpenAI

```python
# Priority: Use Groq if available (FREE), else OpenAI (paid)
if settings.GROQ_API_KEY:
    client = AsyncOpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )
    transcription_model = "whisper-large-v3-turbo"
    chat_model = "llama-3.3-70b-versatile"
else:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    transcription_model = "whisper-1"
    chat_model = "gpt-4"
```

### AI Use Cases

| Feature | AI Model | Purpose | Cost |
|---------|----------|---------|------|
| Transcription | Whisper Large v3 Turbo | Audio → Text | FREE (Groq) |
| Meeting Summary | Llama 3.3 70B | Text → Structured Summary | FREE (Groq) |
| Action Extraction | Llama 3.3 70B | Summary → JSON Action Items | FREE (Groq) |
| Chat Queries | Llama 3.3 70B | Natural Language → Answers | FREE (Groq) |
| Intent Classification | Llama 3.3 70B | Message → Category | FREE (Groq) |
| Email Classification | Llama 3.3 70B | Email → Category | FREE (Groq) |

### Why Groq?

- **100% FREE** with generous rate limits
- **Fast inference** (up to 300 tokens/sec)
- **OpenAI-compatible API** (easy migration)
- **High-quality models** (Whisper v3, Llama 3.3 70B)

Get free API key: https://console.groq.com/keys

---

## Data Flow & Architecture

### Request Flow Example: Creating a Task

```
1. USER ACTION
   User fills form in frontend and clicks "Create Task"

2. FRONTEND
   - Validate form data (title required, etc.)
   - Build task object
   - Call: taskApi.createTask(taskData)

3. AXIOS INTERCEPTOR
   - Check localStorage for access_token
   - Add header: Authorization: Bearer <token>
   - Send POST /api/tasks

4. BACKEND: FastAPI Router
   @router.post("/api/tasks")
   - CORS middleware validates origin
   - Request reaches router

5. BACKEND: Authentication
   current_user = Depends(get_current_user)
   - Extract JWT from Authorization header
   - Verify signature and expiry
   - Decode user_id from token
   - Query database for user
   - Return User object

6. BACKEND: Authorization
   - Check assignee_id is in same team
   - Build Task model instance
   - Set team_id from current_user.team_id

7. BACKEND: Database
   - Add task to session
   - Commit transaction
   - Refresh to get generated ID
   - Load relationships (assignee, creator)

8. BACKEND: Response
   - Serialize Task model to Pydantic schema
   - Return 201 Created with JSON

9. FRONTEND: Response Handling
   - Parse response
   - Update local state
   - Show success toast
   - Redirect to task list

10. FRONTEND: UI Update
    - Task appears in list immediately
    - No page refresh needed (SPA)
```

---

## Database Schema

### Core Models

#### User
```python
class User(Base):
    id: UUID (PK)
    email: str (unique)
    password_hash: str
    full_name: str
    avatar_url: str
    role: UserRole (admin, manager, developer, viewer)
    team_id: UUID (FK → Team)
    is_active: bool
    timezone: str
    created_at: datetime
    updated_at: datetime
```

#### Team
```python
class Team(Base):
    id: UUID (PK)
    name: str
    plan: TeamPlan (free, pro, enterprise)
    settings: JSONB
    created_at: datetime

    # Relationships
    users: List[User]
    tasks: List[Task]
    meetings: List[Meeting]
```

#### Task
```python
class Task(Base):
    id: UUID (PK)
    title: str
    description: str
    status: TaskStatus (todo, in_progress, done, blocked)
    priority: TaskPriority (low, medium, high, urgent)
    due_date: datetime
    estimated_hours: float
    assignee_id: UUID (FK → User)
    created_by_id: UUID (FK → User)
    team_id: UUID (FK → Team)
    source_type: TaskSourceType (manual, meeting, email, chat)
    source_id: UUID (FK → source record)
    external_id: str (for integrations)
    created_at: datetime
    updated_at: datetime

    # Relationships
    assignee: User
    creator: User
```

#### Meeting
```python
class Meeting(Base):
    id: UUID (PK)
    title: str
    recording_url: str (S3/Cloudinary URL)
    transcript: Text
    summary: Text
    duration_minutes: int
    status: MeetingStatus (scheduled, processing, transcribed, completed, failed)
    scheduled_at: datetime
    team_id: UUID (FK → Team)
    created_by_id: UUID (FK → User)
    created_at: datetime

    # Relationships
    action_items: List[ActionItem]
```

#### ActionItem
```python
class ActionItem(Base):
    id: UUID (PK)
    meeting_id: UUID (FK → Meeting)
    description: str
    assignee_mentioned: str (extracted name)
    deadline_mentioned: datetime
    confidence_score: float (0.0 - 1.0)
    status: ActionItemStatus (pending, converted, rejected)
    task_id: UUID (FK → Task, if converted)
    created_at: datetime
```

#### Email
```python
class Email(Base):
    id: UUID (PK)
    gmail_message_id: str (unique, for deduplication)
    subject: str
    sender: str
    to: str
    body_preview: str
    body: Text
    received_at: datetime
    is_read: bool
    is_flagged: bool
    ai_classification: str
    ai_summary: str
    user_id: UUID (FK → User)
    integration_id: UUID (FK → Integration)
    created_at: datetime
```

#### Integration
```python
class Integration(Base):
    id: UUID (PK)
    user_id: UUID (FK → User)
    platform: IntegrationPlatform (gmail, slack, github)
    access_token: str (encrypted)
    refresh_token: str
    is_active: bool
    last_synced_at: datetime
    platform_metadata: JSONB
    created_at: datetime
```

### Relationships

```
Team (1) ──── (N) User
Team (1) ──── (N) Task
Team (1) ──── (N) Meeting

User (1) ──── (N) Task (as assignee)
User (1) ──── (N) Task (as creator)
User (1) ──── (N) Email
User (1) ──── (N) Integration

Meeting (1) ──── (N) ActionItem
ActionItem (1) ──── (1) Task (optional, if converted)

Integration (1) ──── (N) Email
```

---

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register new user account.

**Request:**
```json
{
  "email": "alice@example.com",
  "password": "password123",
  "full_name": "Alice Johnson",
  "team_id": null  // Optional, auto-creates team if null
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "alice@example.com",
  "full_name": "Alice Johnson",
  "team_id": "uuid",
  "created_at": "2024-02-12T10:00:00Z"
}
```

#### POST `/api/auth/login`
Login with credentials.

**Request:** (form-urlencoded)
```
username=alice@example.com
password=password123
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### POST `/api/auth/refresh`
Refresh access token.

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### GET `/api/auth/me`
Get current user info.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "alice@example.com",
  "full_name": "Alice Johnson",
  "role": "developer",
  "team_id": "uuid"
}
```

### Task Endpoints

#### GET `/api/tasks`
List tasks with filters.

**Query Params:**
- `status` (optional): todo, in_progress, done, blocked
- `priority` (optional): low, medium, high, urgent
- `assignee_id` (optional): UUID
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Fix login bug",
    "description": "Users can't login on mobile",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2024-02-15T00:00:00Z",
    "assignee": {
      "id": "uuid",
      "full_name": "Alice Johnson",
      "email": "alice@example.com"
    },
    "created_at": "2024-02-10T10:00:00Z"
  }
]
```

#### POST `/api/tasks`
Create new task.

**Request:**
```json
{
  "title": "Implement dark mode",
  "description": "Add dark mode toggle to settings",
  "status": "todo",
  "priority": "medium",
  "assignee_id": "uuid",
  "due_date": "2024-02-20T00:00:00Z",
  "estimated_hours": 8.0
}
```

**Response:** `201 Created` (same as GET single task)

#### PATCH `/api/tasks/{task_id}`
Update task (partial update).

**Request:**
```json
{
  "status": "done"
}
```

**Response:** Updated task object

#### DELETE `/api/tasks/{task_id}`
Delete task.

**Response:** `204 No Content`

### Meeting Endpoints

#### POST `/api/meetings/upload`
Upload meeting recording.

**Request:** (multipart/form-data)
```
file: <audio_file.mp3>
title: Weekly Sprint Planning
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Weekly Sprint Planning",
  "status": "processing",
  "message": "Meeting uploaded! Transcription starting..."
}
```

#### GET `/api/meetings`
List meetings.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Weekly Sprint Planning",
    "status": "completed",
    "duration_minutes": 45,
    "summary": "## KEY TOPICS\n...",
    "created_at": "2024-02-10T14:00:00Z",
    "action_items": [
      {
        "id": "uuid",
        "description": "Review API documentation",
        "assignee_mentioned": "John",
        "confidence_score": 0.95,
        "status": "pending"
      }
    ]
  }
]
```

#### GET `/api/meetings/{meeting_id}`
Get single meeting with full transcript.

#### POST `/api/meetings/{meeting_id}/retry`
Retry failed transcription.

#### POST `/api/meetings/{meeting_id}/action-items/{action_item_id}/convert`
Convert action item to task.

**Response:**
```json
{
  "task_id": "uuid",
  "message": "Action item converted to task successfully"
}
```

### Chat Endpoints

#### POST `/api/chat/query`
Ask AI assistant a question.

**Request:**
```json
{
  "message": "What tasks are due this week?"
}
```

**Response:**
```json
{
  "response": "You have 5 tasks due this week:\n1. Fix login bug (High, due Thu)\n2. Review docs (Medium, due Fri)\n...",
  "context_used": {
    "tasks": {...},
    "user": {...}
  },
  "suggested_actions": [
    {
      "action": "view_tasks",
      "label": "View all tasks",
      "url": "/dashboard/tasks"
    }
  ]
}
```

### Analytics Endpoints

#### GET `/api/analytics/workload?days=30`
Get workload analytics.

#### GET `/api/analytics/team-workload`
Get team distribution.

#### GET `/api/analytics/meeting-insights?days=30`
Get meeting metrics.

#### GET `/api/analytics/productivity-trend?days=14`
Get daily trend data.

---

## Frontend Architecture

### File Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx          # Sidebar + navigation
│   │   ├── page.tsx             # Dashboard home
│   │   ├── tasks/page.tsx
│   │   ├── meetings/
│   │   │   ├── page.tsx         # Meeting list
│   │   │   └── [id]/page.tsx    # Meeting detail
│   │   ├── chat/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── emails/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx               # Root layout
│   └── providers.tsx            # Context providers
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── auth-initializer.tsx     # Auto-login handler
├── lib/
│   ├── api.ts                   # Axios client + API methods
│   └── utils.ts                 # Utility functions
├── types/
│   └── index.ts                 # TypeScript interfaces
└── package.json
```

### State Management

Synkro uses **React Context + Local State** (no Redux):

```typescript
// Simple per-page state
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  taskApi.getTasks().then(response => {
    setTasks(response.data);
    setLoading(false);
  });
}, []);
```

For global state (user profile), a Context Provider could be added:
```typescript
const UserContext = createContext<User | null>(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      authApi.me().then(res => setUser(res.data));
    }
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
```

### API Client Pattern

```typescript
// lib/api.ts - Single axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000
});

// Automatic token injection
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token and retry
    }
    return Promise.reject(error);
  }
);

// Organized API methods
export const taskApi = {
  getTasks: (params) => api.get('/api/tasks', { params }),
  createTask: (data) => api.post('/api/tasks', data),
  updateTask: (id, data) => api.patch(`/api/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/api/tasks/${id}`)
};
```

### Component Patterns

#### Server Component (Default in Next.js 14)
```typescript
// Renders on server, can't use hooks
export default async function TasksPage() {
  // Can't call API here since it needs auth token from browser
  return <TasksList />;
}
```

#### Client Component
```typescript
'use client';  // Required for hooks

export default function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    taskApi.getTasks().then(res => setTasks(res.data));
  }, []);

  return (
    <div>
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
```

---

## Setup & Deployment

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repo-url>
cd synkro
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# - Database URL
# - Groq API key (free from https://console.groq.com/keys)
# - Gmail credentials (optional)
# - AWS S3 or Cloudinary (optional)

# Run database migrations (if using Alembic)
alembic upgrade head

# OR let SQLAlchemy auto-create tables on startup

# Run development server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000
API docs: http://localhost:8000/api/docs

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:3000

#### 4. Database Setup (PostgreSQL)

**Option A: Docker**
```bash
docker run -d \
  --name synkro-postgres \
  -e POSTGRES_DB=synkro \
  -e POSTGRES_USER=synkro \
  -e POSTGRES_PASSWORD=synkro123 \
  -p 5432:5432 \
  postgres:15
```

**Option B: Local Install**
```bash
# Install PostgreSQL
# Create database
createdb synkro
```

Update .env:
```
DATABASE_URL=postgresql+asyncpg://synkro:synkro123@localhost:5432/synkro
```

#### 5. Redis Setup (Optional - for background jobs)

```bash
docker run -d --name synkro-redis -p 6379:6379 redis:7
```

Update .env:
```
REDIS_URL=redis://localhost:6379/0
```

### Docker Compose Setup

Use the provided `docker-compose.yml`:

```bash
# Start all services
docker-compose up -d

# Services included:
# - PostgreSQL (port 5432)
# - Redis (port 6379)
# - Backend (port 8000)
# - Frontend (port 3000)
```

### Production Deployment

#### Backend (FastAPI)

1. **Use production WSGI server**:
```bash
# Install gunicorn
pip install gunicorn uvicorn[standard]

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

2. **Set production environment variables**:
```bash
ENVIRONMENT=production
SECRET_KEY=<strong-random-key-32-chars>
DATABASE_URL=<production-postgres-url>
ALLOWED_ORIGINS=["https://yourdomain.com"]
```

3. **Enable HTTPS** (use Nginx reverse proxy or cloud load balancer)

#### Frontend (Next.js)

1. **Build for production**:
```bash
npm run build
```

2. **Run production server**:
```bash
npm start
```

3. **Deploy to Vercel** (recommended):
```bash
vercel deploy --prod
```

Set environment variable in Vercel:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### Database Migrations

Use Alembic for database versioning:
```bash
# Generate migration
alembic revision --autogenerate -m "Add email table"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Environment Variables Reference

#### Backend (.env)

```bash
# Application
APP_NAME=Synkro
APP_VERSION=1.0.0
ENVIRONMENT=development  # development | production

# Security
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/synkro

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Services (get FREE key at https://console.groq.com/keys)
GROQ_API_KEY=gsk_xxx  # FREE - Preferred
OPENAI_API_KEY=sk-xxx  # Paid fallback

# Storage (choose one)
# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=us-east-1

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email Integration
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Testing

### Seed Demo Data

Populate database with test data:

```bash
cd backend
python -m scripts.seed
```

This creates:
- 4 demo users (alice, bob, charlie, diana)
- 1 shared team
- Sample tasks
- Sample meetings (no transcripts, just metadata)

Demo credentials:
- Email: `alice@synkro.dev`
- Password: `password123`

### Testing Meeting Transcription

1. **Get a Groq API key** (free):
   - Visit: https://console.groq.com/keys
   - Create account and generate API key
   - Add to `.env`: `GROQ_API_KEY=gsk_xxx`

2. **Upload a test audio file**:
   - Go to http://localhost:3000/dashboard/meetings
   - Click "Upload Meeting"
   - Select any MP3/WAV file (sample meeting audio)
   - Enter title and submit

3. **Watch the processing**:
   - Meeting status: PROCESSING
   - Backend transcribes with Whisper API (~30 sec for 5min audio)
   - Status updates: TRANSCRIBED → COMPLETED
   - Refresh page to see transcript and summary

4. **Test action item conversion**:
   - Click meeting to view details
   - Find an action item
   - Click "Convert to Task"
   - Go to Tasks page - new task should appear

### API Testing

Use the interactive API docs:
- Open: http://localhost:8000/api/docs
- Click "Authorize" and enter JWT token
- Test all endpoints interactively

Or use curl:
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=alice@synkro.dev&password=password123"

# Get tasks (with token)
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <token>"
```

---

## Troubleshooting

### Common Issues

**Issue: "No AI API key configured"**
- Solution: Add `GROQ_API_KEY` to backend/.env
- Get free key: https://console.groq.com/keys

**Issue: Meeting transcription fails**
- Check file format (MP3, WAV, M4A only)
- Check file size (max 100MB)
- Check Groq API key is valid
- Check backend logs for errors

**Issue: 401 Unauthorized on all requests**
- Check localStorage has `access_token`
- Check token hasn't expired (30 min)
- Try logging out and back in

**Issue: Database connection error**
- Check PostgreSQL is running: `docker ps` or `systemctl status postgresql`
- Check DATABASE_URL in .env matches your setup
- Check database exists: `psql -l`

**Issue: CORS errors in browser**
- Check `ALLOWED_ORIGINS` in backend/.env includes frontend URL
- Check frontend is running on correct port (3000)
- Check backend CORS middleware is enabled

**Issue: Gmail sync fails**
- Check 2FA is enabled on Gmail account
- Check App Password is generated (not regular password)
- Check GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env
- Check IMAP is enabled in Gmail settings

---

## Future Enhancements

### Planned Features
1. **Slack Integration**:
   - OAuth authentication
   - Sync messages from channels
   - Extract tasks from Slack threads
   - Post updates to Slack

2. **Real-time Notifications**:
   - WebSocket connection
   - Push notifications for new action items
   - Live meeting status updates

3. **Calendar Integration**:
   - Google Calendar sync
   - Automatically schedule meetings
   - Show tasks on calendar view

4. **Advanced Analytics**:
   - Burndown charts
   - Team velocity tracking
   - Time tracking integration

5. **Mobile App**:
   - React Native app
   - Push notifications
   - Audio recording in-app

6. **Collaborative Features**:
   - Real-time task updates
   - Comments on tasks/meetings
   - @mentions and notifications

### Scalability Improvements
1. **Move to Celery for background jobs**:
   - Currently using FastAPI BackgroundTasks
   - Celery + Redis for distributed job queue
   - Better for production scale

2. **Add caching layer**:
   - Redis cache for frequently accessed data
   - Cache analytics queries
   - Reduce database load

3. **Implement rate limiting**:
   - Protect AI API endpoints
   - Prevent abuse
   - Use Redis for rate limit tracking

4. **Add search functionality**:
   - Elasticsearch for full-text search
   - Search across tasks, meetings, emails
   - Autocomplete suggestions

---

## Conclusion

Synkro is a comprehensive workspace orchestration system that demonstrates:
- **Modern full-stack development** (FastAPI + Next.js)
- **AI integration** (Whisper, Llama 3.3)
- **Real-world SaaS patterns** (multi-tenancy, JWT auth, file storage)
- **Complex workflows** (async processing, background jobs)
- **Production-ready architecture** (Docker, environment config)

The system successfully solves real problems for software teams by:
1. Automating meeting documentation
2. Extracting actionable tasks from conversations
3. Unifying communication channels
4. Providing intelligent insights
5. Reducing context switching

All powered by **free AI services** (Groq) with professional-grade results.

---

**Created**: 2024-02-12
**Version**: 1.0.0
**Author**: Synkro Development Team
**License**: Academic/Educational Use
