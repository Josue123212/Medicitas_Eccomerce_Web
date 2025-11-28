from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from .models import User, PasswordResetToken, SecretaryProfile


class CustomTokenObtainPairSerializer(serializers.Serializer):
    """
    Serializer personalizado para obtener tokens JWT.
    Permite login con email o username.
    """
    email_or_username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        try:
            email_or_username = attrs.get('email_or_username')
            password = attrs.get('password')
            
            print(f"Debug - attrs recibidos: {attrs}")
            print(f"Debug - email_or_username: {email_or_username}")
            print(f"Debug - password: {password}")
            
            if email_or_username and password:
                # Debug: imprimir información
                print(f"Intentando autenticar: {email_or_username}")
                print(f"Request en context: {self.context.get('request')}")
                
                # 🔍 Primero verificar si el usuario existe con esas credenciales
                from django.contrib.auth import get_user_model
                from django.contrib.auth.hashers import check_password
                
                User = get_user_model()
                user = None
                
                # Buscar usuario por email o username
                try:
                    if '@' in email_or_username:
                        user_candidate = User.objects.get(email=email_or_username)
                    else:
                        user_candidate = User.objects.get(username=email_or_username)
                    
                    # Verificar contraseña
                    if check_password(password, user_candidate.password):
                        user = user_candidate
                        print(f"✅ Credenciales válidas para: {user.email}")
                    else:
                        print(f"❌ Contraseña incorrecta para: {email_or_username}")
                        
                except User.DoesNotExist:
                    print(f"❌ Usuario no encontrado: {email_or_username}")
                
                print(f"Resultado de validación: {user}")
                
                if user:
                    # ✅ Credenciales válidas - ahora validar estados
                    if not user.is_active:
                        raise serializers.ValidationError(
                            'La cuenta de usuario está desactivada.'
                        )
                    
                    # 🔒 Validar si es un doctor y si puede acceder al sistema
                    if user.role == 'doctor':
                        try:
                            from apps.doctors.models import Doctor
                            doctor = Doctor.objects.get(user=user)
                            if not doctor.can_access_system:
                                raise serializers.ValidationError(
                                    'Cuenta deshabilitada: Su acceso como doctor ha sido suspendido. Contacte al administrador del sistema.'
                                )
                        except Doctor.DoesNotExist:
                            raise serializers.ValidationError(
                                'No se encontró el perfil de doctor asociado.'
                            )
                    
                    print("Debug - Generando tokens...")
                    # Generar tokens manualmente
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    print(f"Debug - Refresh token: {type(refresh)}")
                    print(f"Debug - Access token: {type(access_token)}")
                    
                    # Preparar la respuesta con tokens y datos del usuario
                    user_data = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                    }
                    
                    # Si el usuario es un paciente, incluir el patient_profile_id
                    if user.role == 'client':
                        try:
                            from apps.patients.models import Patient
                            patient_profile = Patient.objects.get(user=user)
                            user_data['patient_profile_id'] = patient_profile.id
                        except Patient.DoesNotExist:
                            # Si no tiene perfil de paciente, no incluir el campo
                            pass
                    
                    data = {
                        'refresh': str(refresh),
                        'access': str(access_token),
                        'user': user_data
                    }
                    
                    print(f"Debug - Data preparada: {data}")
                    return data
                else:
                    raise serializers.ValidationError(
                        'Credenciales inválidas. Verifique su email/usuario y contraseña.'
                    )
            else:
                raise serializers.ValidationError(
                    'Debe proporcionar email/usuario y contraseña.'
                )
        except Exception as e:
            print(f"❌ Error en validación: {str(e)}")
            raise serializers.ValidationError(
                'Error en la autenticación. Intente nuevamente.'
            )


class SecretaryCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear nuevas secretarias junto con su usuario.
    Maneja la creación completa de usuario y secretaria en una sola operación.
    """
    # Campos del usuario
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(write_only=True, required=False)  # Cambiado de 'phone' a 'phone_number'
    password = serializers.CharField(write_only=True)
    
    # Campos del perfil de secretaria
    employee_id = serializers.CharField(required=False)
    department = serializers.CharField(default='Administración')
    shift_start = serializers.TimeField(default='08:00')
    shift_end = serializers.TimeField(default='17:00')
    hire_date = serializers.DateField(required=False)  # Nuevo campo
    can_manage_appointments = serializers.BooleanField(default=True)
    can_manage_patients = serializers.BooleanField(default=True)
    can_view_reports = serializers.BooleanField(default=False)  # Nuevo campo
    
    class Meta:
        model = SecretaryProfile
        fields = [
            # Campos del usuario
            'username', 'email', 'first_name', 'last_name', 'phone_number', 'password',
            # Campos del perfil de secretaria
            'employee_id', 'department', 'shift_start', 'shift_end', 'hire_date',
            'can_manage_appointments', 'can_manage_patients', 'can_view_reports'
        ]

    def validate_username(self, value):
        """
        Valida que el username sea único.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este nombre de usuario."
            )
        return value

    def validate_email(self, value):
        """
        Valida que el email sea único.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este correo electrónico."
            )
        return value

    def validate_employee_id(self, value):
        """
        Valida que el employee_id sea único si se proporciona.
        """
        if value and SecretaryProfile.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError(
                "Ya existe un secretario con este ID de empleado."
            )
        return value

    def create(self, validated_data):
        """
        Crea un nuevo usuario con rol de secretaria y su perfil asociado.
        """
        # Extraer datos del usuario
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone': validated_data.pop('phone_number', ''),  # Mapear phone_number a phone
            'password': validated_data.pop('password'),
            'role': 'secretary'
        }
        
        # Crear el usuario (esto automáticamente crea el SecretaryProfile via signal)
        user = User.objects.create_user(**user_data)
        
        # Obtener el perfil de secretaria creado automáticamente por el signal
        secretary_profile = SecretaryProfile.objects.get(user=user)
        
        # Generar employee_id si no se proporciona
        if not validated_data.get('employee_id'):
            validated_data['employee_id'] = f"SEC{user.id:04d}"
        
        # Actualizar el perfil de secretaria con los datos adicionales
        for field, value in validated_data.items():
            setattr(secretary_profile, field, value)
        
        secretary_profile.save()
        
        return secretary_profile

    def to_representation(self, instance):
        """
        Retorna la representación del perfil de secretaria creado.
        """
        return SecretaryProfileSerializer(instance).data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de nuevos usuarios.
    """
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'date_of_birth', 'address'
        )
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """
        Validar que el email sea único.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con este email.'
            )
        return value
    
    def validate_username(self, value):
        """
        Validar que el username sea único.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con este nombre de usuario.'
            )
        return value
    
    def validate(self, attrs):
        """
        Validar que las contraseñas coincidan.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': 'Las contraseñas no coinciden.'}
            )
        return attrs
    
    def create(self, validated_data):
        """
        Crear un nuevo usuario.
        """
        # Remover password_confirm ya que no es parte del modelo
        validated_data.pop('password_confirm')
        
        # Crear el usuario
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información del usuario.
    Incluye soporte para todos los roles: client, doctor, secretary, admin, superadmin.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_doctor = serializers.BooleanField(read_only=True)
    is_secretary = serializers.BooleanField(read_only=True)
    is_client = serializers.BooleanField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    is_superadmin = serializers.BooleanField(read_only=True)
    patient_profile_id = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'date_of_birth', 'address', 'is_active',
            'is_staff', 'is_superuser', 'created_at', 'updated_at',
            'is_doctor', 'is_secretary', 'is_client', 'is_admin', 'is_superadmin',
            'patient_profile_id'
        )
        read_only_fields = (
            'id', 'username', 'is_staff', 'is_superuser', 'created_at', 'updated_at',
            'is_doctor', 'is_secretary', 'is_client', 'is_admin', 'is_superadmin',
            'patient_profile_id'
        )
    
    def get_patient_profile_id(self, obj):
        """
        Obtener el ID del perfil de paciente si existe.
        """
        if hasattr(obj, 'patient_profile'):
            return obj.patient_profile.id
        return None
    
    def to_representation(self, instance):
        """
        Incluir datos del perfil de paciente en la representación.
        """
        data = super().to_representation(instance)
        
        # Si el usuario tiene perfil de paciente, incluir sus datos
        if hasattr(instance, 'patient_profile') and instance.patient_profile:
            patient_profile = instance.patient_profile
            data['allergies'] = patient_profile.allergies or ''
            data['medical_conditions'] = patient_profile.medical_conditions or ''
            data['emergency_contact'] = patient_profile.emergency_contact_name or ''
        else:
            data['allergies'] = ''
            data['medical_conditions'] = ''
            data['emergency_contact'] = ''
            
        return data
    
    def update(self, instance, validated_data):
        """
        Actualizar el usuario y su perfil de paciente.
        """
        # Extraer campos del perfil de paciente
        allergies = validated_data.pop('allergies', None)
        medical_conditions = validated_data.pop('medical_conditions', None)
        emergency_contact = validated_data.pop('emergency_contact', None)
        
        # Actualizar campos del usuario
        instance = super().update(instance, validated_data)
        
        # Actualizar perfil de paciente si existe
        if hasattr(instance, 'patient_profile') and instance.patient_profile:
            patient_profile = instance.patient_profile
            
            if allergies is not None:
                patient_profile.allergies = allergies
            if medical_conditions is not None:
                patient_profile.medical_conditions = medical_conditions
            if emergency_contact is not None:
                patient_profile.emergency_contact_name = emergency_contact
                
            patient_profile.save()
        
        return instance
    
    def validate_role(self, value):
        """
        Validar que el rol sea uno de los permitidos.
        """
        valid_roles = ['client', 'doctor', 'secretary', 'admin', 'superadmin']
        if value not in valid_roles:
            raise serializers.ValidationError(
                f"Rol inválido. Los roles permitidos son: {', '.join(valid_roles)}"
            )
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar el perfil del usuario.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    patient_profile_id = serializers.SerializerMethodField()
    
    # Campos del perfil de paciente
    allergies = serializers.CharField(required=False, allow_blank=True)
    medical_conditions = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'date_of_birth', 'address', 'created_at', 'updated_at',
            'patient_profile_id', 'allergies', 'medical_conditions', 'emergency_contact'
        )
        read_only_fields = ('id', 'username', 'role', 'created_at', 'updated_at', 'patient_profile_id')
    
    def get_patient_profile_id(self, obj):
        """
        Obtener el ID del perfil de paciente si existe.
        """
        if hasattr(obj, 'patient_profile'):
            return obj.patient_profile.id
        return None
    
    def validate_email(self, value):
        """
        Validar que el email sea único (excluyendo el usuario actual).
        """
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con este email.'
            )
        return value
    
    def to_representation(self, instance):
        """
        Incluir datos del perfil de paciente en la representación.
        """
        data = super().to_representation(instance)
        
        # Agregar campos del perfil de paciente si existe
        if hasattr(instance, 'patient_profile') and instance.patient_profile:
            patient_profile = instance.patient_profile
            data['allergies'] = patient_profile.allergies or ''
            data['medical_conditions'] = patient_profile.medical_conditions or ''
            data['emergency_contact'] = patient_profile.emergency_contact_name or ''
        else:
            data['allergies'] = ''
            data['medical_conditions'] = ''
            data['emergency_contact'] = ''
            
        return data
    
    def update(self, instance, validated_data):
        """
        Actualizar el usuario y su perfil de paciente.
        """
        print(f"🔍 UserProfileSerializer.update - Datos recibidos: {validated_data}")
        
        # Extraer campos del perfil de paciente
        allergies = validated_data.pop('allergies', None)
        medical_conditions = validated_data.pop('medical_conditions', None)
        emergency_contact = validated_data.pop('emergency_contact', None)
        
        print(f"🔍 Campos médicos extraídos - allergies: {allergies}, medical_conditions: {medical_conditions}, emergency_contact: {emergency_contact}")
        
        # Actualizar campos del usuario
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar perfil de paciente si existe
        if hasattr(instance, 'patient_profile') and instance.patient_profile:
            patient_profile = instance.patient_profile
            print(f"🔍 Perfil de paciente encontrado: {patient_profile.id}")
            
            if allergies is not None:
                patient_profile.allergies = allergies
                print(f"🔍 Actualizando allergies: {allergies}")
            if medical_conditions is not None:
                patient_profile.medical_conditions = medical_conditions
                print(f"🔍 Actualizando medical_conditions: {medical_conditions}")
            if emergency_contact is not None:
                patient_profile.emergency_contact_name = emergency_contact
                print(f"🔍 Actualizando emergency_contact_name: {emergency_contact}")
                
            patient_profile.save()
            print(f"🔍 Perfil de paciente guardado")
        else:
            print(f"🔍 No se encontró perfil de paciente para el usuario {instance.id}")
        
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar la contraseña del usuario.
    """
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        """
        Validar que la contraseña actual sea correcta.
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                'La contraseña actual es incorrecta.'
            )
        return value
    
    def validate(self, attrs):
        """
        Validar que las nuevas contraseñas coincidan.
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': 'Las contraseñas no coinciden.'}
            )
        return attrs
    
    def save(self, **kwargs):
        """
        Cambiar la contraseña del usuario.
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar recuperación de contraseña.
    """
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """
        Validar que el email exista en el sistema.
        """
        try:
            user = User.objects.get(email=value, is_active=True)
            return value
        except User.DoesNotExist:
            # Por seguridad, no revelamos si el email existe o no
            # Siempre devolvemos éxito para evitar enumeración de usuarios
            return value
    
    def save(self, **kwargs):
        """
        Crear token de recuperación y enviar email.
        """
        email = self.validated_data['email']
        request = self.context.get('request')
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Obtener IP y User Agent del request
            ip_address = None
            user_agent = ''
            
            if request:
                # Obtener IP real considerando proxies
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip_address = x_forwarded_for.split(',')[0].strip()
                else:
                    ip_address = request.META.get('REMOTE_ADDR')
                
                user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Crear token de recuperación
            reset_token = PasswordResetToken.create_for_user(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Construir URL de recuperación
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password?token={reset_token.token}"
            
            # Preparar contexto para el template
            context = {
                'user': user,
                'reset_token': reset_token,
                'reset_url': reset_url,
                'expiry_hours': 24,  # 24 horas de expiración
                'site_name': 'Sistema de Citas Médicas',
            }
            
            # Renderizar templates
            html_message = render_to_string('emails/password_reset.html', context)
            plain_message = render_to_string('emails/password_reset.txt', context)
            
            # Enviar email
            try:
                send_mail(
                    subject='🔐 Recuperación de Contraseña - Sistema de Citas Médicas',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
                
                return {
                    'message': 'Si el email existe, recibirás un enlace de recuperación.',
                    'email_sent': True
                }
                
            except Exception as e:
                # Log del error pero no exponemos detalles al usuario
                print(f"Error enviando email de recuperación: {e}")
                return {
                    'message': 'Si el email existe, recibirás un enlace de recuperación.',
                    'email_sent': False
                }
            
        except User.DoesNotExist:
            # Usuario no existe, pero devolvemos el mismo mensaje por seguridad
            return {
                'message': 'Si el email existe, recibirás un enlace de recuperación.'
            }


class PasswordResetVerifySerializer(serializers.Serializer):
    """
    Serializer para verificar token de recuperación.
    """
    token = serializers.CharField(max_length=64)
    
    def validate_token(self, value):
        """
        Validar que el token sea válido y no haya expirado.
        """
        try:
            reset_token = PasswordResetToken.objects.get(
                token=value,
                used=False,
                expires_at__gt=timezone.now()
            )
            return value
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError(
                'Token inválido o expirado.'
            )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmar nueva contraseña con token.
    """
    token = serializers.CharField(max_length=64)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_token(self, value):
        """
        Validar que el token sea válido y no haya expirado.
        """
        try:
            reset_token = PasswordResetToken.objects.get(
                token=value,
                used=False,
                expires_at__gt=timezone.now()
            )
            self.reset_token = reset_token  # Guardar para uso posterior
            return value
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError(
                'Token inválido o expirado.'
            )
    
    def validate(self, attrs):
        """
        Validar que las contraseñas coincidan.
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': 'Las contraseñas no coinciden.'}
            )
        return attrs
    
    def save(self, **kwargs):
        """
        Cambiar la contraseña y marcar el token como usado.
        """
        # Cambiar contraseña del usuario
        user = self.reset_token.user
        user.set_password(self.validated_data['new_password'])
        user.save()
        
        # Marcar token como usado
        self.reset_token.mark_as_used()
        
        return {
            'message': 'Contraseña cambiada exitosamente.',
            'user_id': user.id
        }


class SecretaryProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil completo del secretario/a.
    Incluye información del usuario y campos específicos del secretario.
    Compatible con la interfaz SecretaryProfile del frontend.
    """
    # Campos del usuario relacionado
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    shift_duration = serializers.SerializerMethodField()
    is_working_now = serializers.SerializerMethodField()
    permissions_summary = serializers.CharField(source='get_permissions_summary', read_only=True)
    
    # Campos del User para permitir actualizaciones
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    phone_number = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        from .models import SecretaryProfile
        model = SecretaryProfile
        fields = [
            'id',
            'user',
            'full_name',
            'employee_id',
            'department',
            'shift_start',
            'shift_end',
            'shift_duration',
            'is_working_now',
            'can_manage_appointments',
            'can_manage_patients',
            'can_view_reports',
            'hire_date',
            'permissions_summary',
            'created_at',
            'updated_at',
            # Campos del User para permitir actualizaciones
            'first_name',
            'last_name',
            'email',
            'phone_number'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name', 'shift_duration', 'is_working_now', 'permissions_summary']

    def get_shift_duration(self, obj):
        """
        Retorna la duración del turno en horas.
        """
        try:
            return obj.get_shift_duration()
        except Exception:
            return 0

    def get_is_working_now(self, obj):
        """
        Retorna si la secretaria está trabajando actualmente.
        """
        try:
            return obj.is_working_now()
        except Exception:
            return False

    def validate_employee_id(self, value):
        """
        Valida que el employee_id sea único.
        """
        from .models import SecretaryProfile
        if SecretaryProfile.objects.filter(employee_id=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "Ya existe un secretario con este ID de empleado."
            )
        return value

    def validate_shift_times(self, attrs):
        """
        Valida que los horarios de turno sean coherentes.
        """
        shift_start = attrs.get('shift_start')
        shift_end = attrs.get('shift_end')
        
        if shift_start and shift_end:
            # Permitir turnos que cruzan medianoche
            if shift_start == shift_end:
                raise serializers.ValidationError(
                    "La hora de inicio y fin del turno no pueden ser iguales."
                )
        
        return attrs

    def validate(self, attrs):
        """
        Validación general del serializer.
        """
        attrs = self.validate_shift_times(attrs)
        return attrs

    def update(self, instance, validated_data):
        """
        Actualizar tanto el perfil de secretaria como los datos del usuario relacionado.
        """
        print("=" * 80)
        print("🚨 MÉTODO UPDATE EJECUTÁNDOSE EN SecretaryProfileSerializer")
        print("=" * 80)
        print(f"🔍 SecretaryProfileSerializer.update - Datos recibidos: {validated_data}")
        print(f"🔍 Instance: {instance} (ID: {instance.id})")
        print("=" * 80)
        
        # Extraer campos que pertenecen al modelo User
        user_fields = {}
        secretary_fields = {}
        
        # Mapear campos del frontend al backend
        field_mapping = {
            'first_name': 'first_name',
            'last_name': 'last_name', 
            'email': 'email',
            'phone_number': 'phone',  # Mapear phone_number a phone
            'phone': 'phone'  # También aceptar phone directamente
        }
        
        for field_name, value in validated_data.items():
            if field_name in field_mapping:
                # Es un campo del User
                mapped_field = field_mapping[field_name]
                user_fields[mapped_field] = value
                print(f"🔍 Campo de User: {field_name} -> {mapped_field} = {value}")
            else:
                # Es un campo del SecretaryProfile
                secretary_fields[field_name] = value
                print(f"🔍 Campo de SecretaryProfile: {field_name} = {value}")
        
        # Actualizar campos del usuario relacionado
        if user_fields:
            user = instance.user
            print(f"🔍 Actualizando User {user.id} con: {user_fields}")
            for attr, value in user_fields.items():
                setattr(user, attr, value)
            user.save()
            print(f"✅ Usuario actualizado: {user.first_name} {user.last_name}")
        
        # Actualizar campos del perfil de secretaria
        if secretary_fields:
            print(f"🔍 Actualizando SecretaryProfile {instance.id} con: {secretary_fields}")
            for attr, value in secretary_fields.items():
                setattr(instance, attr, value)
        
        instance.save()
        print(f"✅ Perfil de secretaria actualizado")
        
        return instance

    def to_representation(self, instance):
        """
        Personaliza la representación del serializer.
        """
        data = super().to_representation(instance)
        
        # Formatear las horas para mejor legibilidad
        if data.get('shift_start'):
            data['shift_start_formatted'] = instance.shift_start.strftime('%H:%M')
        if data.get('shift_end'):
            data['shift_end_formatted'] = instance.shift_end.strftime('%H:%M')
        
        return data