import json
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from meetings.models import Meeting, TranscriptSegment


class ChatAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.meeting = Meeting.objects.create(
            title="Design Review",
            duration_seconds=1200,
            participants=["Maya", "Liam"]
        )
        TranscriptSegment.objects.create(
            meeting=self.meeting,
            speaker_name="Maya",
            start_time=0.0,
            end_time=15.0,
            text="We decided to use the purple theme for our Fireflies clone."
        )
        TranscriptSegment.objects.create(
            meeting=self.meeting,
            speaker_name="Liam",
            start_time=16.0,
            end_time=30.0,
            text="I will update the CSS variables accordingly."
        )

    def test_ask_ai_question(self):
        url = reverse('meeting-ask-ai', kwargs={'pk': str(self.meeting.id)})
        data = {
            "question": "What color theme did the team decide on?",
            "save_to_history": True
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("answer", response.data)
        self.assertTrue(len(response.data['answer']) > 0)
        self.assertEqual(self.meeting.chat_messages.count(), 2)
