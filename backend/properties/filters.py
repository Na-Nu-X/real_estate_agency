import django_filters

from .models import Property


class PropertyFilter(django_filters.FilterSet):
    transaction = django_filters.ChoiceFilter(choices=Property.Transaction.choices)
    property_type = django_filters.ChoiceFilter(choices=Property.PropertyType.choices)
    city = django_filters.CharFilter(field_name="city", lookup_expr="icontains")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_area = django_filters.NumberFilter(field_name="floor_area", lookup_expr="gte")
    max_area = django_filters.NumberFilter(field_name="floor_area", lookup_expr="lte")
    rooms = django_filters.NumberFilter(method="filter_rooms")
    featured = django_filters.BooleanFilter(field_name="is_featured")
    agent = django_filters.NumberFilter(field_name="agent_id")

    class Meta:
        model = Property
        fields = [
            "transaction", "property_type", "city", "min_price", "max_price",
            "min_area", "max_area", "rooms", "featured", "agent",
        ]

    def filter_rooms(self, queryset, name, value):
        """`rooms=5` means 5 or more rooms (the "5+" option in the UI)."""
        value = int(value)
        if value >= 5:
            return queryset.filter(rooms__gte=value)
        return queryset.filter(rooms=value)
