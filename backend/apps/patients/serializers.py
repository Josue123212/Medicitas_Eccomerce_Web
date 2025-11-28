from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import date
from .models import Patient
import re

User = get_user_model()


class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer completo para el modelo Patient.
    Incluye información del usuario relacionado y campos calculados.
    """
    # Campos del usuario relacionado (solo lectura)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    # Campos calculados
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    age = serializers.SerializerMethodField()
    medical_summary = serializers.SerializerMethodField()
    
    # Campos de estado
    status_display = serializers.CharField(read_only=True)
    status_color = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_disabled = serializers.BooleanField(read_only=True)
    can_access_system = serializers.BooleanField(read_only=True)
    
    # Serializer anidado para citas (se importará dinámicamente para evitar imports circulares)
    appointments = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'age', 'gender', 'phone_number', 'address',
            'status', 'status_display', 'status_color', 'is_active', 'is_disabled', 'can_access_system',
            'blood_type', 'allergies', 'medical_conditions', 'medications',
            'emergency_contact_name', 'emergency_contact_phone', 
            'emergency_contact_relationship', 'medical_summary',
            'appointments', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'age', 'medical_summary', 'created_at', 'updated_at'
        )
    
    def get_age(self, obj):
        """Calcula la edad del paciente"""
        return obj.age
    
    def get_medical_summary(self, obj):
        """Retorna el resumen médico del paciente"""
        try:
            summary_dict = obj.get_medical_summary()
            # Convertir el diccionario a un formato serializable
            return {
                'blood_type': summary_dict.get('blood_type', 'No especificado'),
                'allergies': summary_dict.get('allergies', 'Ninguna conocida'),
                'medical_conditions': summary_dict.get('medical_conditions', 'Ninguna conocida'),
                'medications': summary_dict.get('medications', 'Ninguna')
            }
        except Exception as e:
            # En caso de error, devolver un resumen básico
            return {
                'blood_type': obj.blood_type or 'No especificado',
                'allergies': obj.allergies or 'Ninguna conocida',
                'medical_conditions': obj.medical_conditions or 'Ninguna conocida',
                'medications': obj.medications or 'Ninguna'
            }
    
    def get_appointments(self, obj):
        """Retorna las citas del paciente (últimas 5 citas)"""
        from apps.appointments.serializers import AppointmentListSerializer
        appointments = obj.appointments.filter(
            status__in=['scheduled', 'confirmed', 'completed']
        ).order_by('-date', '-time')[:5]
        return AppointmentListSerializer(appointments, many=True).data


class PatientStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar el estado del paciente.
    Permite cambiar entre active, inactive y disabled.
    """
    class Meta:
        model = Patient
        fields = ['status']
    
    def validate_status(self, value):
        """Valida que el estado sea válido"""
        valid_statuses = [choice[0] for choice in Patient.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Estado inválido. Opciones válidas: {', '.join(valid_statuses)}"
            )
        return value
    
    def update(self, instance, validated_data):
        """Actualiza el estado del paciente usando el método set_status"""
        new_status = validated_data.get('status')
        if new_status:
            instance.set_status(new_status)
        return instance
    
    def validate_date_of_birth(self, value):
        """Valida que la fecha de nacimiento no sea futura"""
        if value > date.today():
            raise serializers.ValidationError(
                "La fecha de nacimiento no puede ser en el futuro."
            )
        
        # Validar edad mínima (por ejemplo, no menor a 0 años)
        age = date.today().year - value.year
        if age > 120:
            raise serializers.ValidationError(
                "La fecha de nacimiento no es válida (edad mayor a 120 años)."
            )
        
        return value
    
    def validate_phone_number(self, value):
        """Validación adicional para el número de teléfono"""
        # El modelo ya tiene validación con RegexValidator
        # Aquí podemos agregar validaciones adicionales si es necesario
        if value and len(value.replace('+', '').replace(' ', '').replace('-', '')) < 9:
            raise serializers.ValidationError(
                "El número de teléfono debe tener al menos 9 dígitos."
            )
        return value
    
    def validate_emergency_contact_phone(self, value):
        """Validación para el teléfono de contacto de emergencia"""
        if value and len(value.replace('+', '').replace(' ', '').replace('-', '')) < 9:
            raise serializers.ValidationError(
                "El teléfono de contacto de emergencia debe tener al menos 9 dígitos."
            )
        return value


class PatientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear un nuevo paciente.
    Incluye validaciones específicas para la creación.
    """
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Patient
        fields = (
            'user_id', 'date_of_birth', 'gender', 'phone_number', 'address',
            'blood_type', 'allergies', 'medical_conditions', 'medications',
            'emergency_contact_name', 'emergency_contact_phone', 
            'emergency_contact_relationship'
        )
    
    def validate_user_id(self, value):
        """Valida que el usuario exista y no tenga ya un perfil de paciente"""
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("El usuario especificado no existe.")
        
        if hasattr(user, 'patient_profile'):
            raise serializers.ValidationError(
                "Este usuario ya tiene un perfil de paciente."
            )
        
        return value
    
    def validate_date_of_birth(self, value):
        """Valida que la fecha de nacimiento no sea futura"""
        if value > date.today():
            raise serializers.ValidationError(
                "La fecha de nacimiento no puede ser en el futuro."
            )
        
        age = date.today().year - value.year
        if age > 120:
            raise serializers.ValidationError(
                "La fecha de nacimiento no es válida (edad mayor a 120 años)."
            )
        
        return value
    
    def create(self, validated_data):
        """Crea un nuevo paciente asociado al usuario"""
        user_id = validated_data.pop('user_id')
        user = User.objects.get(id=user_id)
        
        patient = Patient.objects.create(
            user=user,
            **validated_data
        )
        
        return patient


class PatientUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar información del paciente.
    Excluye campos que no deben ser modificables.
    """
    class Meta:
        model = Patient
        fields = (
            'date_of_birth', 'gender', 'phone_number', 'address',
            'blood_type', 'allergies', 'medical_conditions', 'medications',
            'emergency_contact_name', 'emergency_contact_phone', 
            'emergency_contact_relationship'
        )
    
    def validate_date_of_birth(self, value):
        """Valida que la fecha de nacimiento no sea futura"""
        if value > date.today():
            raise serializers.ValidationError(
                "La fecha de nacimiento no puede ser en el futuro."
            )
        
        age = date.today().year - value.year
        if age > 120:
            raise serializers.ValidationError(
                "La fecha de nacimiento no es válida (edad mayor a 120 años)."
            )
        
        return value


class PatientListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listar pacientes.
    Incluye solo información esencial para listados.
    """
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    age = serializers.SerializerMethodField()
    status_display = serializers.CharField(read_only=True)
    status_color = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Patient
        fields = (
            'id', 'full_name', 'email', 'age', 'gender', 
            'phone_number', 'status', 'status_display', 'status_color', 'is_active', 'created_at'
        )
        read_only_fields = ('id', 'full_name', 'email', 'age', 'created_at')
    
    def get_age(self, obj):
        """Calcula la edad del paciente"""
        return obj.age