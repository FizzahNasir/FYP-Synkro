# Synkro — Sales Pitch, Demo Script, One-Pager & Slide Deck

---

## PART 1 — SALES PITCH

---

### ATTENTION GRABBER

> **"Your company is paying someone $80,000 a year to copy-paste from emails into spreadsheets."**

---

That's it. That's the job of a project manager in most software companies today.

A client sends an email. The manager reads it, rewrites it as a task, pastes it into Jira, messages the developer on Slack, schedules a follow-up meeting, takes notes in that meeting, turns those notes into more tasks — and then does it all again tomorrow.

**Nothing was built. Nothing shipped. Just information moving from one box to another. By a human.**

And when that manager is handling 3 teams? 5 teams? 10?

The emails pile up. The Slack messages get buried. The meeting notes sit in someone's Google Drive unread. A deadline gets missed. A client requirement gets lost in translation. The client gets upset. The contract is at risk.

**That's not a people problem. That's a systems problem.**

---

### THE PITCH

**What if everything your project manager reads, hears, and receives — every email, every Slack message, every meeting — automatically became an assigned, tracked, prioritized task? Without them lifting a finger?**

That's Synkro.

Synkro connects to every platform your team already uses — **Gmail, Slack, Zoom, Jira, Google Calendar** — and uses AI to listen across all of them simultaneously. When a client sends an email saying *"we need the login page redesigned before the 15th,"* Synkro reads it, creates the task, sets the deadline, assigns it to the right developer, and syncs it to Jira. The project manager gets a notification. The developer gets assigned. The calendar gets updated. The client's request doesn't fall through the cracks.

**No manual entry. No copy-pasting. No missed context.**

When a meeting happens, Synkro transcribes it, identifies who said what, and extracts every commitment made — *"John said he'd fix the API by Friday"* becomes a tracked task assigned to John with a Friday deadline. Automatically.

---

### THE NUMBERS

A mid-size software company with **10 project managers** each spending **3 hours a day** on manual task coordination:

- That's **30 hours of paid human time — every single day — producing zero output.**
- Over a year: **~7,800 hours** wasted on information relay.
- At an average PM salary: **that's $195,000 a year in lost productivity** — just from manual busywork.

And that's before you count the cost of a **single missed deadline** — client penalties, emergency developer overtime, damaged reputation.

**Synkro doesn't just save time. It removes an entire category of human error from your operations.**

---

### ONE LINE FOR EVERY ROOM

| Audience | What to say |
|---|---|
| **CEO** | "We cut project coordination overhead by up to 70% and eliminate the most common cause of missed deadlines." |
| **CFO** | "We recover hundreds of thousands in annual productivity loss — without hiring or firing anyone." |
| **Project Manager** | "You stop being a human copy-paste machine and start being the person who makes strategic decisions." |
| **Developer** | "You get clear, well-defined tasks — not half-remembered summaries from a meeting you weren't even in." |
| **Client** | "Your requirements are heard, tracked, and delivered — not lost in someone's inbox." |

---

### THE CLOSER

> Every day your team operates without Synkro, requirements are being misunderstood, deadlines are being missed by inches, and your project managers are spending half their day doing what a computer should be doing.
>
> **Synkro doesn't replace your team. It gives your team back their time.**
>
> The question isn't whether you can afford Synkro.
> **The question is how much longer you can afford not to have it.**

---
---

## PART 2 — LIVE DEMO SCRIPT

---

### Pre-Demo Setup (before the audience arrives)

- Backend running on :8000, frontend on :3000
- One meeting audio file ready to upload (2–3 min recording with action items)
- A Gmail inbox with a sample client email visible
- A Slack channel with a few messages
- Tasks page open with 2–3 existing tasks
- Jira project connected in Settings

---

### Opening Line (say this before touching the screen)

> *"I'm going to show you 10 minutes of work that used to take a project manager 3 hours. Watch the clock."*

---

### Scene 1 — The Client Email (2 minutes)

**Navigate to:** `/dashboard/emails`

**Say:**
> *"A client just sent an email. In the old world, the PM reads it, rewrites it, opens Jira, creates a ticket, assigns someone, sets a due date. That's 15 minutes minimum — per email. Watch what Synkro does."*

- Show the email in the inbox panel
- Click **"Sync Emails"** — watch tasks appear
- Navigate to `/dashboard/tasks`
- Point out the newly created task: title from email, due date extracted, auto-assigned

> *"That took 4 seconds. The PM didn't write a single word."*

---

### Scene 2 — The Meeting (3 minutes)

**Navigate to:** `/dashboard/meetings`

**Say:**
> *"Your team just finished a sprint planning call. Nobody took proper notes — they never do. But someone hit record."*

- Click **"Upload Meeting"**, upload the audio file
- While it processes (or show a pre-processed one), explain:

> *"Synkro is now transcribing the audio, identifying who said what, and pulling out every commitment made in that meeting."*

- Open the completed meeting
- Show the **diarized transcript** — speaker-labeled, timestamped

> *"Speaker A is your team lead. Speaker B is the developer. You can rename them."*

- Show **Action Items** extracted
- Click **"Convert to Task"** on one action item

> *"John said he'd fix the payment API by Friday. That's now a task, assigned to John, due Friday. John didn't need to be in this room for that to happen."*

---

### Scene 3 — The Task with a Meeting (2 minutes)

**Navigate to:** `/dashboard/tasks` → Create Task

**Say:**
> *"Sometimes the task IS a meeting. Watch this."*

- Type **"Client demo call"** in the title field
- Show the auto-detect banner: *"This looks like a meeting — generate a Google Meet link?"*
- Click Yes, set a time and duration
- Submit

> *"Synkro just created a Google Calendar event, generated a Google Meet link, sent the invite to the assignee, and attached everything to the task. The PM didn't open Google Calendar once."*

- Show the task card with the blue time chip and green "Join Meeting" button

---

### Scene 4 — Jira Sync (1 minute)

**Navigate to:** `/dashboard/integrations/jira`

**Say:**
> *"Your developers live in Jira. Your PMs live in Synkro. Here's how they stay in sync — automatically."*

- Show the Jira dashboard with synced issues
- Update a task status in Synkro → show it reflects in Jira
- Add a comment in Synkro → show it appears in Jira

> *"Bidirectional. Real-time. No one has to manually update two systems."*

---

### Scene 5 — The Notification (30 seconds)

**Point to the bell icon in the top nav**

> *"Every person on the team gets notified when something changes that affects them. No more 'I didn't know about that' in retrospectives."*

- Show the notification dropdown: task assigned, meeting completed, comment added

---

### Closing Line

> *"What you just saw — client email to task, meeting to action items, automatic Meet link, Jira sync, team notifications — that's a full day of project coordination. Synkro did it in under 10 minutes. Your project managers can now spend that recovered time on work that actually moves the business forward."*

---
---

## PART 3 — ONE-PAGE LEAVE-BEHIND

*(Print and hand this to anyone who wasn't in the room)*

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         SYNKRO
          AI-Powered Project Management Automation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE PROBLEM
───────────
A project manager at a software company spends up to 40% of
their day doing one thing: moving information from one place
to another. Reading emails, rewriting them as tasks. Sitting
in meetings, summarizing them manually. Checking Slack,
forwarding updates. Copy. Paste. Repeat.

This is expensive. This causes missed deadlines. This causes
misdelivered requirements. And it scales terribly — the more
teams you have, the worse it gets.

THE SOLUTION
────────────
Synkro connects every platform your team already uses and
automates the entire coordination layer of project management.

  📧 Gmail      → Tasks created from client emails
                  automatically, with deadlines and assignees

  🎙 Meetings   → Audio transcribed, speakers identified,
                  action items extracted and assigned

  💬 Slack      → Messages monitored, task-worthy items
                  surfaced automatically

  📅 Google     → Calendar events and Google Meet links
     Calendar     generated with zero manual effort

  🔧 Jira       → Bidirectional sync — Synkro and Jira stay
                  in perfect alignment automatically

  🔔 Notify     → Every team member notified instantly when
                  something changes that affects them

THE NUMBERS
───────────
  10 project managers × 3 hrs/day manual work
  = 30 hrs/day of zero-output labour
  = ~$195,000/year recovered with Synkro

  1 missed deadline from a lost email
  = client penalty + emergency overtime + reputation damage
  = costs more than an annual Synkro subscription

WHO IT'S FOR
────────────
Any software company with project managers handling multiple
teams, clients on different platforms, and a need to deliver
faster with fewer errors.

THE RESULT
──────────
Your project managers stop being human copy-paste machines
and start making the strategic decisions only humans can make.
Your developers get clear, well-defined tasks. Your clients
get their requirements heard, tracked, and delivered.

        Synkro doesn't replace your team.
        It gives your team back their time.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  synkro.app  |  Book a demo  |  hello@synkro.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---
---

## PART 4 — SLIDE DECK OUTLINE

*(15 slides — 10–12 minute presentation)*

---

### SLIDE 1 — TITLE SLIDE
**Headline:** Synkro
**Subline:** Stop Managing Tasks. Start Delivering Results.
**Visual:** Clean dark background, single logo centered
**Speaker note:** Pause after the title. Let it breathe. Say nothing for 3 seconds.

---

### SLIDE 2 — ATTENTION GRABBER
**Headline (big, bold):**
> "Your company is paying someone $80,000 a year to copy-paste."

**Visual:** A person at a desk surrounded by floating app icons (Gmail, Slack, Jira, Zoom) looking overwhelmed
**Speaker note:** Don't explain it yet. Let the audience read it and sit with it.

---

### SLIDE 3 — THE DAILY REALITY
**Headline:** A Day in the Life of a Project Manager

**Content (timeline format):**
```
9:00 AM  — Read 23 emails, manually create 4 tasks
10:30 AM — Sit in sprint meeting, take notes by hand
12:00 PM — Retype meeting notes into Jira tickets
2:00 PM  — Chase developers on Slack for updates
3:30 PM  — Miss a client email. Deadline slips.
5:00 PM  — Explain to management why it happened.
```

**Visual:** A timeline with clock icons, red flag on the missed email
**Speaker note:** *"This is not a bad PM. This is a PM using bad systems."*

---

### SLIDE 4 — THE COST
**Headline:** This Isn't Just Inefficiency. It's a Financial Problem.

**Content (3 big numbers):**
- **40%** of a PM's day spent on information relay — zero deliverable output
- **$195,000/year** lost per 10-person PM team in manual coordination
- **1 missed deadline** can cost more than an entire year of tooling

**Visual:** Large numbers in accent color, minimal text
**Speaker note:** *"These are conservative estimates. For a company with 5 teams, multiply it."*

---

### SLIDE 5 — ROOT CAUSE
**Headline:** The Real Problem Is Fragmentation

**Content:**
> Clients don't use one platform.
> Teams don't use one platform.
> Information lives everywhere — and no single person can watch all of it.

**Visual:** Icons for Gmail / Slack / Zoom / Jira / Google Calendar scattered, no connections between them
**Speaker note:** *"The PM is the human glue between all of these. We're going to replace the glue with automation."*

---

### SLIDE 6 — THE SOLUTION (ONE LINE)
**Headline (full slide, large):**
> "Synkro reads everything your team sends, says, and receives — and turns it into action. Automatically."

**Visual:** Just the text. No clutter.
**Speaker note:** Pause after reading it. Then go to the next slide.

---

### SLIDE 7 — HOW IT WORKS
**Headline:** One Platform. Every Source. Zero Manual Entry.

**Content (flow diagram):**
```
Client Email  ──┐
Slack Message ──┤──→  SYNKRO AI  ──→  Task Created
Meeting Audio ──┤                      Assigned
Zoom Call     ──┘                      Deadline Set
                                       Jira Synced
                                       Team Notified
```

**Visual:** Clean flow diagram, Synkro in the center as the hub
**Speaker note:** *"Synkro sits in the middle of everything your team already uses."*

---

### SLIDE 8 — FEATURE: EMAILS → TASKS
**Headline:** Client Sends Email. Task Gets Created. PM Does Nothing.

**Visual:** Split screen — left: Gmail inbox with client email. Right: resulting task in Synkro with title, deadline, assignee auto-populated.
**Bullet:** AI extracts requirements, deadlines, and assignees from natural language
**Speaker note:** *"No more manually creating tickets from emails. Ever."*

---

### SLIDE 9 — FEATURE: MEETINGS → ACTION ITEMS
**Headline:** Every Meeting Becomes a Fully Tracked Action Plan

**Visual:** Screenshot of diarized transcript with speaker labels, and action items panel below

**Bullets:**
- Audio transcribed automatically
- Speakers identified and labeled
- Commitments extracted: *"John said he'd fix the API by Friday"* → Task assigned to John, due Friday

**Speaker note:** *"The PM doesn't need to take a single note."*

---

### SLIDE 10 — FEATURE: GOOGLE MEET AUTO-GENERATION
**Headline:** Type "Client Demo Call." Get a Meet Link. Done.

**Visual:** Create Task dialog with the auto-detect banner and Meet link generated
**One line:** Meeting tasks auto-generate Calendar events, Meet links, and send invites to assignees
**Speaker note:** *"Zero trips to Google Calendar."*

---

### SLIDE 11 — FEATURE: JIRA BIDIRECTIONAL SYNC
**Headline:** Synkro and Jira. Always in Sync. Zero Manual Updates.

**Visual:** Two panels — Synkro task on left, Jira issue on right, arrows in both directions

**Bullets:**
- Update a task in Synkro → Jira updates instantly
- Update in Jira → Synkro reflects it
- Comments sync both ways
- Sprint assignment automated

**Speaker note:** *"Your developers never need to leave Jira. Your PMs never need to enter it."*

---

### SLIDE 12 — FEATURE: REAL-TIME NOTIFICATIONS
**Headline:** Nobody Can Say "I Didn't Know"

**Visual:** Notification bell with dropdown showing task assigned, meeting completed, comment added
**One line:** Every relevant event delivered instantly to the right person — task assignment, status change, new comment, meeting processed.

---

### SLIDE 13 — SCALE ARGUMENT
**Headline:** The Bigger Your Company, The Bigger the Return

**Content (table):**

| Team Size | Manual Overhead/Day | Annual Cost Recovered |
|---|---|---|
| 5 PMs | 15 hrs/day | ~$97,500 |
| 10 PMs | 30 hrs/day | ~$195,000 |
| 25 PMs | 75 hrs/day | ~$487,500 |
| 50 PMs | 150 hrs/day | ~$975,000 |

**Speaker note:** *"Synkro doesn't just help one PM. The value compounds with every team you add."*

---

### SLIDE 14 — WHO BENEFITS
**Headline:** Everyone on the Team Wins

| Person | What they get |
|---|---|
| **CEO** | Faster delivery, fewer missed deadlines, lower overhead |
| **CFO** | Quantifiable ROI from day one |
| **Project Manager** | Strategic work instead of manual coordination |
| **Developer** | Clear tasks, no ambiguity, no interruptions for status updates |
| **Client** | Requirements actually delivered as discussed |

---

### SLIDE 15 — CLOSER / CTA
**Headline (large):**
> "Every day without Synkro, something important is sitting in someone's inbox unread."

**Subline:**
> Synkro doesn't replace your team.
> It gives your team back their time.

**CTA (bottom, bold):**
> Book a 15-minute demo → synkro.app

**Visual:** Clean, confident. Company logo. Contact info.
**Speaker note:** *"The question isn't whether you can afford Synkro. The question is how much longer you can afford not to have it."* — then stop talking.

---

### Presentation Tips

- **Total time:** 10–12 minutes, leave 5 for questions
- **Insert the live demo** between Slides 12 and 13
- Slides 2–5 should feel uncomfortable — that's intentional, make the pain real before showing the solution
- **Never use the word "features"** in the room — say *"here's what changes for your team"*
- **Print the one-pager** and hand it out after Slide 15, not before
- **Best opening line for a non-technical room:** start at Slide 3 (the daily reality timeline) and skip Slide 2 until after you've built rapport
