from rest_framework import serializers
from .models import (
    Meeting,
    TranscriptSegment,
    Summary,
    ActionItem,
    Chapter,
    Comment,
    ChatMessage,
)


class TranscriptSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TranscriptSegment
        fields = [
            'id',
            'meeting',
            'speaker_name',
            'speaker_avatar',
            'start_time',
            'end_time',
            'text',
            'sequence_order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Summary
        fields = [
            'id',
            'meeting',
            'overview',
            'key_points',
            'keywords',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ActionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionItem
        fields = [
            'id',
            'meeting',
            'task',
            'assignee',
            'due_date',
            'completed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = [
            'id',
            'meeting',
            'title',
            'start_time',
            'end_time',
            'summary',
            'sequence_order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = [
            'id',
            'meeting',
            'segment',
            'user_name',
            'content',
            'color_tag',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'meeting',
            'role',
            'content',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class MeetingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for meeting dashboard/library listing."""
    transcript_count = serializers.IntegerField(source='transcript_segments.count', read_only=True)
    action_items_count = serializers.IntegerField(source='action_items.count', read_only=True)
    summary_overview = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = [
            'id',
            'title',
            'meeting_date',
            'duration_seconds',
            'participants',
            'audio_url',
            'meeting_type',
            'status',
            'transcript_count',
            'action_items_count',
            'summary_overview',
            'created_at',
            'updated_at',
        ]

    def get_summary_overview(self, obj):
        if hasattr(obj, 'summary') and obj.summary:
            return obj.summary.overview[:140] + ("..." if len(obj.summary.overview) > 140 else "")
        return None


class MeetingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with full nested relationships for the meeting room."""
    transcript_segments = TranscriptSegmentSerializer(many=True, read_only=True)
    summary = SummarySerializer(read_only=True)
    action_items = ActionItemSerializer(many=True, read_only=True)
    chapters = ChapterSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    chat_messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Meeting
        fields = [
            'id',
            'title',
            'meeting_date',
            'duration_seconds',
            'participants',
            'audio_url',
            'meeting_type',
            'status',
            'transcript_segments',
            'summary',
            'action_items',
            'chapters',
            'comments',
            'chat_messages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MeetingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a meeting with optional raw transcript content."""
    transcript_content = serializers.CharField(write_only=True, required=False, allow_blank=True)
    auto_generate_summary = serializers.BooleanField(write_only=True, required=False, default=True)

    class Meta:
        model = Meeting
        fields = [
            'id',
            'title',
            'meeting_date',
            'duration_seconds',
            'participants',
            'audio_url',
            'meeting_type',
            'status',
            'transcript_content',
            'auto_generate_summary',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AskQuestionRequestSerializer(serializers.Serializer):
    question = serializers.CharField(required=True, min_length=2)
    save_to_history = serializers.BooleanField(default=True)
