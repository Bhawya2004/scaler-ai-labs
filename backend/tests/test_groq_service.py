from django.test import TestCase
from meetings.services.groq_service import GroqService


class GroqServiceTestCase(TestCase):
    def setUp(self):
        self.service = GroqService()
        self.segments = [
            {"speaker_name": "Sarah", "start_time": 0.0, "end_time": 10.0, "text": "We should finalize the Q3 product deliverables."},
            {"speaker_name": "Alex", "start_time": 11.0, "end_time": 25.0, "text": "I will deliver the database migration and API endpoints."},
        ]

    def test_heuristic_analysis_generation(self):
        analysis = self.service._heuristic_analysis(self.segments, title="Test Sync")
        self.assertIn("overview", analysis)
        self.assertIn("key_points", analysis)
        self.assertIn("keywords", analysis)
        self.assertIn("action_items", analysis)
        self.assertIn("chapters", analysis)
        self.assertTrue(len(analysis['action_items']) >= 1)

    def test_heuristic_qa(self):
        answer = self.service._heuristic_qa(self.segments, "Who will deliver the database migration?", title="Test Sync")
        self.assertIn("Alex", answer)
