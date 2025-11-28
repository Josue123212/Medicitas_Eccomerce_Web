from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class Doctor(models.Model):
    """
    Modelo para representar un doctor en el sistema.
    Extiende la información del usuario base con datos específicos del doctor.
    """
    
    # Opciones de estado del doctor
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('disabled', 'Inhabilitado'),
    ]
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        verbose_name="Usuario",
        help_text="Usuario asociado al doctor"
    )
    # Información profesional
    medical_license = models.CharField(
        max_length=50, 
        unique=True,
        verbose_name="Licencia Médica",
        help_text="Número único de licencia médica"
    )
    specialization = models.CharField(
        max_length=100,
        verbose_name="Especialización",
        help_text="Especialidad médica del doctor"
    )
    years_experience = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        verbose_name="Años de Experiencia",
        help_text="Años de experiencia profesional"
    )
    consultation_fee = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Tarifa de Consulta",
        help_text="Costo de la consulta médica"
    )
    bio = models.TextField(
        blank=True,
        verbose_name="Biografía",
        help_text="Información adicional sobre el doctor"
    )
    
    # Campo de estado del doctor
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Estado",
        help_text="Estado actual del doctor en el sistema"
    )
    
    # Mantener is_available para compatibilidad hacia atrás
    is_available = models.BooleanField(
        default=True,
        verbose_name="Disponible",
        help_text="Indica si el doctor está disponible para citas"
    )
    
    # Horarios de trabajo
    work_start_time = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Hora de Inicio",
        help_text="Hora de inicio de la jornada laboral"
    )
    work_end_time = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Hora de Fin",
        help_text="Hora de fin de la jornada laboral"
    )
    work_days = models.JSONField(
        default=list,
        verbose_name="Días de Trabajo",
        help_text="Lista de días de trabajo: ['monday', 'tuesday', ...]"
    )
    
    # Campos de auditoría
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )
    
    class Meta:
        app_label = 'doctors'
        verbose_name = "Doctor"
        verbose_name_plural = "Doctores"
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['specialization']),
            models.Index(fields=['status']),
            models.Index(fields=['is_available']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"
    
    def get_full_name(self):
        """Retorna el nombre completo del doctor con título."""
        return f"Dr. {self.user.get_full_name()}"
    
    @property
    def full_name(self):
        """Propiedad para acceder al nombre completo."""
        return self.get_full_name()
    
    @property
    def email(self):
        """Propiedad para acceder al email del usuario."""
        return self.user.email
    
    def toggle_availability(self):
        """Cambia el estado de disponibilidad del doctor."""
        self.is_available = not self.is_available
        self.save(update_fields=['is_available', 'updated_at'])
        return self.is_available
    
    def set_status(self, new_status):
        """Establece el estado del doctor."""
        if new_status in dict(self.STATUS_CHOICES):
            self.status = new_status
            # Actualizar is_available basado en el estado
            self.is_available = new_status == 'active'
            
            # Desactivar/activar usuario según el estado
            if new_status == 'disabled':
                # Si está inhabilitado, desactivar la cuenta del usuario
                self.user.is_active = False
                self.user.save(update_fields=['is_active'])
            elif new_status == 'active':
                # Si está activo, activar la cuenta del usuario
                self.user.is_active = True
                self.user.save(update_fields=['is_active'])
            # Para 'inactive', mantener el usuario activo pero el doctor no disponible
            
            self.save(update_fields=['status', 'is_available', 'updated_at'])
            return True
        return False
    
    def disable_doctor(self):
        """Inhabilita al doctor."""
        return self.set_status('disabled')
    
    def activate_doctor(self):
        """Activa al doctor."""
        return self.set_status('active')
    
    def deactivate_doctor(self):
        """Desactiva temporalmente al doctor."""
        return self.set_status('inactive')
    
    @property
    def is_active(self):
        """Verifica si el doctor está activo."""
        return self.status == 'active'
    
    @property
    def is_disabled(self):
        """Verifica si el doctor está inhabilitado."""
        return self.status == 'disabled'
    
    @property
    def status_display(self):
        """Retorna el texto legible del estado."""
        return dict(self.STATUS_CHOICES).get(self.status, 'Desconocido')
    
    @property
    def can_access_system(self):
        """Verifica si el doctor puede acceder al sistema."""
        return self.status != 'disabled' and self.user.is_active
    
    @property
    def status_color(self):
        """Retorna el color asociado al estado para el frontend considerando estado y disponibilidad."""
        if self.status == 'disabled':
            return '#ef4444'  # Rojo - Inhabilitado
        elif self.status == 'inactive':
            return '#f59e0b'  # Amarillo - Inactivo
        elif self.status == 'active':
            # Si está activo, color basado en disponibilidad
            return '#10b981' if self.is_available else '#6b7280'  # Verde si disponible, gris si ocupado
        else:
            return '#6b7280'  # Gris por defecto
    
    @property
    def status_badge_text(self):
        """Retorna el texto del badge para el frontend considerando estado y disponibilidad."""
        if self.status == 'disabled':
            return 'Inhabilitado'
        elif self.status == 'inactive':
            return 'Inactivo'
        elif self.status == 'active':
            # Si está activo, mostrar disponibilidad real
            return 'Disponible' if self.is_available else 'Ocupado'
        else:
            return 'Desconocido'
    
    def is_working_day(self, day_name):
        """Verifica si el doctor trabaja en un día específico."""
        return day_name.lower() in [day.lower() for day in self.work_days]
    
    def get_work_schedule(self):
        """Retorna el horario de trabajo formateado."""
        if not self.work_start_time or not self.work_end_time:
            return "Horario no definido"
        
        days_str = ", ".join(self.work_days) if self.work_days else "Sin días definidos"
        return f"{self.work_start_time.strftime('%H:%M')} - {self.work_end_time.strftime('%H:%M')} ({days_str})"
    
    def set_work_schedule(self, start_time, end_time, work_days):
        """Establece el horario de trabajo del doctor."""
        self.work_start_time = start_time
        self.work_end_time = end_time
        self.work_days = work_days
        self.save(update_fields=['work_start_time', 'work_end_time', 'work_days', 'updated_at'])
