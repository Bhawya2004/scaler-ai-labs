import logging
from collections import Counter
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Meeting,
    TranscriptSegment,
    Summary,
    ActionItem,
    Chapter,
    Comment,
    ChatMessage,
)
from .serializers import (
    MeetingListSerializer,
    MeetingDetailSerializer,
    MeetingCreateSerializer,
    TranscriptSegmentSerializer,
    SummarySerializer,
    ActionItemSerializer,
    ChapterSerializer,
    CommentSerializer,
    ChatMessageSerializer,
    AskQuestionRequestSerializer,
)
from .services.groq_service import groq_service
from .services.transcript_parser import TranscriptParser
from .services.export_service import ExportService

logger = logging.getLogger(__name__)


class MeetingViewSet(viewsets.ModelViewSet):
    """Full CRUD viewset for Meetings with search, filtering, and AI intelligence."""
    queryset = Meeting.objects.all().prefetch_related(
        'transcript_segments',
        'action_items',
        'chapters',
        'comments',
        'chat_messages'
    ).select_related('summary')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'meeting_type']
    ordering_fields = ['meeting_date', 'created_at', 'duration_seconds', 'title']
    ordering = ['-meeting_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return MeetingListSerializer
        elif self.action in ['retrieve']:
            return MeetingDetailSerializer
        elif self.action in ['create']:
            return MeetingCreateSerializer
        return MeetingDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by search term across title, participants, and type
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(meeting_type__icontains=search_query) |
                Q(participants__icontains=search_query)
            )

        # Filter by meeting type
        meeting_type = self.request.query_params.get('type', None)
        if meeting_type:
            queryset = queryset.filter(meeting_type__iexact=meeting_type)

        # Filter by participant name
        participant = self.request.query_params.get('participant', None)
        if participant:
            queryset = queryset.filter(participants__icontains=participant)

        # Filter by date range
        # Filter by user_email / workspace scoping
        user_email = self.request.query_params.get('user_email', None)
        if user_email:
            queryset = queryset.filter(user_email__iexact=user_email)

        workspace = self.request.query_params.get('workspace', None)
        if workspace:
            queryset = queryset.filter(workspace__iexact=workspace)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create meeting, parse transcripts if provided, and auto-generate AI summary."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transcript_content = serializer.validated_data.pop('transcript_content', None) or serializer.validated_data.pop('transcript_text', None)
        auto_generate = serializer.validated_data.pop('auto_generate_summary', True)

        # Get user scoping details
        user_email = request.data.get('user_email') or request.query_params.get('user_email') or 'bhawya@scaler.com'
        workspace = request.data.get('workspace') or 'Scaler AI Labs'

        # Create meeting instance
        meeting = serializer.save(user_email=user_email, workspace=workspace)

        # Handle uploaded transcript file if sent via multipart form
        if 'transcript_file' in request.FILES:
            uploaded_file = request.FILES['transcript_file']
            try:
                transcript_content = uploaded_file.read().decode('utf-8')
            except Exception as e:
                logger.error(f"Error reading transcript file: {e}")

        # If transcript content is provided, parse and create segments
        parsed_segments = []
        if transcript_content:
            parsed_segments, calculated_duration = TranscriptParser.parse(
                transcript_content,
                default_speaker="Speaker"
            )

            # Update duration if not provided
            if meeting.duration_seconds <= 0 and calculated_duration > 0:
                meeting.duration_seconds = int(calculated_duration)
                meeting.save(update_fields=['duration_seconds'])

            # Bulk create transcript segments
            segment_objs = [
                TranscriptSegment(
                    meeting=meeting,
                    speaker_name=seg['speaker_name'],
                    speaker_avatar=seg.get('speaker_avatar', ''),
                    start_time=seg['start_time'],
                    end_time=seg['end_time'],
                    text=seg['text'],
                    sequence_order=seg['sequence_order']
                )
                for seg in parsed_segments
            ]
            TranscriptSegment.objects.bulk_create(segment_objs)

            # Auto populate participants if empty
            if not meeting.participants:
                extracted_speakers = list({s['speaker_name'] for s in parsed_segments if s['speaker_name']})
                meeting.participants = extracted_speakers
                meeting.save(update_fields=['participants'])

            # Auto generate summary, action items, chapters via Groq
            if auto_generate and parsed_segments:
                try:
                    analysis = groq_service.generate_meeting_analysis(parsed_segments, title=meeting.title)
                    
                    # Create Summary
                    Summary.objects.create(
                        meeting=meeting,
                        overview=analysis.get('overview', 'Meeting overview summary.'),
                        key_points=analysis.get('key_points', []),
                        keywords=analysis.get('keywords', [])
                    )

                    # Create Action Items
                    for ai in analysis.get('action_items', []):
                        ActionItem.objects.create(
                            meeting=meeting,
                            task=ai.get('task', ''),
                            assignee=ai.get('assignee', 'Unassigned'),
                            due_date=ai.get('due_date', '')
                        )

                    # Create Chapters
                    for idx, ch in enumerate(analysis.get('chapters', [])):
                        Chapter.objects.create(
                            meeting=meeting,
                            title=ch.get('title', f'Chapter {idx+1}'),
                            start_time=ch.get('start_time', 0.0),
                            end_time=ch.get('end_time', 0.0),
                            summary=ch.get('summary', ''),
                            sequence_order=idx
                        )
                except Exception as e:
                    logger.error(f"Error during auto summary generation: {e}")

        # Return full meeting detail
        detail_serializer = MeetingDetailSerializer(meeting)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='generate-summary')
    def generate_summary(self, request, pk=None):
        """Get existing summary (GET) or generate/regenerate Groq AI summary, action items, and chapters (POST)."""
        meeting = self.get_object()

        if request.method == 'GET':
            if hasattr(meeting, 'summary') and meeting.summary:
                return Response(SummarySerializer(meeting.summary).data)
            return Response({
                "detail": "No summary generated yet. Send a POST request to generate an AI summary."
            })

        segments = meeting.transcript_segments.all()
        if not segments.exists():
            return Response(
                {"detail": "Cannot generate summary for a meeting without transcripts."},
                status=status.HTTP_400_BAD_REQUEST
            )

        segment_dicts = [
            {
                "speaker_name": s.speaker_name,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "text": s.text,
            }
            for s in segments
        ]

        analysis = groq_service.generate_meeting_analysis(segment_dicts, title=meeting.title)

        # Update or create summary
        Summary.objects.update_or_create(
            meeting=meeting,
            defaults={
                "overview": analysis.get('overview', 'Meeting overview summary.'),
                "key_points": analysis.get('key_points', []),
                "keywords": analysis.get('keywords', [])
            }
        )

        # Add any newly extracted action items if user requested
        replace_action_items = request.data.get('replace_action_items', False) if request.data else False
        if replace_action_items:
            meeting.action_items.all().delete()

        if replace_action_items or not meeting.action_items.exists():
            for ai in analysis.get('action_items', []):
                ActionItem.objects.create(
                    meeting=meeting,
                    task=ai.get('task', ''),
                    assignee=ai.get('assignee', 'Unassigned'),
                    due_date=ai.get('due_date', '')
                )

        # Update chapters
        if analysis.get('chapters'):
            meeting.chapters.all().delete()
            for idx, ch in enumerate(analysis.get('chapters', [])):
                Chapter.objects.create(
                    meeting=meeting,
                    title=ch.get('title', f'Chapter {idx+1}'),
                    start_time=ch.get('start_time', 0.0),
                    end_time=ch.get('end_time', 0.0),
                    summary=ch.get('summary', ''),
                    sequence_order=idx
                )

        detail_serializer = MeetingDetailSerializer(meeting)
        return Response(detail_serializer.data)

    @action(detail=True, methods=['get', 'post'], url_path='ask', serializer_class=AskQuestionRequestSerializer)
    def ask_ai(self, request, pk=None):
        """Ask a question about this meeting using Groq LLM with context grounding (POST) or view chat history (GET)."""
        meeting = self.get_object()

        if request.method == 'GET':
            # Support asking question via GET query param ?question=... or ?q=...
            query_q = request.query_params.get('question') or request.query_params.get('q')
            if not query_q:
                # Return chat history
                chats = meeting.chat_messages.all()
                return Response({
                    "meeting_id": str(meeting.id),
                    "meeting_title": meeting.title,
                    "total_messages": chats.count(),
                    "history": ChatMessageSerializer(chats, many=True).data,
                    "usage": "To ask a question, send a POST request with JSON body {'question': 'your question'} or pass ?question=... in URL."
                })
            question = query_q
            save_to_history = True
        else:
            req_serializer = AskQuestionRequestSerializer(data=request.data)
            if not req_serializer.is_valid():
                # Fallback: check query params if body was empty
                query_q = request.query_params.get('question') or request.query_params.get('q')
                if query_q:
                    question = query_q
                    save_to_history = True
                else:
                    return Response(req_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                question = req_serializer.validated_data['question']
                save_to_history = req_serializer.validated_data.get('save_to_history', True)

        segments = meeting.transcript_segments.all()
        segment_dicts = [
            {
                "speaker_name": s.speaker_name,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "text": s.text,
            }
            for s in segments
        ]

        # Fetch recent chat history
        recent_chats = meeting.chat_messages.all().order_by('-created_at')[:8]
        chat_history = [
            {"role": c.role, "content": c.content}
            for c in reversed(recent_chats)
        ]

        # Call Groq LLM Q&A
        answer = groq_service.ask_meeting_question(
            segments=segment_dicts,
            question=question,
            chat_history=chat_history,
            title=meeting.title
        )

        # Save to chat history if enabled
        if save_to_history:
            ChatMessage.objects.create(meeting=meeting, role="user", content=question)
            assistant_msg = ChatMessage.objects.create(meeting=meeting, role="assistant", content=answer)
            return Response({
                "question": question,
                "answer": answer,
                "message_id": str(assistant_msg.id),
                "created_at": assistant_msg.created_at.isoformat()
            })

        return Response({
            "question": question,
            "answer": answer
        })

    @action(detail=True, methods=['get'], url_path='export')
    def export(self, request, pk=None):
        """Export meeting notes & transcript in Markdown, Plain Text, or VTT format."""
        meeting = self.get_object()
        export_format = (request.query_params.get('format') or request.query_params.get('export_format') or 'markdown').lower()

        if export_format in ['md', 'markdown']:
            content = ExportService.to_markdown(meeting)
            response = HttpResponse(content, content_type='text/markdown; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{meeting.title.replace(" ", "_")}.md"'
            return response
        elif export_format in ['txt', 'text']:
            content = ExportService.to_plain_text(meeting)
            response = HttpResponse(content, content_type='text/plain; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{meeting.title.replace(" ", "_")}.txt"'
            return response
        elif export_format in ['vtt']:
            content = ExportService.to_vtt(meeting)
            response = HttpResponse(content, content_type='text/vtt; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{meeting.title.replace(" ", "_")}.vtt"'
            return response
        elif export_format in ['json']:
            serializer = MeetingDetailSerializer(meeting)
            return Response(serializer.data)

        return Response({"detail": "Unsupported format. Use markdown, txt, vtt, or json."}, status=400)

    @action(detail=True, methods=['get', 'post'], url_path='transcript')
    def transcript(self, request, pk=None):
        """Get all transcript lines (with optional inline query search) or append new lines."""
        meeting = self.get_object()

        if request.method == 'GET':
            query = request.query_params.get('q', None)
            segments = meeting.transcript_segments.all()
            if query:
                segments = segments.filter(Q(text__icontains=query) | Q(speaker_name__icontains=query))
            serializer = TranscriptSegmentSerializer(segments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            # Append a single segment or batch of segments
            data = request.data
            if isinstance(data, list):
                created = []
                for item in data:
                    item['meeting'] = str(meeting.id)
                    s = TranscriptSegmentSerializer(data=item)
                    s.is_valid(raise_exception=True)
                    s.save()
                    created.append(s.data)
                return Response(created, status=status.HTTP_201_CREATED)
            else:
                data['meeting'] = str(meeting.id)
                s = TranscriptSegmentSerializer(data=data)
                s.is_valid(raise_exception=True)
                s.save()
                return Response(s.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='seed-demo')
    def seed_demo(self, request):
        """Seed a rich demo meeting for the requested user."""
        from django.utils import timezone
        user_email = request.data.get('user_email') or 'bhawya@scaler.com'
        workspace = request.data.get('workspace') or 'Scaler AI Labs'

        now = timezone.now()
        m = Meeting.objects.create(
            title="Q3 Product Roadmap & AI Intelligence Review",
            meeting_date=now,
            duration_seconds=1800,
            participants=["Sarah Connor (Head of Product)", "Alex Rivera (Lead Architect)", "Priya Sharma (Senior PM)"],
            audio_url="https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3",
            meeting_type="Product",
            user_email=user_email,
            workspace=workspace,
            status="processed"
        )
        TranscriptSegment.objects.create(
            meeting=m, speaker_name="Sarah Connor (Head of Product)", start_time=0.0, end_time=18.0, text="Good morning team! Today we are reviewing our Q3 product roadmap with a heavy focus on the new Groq AI intelligence features.", sequence_order=0
        )
        TranscriptSegment.objects.create(
            meeting=m, speaker_name="Alex Rivera (Lead Architect)", start_time=19.5, end_time=45.0, text="From an architectural perspective, Groq's low-latency inference allows us to generate real-time meeting summaries in sub-second response times.", sequence_order=1
        )
        TranscriptSegment.objects.create(
            meeting=m, speaker_name="Priya Sharma (Senior PM)", start_time=46.0, end_time=75.0, text="I will finalize the PRD for dashboard filters and share it with the team by Thursday afternoon.", sequence_order=2
        )
        Summary.objects.create(
            meeting=m,
            overview="The team reviewed product milestones and confirmed low-latency Groq AI integration with sub-second response times.",
            key_points=["Groq AI inference confirmed with sub-500ms response times", "PRD finalized for release by Thursday"],
            keywords=["Roadmap", "Groq AI", "Architecture", "PRD"]
        )
        ActionItem.objects.create(meeting=m, task="Finalize PRD and share with engineering team", assignee="Priya Sharma", due_date="Thursday")
        Chapter.objects.create(meeting=m, title="1. Product Kickoff", start_time=0.0, end_time=18.0, summary="Opening review")
        Chapter.objects.create(meeting=m, title="2. Architecture & AI Sync", start_time=19.5, end_time=75.0, summary="Groq AI and latency discussion")

        serializer = MeetingDetailSerializer(m)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ActionItemViewSet(viewsets.ModelViewSet):
    """CRUD operations for action items, including fast status toggle."""
    queryset = ActionItem.objects.all()
    serializer_class = ActionItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        meeting_id = self.request.query_params.get('meeting_id', None)
        if meeting_id:
            queryset = queryset.filter(meeting_id=meeting_id)
        completed = self.request.query_params.get('completed', None)
        if completed is not None:
            is_completed = completed.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(completed=is_completed)
        return queryset

    @action(detail=True, methods=['patch'], url_path='toggle')
    def toggle_completed(self, request, pk=None):
        """Toggle action item status between completed and pending."""
        item = self.get_object()
        item.completed = not item.completed
        item.save(update_fields=['completed', 'updated_at'])
        return Response(self.get_serializer(item).data)


class CommentViewSet(viewsets.ModelViewSet):
    """CRUD operations for user notes, comments, and highlights."""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        meeting_id = self.request.query_params.get('meeting_id', None)
        if meeting_id:
            queryset = queryset.filter(meeting_id=meeting_id)
        return queryset


class GlobalSearchView(APIView):
    """Global search across all meetings, transcripts, summaries, and action items."""

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({
                "meetings": [],
                "transcript_matches": [],
                "action_item_matches": [],
                "total_results": 0
            })

        # Search matching meetings
        matching_meetings = Meeting.objects.filter(
            Q(title__icontains=query) |
            Q(meeting_type__icontains=query) |
            Q(participants__icontains=query) |
            Q(summary__overview__icontains=query)
        ).distinct()[:10]

        # Search matching transcript segments
        matching_segments = TranscriptSegment.objects.filter(
            Q(text__icontains=query) | Q(speaker_name__icontains=query)
        ).select_related('meeting')[:25]

        # Search matching action items
        matching_action_items = ActionItem.objects.filter(
            Q(task__icontains=query) | Q(assignee__icontains=query)
        ).select_related('meeting')[:10]

        transcript_results = [
            {
                "segment_id": str(seg.id),
                "meeting_id": str(seg.meeting.id),
                "meeting_title": seg.meeting.title,
                "speaker_name": seg.speaker_name,
                "start_time": seg.start_time,
                "end_time": seg.end_time,
                "text": seg.text,
                "meeting_date": seg.meeting.meeting_date
            }
            for seg in matching_segments
        ]

        action_results = [
            {
                "action_item_id": str(item.id),
                "meeting_id": str(item.meeting.id),
                "meeting_title": item.meeting.title,
                "task": item.task,
                "assignee": item.assignee,
                "completed": item.completed
            }
            for item in matching_action_items
        ]

        return Response({
            "query": query,
            "meetings": MeetingListSerializer(matching_meetings, many=True).data,
            "transcript_matches": transcript_results,
            "action_item_matches": action_results,
            "total_results": matching_meetings.count() + len(transcript_results) + len(action_results)
        })


class AnalyticsView(APIView):
    """Aggregate statistics & talk-time metrics (Fireflies intelligence dashboard)."""

    def get(self, request):
        meeting_id = request.query_params.get('meeting_id', None)

        if meeting_id:
            # Stats for a single meeting
            meeting = get_object_or_404(Meeting, id=meeting_id)
            segments = meeting.transcript_segments.all()
            
            speaker_durations = {}
            total_speech_time = 0.0
            for s in segments:
                duration = max(1.0, s.end_time - s.start_time)
                speaker_durations[s.speaker_name] = speaker_durations.get(s.speaker_name, 0.0) + duration
                total_speech_time += duration

            talk_time_breakdown = [
                {
                    "speaker": speaker,
                    "seconds": round(sec, 1),
                    "percentage": round((sec / total_speech_time) * 100, 1) if total_speech_time > 0 else 0
                }
                for speaker, sec in sorted(speaker_durations.items(), key=lambda x: x[1], reverse=True)
            ]

            # Calculate Dominance & Balance Score
            dominance_score = 0.0
            meeting_balance = "Balanced"
            if talk_time_breakdown:
                dominance_score = talk_time_breakdown[0]["percentage"]
                if dominance_score > 70.0:
                    meeting_balance = "Monopolized (One Speaker > 70%)"
                elif dominance_score > 55.0:
                    meeting_balance = "Moderately Dominant"
                else:
                    meeting_balance = "Highly Balanced"

            # Calculate Conversation Flow Matrix (who spoke after whom)
            ordered_segments = segments.order_by('start_time')
            interactions = {}
            previous_speaker = None
            for s in ordered_segments:
                current_speaker = s.speaker_name or "Unknown"
                if previous_speaker and previous_speaker != current_speaker:
                    key = f"{previous_speaker} -> {current_speaker}"
                    interactions[key] = interactions.get(key, 0) + 1
                previous_speaker = current_speaker

            interaction_list = [
                {
                    "from_speaker": k.split(" -> ")[0],
                    "to_speaker": k.split(" -> ")[1],
                    "count": count
                }
                for k, count in sorted(interactions.items(), key=lambda x: x[1], reverse=True)
            ]

            return Response({
                "meeting_id": str(meeting.id),
                "meeting_title": meeting.title,
                "total_duration_seconds": meeting.duration_seconds,
                "total_segments": segments.count(),
                "talk_time_breakdown": talk_time_breakdown,
                "action_items_total": meeting.action_items.count(),
                "action_items_completed": meeting.action_items.filter(completed=True).count(),
                "dominance_score": dominance_score,
                "meeting_balance": meeting_balance,
                "conversation_flow": interaction_list,
            })

        # Global aggregate stats (optionally scoped to user)
        user_email = request.query_params.get('user_email', None)
        all_meetings = Meeting.objects.all()
        if user_email:
            all_meetings = all_meetings.filter(user_email__iexact=user_email)

        total_meetings = all_meetings.count()
        total_seconds = sum(m.duration_seconds for m in all_meetings)
        meeting_ids = all_meetings.values_list('id', flat=True)
        total_action_items = ActionItem.objects.filter(meeting_id__in=meeting_ids).count()
        completed_action_items = ActionItem.objects.filter(meeting_id__in=meeting_ids, completed=True).count()

        # Collect top recurring keywords
        summaries = Summary.objects.filter(meeting_id__in=meeting_ids)
        all_keywords = []
        for s in summaries:
            if isinstance(s.keywords, list):
                all_keywords.extend(s.keywords)
        top_topics = [item for item, _ in Counter(all_keywords).most_common(8)]

        return Response({
            "total_meetings": total_meetings,
            "total_hours": round(total_seconds / 3600, 1),
            "total_action_items": total_action_items,
            "completed_action_items": completed_action_items,
            "action_completion_rate": round((completed_action_items / total_action_items * 100), 1) if total_action_items > 0 else 0,
            "top_topics": top_topics,
        })
