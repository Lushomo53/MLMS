from unittest.mock import patch

from django.db import OperationalError
from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from rest_framework.response import Response


@override_settings(ALLOWED_HOSTS=["testserver"])
class FoundationTests(TestCase):
    def test_health_is_public_and_checks_database(self):
        response = self.client.get("/api/v1/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "database": "ok"})
        self.assertIn("no-store", response.headers["Cache-Control"])

    def test_database_outage_is_503_without_sensitive_details(self):
        with patch("core.views.connection.cursor", side_effect=OperationalError("private")):
            response = self.client.get("/api/v1/health/")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"status": "unavailable", "database": "unavailable"})
        self.assertNotContains(response, "private", status_code=503)

    def test_new_api_views_are_private_by_default(self):
        class PrivateView(APIView):
            def get(self, request):
                return Response({"private": True})

        response = PrivateView.as_view()(APIRequestFactory().get("/private/"))
        self.assertEqual(response.status_code, 403)

    def test_health_rejects_writes(self):
        self.assertEqual(self.client.post("/api/v1/health/").status_code, 405)
