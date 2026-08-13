import json
import re
from typing import List, Dict, Any, Tuple


class TranscriptParser:
    """Parses raw text, JSON, VTT, and SRT into standardized transcript segments."""

    @staticmethod
    def _parse_timestamp(timestamp_str: str) -> float:
        """Convert HH:MM:SS or MM:SS or HH:MM:SS.mmm to seconds."""
        timestamp_str = timestamp_str.replace(',', '.').strip()
        parts = timestamp_str.split(':')
        try:
            if len(parts) == 3:
                h, m, s = parts
                return float(h) * 3600 + float(m) * 60 + float(s)
            elif len(parts) == 2:
                m, s = parts
                return float(m) * 60 + float(s)
            elif len(parts) == 1:
                return float(parts[0])
        except ValueError:
            return 0.0
        return 0.0

    @classmethod
    def parse(cls, content: str, default_speaker: str = "Speaker") -> Tuple[List[Dict[str, Any]], float]:
        """Auto-detect format and parse into a list of transcript segment dicts

        and total estimated duration.
        """
        content = content.strip()
        if not content:
            return [], 0.0

        # 1. Try parsing as JSON
        if content.startswith('{') or content.startswith('['):
            try:
                data = json.loads(content)
                if isinstance(data, list):
                    return cls._parse_json_list(data)
                elif isinstance(data, dict) and 'transcript' in data:
                    return cls._parse_json_list(data['transcript'])
                elif isinstance(data, dict) and 'segments' in data:
                    return cls._parse_json_list(data['segments'])
            except json.JSONDecodeError:
                pass

        # 2. Try WebVTT
        if 'WEBVTT' in content[:100]:
            return cls._parse_vtt(content)

        # 3. Try SRT
        if re.search(r'\d+\s*\n\d{2}:\d{2}:\d{2}', content):
            return cls._parse_srt(content)

        # 4. Try regex for timestamped text: "[00:01:23] Alex: Hello" or "Alex (00:01:23): Hello"
        timestamped_segments = cls._parse_timestamped_text(content)
        if timestamped_segments:
            duration = timestamped_segments[-1]['end_time'] if timestamped_segments else 0.0
            return timestamped_segments, duration

        # 5. Fallback: Parse raw unformatted text
        return cls._parse_raw_text(content, default_speaker)

    @classmethod
    def _parse_json_list(cls, data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], float]:
        segments = []
        current_time = 0.0
        for i, item in enumerate(data):
            speaker = item.get('speaker') or item.get('speaker_name') or f"Speaker {i%2 + 1}"
            text = item.get('text', '').strip()
            start = float(item.get('start_time', item.get('start', current_time)))
            end = float(item.get('end_time', item.get('end', start + max(2.0, len(text.split()) * 0.4))))
            current_time = end
            if text:
                segments.append({
                    "speaker_name": speaker,
                    "speaker_avatar": item.get('speaker_avatar', ''),
                    "start_time": start,
                    "end_time": end,
                    "text": text,
                    "sequence_order": i
                })
        duration = segments[-1]['end_time'] if segments else 0.0
        return segments, duration

    @classmethod
    def _parse_vtt(cls, content: str) -> Tuple[List[Dict[str, Any]], float]:
        segments = []
        blocks = re.split(r'\n\s*\n', content)
        order = 0
        for block in blocks:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines or lines[0] == 'WEBVTT':
                continue
            time_line = None
            text_lines = []
            for line in lines:
                if '-->' in line:
                    time_line = line
                elif time_line:
                    text_lines.append(line)

            if time_line and text_lines:
                times = time_line.split('-->')
                start = cls._parse_timestamp(times[0].strip())
                end = cls._parse_timestamp(times[1].strip())
                raw_text = " ".join(text_lines)
                speaker, text = cls._extract_speaker_from_text(raw_text)
                segments.append({
                    "speaker_name": speaker,
                    "speaker_avatar": "",
                    "start_time": start,
                    "end_time": end,
                    "text": text,
                    "sequence_order": order
                })
                order += 1
        duration = segments[-1]['end_time'] if segments else 0.0
        return segments, duration

    @classmethod
    def _parse_srt(cls, content: str) -> Tuple[List[Dict[str, Any]], float]:
        segments = []
        blocks = re.split(r'\n\s*\n', content)
        order = 0
        for block in blocks:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if len(lines) >= 3 and '-->' in lines[1]:
                times = lines[1].split('-->')
                start = cls._parse_timestamp(times[0].strip())
                end = cls._parse_timestamp(times[1].strip())
                raw_text = " ".join(lines[2:])
                speaker, text = cls._extract_speaker_from_text(raw_text)
                segments.append({
                    "speaker_name": speaker,
                    "speaker_avatar": "",
                    "start_time": start,
                    "end_time": end,
                    "text": text,
                    "sequence_order": order
                })
                order += 1
        duration = segments[-1]['end_time'] if segments else 0.0
        return segments, duration

    @classmethod
    def _parse_timestamped_text(cls, content: str) -> List[Dict[str, Any]]:
        """Matches patterns like:

        [01:23] Sarah Connor: Hello team
        Sarah (01:23): Hello team
        01:23 Sarah: Hello team
        """
        lines = content.split('\n')
        segments = []
        order = 0
        pattern1 = re.compile(r'^(?:\[|\()?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:\]|\))?\s*([A-Za-z0-9\s._-]+?)\s*:\s*(.*)$')
        pattern2 = re.compile(r'^([A-Za-z0-9\s._-]+?)\s*(?:\[|\()\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:\]|\))?\s*:\s*(.*)$')

        for line in lines:
            line = line.strip()
            if not line:
                continue

            m1 = pattern1.match(line)
            if m1:
                ts_str, speaker, text = m1.groups()
                start = cls._parse_timestamp(ts_str)
                words_count = len(text.split())
                end = start + max(2.5, words_count * 0.45)
                segments.append({
                    "speaker_name": speaker.strip(),
                    "speaker_avatar": "",
                    "start_time": start,
                    "end_time": end,
                    "text": text.strip(),
                    "sequence_order": order
                })
                order += 1
                continue

            m2 = pattern2.match(line)
            if m2:
                speaker, ts_str, text = m2.groups()
                start = cls._parse_timestamp(ts_str)
                words_count = len(text.split())
                end = start + max(2.5, words_count * 0.45)
                segments.append({
                    "speaker_name": speaker.strip(),
                    "speaker_avatar": "",
                    "start_time": start,
                    "end_time": end,
                    "text": text.strip(),
                    "sequence_order": order
                })
                order += 1

        return segments

    @classmethod
    def _parse_raw_text(cls, content: str, default_speaker: str = "Speaker") -> Tuple[List[Dict[str, Any]], float]:
        """Chunks raw text into realistic timed utterances."""
        paragraphs = [p.strip() for p in content.split('\n') if p.strip()]
        segments = []
        current_time = 0.0
        order = 0

        # Alternate speakers if lines have "Name: " format
        speaker_pattern = re.compile(r'^([A-Z][a-zA-Z\s]{1,25}):\s*(.*)$')

        for para in paragraphs:
            match = speaker_pattern.match(para)
            if match:
                speaker, text = match.group(1).strip(), match.group(2).strip()
            else:
                speaker, text = default_speaker, para

            words = len(text.split())
            duration = max(3.0, words * 0.4)
            segments.append({
                "speaker_name": speaker,
                "speaker_avatar": "",
                "start_time": current_time,
                "end_time": current_time + duration,
                "text": text,
                "sequence_order": order
            })
            current_time += duration + 1.0  # 1 sec pause between speeches
            order += 1

        return segments, current_time

    @staticmethod
    def _extract_speaker_from_text(raw_text: str) -> Tuple[str, str]:
        speaker_match = re.match(r'^<v\s+([^>]+)>(.*)$', raw_text)
        if speaker_match:
            return speaker_match.group(1).strip(), speaker_match.group(2).replace('</v>', '').strip()

        colon_match = re.match(r'^([A-Za-z0-9\s._-]+?):\s*(.*)$', raw_text)
        if colon_match:
            return colon_match.group(1).strip(), colon_match.group(2).strip()

        return "Speaker", raw_text
