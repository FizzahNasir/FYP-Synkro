# Synkro - AI-Powered Workspace Orchestration System

**Final Year Project (FYP)** demonstrating Human-Intent Oriented Computing (HIOC) and Autonomous Coordination Intelligence (ACI) principles.

Synkro eliminates the "coordination tax" for software development teams (5-50 people) by automatically extracting tasks, transcribing meetings, managing workflows, and providing an AI assistant for productivity queries.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Status](#development-status)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Features

### Phase 1: Core Foundation ✅ COMPLETED
- ✅ **User Authentication**: JWT-based auth with access/refresh tokens
- ✅ **Task Management**: Complete CRUD operations with filtering, pagination, and statistics
- ✅ **Team Management**: Multi-tenant architecture with team isolation
- ✅ **Database Models**: Full schema for users, teams, tasks, meetings, action items, integrations
- ✅ **API Documentation**: Auto-generated OpenAPI docs at `/api/docs`
- ✅ **Docker Setup**: Complete containerization with PostgreSQL and Redis

### Phase 2: AI Integration ✅ COMPLETED
- ✅ **Meeting transcription** using OpenAI Whisper API
- ✅ **AI-powered meeting summarization** with action item extraction
- ✅ **Natural language intent classification** for messages
- ✅ **Entity extraction** for automatic task creation
- ✅ **File upload and storage** (S3 or Cloudinary)
- ✅ **Background job processing** with Celery
- ✅ **AI Chat Interface** for natural language productivity queries

### Phase 3: Frontend Application 📋 PLANNED
- ⏳ Next.js 14 with App Router and TypeScript
- ⏳ Modern UI with Tailwind CSS and shadcn/ui
- ⏳ Authentication pages (login/register)
- ⏳ Dashboard with task statistics and team insights
- ⏳ Task management (list view and Kanban board)
- ⏳ Meeting management with upload and playback
- ⏳ AI chat interface for productivity queries

### Phase 4: Integrations 📋 PLANNED
- ⏳ Gmail OAuth integration and email sync
- ⏳ Slack integration for message processing
- ⏳ Unified inbox for all messages
- ⏳ Automatic action item detection

### Phase 5: Polish 📋 PLANNED
- ⏳ Workload analytics and team capacity visualization
- ⏳ Email notifications
- ⏳ Responsive design for mobile
- ⏳ Error handling and loading states
- ⏳ Comprehensive testing

## Technology Stack

### Backend
- **Framework**: FastAPI 0.109.0 (Python 3.11+)
- **Database**: PostgreSQL 15 with async SQLAlchemy 2.0
- **Migrations**: Alembic
- **Cache**: Redis 7
- **Task Queue**: Celery + Redis
- **Authentication**: JWT with PyJWT
- **File Storage**: AWS S3 / Cloudinary
- **AI/ML**: OpenAI GPT-4, GPT-3.5-turbo, Whisper API

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod

## Project Structure

```
synkro/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Database setup
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── team.py
│   │   │   ├── task.py
│   │   │   ├── meeting.py
│   │   │   ├── action_item.py
│   │   │   ├── integration.py
│   │   │   └── message.py
│   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── meeting.py
│   │   ├── routers/           # API endpoints
│   │   │   ├── auth.py        # Authentication
│   │   │   └── tasks.py       # Task management
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   │   └── security.py    # JWT & password hashing
│   │   └── tasks/             # Celery tasks
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   └── alembic.ini
│
├── frontend/                   # Next.js application (TO BE CREATED)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── hooks/
│
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)
- Docker & Docker Compose (recommended)
- PostgreSQL 15 (if not using Docker)
- Redis 7 (if not using Docker)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   cd synkro
   ```

2. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your credentials (especially OPENAI_API_KEY)
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Backend API on port 8000
   - Celery worker for background tasks

4. **Run database migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Access the application**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/api/docs
   - Health Check: http://localhost:8000/health

### Option 2: Local Development

1. **Set up backend**
   ```bash
   cd backend

   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your credentials

   # Run migrations
   alembic upgrade head

   # Start the server
   uvicorn app.main:app --reload
   ```

2. **Set up frontend** (when available)
   ```bash
   cd frontend
   npm install
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   npm run dev
   ```

## Development Status

### ✅ Phase 1: Backend Foundation (COMPLETED)

**What's been built:**

1. **Complete Database Architecture**
   - 7 interconnected models with proper relationships
   - User & Team models with role-based access
   - Task model with status, priority, and source tracking
   - Meeting model for transcription and summaries
   - ActionItem model for extracted tasks
   - Integration model for OAuth connections
   - Message model for email/Slack sync

2. **Authentication System**
   - User registration with email validation
   - Secure login with bcrypt password hashing
   - JWT access tokens (30 min expiry)
   - JWT refresh tokens (7 day expiry)
   - Token refresh endpoint
   - Current user endpoint with team info

3. **Task Management API**
   - Create, read, update, delete tasks
   - Advanced filtering (status, priority, assignee, dates)
   - Pagination support
   - Team isolation (users only see their team's tasks)
   - Task statistics endpoint (counts by status, overdue, completion rate)
   - Full relationship loading (assignee and creator details)

4. **Infrastructure**
   - Async SQLAlchemy with PostgreSQL
   - Alembic migrations ready
   - Redis for caching and job queue
   - Docker Compose for all services
   - CORS middleware configured
   - Auto-generated API documentation
   - Health check endpoints

**API Endpoints Available:**

```
# Authentication
POST   /api/auth/register      - Create new user account
POST   /api/auth/login         - Login and get tokens
POST   /api/auth/refresh       - Refresh access token
GET    /api/auth/me            - Get current user info
POST   /api/auth/logout        - Logout (client-side)

# Task Management
GET    /api/tasks              - List tasks with filters
POST   /api/tasks              - Create new task
GET    /api/tasks/stats        - Get task statistics
GET    /api/tasks/{id}         - Get task details
PATCH  /api/tasks/{id}         - Update task
DELETE /api/tasks/{id}         - Delete task

# Meeting Management
POST   /api/meetings/upload    - Upload meeting recording
GET    /api/meetings           - List meetings with filters
GET    /api/meetings/{id}      - Get meeting details
PATCH  /api/meetings/{id}      - Update meeting
DELETE /api/meetings/{id}      - Delete meeting
POST   /api/meetings/{id}/action-items/{item_id}/convert - Convert action item to task
POST   /api/meetings/{id}/action-items/{item_id}/reject  - Reject action item

# AI Chat
POST   /api/chat/query         - Natural language query about tasks/meetings

# System
GET    /                       - API info
GET    /health                 - Health check
GET    /api/status             - Feature availability
GET    /api/docs               - Interactive API docs
```

### ✅ Phase 2: AI Integration (COMPLETED)

**What's been built:**

1. **AI Services (OpenAI Integration)**
   - **Meeting Transcription**: Whisper API integration with timestamp support
   - **Meeting Summarization**: GPT-4 powered summaries with structured sections
   - **Intent Classification**: GPT-3.5-turbo for message intent detection
   - **Entity Extraction**: GPT-4 function calling for task details extraction
   - **AI Chat**: Natural language interface for productivity queries

2. **File Storage System**
   - Dual support for AWS S3 and Cloudinary
   - Automatic provider selection based on configuration
   - File upload/download with presigned URLs
   - File deletion and existence checking

3. **Meeting Management**
   - Upload audio files (MP3, WAV, M4A, WebM, MP4, up to 200MB)
   - Automatic transcription pipeline
   - AI-powered summary generation
   - Action item extraction with confidence scores
   - Convert action items to tasks
   - Full CRUD operations for meetings

4. **Background Job Processing**
   - Celery setup with Redis broker
   - Asynchronous meeting transcription
   - Asynchronous meeting summarization
   - Message intent processing tasks
   - Task queuing and result tracking

5. **AI Chat Interface**
   - Natural language queries about tasks
   - Context-aware responses
   - Team workload inquiries
   - Meeting summary searches
   - Suggested actions based on context

**Key AI Features:**
- Automatic task extraction from meeting transcripts
- Confidence scoring for AI-generated action items
- Smart assignee detection from mentions
- Deadline extraction from natural language
- Priority inference from urgency indicators

### 🚀 Next Steps

To continue building Synkro, the next priority is:

**Phase 3: Frontend Application**
   - Initialize Next.js 14 with TypeScript
   - Create authentication pages (login/register)
   - Build dashboard layout with sidebar navigation
   - Implement task management UI (list + Kanban)
   - Create meeting upload and viewing interface
   - Build AI chat UI

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Environment Variables

Key environment variables (see [backend/.env.example](backend/.env.example) for full list):

```env
# Required
SECRET_KEY=your-secret-key-min-32-characters
DATABASE_URL=postgresql+asyncpg://synkro:synkro123@localhost:5432/synkro
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your-openai-api-key

# Optional
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=synkro-recordings
GOOGLE_CLIENT_ID=for-gmail-integration
SLACK_CLIENT_ID=for-slack-integration
```

## Testing the API

### 1. Register a new user
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "full_name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=test@example.com&password=securepass123'
```

Save the `access_token` from the response.

### 3. Create a task
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Implement login page",
    "description": "Create the user login interface",
    "priority": "high",
    "status": "todo"
  }'
```

### 4. Get tasks
```bash
curl -X GET "http://localhost:8000/api/tasks?status=todo&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get task statistics
```bash
curl -X GET http://localhost:8000/api/tasks/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Contributing

This is a Final Year Project. Contributions, suggestions, and feedback are welcome!

## License

This project is for educational purposes as part of a Final Year Project.

## Contact

For questions or feedback about this FYP, please create an issue in the repository.

---

**Status**: Phase 1 & 2 Complete ✅ | Phase 3 (Frontend) In Progress 🚧

Built with ❤️ for Human-Intent Oriented Computing
