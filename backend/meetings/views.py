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
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(meeting_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(meeting_date__lte=end_date)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create meeting, parse transcripts if provided, and auto-generate AI summary."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transcript_content = serializer.validated_data.pop('transcript_content', None)
        auto_generate = serializer.validated_data.pop('auto_generate_summary', True)

        # Create meeting instance
        meeting = serializer.save()

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

    @action(detail=True, methods=['post'], url_path='generate-summary')
    def generate_summary(self, request, pk=None):
        """Regenerate or generate Groq AI summary, action items, and chapters."""
        meeting = self.get_object()
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
        replace_action_items = request.data.get('replace_action_items', False)
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

    @action(detail=True, methods=['post'], url_path='ask')
    def ask_ai(self, request, pk=None):
        """Ask a question about this meeting using Groq LLM with context grounding."""
        meeting = self.get_object()
        req_serializer = AskQuestionRequestSerializer(data=request.data)
        req_serializer.is_valid(raise_exception=True)

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
                "created_at": assistant_msg.created_at
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

            return Response({
                "meeting_id": str(meeting.id),
                "meeting_title": meeting.title,
                "total_duration_seconds": meeting.duration_seconds,
                "total_segments": segments.count(),
                "talk_time_breakdown": talk_time_breakdown,
                "action_items_total": meeting.action_items.count(),
                "action_items_completed": meeting.action_items.filter(completed=True).count(),
            })

        # Global aggregate stats
        all_meetings = Meeting.objects.all()
        total_meetings = all_meetings.count()
        total_seconds = sum(m.duration_seconds for m in all_meetings)
        total_action_items = ActionItem.objects.count()
        completed_action_items = ActionItem.objects.filter(completed=True).count()

        # Collect top recurring keywords
        summaries = Summary.objects.all()
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
