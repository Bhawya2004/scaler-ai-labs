from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from meetings.models import Meeting, TranscriptSegment, Summary, ActionItem


class ExportAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.meeting = Meeting.objects.create(
            title="Executive Strategy Sync",
            duration_seconds=1800,
            participants=["Rachel Green", "Sarah Connor"]
        )
        TranscriptSegment.objects.create(
            meeting=self.meeting,
            speaker_name="Rachel Green",
            start_time=0.0,
            end_time=20.0,
            text="Welcome everyone to our executive sync."
        )
        Summary.objects.create(
            meeting=self.meeting,
            overview="Executive strategy and company milestones.",
            key_points=["Growth is 45% MoM"],
            keywords=["Executive", "Strategy"]
        )
        ActionItem.objects.create(
            meeting=self.meeting,
            task="Send board deck",
            assignee="Rachel Green"
        )

    def test_export_markdown(self):
        url = reverse('meeting-export', kwargs={'pk': str(self.meeting.id)}) + '?format=markdown'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("text/markdown", response['Content-Type'])
        self.assertIn("# Executive Strategy Sync", response.content.decode('utf-8'))

    def test_export_plain_text(self):
        url = reverse('meeting-export', kwargs={'pk': str(self.meeting.id)}) + '?format=txt'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("text/plain", response['Content-Type'])
        self.assertIn("MEETING: EXECUTIVE STRATEGY SYNC", response.content.decode('utf-8'))

    def test_export_vtt(self):
        url = reverse('meeting-export', kwargs={'pk': str(self.meeting.id)}) + '?format=vtt'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("text/vtt", response['Content-Type'])
        self.assertIn("WEBVTT", response.content.decode('utf-8'))
