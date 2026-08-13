# 🔥 Fireflies.ai Clone — Meeting Notes & Transcription Platform

A full-stack, production-grade clone of the **Fireflies.ai** meeting intelligence platform built for the **Scaler AI Labs SDE Fullstack Assignment**.

---

## 🌟 Live Architecture Overview

The platform is designed with a modern decoupled fullstack architecture:
- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS, Zustand, Lucide React, Sonner)
- **Backend**: Python (Django 5.x + Django REST Framework)
- **Database**: SQLite (optimized with compound indexing on transcripts)
- **AI Intelligence Engine**: **Groq LLM (`llama-3.3-70b-versatile`)** with sub-second inference and structured JSON mode (with built-in offline heuristic fallback)

```
┌─────────────────────────────────────────────────────────────┐
│               Next.js 14 Frontend (App Router)              │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │ 🎙️ Meetings Dashboard   │  │ 📑 Meeting Room Detail   │  │
│  │ • Multi-filter & Search │  │ • Interactive Transcript │  │
│  │ • Grid & Table views    │  │ • 2-Way Audio Seek Sync  │  │
│  │ • Real-time Stats KPI   │  │ • Groq AI Summary Tabs   │  │
│  └─────────────────────────┘  │ • Grounded Ask-AI Chat   │  │
│                               │ • Multi-format Export    │  │
│                               └──────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ RESTful API (JSON)
┌──────────────────────────────▼──────────────────────────────┐
│                Django REST Framework (DRF)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📡 Endpoints: /api/v1/meetings, /action-items, /chat  │  │
│  │ 🏥 Keepalive: /health/ (for Render & UptimeRobot)     │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ 🧠 Groq LLM Service (llama-3.3-70b-versatile)         │  │
│  │ • Summaries, Action Items, Chapters, Grounded Q&A     │  │
│  │ • Multi-format Parser (.txt, .vtt, .srt, .json)       │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ 🗄️ SQLite Relational Database                         │  │
│  │ (Meetings, Transcripts, Summaries, Actions, Chapters) │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Feature Traceability (Assignment Checklist)

### 1. Core Features (Must Have)
- [x] **Meetings Library / Dashboard**:
  - List of past meetings with title, date, duration, participants avatar stack
  - Search and filter by title, meeting type (Product, Engineering, Sales, Design, Leadership), date, and participant
  - Sort by recency, duration, and title
  - View toggle: Grid View & Table View
  - Navbar with profile, workspace switcher, and Fred AI status badge
- [x] **Meeting / Transcript Detail View**:
  - Interactive transcript with speaker labels, avatars, and timestamp pills
  - Custom media player with seek bar, play/pause, skip +/- 5s, speed control (0.75x, 1x, 1.25x, 1.5x, 2x), and soundwaves
  - **Bidirectional 2-Way Sync**: Clicking transcript line jumps audio player immediately, and during playback the active line highlights and auto-scrolls
  - In-transcript search with highlighted matches, match counter, and Next/Prev match navigation
- [x] **AI Summary & Intelligence (Groq LLM)**:
  - Executive Overview paragraph
  - Structured Key Decisions & Takeaways bullet points
  - Action items with assignees and due dates
  - Smart Chapters / Agenda timeline outline (clicking chapter jumps audio)
  - "Regenerate AI" button calling Groq with one click
- [x] **Meeting Management (CRUD)**:
  - Create meeting (drag-and-drop `.txt`, `.vtt`, `.srt`, `.json` or paste text with auto AI summary generation)
  - Edit meeting metadata (title, category, participants)
  - Delete meeting with double-confirmation dialog
  - Add, edit, complete (toggle checkbox), and delete action items
  - Add user notes, comments, and highlights with color tags
- [x] **Fireflies UI/UX Experience**:
  - Fireflies signature purple/indigo design system (`#5B45E0`, `#4F46E5`)
  - Glassmorphism, subtle micro-animations, and Inter/Outfit typography
  - Notifications / toasts via Sonner
  - Global `Cmd+K` / `Ctrl+K` Spotlight Search modal

### 2. All 6 Bonus Features Included!
- [x] **🌟 Comments / highlights / soundbites** on transcript segments (with color tags)
- [x] **🌟 Multi-format Export**: Download Markdown (`.md`), formatted Text (`.txt`), Captions (`.vtt`), or structured JSON
- [x] **🌟 Global Search (`Cmd+K`)**: Cross-meeting search across titles, spoken dialogue, and action items with direct jumps
- [x] **🌟 Tags & Topics**: Extracted keywords filtering and discovery
- [x] **🌟 LLM-powered "Ask AI about this meeting"**: Interactive Q&A grounded in transcript with suggestion prompt chips
- [x] **🌟 Dark Mode / Light Mode**: Seamless theme toggle with persistent preferences
- [x] **🌟 Speaker Talk-Time Analytics**: Visual participation percentage bar and breakdown

### 3. Mocked / Placeholder Sections
- [x] "Coming Soon" interactive drawers and modals for Fred Live Call Bot, Zoom/Meet integrations, and Team Sharing

---

## 🗄️ Database Schema Design (SQLite + Django ORM)

| Model | Purpose | Key Attributes & Relations |
|---|---|---|
| **`Meeting`** | Core meeting record | `id` (UUID), `title`, `meeting_date`, `duration_seconds`, `participants` (JSON), `audio_url`, `meeting_type`, `status` |
| **`TranscriptSegment`** | Individual speaker utterance | `id` (UUID), `meeting` (FK), `speaker_name`, `start_time` (s), `end_time` (s), `text`, `sequence_order` |
| **`Summary`** | AI-generated intelligence | `id` (UUID), `meeting` (OneToOne), `overview` (Text), `key_points` (JSON), `keywords` (JSON) |
| **`ActionItem`** | Extracted or custom tasks | `id` (UUID), `meeting` (FK), `task`, `assignee`, `due_date`, `completed` (Boolean) |
| **`Chapter`** | Timeline outline chapters | `id` (UUID), `meeting` (FK), `title`, `start_time`, `end_time`, `summary`, `sequence_order` |
| **`Comment`** | User notes & highlights | `id` (UUID), `meeting` (FK), `segment` (FK), `user_name`, `content`, `color_tag` |
| **`ChatMessage`** | Q&A conversation history | `id` (UUID), `meeting` (FK), `role` (`user`/`assistant`), `content`, `created_at` |

---

## 🚀 Step-by-Step Setup Guide

### 1. Backend Setup (Django + DRF)

```bash
# Navigate to backend
cd backend

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (Optional: Add your GROQ_API_KEY)
cp .env.example .env

# Apply database migrations
python manage.py makemigrations meetings
python manage.py migrate

# Seed 5 realistic sample meetings
python manage.py seed_meetings

# Run automated tests (18 tests)
python manage.py test

# Start backend server (Port 8000)
python manage.py runserver 8000
```
- API Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Healthcheck: [http://127.0.0.1:8000/health/](http://127.0.0.1:8000/health/)
- Django Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### 2. Frontend Setup (Next.js 14)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server (Port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🏥 Render Deployment & UptimeRobot Keepalive

1. **Deploy Backend on Render**:
   - Build Command: `pip install -r requirements.txt && python manage.py migrate && python manage.py seed_meetings`
   - Start Command: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
   - Environment Variables:
     - `SECRET_KEY`: `your-production-secret-key`
     - `DEBUG`: `False`
     - `GROQ_API_KEY`: `gsk_your_groq_key`
     - `ALLOWED_HOSTS`: `*`
2. **Setup UptimeRobot**:
   - Add HTTP Monitor URL: `https://your-backend.onrender.com/health/`
   - Ping interval: Every 5-10 minutes (prevents Render free tier from sleeping!)
3. **Deploy Frontend on Vercel**:
   - Framework: Next.js
   - Environment Variable: `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`
