import json
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from meetings.models import Meeting, TranscriptSegment


class TranscriptAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.meeting = Meeting.objects.create(
            title="Tech Sync",
            duration_seconds=600,
            participants=["Alex", "Dave"]
        )
        TranscriptSegment.objects.create(
            meeting=self.meeting,
            speaker_name="Alex",
            start_time=0.0,
            end_time=10.0,
            text="Let us discuss the GraphQL migration."
        )
        TranscriptSegment.objects.create(
            meeting=self.meeting,
            speaker_name="Dave",
            start_time=11.0,
            end_time=22.0,
            text="REST APIs with DRF are working great for our use case."
        )

    def test_get_transcript_segments(self):
        url = reverse('meeting-transcript', kwargs={'pk': str(self.meeting.id)})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_search_within_transcript(self):
        url = reverse('meeting-transcript', kwargs={'pk': str(self.meeting.id)}) + '?q=GraphQL'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn("GraphQL", response.data[0]['text'])

    def test_append_transcript_segment(self):
        url = reverse('meeting-transcript', kwargs={'pk': str(self.meeting.id)})
        new_segment = {
            "speaker_name": "Alex",
            "start_time": 25.0,
            "end_time": 35.0,
            "text": "Agreed, let's proceed with DRF.",
            "sequence_order": 2
        }
        response = self.client.post(url, data=json.dumps(new_segment), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.meeting.transcript_segments.count(), 3)
