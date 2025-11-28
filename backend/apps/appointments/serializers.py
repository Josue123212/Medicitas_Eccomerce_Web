from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, time, timedelta
from .models import Appointment
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.patients.serializers import PatientListSerializer
from apps.doctors.serializers import DoctorListSerializer
from apps.core.validators import AppointmentValidator


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer principal para el modelo Appointment.
    Incluye información de paciente y doctor con serializers anidados.
    """
    # Serializers anidados para mostrar información completa
    patient_info = PatientListSerializer(source='patient', read_only=True)
    doctor_info = DoctorListSerializer(source='doctor', read_only=True)
    
    # Campos calculados
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_color = serializers.CharField(source='get_status_display_color', read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    can_be_cancelled = serializers.SerializerMethodField()
    can_be_rescheduled = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'doctor',
            'patient_info',
            'doctor_info',
            'date',
            'time',
            'status',
            'status_display',
            'status_color',
            'reason',
            'notes',
            'is_today',
            'is_past',
            'can_be_cancelled',
            'can_be_rescheduled',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_can_be_cancelled(self, obj):
        """Determina si la cita puede ser cancelada."""
        return obj.can_be_cancelled()
    
    def get_can_be_rescheduled(self, obj):
        """Determina si la cita puede ser reprogramada."""
        return obj.can_be_rescheduled()

    def validate_date(self, value):
        """
        Valida que la fecha de la cita sea válida.
        """
        # Validar que no sea más de 6 meses en el futuro
        max_date = timezone.now().date() + timedelta(days=180)
        if value > max_date:
            raise serializers.ValidationError(
                "No se pueden programar citas con más de 6 meses de anticipación."
            )
        
        return value

    def validate_patient(self, value):
        """
        Valida que el paciente exista y esté activo.
        """
        if not isinstance(value, Patient):
            raise serializers.ValidationError(
                "Debe especificar un paciente válido."
            )
        
        return value

    def validate_doctor(self, value):
        """
        Valida que el doctor exista.
        """
        if not isinstance(value, Doctor):
            raise serializers.ValidationError(
                "Debe especificar un doctor válido."
            )
        
        return value

    def validate(self, attrs):
        """
        Validaciones integrales usando AppointmentValidator.
        """
        date = attrs.get('date')
        time_value = attrs.get('time')
        doctor = attrs.get('doctor')
        patient = attrs.get('patient')
        
        # Si estamos creando una nueva cita
        if not self.instance:
            if all([doctor, patient, date, time_value]):
                try:
                    AppointmentValidator.validate_appointment_creation(
                        doctor, patient, date, time_value
                    )
                except Exception as e:
                    raise serializers.ValidationError(str(e))
        
        # Si estamos actualizando una cita existente
        else:
            # Usar valores actuales si no se proporcionan nuevos
            current_doctor = doctor or self.instance.doctor
            current_patient = patient or self.instance.patient
            current_date = date or self.instance.date
            current_time = time_value or self.instance.time
            
            try:
                AppointmentValidator.validate_appointment_update(
                    self.instance,
                    new_doctor=current_doctor,
                    new_patient=current_patient,
                    new_date=current_date,
                    new_time=current_time
                )
            except Exception as e:
                raise serializers.ValidationError(str(e))
        
        return attrs


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear nuevas citas.
    Incluye validaciones específicas para la creación.
    """
    class Meta:
        model = Appointment
        fields = [
            'patient',
            'doctor',
            'date',
            'time',
            'reason',
            'notes'
        ]
        validators = []

    def validate(self, attrs):
        """Validaciones específicas para la creación de citas usando AppointmentValidator."""
        doctor = attrs['doctor']
        patient = attrs['patient']
        date = attrs['date']
        time_value = attrs['time']
        
        try:
            AppointmentValidator.validate_appointment_creation(
                doctor, patient, date, time_value
            )
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return attrs


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar citas existentes.
    Incluye validaciones específicas para la actualización.
    """
    
    class Meta:
        model = Appointment
        fields = [
            'doctor', 'patient', 'date', 'time', 
            'reason', 'notes', 'status'
        ]
        validators = []
        
    def validate(self, attrs):
        """
        Validaciones específicas para la actualización usando AppointmentValidator.
        """
        instance = self.instance
        
        # Usar valores actuales si no se proporcionan nuevos
        new_doctor = attrs.get('doctor', instance.doctor)
        new_patient = attrs.get('patient', instance.patient)
        new_date = attrs.get('date', instance.date)
        new_time = attrs.get('time', instance.time)
        
        try:
            AppointmentValidator.validate_appointment_update(
                instance,
                new_doctor=new_doctor,
                new_patient=new_patient,
                new_date=new_date,
                new_time=new_time
            )
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return attrs


class AppointmentListSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para listados de citas.
    Incluye solo los campos esenciales para mejorar performance.
    """
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    doctor_info = DoctorListSerializer(source='doctor', read_only=True)
    patient_info = PatientListSerializer(source='patient', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient_name',
            'doctor_name',
            'doctor_info',
            'patient_info',
            'date',
            'time',
            'status',
            'status_display',
            'reason',
            'created_at',
            'updated_at'
        ]


class AppointmentCalendarSerializer(serializers.ModelSerializer):
    """
    Serializer para vista de calendario.
    Formato optimizado para componentes de calendario.
    """
    title = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    color = serializers.CharField(source='get_status_display_color', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id',
            'title',
            'start',
            'end',
            'color',
            'status'
        ]
    
    def get_title(self, obj):
        """Genera el título para el evento del calendario."""
        return f"{obj.patient.full_name} - {obj.doctor.full_name}"
    
    def get_start(self, obj):
        """Combina fecha y hora para el inicio del evento."""
        return datetime.combine(obj.date, obj.time).isoformat()
    
    def get_end(self, obj):
        """Calcula la hora de fin (asumiendo 1 hora de duración)."""
        start_datetime = datetime.combine(obj.date, obj.time)
        end_datetime = start_datetime + timedelta(hours=1)
        return end_datetime.isoformat()
