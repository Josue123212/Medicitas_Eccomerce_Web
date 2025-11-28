import django_filters
from django.db import models
from datetime import datetime, date, timedelta
from .models import Appointment
from apps.doctors.models import Doctor


class AppointmentFilter(django_filters.FilterSet):
    """
    Filtros personalizados para el modelo Appointment.
    Permite filtrar citas por fecha, rango de fechas, estado, doctor y especialización.
    """
    
    # Filtros por fecha
    date = django_filters.DateFilter(
        field_name='date',
        lookup_expr='exact',
        help_text='Filtrar por fecha exacta (YYYY-MM-DD)'
    )
    
    date_from = django_filters.DateFilter(
        field_name='date',
        lookup_expr='gte',
        help_text='Filtrar citas desde esta fecha (YYYY-MM-DD)'
    )
    
    date_to = django_filters.DateFilter(
        field_name='date',
        lookup_expr='lte',
        help_text='Filtrar citas hasta esta fecha (YYYY-MM-DD)'
    )
    
    # Filtro por rango de fechas
    date_range = django_filters.DateFromToRangeFilter(
        field_name='date',
        help_text='Filtrar por rango de fechas usando date_range_after y date_range_before'
    )
    
    # Filtros por tiempo
    time_from = django_filters.TimeFilter(
        field_name='time',
        lookup_expr='gte',
        help_text='Filtrar citas desde esta hora (HH:MM)'
    )
    
    time_to = django_filters.TimeFilter(
        field_name='time',
        lookup_expr='lte',
        help_text='Filtrar citas hasta esta hora (HH:MM)'
    )
    
    # Filtros por estado
    status = django_filters.ChoiceFilter(
        choices=Appointment.STATUS_CHOICES,
        help_text='Filtrar por estado de la cita'
    )
    
    # Filtros por doctor
    doctor = django_filters.ModelChoiceFilter(
        queryset=Doctor.objects.all(),
        help_text='Filtrar por doctor específico'
    )
    
    doctor_name = django_filters.CharFilter(
        field_name='doctor__user__first_name',
        lookup_expr='icontains',
        help_text='Buscar por nombre del doctor (búsqueda parcial)'
    )
    
    doctor_last_name = django_filters.CharFilter(
        field_name='doctor__user__last_name',
        lookup_expr='icontains',
        help_text='Buscar por apellido del doctor (búsqueda parcial)'
    )
    
    # Filtro por especialización
    specialization = django_filters.CharFilter(
        field_name='doctor__specialization',
        lookup_expr='icontains',
        help_text='Filtrar por especialización del doctor'
    )
    
    # Filtros por paciente
    patient_name = django_filters.CharFilter(
        field_name='patient__user__first_name',
        lookup_expr='icontains',
        help_text='Buscar por nombre del paciente (búsqueda parcial)'
    )
    
    patient_last_name = django_filters.CharFilter(
        field_name='patient__user__last_name',
        lookup_expr='icontains',
        help_text='Buscar por apellido del paciente (búsqueda parcial)'
    )
    
    # Filtros de conveniencia
    today = django_filters.BooleanFilter(
        method='filter_today',
        help_text='Filtrar citas de hoy (true/false)'
    )
    
    this_week = django_filters.BooleanFilter(
        method='filter_this_week',
        help_text='Filtrar citas de esta semana (true/false)'
    )
    
    this_month = django_filters.BooleanFilter(
        method='filter_this_month',
        help_text='Filtrar citas de este mes (true/false)'
    )
    
    upcoming = django_filters.BooleanFilter(
        method='filter_upcoming',
        help_text='Filtrar citas futuras (true/false)'
    )
    
    past = django_filters.BooleanFilter(
        method='filter_past',
        help_text='Filtrar citas pasadas (true/false)'
    )
    
    class Meta:
        model = Appointment
        fields = {
            'id': ['exact'],
            'date': ['exact', 'gte', 'lte'],
            'time': ['exact', 'gte', 'lte'],
            'status': ['exact'],
            'created_at': ['gte', 'lte'],
            'updated_at': ['gte', 'lte'],
        }
    
    def filter_today(self, queryset, name, value):
        """
        Filtrar citas de hoy.
        """
        if value:
            today = date.today()
            return queryset.filter(date=today)
        return queryset
    
    def filter_this_week(self, queryset, name, value):
        """
        Filtrar citas de esta semana.
        """
        if value:
            today = date.today()
            start_week = today - timedelta(days=today.weekday())
            end_week = start_week + timedelta(days=6)
            return queryset.filter(date__range=[start_week, end_week])
        return queryset
    
    def filter_this_month(self, queryset, name, value):
        """
        Filtrar citas de este mes.
        """
        if value:
            today = date.today()
            start_month = today.replace(day=1)
            if today.month == 12:
                end_month = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end_month = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
            return queryset.filter(date__range=[start_month, end_month])
        return queryset
    
    def filter_upcoming(self, queryset, name, value):
        """
        Filtrar citas futuras (desde hoy en adelante).
        """
        if value:
            today = date.today()
            return queryset.filter(date__gte=today)
        return queryset
    
    def filter_past(self, queryset, name, value):
        """
        Filtrar citas pasadas (antes de hoy).
        """
        if value:
            today = date.today()
            return queryset.filter(date__lt=today)
        return queryset


class DoctorFilter(django_filters.FilterSet):
    """
    Filtros personalizados para el modelo Doctor.
    Permite buscar doctores por nombre, especialización y disponibilidad.
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
    
    # Filtro por años de experiencia
    experience_min = django_filters.NumberFilter(
        field_name='years_experience',
        lookup_expr='gte',
        help_text='Filtrar doctores con mínimo años de experiencia'
    )
    
    experience_max = django_filters.NumberFilter(
        field_name='years_experience',
        lookup_expr='lte',
        help_text='Filtrar doctores con máximo años de experiencia'
    )
    
    class Meta:
        model = Doctor
        fields = {
            'specialization': ['exact', 'icontains'],
            'is_available': ['exact'],
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