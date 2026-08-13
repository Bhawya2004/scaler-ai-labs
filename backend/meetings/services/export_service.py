import json
from typing import Any
from django.utils.dateformat import DateFormat


class ExportService:
    """Exports meeting data, summaries, action items, and transcripts

    to Markdown, Plain Text, JSON, and WebVTT.
    """

    @classmethod
    def format_timestamp(cls, seconds: float) -> str:
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins:02d}:{secs:02d}"

    @classmethod
    def to_markdown(cls, meeting: Any) -> str:
        date_str = DateFormat(meeting.meeting_date).format('Y-m-d H:i')
        duration_mins = meeting.duration_seconds // 60
        participants = ", ".join(meeting.participants) if isinstance(meeting.participants, list) else str(meeting.participants)

        md = [
            f"# {meeting.title}",
            f"**Date:** {date_str} | **Duration:** {duration_mins} mins | **Type:** {meeting.meeting_type}",
            f"**Participants:** {participants}\n",
            "---",
            "\n## 📝 Overview",
        ]

        if hasattr(meeting, 'summary') and meeting.summary:
            md.append(f"{meeting.summary.overview}\n")
            if meeting.summary.key_points:
                md.append("### Key Takeaways")
                for kp in meeting.summary.key_points:
                    md.append(f"- {kp}")
                md.append("")
            if meeting.summary.keywords:
                md.append(f"**Topics & Tags:** {', '.join(meeting.summary.keywords)}\n")
        else:
            md.append("*No AI summary generated yet.*\n")

        # Action Items
        action_items = meeting.action_items.all()
        if action_items:
            md.append("## ✅ Action Items")
            for item in action_items:
                status_box = "[x]" if item.completed else "[ ]"
                assignee = f"*(Assignee: {item.assignee})*" if item.assignee else ""
                due = f"*(Due: {item.due_date})*" if item.due_date else ""
                md.append(f"- {status_box} {item.task} {assignee} {due}".strip())
            md.append("")

        # Chapters
        chapters = meeting.chapters.all()
        if chapters:
            md.append("## 📌 Chapters & Outline")
            for ch in chapters:
                start = cls.format_timestamp(ch.start_time)
                end = cls.format_timestamp(ch.end_time)
                md.append(f"- **[{start} - {end}] {ch.title}**: {ch.summary}")
            md.append("")

        # Transcript
        segments = meeting.transcript_segments.all()
        if segments:
            md.append("## 🎙️ Transcript")
            for seg in segments:
                ts = cls.format_timestamp(seg.start_time)
                md.append(f"**[{ts}] {seg.speaker_name}:** {seg.text}")
            md.append("")

        return "\n".join(md)

    @classmethod
    def to_plain_text(cls, meeting: Any) -> str:
        date_str = DateFormat(meeting.meeting_date).format('Y-m-d H:i')
        duration_mins = meeting.duration_seconds // 60
        participants = ", ".join(meeting.participants) if isinstance(meeting.participants, list) else str(meeting.participants)

        lines = [
            f"MEETING: {meeting.title.upper()}",
            f"Date: {date_str} | Duration: {duration_mins} mins | Type: {meeting.meeting_type}",
            f"Participants: {participants}",
            "=" * 60,
            "\nOVERVIEW:",
        ]

        if hasattr(meeting, 'summary') and meeting.summary:
            lines.append(meeting.summary.overview)
            if meeting.summary.key_points:
                lines.append("\nKEY TAKEAWAYS:")
                for kp in meeting.summary.key_points:
                    lines.append(f"  * {kp}")
        else:
            lines.append("No summary available.")

        action_items = meeting.action_items.all()
        if action_items:
            lines.append("\nACTION ITEMS:")
            for item in action_items:
                check = "[DONE]" if item.completed else "[TODO]"
                lines.append(f"  {check} {item.task} (Assignee: {item.assignee})")

        segments = meeting.transcript_segments.all()
        if segments:
            lines.append("\nTRANSCRIPT:")
            for seg in segments:
                ts = cls.format_timestamp(seg.start_time)
                lines.append(f"[{ts}] {seg.speaker_name}: {seg.text}")

        return "\n".join(lines)

    @classmethod
    def to_vtt(cls, meeting: Any) -> str:
        vtt = ["WEBVTT", f"Title: {meeting.title}\n"]
        for seg in meeting.transcript_segments.all():
            s_mins, s_secs = int(seg.start_time // 60), seg.start_time % 60
            e_mins, e_secs = int(seg.end_time // 60), seg.end_time % 60
            time_str = f"00:{s_mins:02d}:{s_secs:06.3f} --> 00:{e_mins:02d}:{e_secs:06.3f}"
            vtt.append(f"{time_str}\n<v {seg.speaker_name}>{seg.text}\n")
        return "\n".join(vtt)
