import django_filters
from django.db import models
from .models import Doctor


class DoctorFilter(django_filters.FilterSet):
    """
    Filtros personalizados para el modelo Doctor.
    Permite buscar doctores por nombre, especialización, disponibilidad y estado.
    """
    
    # Búsqueda por nombre completo
    name = django_filters.CharFilter(
        method='filter_by_name',
        help_text='Buscar por nombre o apellido del doctor'
    )
    
    # Filtro por especialización
    specialization = django_filters.CharFilter(
        field_name='specialization',
        lookup_expr='icontains',
        help_text='Filtrar por especialización (búsqueda parcial)'
    )
    
    # Filtro por disponibilidad
    is_available = django_filters.BooleanFilter(
        field_name='is_available',
        help_text='Filtrar por disponibilidad del doctor'
    )
    
    # Filtro por estado
    status = django_filters.ChoiceFilter(
        choices=Doctor.STATUS_CHOICES,
        help_text='Filtrar por estado del doctor (active, inactive, disabled)'
    )
    
    # Filtro por años de experiencia
    min_experience = django_filters.NumberFilter(
        field_name='years_experience',
        lookup_expr='gte',
        help_text='Filtrar doctores con mínimo años de experiencia'
    )
    
    max_experience = django_filters.NumberFilter(
        field_name='years_experience',
        lookup_expr='lte',
        help_text='Filtrar doctores con máximo años de experiencia'
    )
    
    # Filtro por tarifa de consulta
    min_fee = django_filters.NumberFilter(
        field_name='consultation_fee',
        lookup_expr='gte',
        help_text='Filtrar doctores con tarifa mínima'
    )
    
    max_fee = django_filters.NumberFilter(
        field_name='consultation_fee',
        lookup_expr='lte',
        help_text='Filtrar doctores con tarifa máxima'
    )

    class Meta:
        model = Doctor
        fields = {
            'specialization': ['exact', 'icontains'],
            'is_available': ['exact'],
            'status': ['exact'],
            'years_experience': ['exact', 'gte', 'lte'],
            'consultation_fee': ['exact', 'gte', 'lte'],
        }
    
    def filter_by_name(self, queryset, name, value):
        """
        Filtrar doctores por nombre o apellido.
        Busca en first_name y last_name del usuario relacionado.
        """
        if value:
            return queryset.filter(
                models.Q(user__first_name__icontains=value) |
                models.Q(user__last_name__icontains=value)
            )
        return queryset