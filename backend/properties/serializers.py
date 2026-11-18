import re

from django.utils import timezone
from rest_framework import serializers

from .models import (
    Agent,
    ContactMessage,
    Property,
    PropertyImage,
    ValuationRequest,
    ViewingInquiry,
)

PHONE_RE = re.compile(r"^\+?[0-9 ()/-]{9,20}$")


def validate_phone_number(value: str) -> str:
    value = value.strip()
    if not PHONE_RE.match(value):
        raise serializers.ValidationError(
            "Zadajte platné telefónne číslo, napr. +421 900 123 456."
        )
    return value


class AgentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ["id", "full_name", "role", "phone", "email", "photo_url"]


class AgentSerializer(serializers.ModelSerializer):
    active_listings_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Agent
        fields = [
            "id", "full_name", "role", "phone", "email", "photo_url", "bio",
            "display_order", "active_listings_count",
        ]


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image_url", "caption", "display_order"]


class PropertyListSerializer(serializers.ModelSerializer):
    transaction_display = serializers.CharField(source="get_transaction_display", read_only=True)
    property_type_display = serializers.CharField(source="get_property_type_display", read_only=True)
    condition_display = serializers.CharField(source="get_condition_display", read_only=True)
    badge_display = serializers.CharField(source="get_badge_display", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "title", "slug", "transaction", "transaction_display",
            "property_type", "property_type_display", "price", "city", "district",
            "floor_area", "land_area", "rooms", "floor", "condition", "condition_display",
            "energy_class", "badge", "badge_display", "cover_image_url", "is_featured",
            "agent", "created_at",
        ]


class PropertyDetailSerializer(PropertyListSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    agent = AgentSummarySerializer(read_only=True)

    class Meta(PropertyListSerializer.Meta):
        fields = PropertyListSerializer.Meta.fields + ["description", "amenities", "images"]


class ViewingInquirySerializer(serializers.ModelSerializer):
    property = serializers.SlugRelatedField(
        slug_field="slug", queryset=Property.objects.all(),
        error_messages={"does_not_exist": "Nehnuteľnosť neexistuje."},
    )

    class Meta:
        model = ViewingInquiry
        fields = ["id", "property", "client_name", "email", "phone", "preferred_datetime", "message", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_client_name(self, value: str) -> str:
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Zadajte celé meno.")
        return value.strip()

    def validate_phone(self, value: str) -> str:
        return validate_phone_number(value)

    def validate_preferred_datetime(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Termín obhliadky musí byť v budúcnosti.")
        return value

    def validate_property(self, value: Property) -> Property:
        if value.badge == Property.Badge.SOLD:
            raise serializers.ValidationError("Táto nehnuteľnosť je už predaná.")
        return value


class ValuationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValuationRequest
        fields = [
            "id", "property_type", "location", "floor_area", "rooms", "condition",
            "owner_name", "phone", "email", "notes", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_owner_name(self, value: str) -> str:
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Zadajte celé meno.")
        return value.strip()

    def validate_phone(self, value: str) -> str:
        return validate_phone_number(value)

    def validate_rooms(self, value: int) -> int:
        if value > 50:
            raise serializers.ValidationError("Zadajte reálny počet izieb.")
        return value


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_phone(self, value: str) -> str:
        return validate_phone_number(value) if value else value

    def validate_message(self, value: str) -> str:
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Správa musí mať aspoň 10 znakov.")
        return value.strip()
