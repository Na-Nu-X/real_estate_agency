from datetime import timedelta

from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Property, ValuationRequest, ViewingInquiry


class ApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", "--no-admin", verbosity=0)

    def test_list_and_filters(self):
        res = self.client.get("/api/properties/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), Property.objects.count())

        res = self.client.get("/api/properties/", {"transaction": "prenajom"})
        self.assertTrue(all(p["transaction"] == "prenajom" for p in res.json()))

        res = self.client.get("/api/properties/", {"city": "bratislava", "min_price": 500000, "ordering": "price"})
        prices = [float(p["price"]) for p in res.json()]
        self.assertTrue(prices and min(prices) >= 500000)
        self.assertEqual(prices, sorted(prices))

        res = self.client.get("/api/properties/", {"rooms": 5})
        self.assertTrue(all(p["rooms"] >= 5 for p in res.json()))

        res = self.client.get("/api/properties/", {"featured": "true"})
        self.assertTrue(all(p["is_featured"] for p in res.json()))

    def test_detail(self):
        res = self.client.get("/api/properties/moderna-vila-s-bazenom-koliba/")
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["agent"]["full_name"], "Martin Kováč")
        self.assertGreater(len(body["images"]), 0)
        self.assertIn("Bazén", body["amenities"])

    def test_agents_have_active_counts(self):
        res = self.client.get("/api/agents/")
        self.assertEqual(len(res.json()), 4)
        lucia = next(a for a in res.json() if a["full_name"] == "Lucia Vargová")
        # Lucia has 4 listings, one of them sold
        self.assertEqual(lucia["active_listings_count"], 3)

    def test_inquiry_validation_and_create(self):
        res = self.client.post("/api/inquiries/", {"property": "neexistuje", "client_name": "A", "email": "x", "phone": "1"})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(set(res.json()), {"property", "client_name", "email", "phone"})

        res = self.client.post("/api/inquiries/", {
            "property": "moderna-vila-s-bazenom-koliba",
            "client_name": "Ján Testovací",
            "email": "jan@example.sk",
            "phone": "+421 900 111 222",
            "preferred_datetime": (timezone.now() + timedelta(days=2)).isoformat(),
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(ViewingInquiry.objects.count(), 1)

    def test_inquiry_rejects_sold_property(self):
        res = self.client.post("/api/inquiries/", {
            "property": "apartman-strbske-pleso", "client_name": "Ján Testovací",
            "email": "jan@example.sk", "phone": "+421 900 111 222",
        })
        self.assertEqual(res.status_code, 400)

    def test_valuation(self):
        res = self.client.post("/api/valuations/", {
            "property_type": "byt", "location": "Bratislava – Ružinov", "floor_area": 72,
            "rooms": 3, "condition": "povodny_stav", "owner_name": "Eva Predajná",
            "phone": "0905 123 456", "email": "eva@example.sk",
        })
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(ValuationRequest.objects.count(), 1)

    def test_contact(self):
        res = self.client.post("/api/contact/", {"name": "Eva", "email": "eva@example.sk", "message": "krátka"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("message", res.json())
