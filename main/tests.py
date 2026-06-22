import json
from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse


class HomeViewTests(TestCase):
    def test_home_renders(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)


class ContactSubmitTests(TestCase):
    def setUp(self):
        self.url = reverse('contact_submit')

    def test_get_not_allowed(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)

    def test_missing_fields(self):
        response = self.client.post(
            self.url, data=json.dumps({'name': 'Vin', 'email': '', 'message': ''}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])

    def test_invalid_email(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'name': 'Vin', 'email': 'not-an-email', 'message': 'hi'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])

    def test_invalid_json(self):
        response = self.client.post(self.url, data='not json', content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])

    @patch('main.views.send_mail')
    def test_valid_submission_sends_email(self, mock_send_mail):
        response = self.client.post(
            self.url,
            data=json.dumps({'name': 'Vin', 'email': 'vin@example.com', 'message': 'Hello there'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        mock_send_mail.assert_called_once()

    @patch('main.views.send_mail', side_effect=Exception('smtp down'))
    def test_email_failure_does_not_leak_details(self, mock_send_mail):
        response = self.client.post(
            self.url,
            data=json.dumps({'name': 'Vin', 'email': 'vin@example.com', 'message': 'Hello there'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 500)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertNotIn('smtp down', data['message'])
