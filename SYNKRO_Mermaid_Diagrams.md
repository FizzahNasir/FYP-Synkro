# SYNKRO — Diagram Source Codes (Mermaid)

---

## Section 1 — Overall Use Case Diagram (Figure 1)

> Insert at: Chapter 2, Section 2.6

flowchart LR

%% =========================
%% ACTORS
%% =========================
subgraph A["👥 ACTORS"]
direction TB
A1["Admin"]
A2["Project Manager"]
A3["Team Lead"]
A4["Developer"]
A5["Intern"]
end

%% =========================
%% MAIN SYSTEM
%% =========================
subgraph S["🧠 SYNKRO WORKSPACE ORCHESTRATION PLATFORM"]
direction TB

%% ---------- AUTH ----------
subgraph S1["🔐 AUTHENTICATION"]
direction TB
UC1["Register Team"]
UC2["Login / JWT Auth"]
UC3["Reset Password"]
UC4["Invite Members"]
UC5["Manage Roles"]
end

%% ---------- MEETINGS ----------
subgraph S2["🎙️ AI MEETING SYSTEM"]
direction TB
UC6["Upload Meeting"]
UC7["AI Transcription"]
UC8["Speaker Diarization"]
UC9["Meeting Analysis"]
UC10["View Transcript & Summary"]
UC11["Extract Action Items"]
UC12["Convert Actions → Tasks"]
end

%% ---------- TASKS ----------
subgraph S3["📋 TASK MANAGEMENT"]
direction TB
UC13["Create Tasks"]
UC14["Edit / Delete Tasks"]
UC15["Assign Tasks"]
UC16["Track / Filter Tasks"]
UC17["Jira Sync"]
UC18["Calendar Sync"]
end

%% ---------- INTEGRATIONS ----------
subgraph S4["🔌 INTEGRATIONS"]
direction TB
UC19["Connect Gmail"]
UC20["Connect Slack"]
UC21["Connect Jira"]
UC22["Connect Google Calendar"]
UC23["Sync Emails & Messages"]
end

%% ---------- AI ----------
subgraph S5["🤖 AI & ANALYTICS"]
direction TB
UC24["AI Chat Assistant"]
UC25["Analytics Dashboard"]
UC26["Direct Messaging"]
UC27["Notifications"]
UC28["Productivity Insights"]
end

end

%% =========================
%% ADMIN
%% =========================
A1 --> UC1
A1 --> UC2
A1 --> UC4
A1 --> UC5
A1 --> UC6
A1 --> UC12
A1 --> UC13
A1 --> UC17
A1 --> UC19
A1 --> UC20
A1 --> UC21
A1 --> UC22
A1 --> UC24
A1 --> UC25
A1 --> UC26
A1 --> UC27

%% =========================
%% PM
%% =========================
A2 --> UC2
A2 --> UC6
A2 --> UC10
A2 --> UC11
A2 --> UC12
A2 --> UC13
A2 --> UC15
A2 --> UC16
A2 --> UC17
A2 --> UC24
A2 --> UC25
A2 --> UC26

%% =========================
%% TEAM LEAD
%% =========================
A3 --> UC2
A3 --> UC10
A3 --> UC11
A3 --> UC12
A3 --> UC13
A3 --> UC15
A3 --> UC16
A3 --> UC24
A3 --> UC25

%% =========================
%% DEVELOPER
%% =========================
A4 --> UC2
A4 --> UC3
A4 --> UC10
A4 --> UC13
A4 --> UC14
A4 --> UC16
A4 --> UC24
A4 --> UC26

%% =========================
%% INTERN
%% =========================
A5 --> UC2
A5 --> UC3
A5 --> UC10
A5 --> UC13
A5 --> UC24

%% =========================
%% USE CASE RELATIONSHIPS
%% =========================
UC6 --> UC7
UC7 --> UC8
UC8 --> UC9
UC9 --> UC10
UC10 --> UC11
UC11 --> UC12

UC12 --> UC13
UC13 --> UC15
UC15 --> UC16

UC17 -.-> UC16
UC18 -.-> UC13
UC19 -.-> UC13
UC20 -.-> UC26
UC21 -.-> UC17
UC22 -.-> UC6

UC24 -.-> UC25
UC27 -.-> UC26
UC28 -.-> UC25

![Figure 1 — Overall Use Case Diagram](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_01_Overall_Use_Case_Diagram.png)

---

## Section 2 — System Sequence Diagrams (SSDs) for Each Use Case

### Figure 13 — SSD: UC-1 Register User Account

> Insert at: Chapter 2, Section 2.5.1 (after Table 2.1)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL

    U->>F: Open Register Page
    F-->>U: Display Registration Form

    U->>F: Enter Name, Email, Password, Role
    U->>F: Click Register

    F->>F: Validate Form Input

    F->>B: POST /api/auth/register

    B->>DB: Check if email already exists
    DB-->>B: No existing user found

    B->>B: Hash password using bcrypt

    alt User role is Admin
        B->>DB: Create new team
        DB-->>B: Return team_id

    else User role is not Admin
        B->>DB: Fetch existing admin team_id
        DB-->>B: Return team_id
    end

    B->>DB: Create user account
    DB-->>B: User record created

    B->>B: Generate JWT access token
    B->>B: Generate refresh token

    B-->>F: Return tokens and user data

    F->>F: Store tokens in localStorage
    F->>F: Update Zustand auth store

    F-->>U: Redirect to Dashboard
![Figure 13 — SSD: UC-1 Register User Account](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_13_SSD_UC-1_Register_User_Account.png)

---

### Figure 14 — SSD: UC-2 Login to System

> Insert at: Chapter 2, Section 2.5.2 (after Table 2.2)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL

    U->>F: Open Login Page
    F-->>U: Display Login Form

    U->>F: Enter Email and Password
    U->>F: Click Sign In

    F->>B: POST /api/auth/login

    B->>DB: Fetch user by email
    DB-->>B: User record with password hash

    B->>B: Verify password using bcrypt

    alt Credentials valid and account active

        B->>B: Generate JWT access token
        B->>B: Generate refresh token

        B-->>F: Return tokens and user data

        F->>F: Store tokens in localStorage
        F->>F: Update authentication state

        F-->>U: Redirect to Dashboard

    else Invalid credentials

        B-->>F: Return 401 Unauthorized
        F-->>U: Display Invalid Credentials Error

    else Account inactive

        B-->>F: Return 403 Forbidden
        F-->>U: Display Account Inactive Error

    end

![Figure 14 — SSD: UC-2 Login to System](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_14_SSD_UC-2_Login_to_System.png)

---

### Figure 15 — SSD: UC-3 Reset Password

> Insert at: Chapter 2, Section 2.5.3 (after Table 2.3)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL

    U->>F: Click Forgot Password
    F-->>U: Display Email Input Form

    U->>F: Enter Email Address
    U->>F: Submit Request

    F->>B: POST /api/auth/forgot-password

    B->>DB: Find user by email
    DB-->>B: User record found

    B->>B: Generate password reset token
    B->>B: Hash token and set expiration time

    B->>DB: Save reset token and expiry
    DB-->>B: Update successful

    B-->>F: Return success response

    F-->>U: Display Reset Token Input

    U->>F: Enter Reset Token
    U->>F: Submit Token

    F-->>U: Display New Password Form

    U->>F: Enter New Password
    U->>F: Submit Password Reset

    F->>B: POST /api/auth/reset-password

    B->>DB: Validate token and expiration
    DB-->>B: Matching user record

    B->>B: Hash new password

    B->>DB: Update password and clear reset token
    DB-->>B: Password updated successfully

    B-->>F: Return password reset success

    F-->>U: Redirect to Login Page

![Figure 15 — SSD: UC-3 Reset Password](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_15_SSD_UC-3_Reset_Password.png)

---

### Figure 16 — SSD: UC-4 Upload Meeting Recording

> Insert at: Chapter 2, Section 2.5.4 (after Table 2.4)
sequenceDiagram
    actor A as Admin
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant S as File Storage
    participant BG as Background Worker
    participant DB as PostgreSQL

    A->>F: Open Meetings Page
    A->>F: Click Upload Meeting

    F-->>A: Display Upload Form

    A->>F: Enter Meeting Title
    A->>F: Select Audio or Video File

    F->>F: Validate file type and file size

    F->>B: POST /api/meetings/upload

    B->>B: Validate uploaded file

    B->>S: Store recording file
    S-->>B: Return recording URL

    B->>DB: Create meeting record with Processing status
    DB-->>B: Meeting record created

    B->>BG: Launch background AI processing task

    B-->>F: Return meeting ID and processing status

    F->>F: Start polling meeting status every 5 seconds

    F-->>A: Display Processing Indicator

    Note over BG: AI meeting pipeline executes asynchronously

    BG->>DB: Update meeting status to Completed

    F->>B: GET /api/meetings/{meeting_id}

    B->>DB: Fetch updated meeting status
    DB-->>B: Completed meeting record

    B-->>F: Return completed meeting details

    F-->>A: Display Completed Badge
    F-->>A: Enable Meeting Details View

![Figure 16 — SSD: UC-4 Upload Meeting Recording](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_16_SSD_UC-4_Upload_Meeting_Recording.png)

---

### Figure 17 — SSD: UC-5 AI Meeting Processing

> Insert at: Chapter 2, Section 2.5.5 (after Table 2.5)

sequenceDiagram
    participant BG as Background Worker
    participant S as File Storage
    participant Groq as Groq API
    participant Diar as Diarization Service
    participant DB as PostgreSQL

    BG->>S: Retrieve meeting recording
    S-->>BG: Return audio data

    rect rgb(230,240,255)
        Note over BG,Groq: Stage 1 - Audio Transcription

        BG->>Groq: Transcribe audio using Whisper Large V3 Turbo
        Groq-->>BG: Return transcript and timestamped segments
    end

    rect rgb(230,255,230)
        Note over BG,Diar: Stage 2 - Speaker Diarization

        BG->>Diar: Perform speaker diarization

        alt pyannote.audio available
            Diar->>Diar: Run local pyannote model

        else AssemblyAI available
            Diar->>Diar: Call AssemblyAI cloud API

        else LLM fallback available
            Diar->>Groq: Infer speakers using Llama 3.3 70B
            Groq-->>Diar: Return inferred speaker mapping
        end

        Diar-->>BG: Return labeled speaker segments
    end

    rect rgb(255,245,220)
        Note over BG,Groq: Stage 3 - Context Analysis

        BG->>Groq: Analyze diarized transcript

        Note right of Groq: Extract action items,\nclassify utterances,\nidentify speakers,\nand generate statistics

        Groq-->>BG: Return enriched meeting insights
    end

    rect rgb(255,230,230)
        Note over BG,Groq: Stage 4 - Meeting Summarization

        BG->>Groq: Generate speaker-aware summary
        Groq-->>BG: Return summary text
    end

    BG->>DB: Update meeting transcript and summary

    BG->>DB: Store action items with confidence score >= 0.6

    DB-->>BG: Meeting processing completed

![Figure 17 — SSD: UC-5 AI Meeting Processing](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_17_SSD_UC-5_AI_Meeting_Processing.png)

---

### Figure 18 — SSD: UC-6 View Meeting Details

> Insert at: Chapter 2, Section 2.5.6 (after Table 2.6)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL

    U->>F: Open Meetings Dashboard

    F->>B: GET /api/meetings

    B->>DB: Fetch meetings by team ordered by creation date
    DB-->>B: Return meeting list

    B-->>F: Return meeting summaries with status

    F-->>U: Display meeting cards

    U->>F: Select completed meeting

    F->>B: GET /api/meetings/{meeting_id}

    B->>DB: Fetch meeting details and related action items
    DB-->>B: Return full meeting record

    B-->>F: Return meeting detail payload

    F->>F: Parse diarized transcript data
    F->>F: Assign colors to speaker labels

    F-->>U: Display summary tab
    F-->>U: Display transcript tab
    F-->>U: Display action items tab

![Figure 18 — SSD: UC-6 View Meeting Details](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_18_SSD_UC-6_View_Meeting_Details.png)

---

### Figure 19 — SSD: UC-7 Assign Action Items to Tasks

> Insert at: Chapter 2, Section 2.5.7 (after Table 2.7)

sequenceDiagram
    actor A as Admin or Project Manager
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL

    A->>F: Open Action Items tab and click "Assign Tasks"

    F->>B: GET /api/meetings/{meeting_id}/pending-assignments

    B->>DB: Fetch pending action items for meeting
    B->>DB: Fetch team members for assignment

    B->>B: Match speaker labels and assignee mentions to users

    B-->>F: Return action items with suggested assignees

    F-->>A: Display assignment dialog with pre-filled suggestions

    A->>F: Review assignments and confirm

    F->>B: POST /api/meetings/{meeting_id}/bulk-assign

    loop For each selected action item
        B->>DB: Create task from action item
        B->>DB: Update action item status to converted
    end

    DB-->>B: Tasks created successfully

    B-->>F: Return created task list

    F->>F: Refresh meetings and tasks cache

    F-->>A: Display success notification
![Figure 19 — SSD: UC-7 Assign Action Items to Tasks](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_19_SSD_UC-7_Assign_Action_Items_to_Tasks.png)

---

### Figure 20 — SSD: UC-8 Create Task

> Insert at: Chapter 2, Section 2.5.8 (after Table 2.8)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL

    U->>F: Open Tasks page and click "New Task"

    F-->>U: Display Create Task dialog

    U->>F: Enter task details and submit form

    F->>F: Validate required fields

    F->>B: POST /api/tasks

    B->>B: Set source_type = manual
    B->>B: Resolve current user's team context

    B->>DB: Verify assignee belongs to same team
    DB-->>B: Assignee validated

    B->>DB: Insert new task record
    DB-->>B: Return created task

    B-->>F: 201 Created {task}

    F->>F: Refresh tasks and statistics cache

    F-->>U: Display created task in task list

![Figure 20 — SSD: UC-8 Create Task](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_20_SSD_UC-8_Create_Task.png)

---

### Figure 21 — SSD: UC-9 Manage Tasks

> Insert at: Chapter 2, Section 2.5.9 (after Table 2.9)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL

    U->>F: Open task edit dialog

    F-->>U: Display task details form

    U->>F: Modify status, priority, or assignee

    F->>B: PATCH /api/tasks/{task_id}

    B->>DB: Fetch task by id and team_id
    DB-->>B: Task record

    B->>B: Validate user permissions

    B->>DB: Update task fields
    DB-->>B: Updated task record

    B-->>F: 200 OK {task}

    F->>F: Refresh tasks cache

    F-->>U: Display updated task information

    note over U,DB: Delete Task Flow

    U->>F: Click delete button and confirm

    F->>B: DELETE /api/tasks/{task_id}

    B->>DB: Delete task by id and team_id
    DB-->>B: Task deleted

    B-->>F: 200 OK

    F->>F: Refresh tasks and statistics cache

    F-->>U: Remove task from task list
![Figure 21 — SSD: UC-9 Manage Tasks](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_21_SSD_UC-9_Manage_Tasks.png)

---

### Figure 22 — SSD: UC-10 Connect Gmail Integration

> Insert at: Chapter 2, Section 2.5.10 (after Table 2.10)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant IMAP as Gmail IMAP Server
    participant DB as PostgreSQL

    U->>F: Open Settings → Gmail Integration

    F-->>U: Display Gmail connection form

    U->>F: Enter email and App Password

    F->>B: POST /api/integrations/gmail/connect

    B->>IMAP: Authenticate via IMAP4_SSL

    IMAP-->>B: Authentication successful

    B->>B: Encrypt App Password using Fernet

    B->>DB: Create Gmail integration record
    DB-->>B: Integration stored

    B->>IMAP: Fetch recent emails

    loop For each email message
        IMAP-->>B: Email content and metadata
        B->>DB: Store email if not already synced
    end

    DB-->>B: Email sync completed

    B-->>F: 200 OK {synced_count}

    F-->>U: Display Gmail connected success message
![Figure 22 — SSD: UC-10 Connect Gmail Integration](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_22_SSD_UC-10_Connect_Gmail_Integration.png)

---

### Figure 23 — SSD: UC-11 Connect Slack Integration

> Insert at: Chapter 2, Section 2.5.11 (after Table 2.11)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant Slack as Slack OAuth Server
    participant DB as PostgreSQL

    U->>F: Open Settings → Slack Integration

    F->>B: GET /api/integrations/slack/start

    B->>B: Generate secure OAuth state token

    B-->>F: Return Slack authorization URL

    F-->>U: Redirect user to Slack consent screen

    U->>Slack: Approve requested permissions

    Slack-->>B: OAuth callback with code and state

    B->>B: Validate OAuth state token

    B->>Slack: Exchange authorization code for access tokens

    Slack-->>B: Return bot token, user token, and workspace info

    B->>B: Encrypt Slack tokens using Fernet

    B->>DB: Store Slack integration and workspace metadata
    DB-->>B: Integration saved

    B->>Slack: Verify authentication using auth.test()

    Slack-->>B: Authentication verified

    B-->>F: Redirect to settings page with success status

    F-->>U: Display Slack connected confirmation

![Figure 23 — SSD: UC-11 Connect Slack Integration](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_23_SSD_UC-11_Connect_Slack_Integration.png)

---

### Figure 24 — SSD: UC-12 Connect Jira Integration

> Insert at: Chapter 2, Section 2.5.12 (after Table 2.12)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant Jira as Jira Cloud REST API
    participant DB as PostgreSQL

    U->>F: Open Settings → Jira Integration

    F-->>U: Display Jira connection form

    U->>F: Enter domain, email, and API token

    F->>B: POST /api/integrations/jira/connect

    B->>Jira: Validate credentials using /rest/api/3/myself

    Jira-->>B: Return authenticated user details

    B->>B: Encrypt Jira API token using Fernet

    B->>DB: Store Jira integration and account metadata
    DB-->>B: Integration saved

    B->>Jira: Fetch available Jira projects

    Jira-->>B: Return project list

    B-->>F: 200 OK {connected, projects}

    F-->>U: Display Jira connected status and project selector

![Figure 24 — SSD: UC-12 Connect Jira Integration](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_24_SSD_UC-12_Connect_Jira_Integration.png)

---

### Figure 25 — SSD: UC-13 Connect Google Calendar Integration

> Insert at: Chapter 2, Section 2.5.13 (after Table 2.13)

sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant Google as Google Calendar API
    participant DB as PostgreSQL

    U->>F: Open Settings → Google Calendar Integration

    F->>B: GET /api/integrations/gcal/start

    B->>B: Generate Google OAuth2 authorization URL

    B-->>F: Return authorization URL

    F-->>U: Redirect user to Google consent screen

    U->>Google: Approve calendar access permissions

    Google-->>B: OAuth callback with authorization code

    B->>Google: Exchange code for access and refresh tokens

    Google-->>B: Return tokens and expiry data

    B->>B: Encrypt Google tokens using Fernet

    B->>DB: Store Google Calendar integration metadata
    DB-->>B: Integration saved

    B-->>F: Redirect to settings page with success status

    F-->>U: Display Google Calendar connected message

    note over F,DB: Automatic Task ↔ Calendar Sync Flow

    F->>B: POST /api/tasks with due_date

    B->>DB: Fetch calendar preferences for current user
    DB-->>B: auto_sync_tasks = true

    B->>Google: Create calendar event for task

    Google-->>B: Return calendar event ID

    B->>DB: Update task with calendar_event_id

    DB-->>B: Task updated successfully

    B-->>F: Return synced task response

    F-->>U: Display task with calendar sync indicator

![Figure 25 — SSD: UC-13 Connect Google Calendar Integration](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_25_SSD_UC-13_Connect_Google_Calendar_Integration.png)

---

### Figure 26 — SSD: UC-14 AI Natural Language Chat

> Insert at: Chapter 2, Section 2.5.14 (after Table 2.14)

sequenceDiagram
    actor U as User
    participant F as Chat Page (Next.js)
    participant B as Chat Router (FastAPI)
    participant LLM as AI Service
    participant Groq as Groq API
    participant DB as PostgreSQL

    U->>F: Open AI Chat and submit query

    F->>B: POST /api/chat/query

    B->>B: Validate JWT and resolve current user context

    par Fetch contextual data
        B->>DB: Fetch recent tasks
        DB-->>B: tasks[]
    and
        B->>DB: Fetch recent meetings
        DB-->>B: meetings[]
    and
        B->>DB: Fetch team members
        DB-->>B: users[]
    and
        B->>DB: Fetch recent emails
        DB-->>B: emails[]
    end

    B->>B: Serialize context into compact prompt format

    B->>LLM: Generate AI response with context

    LLM->>Groq: Chat completion request (Llama 3.3 70B)

    Groq-->>LLM: Return answer and suggested actions

    LLM-->>B: Structured AI response

    B-->>F: 200 OK {response, sources, actions}

    F->>F: Render AI message bubble
    F->>F: Display context source chips
    F->>F: Render suggested action buttons

    F-->>U: Display AI response

![Figure 26 — SSD: UC-14 AI Natural Language Chat](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_26_SSD_UC-14_AI_Chat_Query.png)

---

### Figure 27 — SSD: UC-15 View Analytics Dashboard

> Insert at: Chapter 2, Section 2.5.15 (after Table 2.15)

sequenceDiagram
    actor U as User
    participant F as Frontend
    participant B as Backend API
    participant DB as PostgreSQL

    U->>F: Open /dashboard/analytics

    par Load analytics modules
        F->>B: GET /api/analytics/workload
    and
        F->>B: GET /api/analytics/team-workload
    and
        F->>B: GET /api/analytics/productivity-trend
    and
        F->>B: GET /api/analytics/meeting-insights
    end

    rect rgb(230, 240, 255)
        note over B,DB: Workload Analytics
        B->>DB: Aggregate tasks by status, priority, overdue
        DB-->>B: workload metrics
    end

    rect rgb(230, 255, 230)
        note over B,DB: Team Performance Analytics
        B->>DB: Calculate per-member active/completed/overdue tasks
        B->>DB: Compute estimated workload hours
        DB-->>B: team workload data
    end

    rect rgb(255, 245, 220)
        note over B,DB: Productivity Trend Analytics
        B->>DB: Group created/completed tasks by day
        B->>DB: Calculate productivity trends (30d)
        DB-->>B: trend statistics
    end

    rect rgb(255, 230, 230)
        note over B,DB: Meeting Insights Analytics
        B->>DB: Aggregate meeting count, duration, action item stats
        DB-->>B: meeting analytics
    end

    B-->>F: Combined analytics payloads

    F->>F: Render KPI cards
    F->>F: Render workload charts and team tables
    F->>F: Render productivity trend graph
    F->>F: Render meeting insights widgets

    F-->>U: Display analytics dashboard

    U->>F: Click team member bar in workload chart
    F->>F: Apply assignee filter to tasks view
    F-->>U: Show filtered tasks for selected member

![Figure 27 — SSD: UC-15 View Analytics Dashboard](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_27_SSD_UC-15_View_Analytics_Dashboard.png)

---

### Figure 28 — SSD: UC-16 Manage Team Members (Admin)

> Insert at: Chapter 2, Section 2.5.16 (after Table 2.16)

sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend API
    participant DB as PostgreSQL

    A->>F: Open /dashboard/settings → Admin Panel
    F->>B: GET /api/admin/users/team

    B->>B: Verify current user has admin role
    B->>DB: SELECT users WHERE team_id=? ORDER BY created_at
    DB-->>B: Team users list

    B-->>F: Users with role and active status
    F->>F: Render user management table
    F-->>A: Display team members

    rect rgb(230, 240, 255)
        note over A,DB: Update User Role
        A->>F: Change user role from dropdown
        F->>B: PATCH /api/admin/users/{id}/role {role}

        B->>DB: SELECT user WHERE id=? AND team_id=?
        DB-->>B: User record

        B->>B: Validate role transition permissions
        B->>DB: UPDATE users SET role=?
        DB-->>B: Updated user

        B-->>F: 200 OK {user}
        F->>F: Refresh users cache
        F-->>A: Updated role shown in table
    end

    rect rgb(230, 255, 230)
        note over A,DB: Toggle Active Status
        A->>F: Click active/inactive toggle
        F->>B: PATCH /api/admin/users/{id}/toggle-active

        B->>DB: SELECT user WHERE id=? AND team_id=?
        DB-->>B: User record

        B->>B: Prevent self-deactivation
        B->>DB: UPDATE users SET is_active = NOT is_active
        DB-->>B: Updated user

        B-->>F: 200 OK {user}
        F->>F: Update status badge
        F-->>A: Active status updated
    end

    rect rgb(255, 230, 230)
        note over A,DB: Delete User
        A->>F: Click delete user
        F-->>A: Show confirmation dialog

        A->>F: Confirm deletion
        F->>B: DELETE /api/admin/users/{id}

        B->>DB: SELECT user WHERE id=? AND team_id=?
        DB-->>B: User record

        B->>B: Prevent self-deletion
        B->>DB: DELETE FROM users WHERE id=?
        DB-->>B: User deleted

        B-->>F: 200 OK
        F->>F: Refresh users list
        F-->>A: User removed from table
    end

![Figure 28 — SSD: UC-16 Manage Team Members (Admin)](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_28_SSD_UC-16_Manage_Team_Members_Admin.png)

---

### Figure 29 — SSD: UC-17 Send Direct Message

> Insert at: Chapter 2, Section 2.5.17 (after Table 2.17)

sequenceDiagram
    actor U as User
    participant F as Frontend
    participant B as Backend API
    participant DB as PostgreSQL
    participant R as Recipient Client

    U->>F: Open /dashboard/messages
    F->>B: GET /api/dm/users

    B->>B: Authenticate current user
    B->>DB: SELECT users WHERE team_id=? AND id != current_user
    DB-->>B: Team member list

    B-->>F: Available conversation users
    F->>F: Render sidebar user list
    F-->>U: Display messaging dashboard

    rect rgb(230, 240, 255)
        note over U,DB: Open Conversation
        U->>F: Select team member conversation
        F->>B: GET /api/dm/{user_id}

        B->>DB: SELECT messages WHERE sender/recipient pair matches
        B->>DB: UPDATE direct_messages SET read_at=NOW() WHERE recipient_id=current_user AND sender_id=target_user AND read_at IS NULL
        DB-->>B: Conversation thread

        B-->>F: Ordered message history
        F->>F: Group messages by sender/time
        F-->>U: Render chat thread
    end

    rect rgb(230, 255, 230)
        note over U,DB: Send Message
        U->>F: Type message and click Send
        F->>F: Validate non-empty message
        F->>B: POST /api/dm/send {recipient_id, content}

        B->>DB: SELECT user WHERE id=? AND team_id=?
        DB-->>B: Recipient verified

        B->>DB: INSERT direct_messages (sender_id, recipient_id, content, created_at)
        DB-->>B: Message record

        B-->>F: 201 Created {message}
        F->>F: Append message to local thread
        F-->>U: Sent message appears instantly
    end

    rect rgb(255, 245, 220)
        note over R,DB: Unread Notifications
        loop Every 10 seconds
            R->>B: GET /api/dm/unread-count

            B->>DB: COUNT messages WHERE recipient_id=? AND read_at IS NULL
            DB-->>B: Unread total

            B-->>R: {count}
            R->>R: Update unread badge in sidebar
        end
    end
![Figure 29 — SSD: UC-17 Send Direct Message](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_29_SSD_UC-17_Send_Direct_Message.png)

---

## Section 3 — Domain Model (Figure 4)

> Insert at: Chapter 3, Section 3.1.2

classDiagram

class Team {
    +id : UUID
    +name : string
    +plan : string
    +createdAt : datetime
}

class User {
    +id : UUID
    +fullName : string
    +email : string
    +passwordHash : string
    +role : enum
    +isActive : boolean
    +createdAt : datetime
}

class Meeting {
    +id : UUID
    +title : string
    +scheduledAt : datetime
    +transcript : text
    +diarizedTranscript : JSON
    +summary : text
    +status : enum
    +googleMeetLink : string
    +recordingUrl : string
}

class Task {
    +id : UUID
    +title : string
    +description : text
    +status : enum
    +priority : enum
    +dueDate : datetime
    +sourceType : enum
    +calendarEventId : string
}

class ActionItem {
    +id : UUID
    +description : text
    +confidenceScore : float
    +speakerLabel : string
    +contextType : string
    +status : enum
}

class Integration {
    +id : UUID
    +platform : string
    +isActive : boolean
    +lastSyncedAt : datetime
    +metadata : JSON
}

class Email {
    +id : UUID
    +subject : string
    +sender : string
    +bodyPreview : text
    +isRead : boolean
    +receivedAt : datetime
}

class Message {
    +id : UUID
    +content : text
    +platform : string
    +intent : string
    +timestamp : datetime
}

class DirectMessage {
    +id : UUID
    +content : text
    +createdAt : datetime
    +readAt : datetime
}

class CalendarPreference {
    +id : UUID
    +autoSyncTasks : boolean
    +autoSyncMeetings : boolean
    +dailyDigestEnabled : boolean
}

%% =========================
%% Relationships
%% =========================

Team "1" o-- "*" User : has
Team "1" o-- "*" Meeting : owns
Team "1" o-- "*" Task : manages

User "1" --> "*" Task : assignedTo
User "1" --> "*" Task : createdBy

User "1" o-- "*" Integration : connects
User "1" o-- "*" Email : receives
User "1" o-- "*" Message : syncs
User "1" o-- "0..1" CalendarPreference : configures

Meeting "1" *-- "*" ActionItem : generates
ActionItem "0..1" --> "0..1" Task : convertsInto

Meeting "1" --> "*" Task : produces

User "1" --> "*" DirectMessage : sends
User "1" <-- "*" DirectMessage : receives

Integration "*" --> "1" Team : belongsTo
Email "*" --> "0..1" Task : linkedTo
![Figure 4 — Domain Model](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_04_Domain_Model.png)

---

## Section 4 — Full Class Diagram (Figure 5)

> Insert at: Chapter 3, Section 3.1.3

classDiagram

class User {
    +UUID id
    +string email
    +string fullName
    +enum role
    +UUID teamId
    +boolean isActive
    +boolean isVerified
    +datetime createdAt
}

class Team {
    +UUID id
    +string name
    +string plan
    +datetime createdAt
}

class Meeting {
    +UUID id
    +string title
    +datetime scheduledAt
    +text transcript
    +JSON diarizedTranscript
    +text summary
    +enum status
    +string googleMeetLink
    +string calendarEventId
    +UUID teamId
    +UUID createdById
}

class Task {
    +UUID id
    +string title
    +text description
    +enum status
    +enum priority
    +datetime dueDate
    +enum sourceType
    +string calendarEventId
    +UUID assigneeId
    +UUID createdById
    +UUID teamId
}

class ActionItem {
    +UUID id
    +text description
    +float confidenceScore
    +string speakerLabel
    +string contextType
    +enum status
    +UUID meetingId
    +UUID taskId
}

class Integration {
    +UUID id
    +string platform
    +boolean isActive
    +datetime lastSyncedAt
    +UUID userId
}

class Email {
    +UUID id
    +string subject
    +string sender
    +text bodyPreview
    +datetime receivedAt
    +UUID userId
}

class Message {
    +UUID id
    +text content
    +string platform
    +string intent
    +datetime timestamp
    +UUID userId
}

class DirectMessage {
    +UUID id
    +UUID senderId
    +UUID recipientId
    +text content
    +datetime createdAt
    +datetime readAt
}

class CalendarPreference {
    +UUID id
    +UUID userId
    +boolean autoSyncTasks
    +boolean autoSyncMeetings
    +boolean dailyDigestEnabled
    +datetime createdAt
}

class TeamInvitation {
    +UUID id
    +UUID teamId
    +UUID invitedByUserId
    +string token
    +enum role
    +string email
    +datetime expiresAt
    +datetime usedAt
}

%% =========================
%% Core Relationships
%% =========================

Team "1" --> "*" User : hasMembers
Team "1" --> "*" Meeting : owns
Team "1" --> "*" Task : manages
Team "1" --> "*" TeamInvitation : creates

User "1" --> "*" Task : assignedTasks
User "1" --> "*" Task : createdTasks
User "1" --> "*" Integration : connects
User "1" --> "*" Email : receives
User "1" --> "*" Message : syncs
User "1" --> "*" Meeting : creates
User "1" --> "0..1" CalendarPreference : configures

Meeting "1" --> "*" ActionItem : generates
Meeting "1" --> "*" Task : produces

ActionItem "*" --> "0..1" Task : convertsInto

User "1" --> "*" DirectMessage : sends
User "1" <-- "*" DirectMessage : receives

TeamInvitation "*" --> "1" User : invitedBy
![Figure 5 — Full Class Diagram](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_05_Full_Class_Diagram.png)

---

## Section 5 — Sequence Diagrams (Key Flows)

### Figure 9 — Meeting AI Processing Pipeline (Detailed)

> Insert at: Chapter 3, Section 3.2.1

sequenceDiagram
    participant Router as Meetings Router
    participant BG as Background Worker
    participant AI as AI Service
    participant Diar as Diarization Service
    participant Analysis as Analysis Service
    participant Groq as Groq API
    participant AAI as AssemblyAI API
    participant OpenAI as OpenAI API
    participant DB as PostgreSQL

    Router->>BG: process_meeting_background(meeting_id)

    BG->>DB: SELECT meeting WHERE id=?
    DB-->>BG: Meeting record + file path

    BG->>AI: transcribe_meeting_with_segments(file_path)

    alt Primary: Groq Whisper available
        AI->>Groq: Transcribe audio (whisper-large-v3-turbo)
        Groq-->>AI: Transcript + timestamped segments
    else Fallback: OpenAI Whisper
        AI->>OpenAI: Transcribe audio (whisper-1)
        OpenAI-->>AI: Transcript + timestamped segments
    end

    AI-->>BG: {transcript, whisper_segments, duration}

    BG->>Diar: diarize(audio_file, whisper_segments)

    alt Tier 1: pyannote.audio available
        Diar->>Diar: Run local speaker diarization model
        Diar-->>BG: Speaker-labelled transcript
    else Tier 2: AssemblyAI available
        Diar->>AAI: Request diarization processing
        AAI-->>Diar: Speaker-labelled transcript
        Diar-->>BG: Speaker-labelled transcript
    else Tier 3: LLM fallback
        Diar->>Groq: Infer speakers using llama-3.3-70b
        Groq-->>Diar: Speaker mapping + labels
        Diar-->>BG: Speaker-labelled transcript
    end

    BG->>Analysis: analyze_meeting(diarized_transcript)

    Analysis->>Groq: Context classification + action extraction
    note right of Groq: Detect speakers, tasks, priorities, and decisions
    Groq-->>Analysis: {enriched_segments, action_items, speakers, stats}

    Analysis-->>BG: Enriched meeting insights

    BG->>AI: summarize_meeting(transcript, diarized_transcript)

    AI->>Groq: Generate meeting summary
    Groq-->>AI: Summary text

    AI-->>BG: Summary

    BG->>DB: UPDATE meetings SET transcript, diarized_transcript, summary, status='completed'

    loop For each action item with confidence >= 0.6
        BG->>DB: INSERT action_items
    end

    DB-->>BG: Processing complete
![Figure 9 — Meeting AI Processing Pipeline (Detailed)](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_09_Meeting_AI_Processing_Pipeline_Detailed.png)

---

### Figure 10 — User Authentication Flow (Detailed)

> Insert at: Chapter 3, Section 3.2.2

sequenceDiagram
    participant U as Browser
    participant S as Auth Store (Zustand)
    participant API as Axios Client
    participant B as Backend API
    participant DB as PostgreSQL

    U->>S: App initializes
    S->>S: Read access_token from localStorage

    alt Access token exists
        S->>API: GET /api/auth/me (Bearer access_token)
        API->>B: Authenticated request

        B->>B: Decode and verify JWT
        alt JWT valid
            B->>DB: SELECT user WHERE id=?
            DB-->>B: User record

            alt User exists AND is_active=true
                B-->>API: 200 OK {user}
                API-->>S: Set user + isAuthenticated=true
            else User inactive or missing
                B-->>API: 403 Forbidden
                API-->>S: Clear auth state + tokens
            end

        else JWT expired or invalid
            B-->>API: 401 Unauthorized
            API-->>S: Attempt token refresh
        end
    else No token found
        S-->>U: User remains unauthenticated
    end

    note over U,DB: Access token expires during active session

    U->>API: Send authenticated API request
    API->>B: Request with expired access_token
    B-->>API: 401 Unauthorized

    API->>API: Pause and queue pending requests

    API->>B: POST /api/auth/refresh {refresh_token}

    alt Refresh token valid
        B->>B: Verify refresh token signature + expiry
        B->>DB: SELECT user linked to refresh token
        DB-->>B: User record

        B->>B: Generate new access_token
        B-->>API: 200 OK {access_token}

        API->>API: Store new access_token in localStorage
        API->>API: Replay queued requests

        API->>B: Retry original request
        B-->>API: 200 OK

        API-->>U: Return requested data

    else Refresh token expired or invalid
        B-->>API: 401 Unauthorized

        API->>S: Clear auth store
        API->>API: Remove tokens from localStorage

        API-->>U: Redirect to /login
    end

![Figure 10 — User Authentication Flow (Detailed)](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_10_User_Authentication_Flow_Detailed.png)

---

### Figure 12 — AI Chat Query Flow (Detailed)

> Insert at: Chapter 3, Section 3.2.3

sequenceDiagram
    actor U as User
    participant F as Chat Page (Frontend)
    participant B as Chat Router (FastAPI)
    participant AI as AI Service
    participant Groq as Groq API
    participant DB as PostgreSQL

    U->>F: Open /dashboard/chat
    F-->>U: Render chat interface

    U->>F: Enter question and click Send
    F->>B: POST /api/chat/query {message}

    B->>B: Authenticate user from JWT
    B->>B: Resolve current user + team_id

    par Context gathering
        B->>DB: SELECT tasks WHERE team_id=? ORDER BY due_date LIMIT 50
        DB-->>B: tasks[]
    and
        B->>DB: SELECT meetings summaries WHERE team_id=? ORDER BY created_at DESC LIMIT 5
        DB-->>B: meetings[]
    and
        B->>DB: SELECT users WHERE team_id=?
        DB-->>B: users[]
    and
        B->>DB: SELECT recent emails WHERE user_id=? ORDER BY received_at DESC LIMIT 10
        DB-->>B: emails[]
    end

    B->>B: Normalize and serialize context data
    B->>AI: generate_chat_response(user_message, context)

    AI->>AI: Build system prompt + context window

    AI->>Groq: POST /v1/chat/completions
    note right of Groq: Model: llama-3.3-70b-versatile

    Groq-->>AI: AI answer + metadata

    AI->>AI: Extract sources and suggested actions
    AI-->>B: Structured response payload

    B-->>F: 200 OK {response, sources, actions}

    F->>F: Append AI response bubble
    F->>F: Render source chips
    F->>F: Render suggested action buttons

    alt User clicks suggested action
        U->>F: Click "View Overdue Tasks"
        F->>F: Navigate to filtered tasks page
    end

    F-->>U: Display completed AI response

![Figure 12 — AI Chat Query Flow (Detailed)](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_12_AI_Chat_Query_Flow_Detailed.png)

---

## Section 6 — System Architecture + Component Interaction Diagrams (Figures 2 & 8)

### Figure 2 — System Architecture Diagram

> Insert at: Chapter 3, Section 3.3

flowchart TB

    subgraph Client["Presentation Layer — Browser"]
        Next["Next.js 14 App Router<br/>TypeScript + Tailwind CSS"]
        Zustand["Zustand Stores<br/>(auth, theme, UI state)"]
        TQ["TanStack Query<br/>(server state + caching)"]
        Axios["Axios Client<br/>JWT interceptor + token refresh"]
    end

    subgraph Backend["Business Logic Layer — FastAPI"]
        Routers["API Routers<br/>auth · tasks · meetings · chat · integrations<br/>analytics · admin · emails · messages<br/>direct_messages · calendar · notifications"]
        
        Services["Service Layer<br/>AI · diarization · meeting_analysis<br/>Slack · Jira · Gmail · Google Calendar<br/>notification · task_assignment"]
        
        Models["SQLAlchemy ORM Models<br/>Users · Teams · Tasks · Meetings<br/>ActionItems · Integrations · Messages"]
        
        Auth["Authentication & Security<br/>JWT · bcrypt · Fernet encryption<br/>role-based access control"]
        
        BG["Background Workers<br/>Meeting AI processing pipeline"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL 14+<br/>asyncpg + JSONB")]
        FS["File Storage<br/>Local Storage / AWS S3 / Cloudinary"]
    end

    subgraph AI["AI & ML Services"]
        Whisper["Groq Whisper<br/>whisper-large-v3-turbo"]
        
        Llama["Groq Llama 3.3 70B<br/>Summaries · chat · extraction"]
        
        OpenAI["OpenAI Fallback<br/>GPT-4 / whisper-1"]
        
        Pyannote["pyannote.audio<br/>Local diarization (Tier 1)"]
        
        Assembly["AssemblyAI<br/>Cloud diarization (Tier 2)"]
    end

    subgraph Integrations["External Integrations"]
        Slack["Slack API<br/>OAuth2 + Events Webhooks"]
        
        Jira["Jira Cloud REST API<br/>API Token Authentication"]
        
        Gmail["Gmail IMAP<br/>SSL + App Password"]
        
        GCal["Google Calendar API<br/>OAuth2 + Event Synchronization"]
    end

    Client <-->|HTTPS REST API + JSON| Backend

    Backend <-->|Async SQL Queries| PG

    Backend -->|Upload / Retrieve Media| FS

    Backend -->|Transcription + LLM Processing| AI

    Backend -->|OAuth + Sync + Webhooks| Integrations

    BG --> AI

    Services --> Models

    Routers --> Services

    Auth --> Routers
![Figure 2 — System Architecture Diagram](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_02_System_Architecture_Diagram.png)

---

### Figure 8 — Component Interaction Diagram

> Insert at: Chapter 3, Section 3.5

flowchart LR

    subgraph FE["Frontend Layer — Next.js"]
        Dashboard["Dashboard Page"]
        MeetingPage["Meeting Detail Page"]
        TaskPage["Tasks Management Page"]
        ChatPage["AI Chat Assistant Page"]
        AnalyticsPage["Analytics Dashboard"]
        SettingsPage["Settings & Integrations"]
        CalendarPage["Calendar Page"]
        EmailPage["Emails Page"]
        DmPage["Direct Messages Page"]
    end

    subgraph Routers["Backend API Routers — FastAPI"]
        AuthR["auth.py"]
        MeetR["meetings.py"]
        TaskR["tasks.py"]
        ChatR["chat.py"]
        AnalyticsR["analytics.py"]
        IntegrationR["integrations.py"]
        AdminR["admin.py"]
        CalendarR["calendar.py"]
        EmailR["emails.py"]
        DmR["direct_messages.py"]
        WebhookR["slack_webhooks.py"]
        NotificationR["notifications.py"]
    end

    subgraph Services["Business Logic Services"]
        AISvc["ai_service.py<br/>Transcription · LLM · Summaries · Chat"]
        
        DiarSvc["diarization_service.py<br/>Speaker Detection"]
        
        MeetingSvc["meeting_analysis_service.py<br/>Action Items · Context Analysis"]
        
        SlackSvc["slack_service.py"]
        
        JiraSvc["jira_service.py"]
        
        GmailSvc["gmail_service.py"]
        
        GCalSvc["google_calendar_service.py"]
        
        NotificationSvc["notification_service.py"]
        
        Security["security.py<br/>JWT · bcrypt · Fernet"]
    end

    subgraph External["External APIs & Platforms"]
        GroqAPI["Groq API"]
        AssemblyAI["AssemblyAI"]
        SlackAPI["Slack API"]
        JiraAPI["Jira Cloud REST API"]
        GmailIMAP["Gmail IMAP"]
        GoogleCal["Google Calendar API"]
    end

    %% Frontend → Routers
    Dashboard -->|"Recent meetings + task stats"| TaskR
    Dashboard -->|"Meeting summaries"| MeetR

    MeetingPage -->|"Meeting details"| MeetR
    MeetingPage -->|"Action item assignment"| MeetR

    TaskPage -->|"Task CRUD + filters"| TaskR

    ChatPage -->|"AI queries"| ChatR

    AnalyticsPage -->|"Charts + productivity metrics"| AnalyticsR

    SettingsPage -->|"Integrations management"| IntegrationR
    SettingsPage -->|"Admin controls"| AdminR

    CalendarPage -->|"Calendar sync + events"| CalendarR

    EmailPage -->|"Email sync + inbox"| EmailR

    DmPage -->|"Conversations + sending messages"| DmR

    %% Routers → Services
    MeetR --> AISvc
    MeetR --> DiarSvc
    MeetR --> MeetingSvc

    ChatR --> AISvc

    IntegrationR --> SlackSvc
    IntegrationR --> JiraSvc
    IntegrationR --> GmailSvc
    IntegrationR --> GCalSvc

    CalendarR --> GCalSvc

    EmailR --> GmailSvc

    WebhookR --> SlackSvc

    NotificationR --> NotificationSvc

    %% Security bindings
    AuthR --> Security
    TaskR --> Security
    MeetR --> Security
    ChatR --> Security
    AdminR --> Security

    %% Services → External APIs
    AISvc --> GroqAPI

    DiarSvc --> AssemblyAI

    SlackSvc --> SlackAPI

    JiraSvc --> JiraAPI

    GmailSvc --> GmailIMAP

    GCalSvc --> GoogleCal
![Figure 8 — Component Interaction Diagram](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_08_Component_Interaction_Diagram.png)

---

## Section 7 — Data Flow Diagrams (Figures 6 & 7)

### Figure 6 — DFD Context Level 0

> Insert at: Chapter 3, Section 3.1 (or after System Architecture)

flowchart LR

    %% =========================
    %% Users
    %% =========================
    subgraph Users
        Admin([Admin])
        Member([Team Member])
    end

    %% =========================
    %% Main System
    %% =========================
    SYNKRO["SYNKRO<br/>Workspace Orchestration System"]

    %% =========================
    %% External Services
    %% =========================
    subgraph External_Integrations
        Slack([Slack])
        Jira([Jira])
        Gmail([Gmail])
        GCal([Google Calendar])
        Groq([Groq AI API])
    end

    %% =========================
    %% User Interactions
    %% =========================
    Admin -->|"Manage users<br/>Upload meetings"| SYNKRO

    Member -->|"Tasks<br/>AI Chat<br/>Analytics"| SYNKRO

    SYNKRO -->|"Reports<br/>Summaries<br/>Insights"| Admin
    SYNKRO -->|"Tasks<br/>Notifications"| Member

    %% =========================
    %% Integrations
    %% =========================
    Slack <-->|Messages & Alerts| SYNKRO
    Jira <-->|Issues & Projects| SYNKRO
    Gmail -->|Email Sync| SYNKRO
    GCal <-->|Calendar Events| SYNKRO
    Groq <-->|AI Processing| SYNKRO

![Figure 6 — DFD Context Level 0](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_06_DFD_Context_Level_0.png)

---

### Figure 7 — DFD Level 1

> Insert at: Chapter 3, Section 3.1 (after DFD Level 0)

flowchart LR

    %% =========================
    %% External Entities
    %% =========================
    Admin([Admin])
    User([Team Member])

    Slack([Slack])
    Gmail([Gmail])
    Groq([Groq AI API])
    GCal([Google Calendar])
    Jira([Jira Cloud])

    %% =========================
    %% Core Processes
    %% =========================
    subgraph SYNKRO["SYNKRO System"]

        P1["1.0 Auth & User Management"]
        P2["2.0 Meeting Processing"]
        P3["3.0 Task Management"]
        P4["4.0 Integration Sync"]
        P5["5.0 AI Chat Assistant"]
        P6["6.0 Analytics Engine"]

    end

    %% =========================
    %% Data Stores
    %% =========================
    subgraph Database["Database Layer"]

        D1[("Users")]
        D2[("Meetings")]
        D3[("Tasks")]
        D4[("Integrations")]
        D5[("Emails")]
        D6[("Messages")]
        D7[("Action Items")]

    end

    %% =========================
    %% User Authentication
    %% =========================
    Admin --> P1
    User --> P1
    P1 <--> D1

    %% =========================
    %% Meeting Processing
    %% =========================
    Admin --> P2
    P2 <--> Groq
    P2 --> D2
    P2 --> D7

    %% =========================
    %% Task Management
    %% =========================
    User --> P3
    P3 <--> D3
    D7 --> P3
    P3 --> Jira
    P3 --> GCal

    %% =========================
    %% Integrations
    %% =========================
    Slack --> P4
    Gmail --> P4
    GCal --> P4

    P4 <--> D4
    P4 --> D5
    P4 --> D6

    %% =========================
    %% AI Chat Assistant
    %% =========================
    User --> P5

    D2 --> P5
    D3 --> P5
    D5 --> P5

    P5 <--> Groq
    P5 --> User

    %% =========================
    %% Analytics
    %% =========================
    D1 --> P6
    D2 --> P6
    D3 --> P6

    P6 --> Admin
    P6 --> User
![Figure 7 — DFD Level 1](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_07_DFD_Level_1.png)

---

## Section 8 — Entity-Relationship Diagram (Figure 3)

> Insert at: Chapter 3, Section 3.1.1

erDiagram

    TEAMS {
        uuid id PK
        string name
        string plan
        json settings
    }

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
        string avatar_url
        string timezone
        boolean is_active
        boolean is_verified
        uuid team_id FK
        timestamp created_at
    }

    MEETINGS {
        uuid id PK
        string title
        timestamp scheduled_at
        int duration_minutes
        string recording_url
        text transcript
        json diarized_transcript
        text summary
        string status
        string google_meet_link
        uuid team_id FK
        uuid created_by_id FK
    }

    TASKS {
        uuid id PK
        string title
        text description
        string status
        string priority
        timestamp due_date
        int estimated_hours
        string source_type
        string external_id
        string calendar_event_id
        boolean is_meeting_task
        uuid assignee_id FK
        uuid created_by_id FK
        uuid team_id FK
    }

    ACTION_ITEMS {
        uuid id PK
        text description
        string assignee_mentioned
        float confidence_score
        string status
        string speaker_label
        string context_type
        uuid meeting_id FK
        uuid message_id FK
        uuid task_id FK
    }

    INTEGRATIONS {
        uuid id PK
        string platform
        text access_token
        text refresh_token
        boolean is_active
        json platform_metadata
        timestamp last_synced_at
        uuid user_id FK
    }

    EMAILS {
        uuid id PK
        string gmail_message_id
        string subject
        string sender
        text body_preview
        timestamp received_at
        boolean is_read
        string ai_classification
        uuid user_id FK
        uuid integration_id FK
    }

    MESSAGES {
        uuid id PK
        string platform
        string sender_name
        text content
        timestamp message_timestamp
        string thread_id
        string channel_id
        string intent
        uuid user_id FK
    }

    DIRECT_MESSAGES {
        uuid id PK
        uuid sender_id FK
        uuid recipient_id FK
        text content
        timestamp read_at
        string slack_ts
        timestamp created_at
    }

    CALENDAR_PREFERENCES {
        uuid id PK
        uuid user_id FK
        boolean auto_sync_tasks
        boolean auto_sync_meetings
        boolean daily_digest_enabled
        string daily_digest_time
    }

    TEAM_INVITATIONS {
        uuid id PK
        uuid team_id FK
        uuid invited_by_id FK
        string token UK
        string role
        string email
        timestamp expires_at
    }

    %% Relationships
    TEAMS ||--o{ USERS : members
    TEAMS ||--o{ MEETINGS : meetings
    TEAMS ||--o{ TASKS : tasks
    TEAMS ||--o{ TEAM_INVITATIONS : invitations

    USERS ||--o{ MEETINGS : creates
    USERS ||--o{ TASKS : creates
    USERS ||--o{ TASKS : assigned
    USERS ||--o{ INTEGRATIONS : integrations
    USERS ||--o{ EMAILS : emails
    USERS ||--o{ MESSAGES : messages
    USERS ||--o{ DIRECT_MESSAGES : sends
    USERS ||--o{ DIRECT_MESSAGES : receives
    USERS ||--o| CALENDAR_PREFERENCES : preferences
    USERS ||--o{ TEAM_INVITATIONS : invites

    MEETINGS ||--o{ ACTION_ITEMS : action_items
    MESSAGES ||--o{ ACTION_ITEMS : extracted_actions

    ACTION_ITEMS ||--o| TASKS : converted_to

    INTEGRATIONS ||--o{ EMAILS : syncs
![Figure 3 — Entity-Relationship Diagram](C:/Users/yasha/Desktop/SYNKRO_Diagrams/Figure_03_ER_Diagram.png)
