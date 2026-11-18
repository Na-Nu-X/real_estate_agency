from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("properties", views.PropertyViewSet, basename="property")
router.register("agents", views.AgentViewSet, basename="agent")
router.register("inquiries", views.ViewingInquiryViewSet, basename="inquiry")
router.register("valuations", views.ValuationRequestViewSet, basename="valuation")
router.register("contact", views.ContactMessageViewSet, basename="contact")

urlpatterns = router.urls
