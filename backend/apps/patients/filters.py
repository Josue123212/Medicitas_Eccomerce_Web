import django_filters
from django.db import models
from .models import Patient


class PatientFilter(django_filters.FilterSet):
    """
    Filtros personalizados para el modelo Patient.
    Permite buscar pacientes por nombre, teléfono, fecha de nacimiento, etc.
    """
    
    # Búsqueda por nombre completo
    name = django_filters.CharFilter(
        method='filter_by_name',
        help_text='Buscar por nombre o apellido del paciente'
    )
    
    # Filtros por información personal
    phone = django_filters.CharFilter(
        field_name='phone',
        lookup_expr='icontains',
        help_text='Buscar por número de teléfono (búsqueda parcial)'
    )
    
    email = django_filters.CharFilter(
        field_name='user__email',
        lookup_expr='icontains',
        help_text='Buscar por email (búsqueda parcial)'
    )
    
    # Filtros por fecha de nacimiento
    birth_date = django_filters.DateFilter(
        field_name='birth_date',
        lookup_expr='exact',
        help_text='Filtrar por fecha de nacimiento exacta (YYYY-MM-DD)'
    )
    
    birth_date_from = django_filters.DateFilter(
        field_name='birth_date',
        lookup_expr='gte',
        help_text='Filtrar pacientes nacidos desde esta fecha'
    )
    
    birth_date_to = django_filters.DateFilter(
        field_name='birth_date',
        lookup_expr='lte',
        help_text='Filtrar pacientes nacidos hasta esta fecha'
    )
    
    # Filtro por rango de edad
    age_min = django_filters.NumberFilter(
        method='filter_age_min',
        help_text='Filtrar pacientes con edad mínima'
    )
    
    age_max = django_filters.NumberFilter(
        method='filter_age_max',
        help_text='Filtrar pacientes con edad máxima'
    )
    
    # Filtros por dirección
    address = django_filters.CharFilter(
        field_name='address',
        lookup_expr='icontains',
        help_text='Buscar por dirección (búsqueda parcial)'
    )
    
    # Filtros por información de emergencia
    emergency_contact_name = django_filters.CharFilter(
        field_name='emergency_contact_name',
        lookup_expr='icontains',
        help_text='Buscar por nombre del contacto de emergencia'
    )
    
    emergency_contact_phone = django_filters.CharFilter(
        field_name='emergency_contact_phone',
        lookup_expr='icontains',
        help_text='Buscar por teléfono del contacto de emergencia'
    )
    
    class Meta:
        model = Patient
        fields = {
            'address': ['icontains'],
            'emergency_contact_name': ['icontains'],
            'emergency_contact_phone': ['exact', 'icontains'],
            'created_at': ['gte', 'lte'],
            'updated_at': ['gte', 'lte'],
        }
    
    def filter_by_name(self, queryset, name, value):
        """
        Filtrar pacientes por nombre o apellido.
        Busca en first_name y last_name del usuario relacionado.
        """
        if value:
            return queryset.filter(
                models.Q(user__first_name__icontains=value) |
                models.Q(user__last_name__icontains=value)
            )
        return queryset
    
    def filter_age_min(self, queryset, name, value):
        """
        Filtrar pacientes con edad mínima.
        Calcula la edad basada en la fecha de nacimiento.
        """
        if value is not None:
            from datetime import date
            today = date.today()
            birth_date_max = date(today.year - value, today.month, today.day)
            return queryset.filter(birth_date__lte=birth_date_max)
        return queryset
    
    def filter_age_max(self, queryset, name, value):
        """
        Filtrar pacientes con edad máxima.
        Calcula la edad basada en la fecha de nacimiento.
        """
        if value is not None:
            from datetime import date
            today = date.today()
            birth_date_min = date(today.year - value - 1, today.month, today.day)
            return queryset.filter(birth_date__gte=birth_date_min)
        return queryset