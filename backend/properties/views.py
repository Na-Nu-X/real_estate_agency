from django.db.models import Count, Q
from rest_framework import mixins, viewsets
from rest_framework.throttling import ScopedRateThrottle

from .filters import PropertyFilter
from .models import (
    Agent,
    ContactMessage,
    Property,
    ValuationRequest,
    ViewingInquiry,
)
from .serializers import (
    AgentSerializer,
    ContactMessageSerializer,
    PropertyDetailSerializer,
    PropertyListSerializer,
    ValuationRequestSerializer,
    ViewingInquirySerializer,
)


class PropertyViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    filterset_class = PropertyFilter
    ordering_fields = ["created_at", "price", "floor_area"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Property.objects.select_related("agent")
        if self.action == "retrieve":
            qs = qs.prefetch_related("images")
        return qs

    def get_serializer_class(self):
        return PropertyDetailSerializer if self.action == "retrieve" else PropertyListSerializer


class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AgentSerializer
    queryset = Agent.objects.annotate(
        active_listings_count=Count(
            "properties", filter=~Q(properties__badge=Property.Badge.SOLD)
        )
    ).order_by("display_order", "full_name")
    filter_backends = []


class LeadCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "leads"
    filter_backends = []


class ViewingInquiryViewSet(LeadCreateViewSet):
    queryset = ViewingInquiry.objects.all()
    serializer_class = ViewingInquirySerializer


class ValuationRequestViewSet(LeadCreateViewSet):
    queryset = ValuationRequest.objects.all()
    serializer_class = ValuationRequestSerializer


class ContactMessageViewSet(LeadCreateViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
