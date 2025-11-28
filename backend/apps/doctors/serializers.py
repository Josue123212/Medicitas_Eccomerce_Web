from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Doctor
from decimal import Decimal

User = get_user_model()


class DoctorSerializer(serializers.ModelSerializer):
    """
    Serializer principal para el modelo Doctor.
    Incluye información del usuario relacionado y campos calculados.
    """
    # Campos del usuario relacionado
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    # Campos calculados
    full_name = serializers.CharField(read_only=True)
    
    # Campos de estado
    status_display = serializers.CharField(read_only=True)
    status_color = serializers.CharField(read_only=True)
    status_badge_text = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_disabled = serializers.BooleanField(read_only=True)
    can_access_system = serializers.BooleanField(read_only=True)
    
    # Serializer anidado para citas
    appointments = serializers.SerializerMethodField()
    appointments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id',
            'user',
            'first_name', 
            'last_name', 
            'email',
            'full_name',
            'medical_license',
            'specialization',
            'years_experience',
            'consultation_fee',
            'bio',
            'status',
            'status_display',
            'status_color',
            'status_badge_text',
            'is_available',
            'is_active',
            'is_disabled',
            'can_access_system',
            'appointments',
            'appointments_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_medical_license(self, value):
        """
        Valida que el número de licencia sea único y tenga formato válido.
        """
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError(
                "El número de licencia debe tener al menos 5 caracteres."
            )
        
        # Verificar unicidad excluyendo la instancia actual en caso de actualización
        queryset = Doctor.objects.filter(medical_license=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe un doctor con este número de licencia."
            )
        
        return value

    def get_appointments(self, obj):
        """Retorna las próximas citas del doctor (próximas 10 citas)"""
        try:
            from apps.appointments.serializers import AppointmentListSerializer
            from django.utils import timezone
            
            appointments = obj.appointments.filter(
                status__in=['scheduled', 'confirmed'],
                date__gte=timezone.now().date()
            ).order_by('date', 'time')[:10]
            return AppointmentListSerializer(appointments, many=True).data
        except:
            # Si hay algún error con las citas, retornar lista vacía
            return []
    
    def get_appointments_count(self, obj):
        """Retorna el conteo de citas por estado"""
        try:
            from django.utils import timezone
            
            return {
                'total': obj.appointments.count(),
                'scheduled': obj.appointments.filter(status='scheduled').count(),
                'confirmed': obj.appointments.filter(status='confirmed').count(),
                'upcoming': obj.appointments.filter(
                    status__in=['scheduled', 'confirmed'],
                    date__gte=timezone.now().date()
                ).count(),
                'completed_this_month': obj.appointments.filter(
                    status='completed',
                    date__year=timezone.now().year,
                    date__month=timezone.now().month
                ).count()
            }
        except:
            # Si hay algún error, retornar conteos en cero
            return {
                'total': 0,
                'scheduled': 0,
                'confirmed': 0,
                'upcoming': 0,
                'completed_this_month': 0
            }


class DoctorCreateWithUserSerializer(serializers.ModelSerializer):
    """
    Serializer para crear nuevos doctores junto con su usuario.
    Maneja la creación completa de usuario y doctor en una sola operación.
    """
    # Campos del usuario
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True)
    
    # Campos opcionales de horario
    work_start_time = serializers.TimeField(required=False, allow_null=True)
    work_end_time = serializers.TimeField(required=False, allow_null=True)
    work_days = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Doctor
        fields = [
            # Campos del usuario
            'username', 'email', 'first_name', 'last_name', 'phone', 'password',
            # Campos del doctor
            'medical_license', 'specialization', 'years_experience', 
            'consultation_fee', 'bio', 'is_available',
            # Campos de horario
            'work_start_time', 'work_end_time', 'work_days'
        ]

    def validate_username(self, value):
        """Valida que el username sea único."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este nombre de usuario."
            )
        return value

    def validate_email(self, value):
        """Valida que el email sea único."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este email."
            )
        return value

    def validate_medical_license(self, value):
        """Valida que el número de licencia sea único y tenga formato válido."""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError(
                "El número de licencia debe tener al menos 5 caracteres."
            )
        
        if Doctor.objects.filter(medical_license=value.strip().upper()).exists():
            raise serializers.ValidationError(
                "Ya existe un doctor con este número de licencia."
            )
        
        return value.strip().upper()

    def validate_consultation_fee(self, value):
        """Valida que la tarifa de consulta sea un valor positivo razonable."""
        if value < Decimal('0.00'):
            raise serializers.ValidationError(
                "La tarifa de consulta no puede ser negativa."
            )
        
        if value > Decimal('10000.00'):
            raise serializers.ValidationError(
                "La tarifa de consulta parece excesivamente alta."
            )
        
        return value

    def validate_years_experience(self, value):
        """Valida que los años de experiencia sean un valor positivo."""
        if value < 0:
            raise serializers.ValidationError(
                "Los años de experiencia no pueden ser negativos."
            )
        if value > 70:
            raise serializers.ValidationError(
                "Los años de experiencia no pueden ser mayores a 70."
            )
        return value

    def create(self, validated_data):
        """
        Crea un nuevo usuario y su perfil de doctor asociado.
        """
        # Extraer datos del usuario
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'password': validated_data.pop('password'),
        }
        
        # Extraer teléfono si existe
        phone = validated_data.pop('phone', None)
        
        # Crear el usuario
        user = User.objects.create_user(**user_data)
        
        # Asignar rol de doctor
        user.groups.clear()
        from django.contrib.auth.models import Group
        doctor_group, created = Group.objects.get_or_create(name='doctor')
        user.groups.add(doctor_group)
        
        # Actualizar teléfono del usuario si se proporciona
        if phone:
            user.phone = phone
            user.save()
        
        # Crear el doctor
        doctor = Doctor.objects.create(
            user=user,
            **validated_data
        )
        
        return doctor

    def validate_consultation_fee(self, value):
        """
        Valida que la tarifa de consulta sea un valor positivo razonable.
        """
        if value < Decimal('0.00'):
            raise serializers.ValidationError(
                "La tarifa de consulta no puede ser negativa."
            )
        
        if value > Decimal('10000.00'):
            raise serializers.ValidationError(
                "La tarifa de consulta parece excesivamente alta."
            )
        
        return value

    def validate_years_experience(self, value):
        """
        Valida que los años de experiencia sean un valor positivo.
        """
        if value < 0:
            raise serializers.ValidationError(
                "Los años de experiencia no pueden ser negativos."
            )
        if value > 70:
            raise serializers.ValidationError(
                "Los años de experiencia no pueden ser mayores a 70."
            )
        return value




class DoctorCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear nuevos doctores.
    Incluye validaciones específicas para la creación.
    """
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'user_id',
            'medical_license',
            'specialization',
            'years_experience',
            'consultation_fee',
            'bio',
            'is_available'
        ]

    def validate_user_id(self, value):
        """
        Valida que el usuario exista y no esté ya asociado a otro doctor.
        """
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "El usuario especificado no existe."
            )
        
        # Verificar que el usuario no esté ya asociado a otro doctor
        if Doctor.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                "Este usuario ya está asociado a un doctor."
            )
        
        return value

    def create(self, validated_data):
        """
        Crea un nuevo doctor con el usuario especificado.
        """
        user_id = validated_data.pop('user_id')
        user = User.objects.get(id=user_id)
        
        doctor = Doctor.objects.create(
            user=user,
            **validated_data
        )
        
        return doctor


class DoctorUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar doctores existentes.
    Excluye campos que no deberían modificarse después de la creación.
    """
    class Meta:
        model = Doctor
        fields = [
            'specialization',
            'years_experience',
            'consultation_fee',
            'bio',
            'is_available',
            'status'  # Permitir actualización del estado del doctor
        ]
        # license_number y user no se pueden modificar después de la creación


class DoctorListSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para listados de doctores.
    Incluye solo los campos esenciales para mejorar performance.
    """
    full_name = serializers.CharField(read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    # Campos de estado para badges
    status_display = serializers.CharField(read_only=True)
    status_color = serializers.CharField(read_only=True)
    status_badge_text = serializers.CharField(read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id',
            'full_name',
            'email',
            'specialization',
            'years_experience',
            'consultation_fee',
            'status',
            'status_display',
            'status_color',
            'status_badge_text',
            'is_available',
            'work_start_time',
            'work_end_time',
            'work_days'
        ]


class DoctorPublicSerializer(serializers.ModelSerializer):
    """
    Serializer para información pública de doctores.
    Excluye información sensible como email completo.
    """
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id',
            'full_name',
            'specialization',
            'years_experience',
            'bio',
            'is_available'
        ]


class DoctorProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil completo del doctor.
    Incluye información del usuario y campos específicos del doctor.
    Compatible con la interfaz DoctorProfile del frontend.
    """
    # Campos del usuario relacionado
    user = serializers.SerializerMethodField()
    
    # Mapeo de campos para compatibilidad con frontend
    medical_license = serializers.CharField()
    years_experience = serializers.IntegerField()
    
    # Campos adicionales que se pueden agregar en el futuro
    work_start_time = serializers.SerializerMethodField()
    work_end_time = serializers.SerializerMethodField()
    work_days = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id',
            'user',
            'medical_license',
            'specialization',
            'years_experience',
            'consultation_fee',
            'bio',
            'status',
            'is_available',
            'work_start_time',
            'work_end_time',
            'work_days',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user(self, obj):
        """
        Retorna información básica del usuario asociado al doctor.
        """
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'full_name': obj.user.get_full_name(),
            'role': obj.user.role,
            'phone': getattr(obj.user, 'phone', ''),
            'is_active': obj.user.is_active
        }

    def get_work_start_time(self, obj):
        """
        Retorna la hora de inicio de trabajo.
        Por ahora retorna un valor por defecto, se puede personalizar en el futuro.
        """
        # TODO: Agregar campo work_start_time al modelo Doctor si es necesario
        return "08:00"

    def get_work_end_time(self, obj):
        """
        Retorna la hora de fin de trabajo.
        Por ahora retorna un valor por defecto, se puede personalizar en el futuro.
        """
        # TODO: Agregar campo work_end_time al modelo Doctor si es necesario
        return "17:00"

    def get_work_days(self, obj):
        """
        Retorna los días de trabajo.
        Por ahora retorna días laborales por defecto, se puede personalizar en el futuro.
        """
        # TODO: Agregar campo work_days al modelo Doctor si es necesario
        return ["monday", "tuesday", "wednesday", "thursday", "friday"]

    def validate_medical_license(self, value):
        """
        Valida el número de licencia médica.
        """
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError(
                "El número de licencia médica debe tener al menos 5 caracteres."
            )
        
        # Verificar unicidad excluyendo la instancia actual en caso de actualización
        queryset = Doctor.objects.filter(license_number=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe un doctor con este número de licencia médica."
            )
        
        return value.strip().upper()

    def validate_years_experience(self, value):
        """
        Valida los años de experiencia.
        """
        if value < 0:
            raise serializers.ValidationError(
                "Los años de experiencia no pueden ser negativos."
            )
        
        if value > 70:
            raise serializers.ValidationError(
                "Los años de experiencia parecen excesivos."
            )
        
        return value

    def validate_consultation_fee(self, value):
        """
        Valida la tarifa de consulta.
        """
        if value < Decimal('0.00'):
            raise serializers.ValidationError(
                "La tarifa de consulta no puede ser negativa."
            )
        
        if value > Decimal('10000.00'):
            raise serializers.ValidationError(
                "La tarifa de consulta parece excesivamente alta."
            )
        
        return value