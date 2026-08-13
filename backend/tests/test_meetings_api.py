import json
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from meetings.models import Meeting, TranscriptSegment, Summary, ActionItem


class MeetingAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.meeting = Meeting.objects.create(
            title="Sprint Planning Sync",
            duration_seconds=1800,
            participants=["Alice", "Bob"],
            meeting_type="Engineering"
        )
        self.segment1 = TranscriptSegment.objects.create(
            meeting=self.meeting,
            speaker_name="Alice",
            start_time=0.0,
            end_time=15.0,
            text="Let's prioritize the core auth service this sprint.",
            sequence_order=0
        )
        self.segment2 = TranscriptSegment.objects.create(
            meeting=self.meeting,
            speaker_name="Bob",
            start_time=16.0,
            end_time=30.0,
            text="I agree, I will take the database schema task.",
            sequence_order=1
        )
        self.summary = Summary.objects.create(
            meeting=self.meeting,
            overview="Team planned sprint deliverables for auth service.",
            key_points=["Prioritize auth", "Bob owns database schema"],
            keywords=["Sprint", "Auth", "Database"]
        )

    def test_list_meetings(self):
        response = self.client.get(reverse('meeting-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['title'], "Sprint Planning Sync")

    def test_retrieve_meeting_detail(self):
        url = reverse('meeting-detail', kwargs={'pk': str(self.meeting.id)})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Sprint Planning Sync")
        self.assertEqual(len(response.data['transcript_segments']), 2)
        self.assertIsNotNone(response.data['summary'])
        self.assertEqual(response.data['summary']['overview'], "Team planned sprint deliverables for auth service.")

    def test_create_meeting_with_transcript_text(self):
        data = {
            "title": "Design System Kickoff",
            "meeting_type": "Design",
            "transcript_content": "[00:00] Maya: Welcome team.\n[00:15] Liam: Let's design the dark theme.",
            "auto_generate_summary": True
        }
        response = self.client.post(reverse('meeting-list'), data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "Design System Kickoff")
        self.assertEqual(len(response.data['transcript_segments']), 2)
        self.assertIsNotNone(response.data['summary'])

    def test_update_meeting_metadata(self):
        url = reverse('meeting-detail', kwargs={'pk': str(self.meeting.id)})
        update_data = {"title": "Updated Sprint Planning Sync", "meeting_type": "Product"}
        response = self.client.patch(url, data=json.dumps(update_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.meeting.refresh_from_db()
        self.assertEqual(self.meeting.title, "Updated Sprint Planning Sync")
        self.assertEqual(self.meeting.meeting_type, "Product")

    def test_health_check(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['status'], "healthy")
        self.assertEqual(response.json()['database'], "ok")

    def test_delete_meeting(self):
        url = reverse('meeting-detail', kwargs={'pk': str(self.meeting.id)})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Meeting.objects.filter(id=self.meeting.id).exists())
        self.assertFalse(TranscriptSegment.objects.filter(meeting_id=self.meeting.id).exists())
