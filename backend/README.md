# 🔥 Fireflies.ai Clone - Backend (Django REST Framework + Groq LLM)

A production-grade backend for the **Fireflies.ai Meeting Notes & Transcription Platform** built for the **Scaler AI Labs SDE Assignment**.

---

## 🌟 Overview & Architecture

The backend provides a comprehensive RESTful API for managing meeting libraries, synchronizing interactive transcripts, extracting AI-powered summaries with **Groq LLM (`llama-3.3-70b-versatile`)**, tracking action items, managing chapter outlines, handling user notes/comments, and answering user questions through an interactive "Ask AI" assistant.

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                  Django REST Framework (DRF)                │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │ Meeting View  │ │ Action Items  │ │ Ask-AI Q&A Engine │  │
│  └───────┬───────┘ └───────┬───────┘ └─────────┬─────────┘  │
│          │                 │                   │            │
│  ┌───────▼─────────────────▼───────────────────▼─────────┐  │
│  │                    Service Layer                      │  │
│  │  • Groq LLM Service (Summaries, Actions, Chapters)     │  │
│  │  • Transcript Parser (JSON, VTT, SRT, Plain Text)     │  │
│  │  • Multi-Format Exporter (MD, TXT, VTT, JSON)         │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │               SQLite Relational Database              │  │
│  │  (Meetings, Transcripts, Summaries, Actions, Chapters) │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design (SQLite + Django ORM)

| Model | Description | Key Fields / Relations |
|---|---|---|
| **`Meeting`** | Root entity for a recorded/uploaded meeting | `id` (UUID), `title`, `meeting_date`, `duration_seconds`, `participants` (JSON), `audio_url`, `meeting_type`, `status` |
| **`TranscriptSegment`** | Individual speaker utterance with timing | `id` (UUID), `meeting` (FK), `speaker_name`, `start_time` (sec), `end_time` (sec), `text`, `sequence_order` |
| **`Summary`** | High-level meeting intelligence & takeaways | `id` (UUID), `meeting` (OneToOne), `overview` (Text), `key_points` (JSON), `keywords` (JSON) |
| **`ActionItem`** | Extracted or custom tasks with status | `id` (UUID), `meeting` (FK), `task`, `assignee`, `due_date`, `completed` (Boolean) |
| **`Chapter`** | Timeline breakdown & chapter outlines | `id` (UUID), `meeting` (FK), `title`, `start_time`, `end_time`, `summary`, `sequence_order` |
| **`Comment`** | User notes and highlights | `id` (UUID), `meeting` (FK), `segment` (FK, optional), `user_name`, `content`, `color_tag` |
| **`ChatMessage`** | Conversation history for Ask-AI Q&A | `id` (UUID), `meeting` (FK), `role` (`user`/`assistant`), `content`, `created_at` |

---

## 🚀 Quickstart & Setup Instructions

### 1. Prerequisites
- Python 3.10+
- `pip` / `virtualenv`

### 2. Create and Activate Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
cp .env.example .env
```
Add your Groq API key:
```env
SECRET_KEY=django-insecure-fireflies-clone-scaler-ai-key-change-in-prod-!@#$
DEBUG=True
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```
*(Note: If `GROQ_API_KEY` is not provided, the backend seamlessly activates its built-in heuristic analysis and Q&A engine so all features work reliably).*

### 5. Apply Migrations
```bash
python manage.py makemigrations meetings
python manage.py migrate
```

### 6. Seed Sample Data
Populate 5 realistic, full-featured meetings with complete transcripts, AI summaries, action items, chapters, and comments:
```bash
python manage.py seed_meetings
```

### 7. Run the Development Server
```bash
python manage.py runserver 8000
```
- API Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- API V1 Base: [http://127.0.0.1:8000/api/v1/](http://127.0.0.1:8000/api/v1/)
- Django Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 🧪 Running Automated Tests

Run the complete test suite:
```bash
python manage.py test
```

---

## 📡 REST API Reference

### Meetings API
- `GET /api/v1/meetings/` — List meetings with search (`?search=`), filtering (`?type=`, `?participant=`, `?start_date=`), and sorting (`?ordering=-meeting_date`).
- `GET /api/v1/meetings/{id}/` — Retrieve full meeting details (transcripts, summary, chapters, action items, comments).
- `POST /api/v1/meetings/` — Create a new meeting (supports metadata, raw text, VTT, SRT, or JSON transcript, with automatic Groq summary generation).
- `PATCH /api/v1/meetings/{id}/` — Update meeting metadata (title, participants, meeting type).
- `DELETE /api/v1/meetings/{id}/` — Delete meeting with cascading deletes.

### Intelligence & Groq AI Endpoints
- `POST /api/v1/meetings/{id}/generate-summary/` — Trigger/regenerate Groq LLM summary, key points, action items, and chapter outline.
- `POST /api/v1/meetings/{id}/ask/` — Ask questions about the meeting grounded strictly in transcript context.
  - Body: `{"question": "What was decided regarding the security audit?"}`
- `GET /api/v1/meetings/{id}/export/?format=markdown|txt|vtt|json` — Export meeting notes and transcript.

### Transcripts & Action Items
- `GET /api/v1/meetings/{id}/transcript/?q=` — Get transcript lines with optional inline keyword search.
- `POST /api/v1/meetings/{id}/transcript/` — Append new transcript segments.
- `GET /api/v1/action-items/?meeting_id=` — List action items for a meeting.
- `POST /api/v1/action-items/` — Create an action item.
- `PATCH /api/v1/action-items/{id}/toggle/` — Toggle action item completion status (`completed`: `true`/`false`).
- `DELETE /api/v1/action-items/{id}/` — Delete an action item.

### Search & Analytics
- `GET /api/v1/search/?q=` — Global search across meetings, transcripts, and action items.
- `GET /api/v1/analytics/` — Global stats (total meetings, hours, completion rate, top topics).
- `GET /api/v1/analytics/?meeting_id=` — Per-meeting analytics (speaker talk-time percentage breakdown).
