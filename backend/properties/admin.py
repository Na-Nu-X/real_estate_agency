from django.contrib import admin
from django.db.models import Count, Q
from django.utils.html import format_html

from .models import (
    Agent,
    ContactMessage,
    Property,
    PropertyImage,
    ValuationRequest,
    ViewingInquiry,
)


def thumbnail(url: str, width: int = 96):
    if not url:
        return "—"
    return format_html(
        '<img src="{}" style="width:{}px;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:2px" alt="">',
        url,
        width,
    )


@admin.action(description="Označiť ako vybavené")
def mark_resolved(modeladmin, request, queryset):
    updated = queryset.update(is_resolved=True)
    modeladmin.message_user(request, f"Označené ako vybavené: {updated}.")


@admin.action(description="Označiť ako nevybavené")
def mark_unresolved(modeladmin, request, queryset):
    updated = queryset.update(is_resolved=False)
    modeladmin.message_user(request, f"Označené ako nevybavené: {updated}.")


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ["photo_preview", "full_name", "role", "phone", "email", "listings", "display_order"]
    list_display_links = ["photo_preview", "full_name"]
    list_editable = ["display_order"]
    search_fields = ["full_name", "email", "phone"]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _listings=Count("properties", filter=~Q(properties__badge=Property.Badge.SOLD))
        )

    @admin.display(description="Foto")
    def photo_preview(self, obj):
        return thumbnail(obj.photo_url, 48)

    @admin.display(description="Aktívne ponuky", ordering="_listings")
    def listings(self, obj):
        return obj._listings


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ["preview", "image_url", "caption", "display_order"]
    readonly_fields = ["preview"]

    @admin.display(description="Náhľad")
    def preview(self, obj):
        return thumbnail(obj.image_url, 120)


class ViewingInquiryInline(admin.TabularInline):
    model = ViewingInquiry
    extra = 0
    fields = ["client_name", "phone", "email", "preferred_datetime", "is_resolved", "created_at"]
    readonly_fields = ["client_name", "phone", "email", "preferred_datetime", "created_at"]
    can_delete = False
    show_change_link = True

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = [
        "cover_preview", "title", "transaction", "property_type", "city",
        "price", "badge", "is_featured", "agent", "created_at",
    ]
    list_display_links = ["cover_preview", "title"]
    list_editable = ["badge", "is_featured"]
    list_filter = ["transaction", "property_type", "badge", "is_featured", "city", "agent"]
    search_fields = ["title", "city", "district", "description"]
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ["cover_large", "created_at"]
    date_hierarchy = "created_at"
    list_per_page = 25
    inlines = [PropertyImageInline, ViewingInquiryInline]
    fieldsets = [
        ("Základné údaje", {
            "fields": ["title", "slug", "transaction", "property_type", "price", "badge", "is_featured", "agent"],
        }),
        ("Lokalita", {"fields": ["city", "district"]}),
        ("Parametre", {
            "fields": ["floor_area", "land_area", "rooms", "floor", "condition", "energy_class"],
        }),
        ("Popis a vybavenie", {"fields": ["description", "amenities"]}),
        ("Titulná fotografia", {"fields": ["cover_image_url", "cover_large"]}),
        ("Systémové údaje", {"fields": ["created_at"], "classes": ["collapse"]}),
    ]

    @admin.display(description="Foto")
    def cover_preview(self, obj):
        return thumbnail(obj.cover_image_url, 80)

    @admin.display(description="Náhľad")
    def cover_large(self, obj):
        return thumbnail(obj.cover_image_url, 360)


@admin.register(ViewingInquiry)
class ViewingInquiryAdmin(admin.ModelAdmin):
    list_display = ["client_name", "property", "phone", "email", "preferred_datetime", "is_resolved", "created_at"]
    list_editable = ["is_resolved"]
    list_filter = ["is_resolved", "created_at", "property__agent"]
    search_fields = ["client_name", "email", "phone", "property__title"]
    readonly_fields = ["created_at"]
    autocomplete_fields = ["property"]
    actions = [mark_resolved, mark_unresolved]
    date_hierarchy = "created_at"


@admin.register(ValuationRequest)
class ValuationRequestAdmin(admin.ModelAdmin):
    list_display = ["owner_name", "property_type", "location", "floor_area", "rooms", "phone", "is_resolved", "created_at"]
    list_editable = ["is_resolved"]
    list_filter = ["is_resolved", "property_type", "condition", "created_at"]
    search_fields = ["owner_name", "email", "phone", "location"]
    readonly_fields = ["created_at"]
    actions = [mark_resolved, mark_unresolved]
    date_hierarchy = "created_at"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "subject", "email", "phone", "is_resolved", "created_at"]
    list_editable = ["is_resolved"]
    list_filter = ["is_resolved", "created_at"]
    search_fields = ["name", "email", "subject", "message"]
    readonly_fields = ["created_at"]
    actions = [mark_resolved, mark_unresolved]
