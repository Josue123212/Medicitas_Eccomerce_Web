from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import secrets
import hashlib
from datetime import timedelta


class User(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser.
    Incluye campos adicionales para el sistema de citas médicas.
    """
    ROLE_CHOICES = [
        ('client', 'Cliente'),
        ('doctor', 'Doctor'),
        ('secretary', 'Secretario/a'),
        ('admin', 'Administrador'),
        ('superadmin', 'Super Administrador'),
    ]
    
    # Hacer email único y requerido
    email = models.EmailField(unique=True, verbose_name='Correo electrónico')
    
    # Campos adicionales
    phone = models.CharField(
        max_length=15, 
        blank=True, 
        verbose_name='Teléfono',
        help_text='Número de teléfono del usuario'
    )
    
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='client',
        verbose_name='Rol',
        help_text='Rol del usuario en el sistema'
    )
    
    # Campos de perfil adicionales
    date_of_birth = models.DateField(
        null=True, 
        blank=True, 
        verbose_name='Fecha de nacimiento'
    )
    
    address = models.TextField(
        blank=True, 
        verbose_name='Dirección',
        help_text='Dirección completa del usuario'
    )
    
    # Campos de auditoría
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Fecha de creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True, 
        verbose_name='Fecha de actualización'
    )
    
    # Configuración del modelo
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['first_name']),
            models.Index(fields=['last_name']),
            models.Index(fields=['role']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
    
    def get_full_name(self):
        """
        Retorna el nombre completo del usuario.
        """
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_admin(self):
        """
        Verifica si el usuario es administrador o super administrador.
        """
        return self.role in ['admin', 'superadmin']
    
    def is_superadmin(self):
        """
        Verifica si el usuario es super administrador.
        """
        return self.role == 'superadmin'
    
    def is_client(self):
        """
        Verifica si el usuario es cliente.
        """
        return self.role == 'client'
    
    def is_doctor(self):
        """
        Verifica si el usuario es doctor.
        """
        return self.role == 'doctor'
    
    def is_secretary(self):
        """
        Verifica si el usuario es secretario/a.
        """
        return self.role == 'secretary'


class PasswordResetToken(models.Model):
    """
    Modelo para gestionar tokens de recuperación de contraseña.
    Incluye medidas de seguridad como expiración, uso único y tracking de IP.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        verbose_name='Usuario'
    )
    
    token = models.CharField(
        max_length=64,
        unique=True,
        verbose_name='Token',
        help_text='Token único para la recuperación de contraseña'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    
    expires_at = models.DateTimeField(
        verbose_name='Fecha de expiración',
        help_text='Fecha y hora cuando expira el token'
    )
    
    used = models.BooleanField(
        default=False,
        verbose_name='Usado',
        help_text='Indica si el token ya fue utilizado'
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='Dirección IP',
        help_text='IP desde donde se solicitó la recuperación'
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name='User Agent',
        help_text='Información del navegador/dispositivo'
    )
    
    class Meta:
        verbose_name = 'Token de Recuperación de Contraseña'
        verbose_name_plural = 'Tokens de Recuperación de Contraseña'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        status = 'Usado' if self.used else ('Expirado' if self.is_expired() else 'Activo')
        return f"Token para {self.user.email} - {status}"
    
    def save(self, *args, **kwargs):
        """
        Genera automáticamente el token y la fecha de expiración al crear.
        """
        if not self.token:
            self.token = self.generate_token()
        
        if not self.expires_at:
            # Token válido por 1 hora
            self.expires_at = timezone.now() + timedelta(hours=1)
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_token():
        """
        Genera un token seguro único.
        """
        # Generar token aleatorio de 32 bytes y convertir a hex
        random_token = secrets.token_bytes(32)
        # Agregar timestamp para mayor unicidad
        timestamp = str(timezone.now().timestamp()).encode()
        # Crear hash SHA-256
        token_hash = hashlib.sha256(random_token + timestamp).hexdigest()
        return token_hash
    
    def is_expired(self):
        """
        Verifica si el token ha expirado.
        """
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """
        Verifica si el token es válido (no usado y no expirado).
        """
        return not self.used and not self.is_expired()
    
    def mark_as_used(self):
        """
        Marca el token como usado.
        """
        self.used = True
        self.save(update_fields=['used'])
    
    @classmethod
    def create_for_user(cls, user, ip_address=None, user_agent=None):
        """
        Crea un nuevo token para un usuario, invalidando tokens anteriores.
        """
        # Invalidar tokens anteriores no usados del mismo usuario
        cls.objects.filter(
            user=user,
            used=False,
            expires_at__gt=timezone.now()
        ).update(used=True)
        
        # Crear nuevo token
        return cls.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @classmethod
    def cleanup_expired(cls):
        """
        Elimina tokens expirados (para tarea periódica).
        """
        expired_count = cls.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()[0]
        return expired_count


class SecretaryProfile(models.Model):
    """
    Modelo de perfil para usuarios con rol de secretario/a.
    Contiene información específica para la gestión administrativa.
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='secretary_profile',
        verbose_name='Usuario'
    )
    
    employee_id = models.CharField(
        max_length=20, 
        unique=True,
        verbose_name='ID de Empleado',
        help_text='Identificador único del empleado'
    )
    
    department = models.CharField(
        max_length=100,
        verbose_name='Departamento',
        help_text='Departamento donde trabaja la secretaria'
    )
    
    shift_start = models.TimeField(
        verbose_name='Inicio de Turno',
        help_text='Hora de inicio del turno de trabajo'
    )
    
    shift_end = models.TimeField(
        verbose_name='Fin de Turno',
        help_text='Hora de fin del turno de trabajo'
    )
    
    can_manage_appointments = models.BooleanField(
        default=True,
        verbose_name='Puede Gestionar Citas',
        help_text='Permiso para crear, modificar y cancelar citas'
    )
    
    can_manage_patients = models.BooleanField(
        default=True,
        verbose_name='Puede Gestionar Pacientes',
        help_text='Permiso para gestionar información de pacientes'
    )
    
    can_view_reports = models.BooleanField(
        default=False,
        verbose_name='Puede Ver Reportes',
        help_text='Permiso para acceder a reportes y estadísticas'
    )
    
    hire_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Fecha de Contratación',
        help_text='Fecha en que fue contratada la secretaria'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Actualización'
    )
    
    class Meta:
        verbose_name = 'Perfil de Secretario/a'
        verbose_name_plural = 'Perfiles de Secretarios/as'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"Secretario/a: {self.user.get_full_name()} - {self.department}"
    
    def get_full_name(self):
        """
        Retorna el nombre completo del secretario/a.
        """
        return self.user.get_full_name()
    
    def get_shift_duration(self):
        """
        Calcula la duración del turno en horas.
        """
        from datetime import datetime, timedelta, time
        
        # Función helper para convertir a time
        def to_time(time_value):
            if isinstance(time_value, time):
                return time_value
            time_str = str(time_value)
            # Intentar diferentes formatos
            for fmt in ['%H:%M:%S', '%H:%M']:
                try:
                    return datetime.strptime(time_str, fmt).time()
                except ValueError:
                    continue
            raise ValueError(f"No se pudo convertir {time_str} a time")
        
        # Convertir a objetos time
        start_time = to_time(self.shift_start)
        end_time = to_time(self.shift_end)
        
        # Convertir TimeField a datetime para calcular diferencia
        start = datetime.combine(datetime.today(), start_time)
        end = datetime.combine(datetime.today(), end_time)
        
        # Si el turno termina al día siguiente
        if end < start:
            end += timedelta(days=1)
        
        duration = end - start
        return duration.total_seconds() / 3600  # Retornar en horas
    
    def is_working_now(self):
        """
        Verifica si la secretaria está en horario de trabajo actualmente.
        """
        from datetime import datetime, time
        
        now = datetime.now().time()
        
        # Función helper para convertir a time
        def to_time(time_value):
            if isinstance(time_value, time):
                return time_value
            time_str = str(time_value)
            # Intentar diferentes formatos
            for fmt in ['%H:%M:%S', '%H:%M']:
                try:
                    return datetime.strptime(time_str, fmt).time()
                except ValueError:
                    continue
            raise ValueError(f"No se pudo convertir {time_str} a time")
        
        # Convertir a objetos time
        start_time = to_time(self.shift_start)
        end_time = to_time(self.shift_end)
        
        # Si el turno no cruza medianoche
        if start_time <= end_time:
            return start_time <= now <= end_time
        # Si el turno cruza medianoche
        else:
            return now >= start_time or now <= end_time
    
    def get_permissions_summary(self):
        """
        Retorna un resumen de los permisos del secretario/a.
        """
        permissions = []
        if self.can_manage_appointments:
            permissions.append('Gestión de Citas')
        if self.can_manage_patients:
            permissions.append('Gestión de Pacientes')
        
        return ', '.join(permissions) if permissions else 'Sin permisos especiales'
