from django.contrib import admin
from .models import (
    Meeting,
    TranscriptSegment,
    Summary,
    ActionItem,
    Chapter,
    Comment,
    ChatMessage,
)


class TranscriptSegmentInline(admin.TabularInline):
    model = TranscriptSegment
    extra = 0
    fields = ('speaker_name', 'start_time', 'end_time', 'text')


class ActionItemInline(admin.TabularInline):
    model = ActionItem
    extra = 0
    fields = ('task', 'assignee', 'due_date', 'completed')


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 0
    fields = ('sequence_order', 'title', 'start_time', 'end_time', 'summary')


class SummaryInline(admin.StackedInline):
    model = Summary
    extra = 0


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('title', 'meeting_date', 'meeting_type', 'duration_seconds', 'status', 'created_at')
    list_filter = ('meeting_type', 'status', 'meeting_date')
    search_fields = ('title', 'participants')
    inlines = [SummaryInline, ActionItemInline, ChapterInline, TranscriptSegmentInline]


@admin.register(TranscriptSegment)
class TranscriptSegmentAdmin(admin.ModelAdmin):
    list_display = ('meeting', 'speaker_name', 'start_time', 'end_time', 'text')
    search_fields = ('text', 'speaker_name')
    list_filter = ('meeting', 'speaker_name')


@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ('meeting', 'created_at')
    search_fields = ('overview', 'meeting__title')


@admin.register(ActionItem)
class ActionItemAdmin(admin.ModelAdmin):
    list_display = ('task', 'meeting', 'assignee', 'due_date', 'completed')
    list_filter = ('completed', 'assignee')
    search_fields = ('task', 'assignee', 'meeting__title')


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('meeting', 'sequence_order', 'title', 'start_time', 'end_time')
    search_fields = ('title', 'summary', 'meeting__title')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('meeting', 'user_name', 'color_tag', 'created_at', 'content')
    list_filter = ('color_tag', 'user_name')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('meeting', 'role', 'created_at', 'content')
    list_filter = ('role', 'meeting')
