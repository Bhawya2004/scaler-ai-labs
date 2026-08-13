import json
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from meetings.models import Meeting, ActionItem


class ActionItemAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.meeting = Meeting.objects.create(
            title="Ops Sync",
            duration_seconds=900,
            participants=["Nina", "Tariq"]
        )
        self.item = ActionItem.objects.create(
            meeting=self.meeting,
            task="Check database load",
            assignee="Nina",
            due_date="Friday",
            completed=False
        )

    def test_list_action_items(self):
        response = self.client.get(reverse('action-item-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

    def test_toggle_action_item_completed(self):
        url = reverse('action-item-toggle-completed', kwargs={'pk': str(self.item.id)})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertTrue(self.item.completed)

        # Toggle back to incomplete
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertFalse(self.item.completed)

    def test_create_action_item(self):
        data = {
            "meeting": str(self.meeting.id),
            "task": "Set up Grafana alerts",
            "assignee": "Tariq",
            "due_date": "Next Monday",
            "completed": False
        }
        response = self.client.post(reverse('action-item-list'), data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.meeting.action_items.count(), 2)
