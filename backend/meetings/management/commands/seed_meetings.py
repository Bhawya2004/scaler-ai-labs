import uuid
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from meetings.models import (
    Meeting,
    TranscriptSegment,
    Summary,
    ActionItem,
    Chapter,
    Comment,
    ChatMessage,
)


class Command(BaseCommand):
    help = "Seeds the database with realistic Fireflies.ai sample meetings, transcripts, AI summaries, and action items."

    def handle(self, *args, **options):
        self.stdout.write("Cleaning existing meeting data...")
        Meeting.objects.all().delete()

        now = timezone.now()

        # ==========================================
        # Meeting 1: Product Roadmap & AI Review
        # ==========================================
        m1 = Meeting.objects.create(
            id=uuid.uuid4(),
            title="Q3 Product Roadmap & AI Intelligence Review",
            meeting_date=now - timedelta(hours=3),
            duration_seconds=2100,  # 35 mins
            participants=["Sarah Connor (Head of Product)", "Alex Rivera (Lead Architect)", "Priya Sharma (Senior PM)", "David Kim (ML Engineer)"],
            audio_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
            meeting_type="Product",
            status="processed"
        )

        m1_segments = [
            ("Sarah Connor (Head of Product)", 0.0, 18.0, "Good morning everyone. Thanks for jumping on. Today we're reviewing our Q3 product roadmap with a heavy focus on the new AI intelligence features powered by Groq and LLaMA 3.3."),
            ("Alex Rivera (Lead Architect)", 19.5, 42.0, "Morning Sarah. From an architectural perspective, Groq's low-latency inference allows us to generate real-time meeting summaries and chapter outlines in sub-second response times, which drastically improves the user experience."),
            ("Priya Sharma (Senior PM)", 43.0, 68.0, "That's huge. In our customer feedback surveys, users specifically asked for three things: instant smart chapters, speaker talk-time breakdown, and an interactive 'Ask AI' assistant in the transcript view."),
            ("David Kim (ML Engineer)", 69.5, 95.0, "On the model side, we have structured JSON mode enabled for Groq. It reliably extracts action items with assignees and due dates directly from the raw transcript with 95%+ precision."),
            ("Sarah Connor (Head of Product)", 96.0, 122.0, "Excellent. Alex, what is the plan for integrating the audio seek bar so clicking a transcript line jumps the media player directly to that second?"),
            ("Alex Rivera (Lead Architect)", 123.0, 155.0, "We've implemented bidirectional sync between the audio element and transcript segments. When a user clicks any timestamp, `audio.currentTime` updates immediately, and vice versa while playing."),
            ("Priya Sharma (Senior PM)", 156.0, 180.0, "I will finalize the PRD for the dashboard filters and share it with the team by Thursday afternoon."),
            ("David Kim (ML Engineer)", 181.0, 210.0, "I will add the heuristic fallback engine to handle edge cases where the network drops or API rate limits are hit."),
            ("Sarah Connor (Head of Product)", 211.0, 235.0, "Perfect. Let's make sure we have unit tests covering all endpoints. Thank you all for the great progress!")
        ]

        for idx, (speaker, start, end, text) in enumerate(m1_segments):
            TranscriptSegment.objects.create(
                meeting=m1,
                speaker_name=speaker,
                start_time=start,
                end_time=end,
                text=text,
                sequence_order=idx
            )

        Summary.objects.create(
            meeting=m1,
            overview="The team aligned on the Q3 roadmap focusing on AI intelligence features powered by Groq. Key discussions centered around sub-second summary generation, bidirectional media player seeking, and structured action item extraction.",
            key_points=[
                "Groq LLM enables sub-second real-time meeting summaries and chapter outlines.",
                "Bidirectional media player sync allows clicking timestamps to jump audio playback instantly.",
                "Structured JSON mode delivers 95%+ precision for automatic action item extraction.",
                "Priya Sharma will deliver the updated PRD by Thursday.",
                "David Kim is implementing offline heuristic fallbacks for high reliability."
            ],
            keywords=["Groq LLM", "LLaMA 3.3", "Roadmap", "Audio Sync", "Action Items", "Fast Inference"]
        )

        ActionItem.objects.create(meeting=m1, task="Finalize and circulate Q3 AI Features PRD", assignee="Priya Sharma (Senior PM)", due_date="Thursday 5:00 PM", completed=True)
        ActionItem.objects.create(meeting=m1, task="Implement offline fallback engine for Groq LLM", assignee="David Kim (ML Engineer)", due_date="Friday", completed=False)
        ActionItem.objects.create(meeting=m1, task="Optimize bidirectional audio seek bar latency", assignee="Alex Rivera (Lead Architect)", due_date="Next Sprint", completed=False)

        Chapter.objects.create(meeting=m1, title="Welcome & Q3 AI Roadmap Goals", start_time=0.0, end_time=42.0, summary="Sarah opens the sync and Alex highlights Groq low latency advantages.", sequence_order=0)
        Chapter.objects.create(meeting=m1, title="Customer Feedback & AI Extraction Engine", start_time=43.0, end_time=122.0, summary="Priya and David discuss structured JSON mode and user expectations.", sequence_order=1)
        Chapter.objects.create(meeting=m1, title="Audio Player Sync & Next Steps", start_time=123.0, end_time=235.0, summary="Alex explains media sync and action items are assigned.", sequence_order=2)

        Comment.objects.create(meeting=m1, user_name="Sarah Connor", content="Make sure we highlight the Groq sub-second latency in the customer demo!", color_tag="purple")
        ChatMessage.objects.create(meeting=m1, role="user", content="Who is responsible for the PRD and when is it due?")
        ChatMessage.objects.create(meeting=m1, role="assistant", content="Priya Sharma (Senior PM) is responsible for finalizing the PRD, and it is due by Thursday afternoon.")

        # ==========================================
        # Meeting 2: Enterprise Client Security & Demo
        # ==========================================
        m2 = Meeting.objects.create(
            id=uuid.uuid4(),
            title="Enterprise Client Security & SOC-2 Compliance Demo",
            meeting_date=now - timedelta(days=1, hours=2),
            duration_seconds=1800,  # 30 mins
            participants=["Elena Rostova (Account Executive)", "Marcus Vance (CISO, Apex Corp)", "Jason Lee (Security Engineer)"],
            audio_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            meeting_type="Sales",
            status="processed"
        )

        m2_segments = [
            ("Elena Rostova (Account Executive)", 0.0, 22.0, "Welcome Marcus. Today we're thrilled to walk Apex Corp through our meeting intelligence platform and address your security and SOC-2 Type II questions."),
            ("Marcus Vance (CISO, Apex Corp)", 23.0, 50.0, "Thanks Elena. Our primary criteria for adoption across our 2,000 enterprise seats are data residency, zero-data-retention agreements for LLM inference, and role-based access control."),
            ("Jason Lee (Security Engineer)", 51.0, 85.0, "Understood Marcus. All transcript data is encrypted at rest using AES-256 and in transit via TLS 1.3. For Groq LLM processing, we operate under enterprise zero-data-retention agreements where transcripts are never used for training."),
            ("Marcus Vance (CISO, Apex Corp)", 86.0, 110.0, "That is exactly what our compliance team requires. Can you also support custom data export into Markdown and JSON for our internal audit trails?"),
            ("Elena Rostova (Account Executive)", 111.0, 138.0, "Yes! We support single-click exports to Markdown, formatted TXT, and structured JSON with full transcript segments and action items."),
            ("Jason Lee (Security Engineer)", 139.0, 165.0, "I will send over our latest SOC-2 Type II audit report and standard DPA package by tomorrow morning."),
            ("Elena Rostova (Account Executive)", 166.0, 190.0, "And I will prepare the 2,000 seat enterprise pilot proposal for your review by Friday.")
        ]

        for idx, (speaker, start, end, text) in enumerate(m2_segments):
            TranscriptSegment.objects.create(
                meeting=m2,
                speaker_name=speaker,
                start_time=start,
                end_time=end,
                text=text,
                sequence_order=idx
            )

        Summary.objects.create(
            meeting=m2,
            overview="Apex Corp security review with CISO Marcus Vance. Addressed enterprise compliance requirements including AES-256 encryption, zero-data retention on LLM pipelines, and audit export formats. Moving forward with a 2,000 seat pilot proposal.",
            key_points=[
                "Apex Corp confirmed 2,000 enterprise seat deployment requirement.",
                "Confirmed AES-256 at-rest encryption and TLS 1.3 transit security.",
                "Groq LLM zero-data-retention guarantees meet strict enterprise security standards.",
                "Supported custom exports in Markdown, TXT, and JSON for audit trails.",
                "Jason Lee to provide SOC-2 Type II report and DPA tomorrow morning."
            ],
            keywords=["Security", "SOC-2", "Zero Data Retention", "Enterprise Pilot", "Encryption"]
        )

        ActionItem.objects.create(meeting=m2, task="Send SOC-2 Type II report and standard DPA to Marcus", assignee="Jason Lee (Security Engineer)", due_date="Tomorrow 10:00 AM", completed=True)
        ActionItem.objects.create(meeting=m2, task="Draft 2,000 seat enterprise pilot proposal", assignee="Elena Rostova (Account Executive)", due_date="Friday", completed=False)

        Chapter.objects.create(meeting=m2, title="Introductions & Apex Corp Security Criteria", start_time=0.0, end_time=50.0, summary="Marcus outlines security and compliance prerequisites.", sequence_order=0)
        Chapter.objects.create(meeting=m2, title="Encryption Standards & Zero-Retention LLM", start_time=51.0, end_time=110.0, summary="Jason explains AES-256 and Groq privacy policies.", sequence_order=1)
        Chapter.objects.create(meeting=m2, title="Export Capabilities & Pilot Next Steps", start_time=111.0, end_time=190.0, summary="Elena and Jason outline deliverables for the pilot.", sequence_order=2)

        # ==========================================
        # Meeting 3: Frontend Design System & UI Refresh
        # ==========================================
        m3 = Meeting.objects.create(
            id=uuid.uuid4(),
            title="Frontend Design System & Fireflies UI Refresh",
            meeting_date=now - timedelta(days=2, hours=4),
            duration_seconds=1500,  # 25 mins
            participants=["Maya Lin (Design Lead)", "Liam Foster (Frontend Lead)", "Chloe Zhang (UI Engineer)"],
            audio_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            meeting_type="Design",
            status="processed"
        )

        m3_segments = [
            ("Maya Lin (Design Lead)", 0.0, 25.0, "Hi team. Today we're reviewing the high-fidelity UI components replicating Fireflies's iconic purple-indigo color palette, clean typography, and responsive panels."),
            ("Liam Foster (Frontend Lead)", 26.0, 55.0, "Awesome. In Next.js, we've set up a split layout with the interactive transcript on the left and dynamic tabbed summary panels on the right."),
            ("Chloe Zhang (UI Engineer)", 56.0, 85.0, "We also built floating action item cards with smooth toggle checkboxes and instant optimistic updates so the UI feels ultra-responsive."),
            ("Maya Lin (Design Lead)", 86.0, 115.0, "Love it. Let's ensure search highlighting in transcripts is instantaneous using regex string splitting, and that speaker avatars use distinct pastel colors."),
            ("Liam Foster (Frontend Lead)", 116.0, 140.0, "I will write the theme tokens and export the Tailwind CSS configuration for the full team by tomorrow.")
        ]

        for idx, (speaker, start, end, text) in enumerate(m3_segments):
            TranscriptSegment.objects.create(
                meeting=m3,
                speaker_name=speaker,
                start_time=start,
                end_time=end,
                text=text,
                sequence_order=idx
            )

        Summary.objects.create(
            meeting=m3,
            overview="Design and frontend sync reviewing the Fireflies-inspired layout. Focused on split transcript and summary views, optimistic action item toggles, distinct speaker avatars, and search highlighting.",
            key_points=[
                "Implemented split layout with synchronized transcript and summary panels.",
                "Optimistic UI updates for action item checkbox toggles.",
                "Instant search keyword highlighting across meeting transcripts.",
                "Liam Foster to export unified design system tokens tomorrow."
            ],
            keywords=["Design System", "Fireflies UI", "Next.js", "Micro-animations", "Speaker Badges"]
        )

        ActionItem.objects.create(meeting=m3, task="Publish unified theme tokens and color palette", assignee="Liam Foster (Frontend Lead)", due_date="Tomorrow", completed=True)
        ActionItem.objects.create(meeting=m3, task="Add speaker avatar color hashing utility", assignee="Chloe Zhang (UI Engineer)", due_date="Wednesday", completed=False)

        Chapter.objects.create(meeting=m3, title="UI Architecture & Layout Review", start_time=0.0, end_time=55.0, summary="Maya and Liam review Next.js layout structure.", sequence_order=0)
        Chapter.objects.create(meeting=m3, title="Micro-interactions & Search Highlights", start_time=56.0, end_time=140.0, summary="Chloe and Maya finalize animation and highlighting specs.", sequence_order=1)

        # ==========================================
        # Meeting 4: Backend Scalability & SQLite Optimization
        # ==========================================
        m4 = Meeting.objects.create(
            id=uuid.uuid4(),
            title="Backend Scalability & High-Throughput Sync",
            meeting_date=now - timedelta(days=3, hours=5),
            duration_seconds=2700,  # 45 mins
            participants=["Alex Rivera (Lead Architect)", "Tariq Mansoor (DevOps Engineer)", "Nina Patel (Backend Engineer)"],
            audio_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            meeting_type="Engineering",
            status="processed"
        )

        m4_segments = [
            ("Alex Rivera (Lead Architect)", 0.0, 28.0, "Let's review our Django backend throughput, database indexing, and transcript search latency across millions of utterances."),
            ("Nina Patel (Backend Engineer)", 29.0, 60.0, "We added compound database indexes on (meeting_id, sequence_order) and (meeting_id, start_time). Full-text queries on SQLite now execute in under 4ms."),
            ("Tariq Mansoor (DevOps Engineer)", 61.0, 92.0, "On the deployment front, we have containerized the Django app with Gunicorn and Uvicorn workers for asynchronous performance."),
            ("Alex Rivera (Lead Architect)", 93.0, 120.0, "Great work. Nina, please ensure the seed command populates complete realistic datasets for evaluation.")
        ]

        for idx, (speaker, start, end, text) in enumerate(m4_segments):
            TranscriptSegment.objects.create(
                meeting=m4,
                speaker_name=speaker,
                start_time=start,
                end_time=end,
                text=text,
                sequence_order=idx
            )

        Summary.objects.create(
            meeting=m4,
            overview="Engineering sync on database performance and scalable architecture. Verified sub-4ms transcript query latency through compound indexing on SQLite and finalized containerization strategy.",
            key_points=[
                "Compound indexes on transcript segments reduced query latency to under 4ms.",
                "Gunicorn and Uvicorn async deployment configured.",
                "Automated seed command configured for instant evaluator testing."
            ],
            keywords=["Scalability", "Database Indexing", "SQLite", "Performance", "Gunicorn"]
        )

        ActionItem.objects.create(meeting=m4, task="Verify composite database indexes in production migrations", assignee="Nina Patel (Backend Engineer)", due_date="Friday", completed=True)

        Chapter.objects.create(meeting=m4, title="Database Optimization & Benchmarks", start_time=0.0, end_time=60.0, summary="Reviewing query times and SQLite compound indexes.", sequence_order=0)
        Chapter.objects.create(meeting=m4, title="Deployment & Testing Automation", start_time=61.0, end_time=120.0, summary="Tariq and Alex review server readiness.", sequence_order=1)

        # ==========================================
        # Meeting 5: Weekly Executive Sync
        # ==========================================
        m5 = Meeting.objects.create(
            id=uuid.uuid4(),
            title="Weekly Executive Sync & Go-To-Market Strategy",
            meeting_date=now - timedelta(days=4, hours=1),
            duration_seconds=1200,  # 20 mins
            participants=["Rachel Green (CEO)", "Sarah Connor (Head of Product)", "Elena Rostova (Account Executive)"],
            audio_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            meeting_type="Leadership",
            status="processed"
        )

        m5_segments = [
            ("Rachel Green (CEO)", 0.0, 24.0, "Welcome team. Weekly executive sync. Let's look at our user growth, enterprise pipeline, and Scaler AI project deliverables."),
            ("Sarah Connor (Head of Product)", 25.0, 55.0, "Our meeting assistant retention has grown 45% month-over-month. Users love the automated Groq summaries and instant Q&A."),
            ("Elena Rostova (Account Executive)", 56.0, 85.0, "Our enterprise pipeline is expanding rapidly with 5 new pilot proposals out this week.")
        ]

        for idx, (speaker, start, end, text) in enumerate(m5_segments):
            TranscriptSegment.objects.create(
                meeting=m5,
                speaker_name=speaker,
                start_time=start,
                end_time=end,
                text=text,
                sequence_order=idx
            )

        Summary.objects.create(
            meeting=m5,
            overview="Executive sync reviewing company milestones, 45% MoM user growth, product engagement metrics, and expanding enterprise sales pipeline.",
            key_points=[
                "User retention increased 45% month-over-month driven by Groq AI summaries.",
                "Five new enterprise pilot proposals sent out this week.",
                "Scaler AI Labs project milestones are on schedule."
            ],
            keywords=["Leadership", "Growth", "Retention", "Enterprise", "Milestones"]
        )

        ActionItem.objects.create(meeting=m5, task="Prepare investor update presentation with Q3 metrics", assignee="Rachel Green (CEO)", due_date="Next Monday", completed=False)

        Chapter.objects.create(meeting=m5, title="Company Growth & Product Highlights", start_time=0.0, end_time=55.0, summary="Rachel and Sarah review monthly metrics.", sequence_order=0)
        Chapter.objects.create(meeting=m5, title="Enterprise Pipeline Review", start_time=56.0, end_time=85.0, summary="Elena presents pilot opportunities.", sequence_order=1)

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded 5 realistic meetings with {TranscriptSegment.objects.count()} transcript segments, {ActionItem.objects.count()} action items, and {Summary.objects.count()} AI summaries!"))
