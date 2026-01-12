from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import SmsUser

class TestAuth(APITestCase): 
    def setUp(self):
        self.user = SmsUser.objects.create_user(
            username="testuser",
            password="StrongPass123",
            email="test@example.com",
            role="student"
        )
        self.login_url = reverse("login")
        self.token_url = reverse("get_jwt_token")

    def test_login_success(self):
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "StrongPass123"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_failure(self):
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "WrongPass"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)