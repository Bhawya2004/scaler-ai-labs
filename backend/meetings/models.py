import uuid
from django.db import models
from django.utils import timezone

class Meeting(models.Model):
    """Core Meeting entity containing metadata, timing, and participants."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, db_index=True)
    meeting_date = models.DateTimeField(default=timezone.now, db_index=True)
    duration_seconds = models.IntegerField(default=0)
    participants = models.JSONField(default=list, help_text="List of participant names or objects")
    audio_url = models.CharField(max_length=500, blank=True, default="")
    meeting_type = models.CharField(max_length=100, default="General", db_index=True)
    user_email = models.CharField(max_length=255, default="bhawya@scaler.com", db_index=True)
    workspace = models.CharField(max_length=255, default="Scaler AI Labs", db_index=True)
    status = models.CharField(
        max_length=50,
        default="processed",
        choices=[
            ("processing", "Processing"),
            ("processed", "Processed"),
            ("failed", "Failed"),
        ],
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-meeting_date', '-created_at']
        indexes = [
            models.Index(fields=['-meeting_date']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        return f"{self.title} ({self.meeting_date.strftime('%Y-%m-%d %H:%M')})"


class TranscriptSegment(models.Model):
    """An utterance or speech segment within a meeting transcript."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(Meeting, related_name='transcript_segments', on_delete=models.CASCADE)
    speaker_name = models.CharField(max_length=150, default="Speaker", db_index=True)
    speaker_avatar = models.CharField(max_length=255, blank=True, default="")
    start_time = models.FloatField(default=0.0, db_index=True, help_text="Start timestamp in seconds")
    end_time = models.FloatField(default=0.0, help_text="End timestamp in seconds")
    text = models.TextField()
    sequence_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sequence_order', 'start_time']
        indexes = [
            models.Index(fields=['meeting', 'sequence_order']),
            models.Index(fields=['meeting', 'start_time']),
        ]

    def __str__(self):
        return f"[{self.start_time:.1f}s] {self.speaker_name}: {self.text[:40]}"


class Summary(models.Model):
    """AI-generated summary and high level takeaways for a meeting."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.OneToOneField(Meeting, related_name='summary', on_delete=models.CASCADE)
    overview = models.TextField(help_text="High-level paragraph overview of the meeting")
    key_points = models.JSONField(default=list, help_text="List of bullet points / takeaways")
    keywords = models.JSONField(default=list, help_text="Extracted tags and topics")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Summary for {self.meeting.title}"


class ActionItem(models.Model):
    """Action items / tasks extracted or manually added for a meeting."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(Meeting, related_name='action_items', on_delete=models.CASCADE)
    task = models.TextField()
    assignee = models.CharField(max_length=150, blank=True, default="Unassigned", db_index=True)
    due_date = models.CharField(max_length=100, blank=True, default="")
    completed = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['completed', '-created_at']

    def __str__(self):
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.task[:50]} ({self.assignee})"


class Chapter(models.Model):
    """Smart chapters / topic outline dividing the meeting into structured segments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(Meeting, related_name='chapters', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    start_time = models.FloatField(default=0.0)
    end_time = models.FloatField(default=0.0)
    summary = models.TextField(blank=True, default="")
    sequence_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sequence_order', 'start_time']

    def __str__(self):
        return f"Chapter {self.sequence_order}: {self.title} ({self.start_time}s - {self.end_time}s)"


class Comment(models.Model):
    """Comments, notes, or highlights attached to a meeting or transcript segment."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(Meeting, related_name='comments', on_delete=models.CASCADE)
    segment = models.ForeignKey(
        TranscriptSegment,
        related_name='comments',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    user_name = models.CharField(max_length=150, default="User")
    content = models.TextField()
    color_tag = models.CharField(max_length=50, default="yellow")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user_name} on {self.meeting.title}"


class ChatMessage(models.Model):
    """Q&A chat messages for 'Ask questions about this meeting' feature."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(Meeting, related_name='chat_messages', on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=[("user", "User"), ("assistant", "Assistant")])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:40]}"
