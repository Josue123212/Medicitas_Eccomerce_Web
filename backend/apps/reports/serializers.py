from rest_framework import serializers
from django.db.models import Count, Q
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from django.utils import timezone
from datetime import datetime, timedelta


class BasicStatsSerializer(serializers.Serializer):
    """
    Serializer para estadísticas básicas del sistema.
    """
    total_appointments = serializers.IntegerField(read_only=True)
    total_patients = serializers.IntegerField(read_only=True)
    total_doctors = serializers.IntegerField(read_only=True)
    appointments_today = serializers.IntegerField(read_only=True)
    appointments_this_week = serializers.IntegerField(read_only=True)
    appointments_this_month = serializers.IntegerField(read_only=True)
    completed_appointments = serializers.IntegerField(read_only=True)
    cancelled_appointments = serializers.IntegerField(read_only=True)
    pending_appointments = serializers.IntegerField(read_only=True)


class AppointmentsByPeriodSerializer(serializers.Serializer):
    """
    Serializer para reportes de citas por período.
    """
    date = serializers.DateField(read_only=True)
    total_appointments = serializers.IntegerField(read_only=True)
    completed = serializers.IntegerField(read_only=True)
    cancelled = serializers.IntegerField(read_only=True)
    no_show = serializers.IntegerField(read_only=True)
    scheduled = serializers.IntegerField(read_only=True)
    confirmed = serializers.IntegerField(read_only=True)


class PopularDoctorsSerializer(serializers.Serializer):
    """
    Serializer para reporte de doctores más solicitados.
    """
    doctor_id = serializers.IntegerField(read_only=True)
    doctor_name = serializers.CharField(read_only=True)
    specialization = serializers.CharField(read_only=True)
    total_appointments = serializers.IntegerField(read_only=True)
    completed_appointments = serializers.IntegerField(read_only=True)
    cancelled_appointments = serializers.IntegerField(read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)


class CancellationMetricsSerializer(serializers.Serializer):
    """
    Serializer para métricas de cancelaciones.
    """
    total_cancellations = serializers.IntegerField(read_only=True)
    cancellation_rate = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    cancellations_by_month = serializers.ListField(
        child=serializers.DictField(), read_only=True
    )
    cancellations_by_doctor = serializers.ListField(
        child=serializers.DictField(), read_only=True
    )
    main_cancellation_reasons = serializers.ListField(
        child=serializers.DictField(), read_only=True
    )


class ReportFilterSerializer(serializers.Serializer):
    """
    Serializer para filtros de reportes.
    """
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    doctor_id = serializers.IntegerField(required=False)
    patient_id = serializers.IntegerField(required=False)
    status = serializers.ChoiceField(
        choices=Appointment.STATUS_CHOICES,
        required=False
    )
    
    def validate(self, data):
        """
        Validar que la fecha de inicio sea anterior a la fecha de fin.
        """
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError(
                    "La fecha de inicio debe ser anterior a la fecha de fin."
                )
        
        return data