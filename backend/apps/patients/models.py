from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator

User = get_user_model()


class Patient(models.Model):
    """
    Modelo de Paciente que extiende la información del usuario
    para incluir datos médicos y de contacto de emergencia.
    """
    
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('disabled', 'Inhabilitado'),
    ]
    
    # Relación con el usuario
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile',
        verbose_name='Usuario'
    )
    
    # Información personal adicional
    date_of_birth = models.DateField(
        verbose_name='Fecha de nacimiento',
        null=True,
        blank=True
    )
    
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        verbose_name='Género',
        null=True,
        blank=True
    )
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="El número de teléfono debe estar en formato: '+999999999'. Hasta 15 dígitos permitidos."
    )
    
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        verbose_name='Número de teléfono',
        null=True,
        blank=True
    )
    
    address = models.TextField(
        verbose_name='Dirección',
        null=True,
        blank=True
    )
    
    # Campo de estado del paciente
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Estado",
        help_text="Estado actual del paciente en el sistema"
    )
    
    # Información médica
    blood_type = models.CharField(
        max_length=3,
        blank=True,
        null=True,
        verbose_name='Tipo de sangre'
    )
    
    allergies = models.TextField(
        blank=True,
        null=True,
        verbose_name='Alergias'
    )
    
    medical_conditions = models.TextField(
        blank=True,
        null=True,
        verbose_name='Condiciones médicas'
    )
    
    medications = models.TextField(
        blank=True,
        null=True,
        verbose_name='Medicamentos actuales'
    )
    
    # Contacto de emergencia
    emergency_contact_name = models.CharField(
        max_length=100,
        verbose_name='Nombre del contacto de emergencia',
        null=True,
        blank=True
    )
    
    emergency_contact_phone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        verbose_name='Teléfono del contacto de emergencia',
        null=True,
        blank=True
    )
    
    emergency_contact_relationship = models.CharField(
        max_length=50,
        verbose_name='Relación con el contacto de emergencia',
        null=True,
        blank=True
    )
    
    # Metadatos
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de actualización'
    )
    
    class Meta:
        app_label = 'patients'
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['emergency_contact_phone']),
            models.Index(fields=['emergency_contact_name']),
            models.Index(fields=['address']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"{self.user.get_full_name()} - Paciente"
    
    @property
    def full_name(self):
        """Retorna el nombre completo del paciente"""
        return self.user.get_full_name()
    
    @property
    def age(self):
        """Calcula la edad del paciente basada en su fecha de nacimiento"""
        if not self.date_of_birth:
            return None
        
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    def get_medical_summary(self):
        """Retorna un resumen médico del paciente"""
        summary = {
            'blood_type': self.blood_type or 'No especificado',
            'allergies': self.allergies or 'Ninguna conocida',
            'medical_conditions': self.medical_conditions or 'Ninguna conocida',
            'medications': self.medications or 'Ninguna'
        }
        return summary
    
    def set_status(self, new_status):
        """Establece el estado del paciente."""
        if new_status in dict(self.STATUS_CHOICES):
            self.status = new_status
            
            # Desactivar/activar usuario según el estado
            if new_status == 'disabled':
                # Si está inhabilitado, desactivar la cuenta del usuario
                self.user.is_active = False
                self.user.save(update_fields=['is_active'])
            elif new_status == 'active':
                # Si está activo, activar la cuenta del usuario
                self.user.is_active = True
                self.user.save(update_fields=['is_active'])
            # Para 'inactive', mantener el usuario activo pero el paciente no disponible
            
            self.save(update_fields=['status', 'updated_at'])
            return True
        return False
    
    def disable_patient(self):
        """Inhabilita al paciente."""
        return self.set_status('disabled')
    
    def activate_patient(self):
        """Activa al paciente."""
        return self.set_status('active')
    
    def deactivate_patient(self):
        """Desactiva temporalmente al paciente."""
        return self.set_status('inactive')
    
    @property
    def is_active(self):
        """Verifica si el paciente está activo."""
        return self.status == 'active'
    
    @property
    def is_disabled(self):
        """Verifica si el paciente está inhabilitado."""
        return self.status == 'disabled'
    
    @property
    def status_display(self):
        """Retorna el texto legible del estado."""
        return dict(self.STATUS_CHOICES).get(self.status, 'Desconocido')
    
    @property
    def can_access_system(self):
        """Verifica si el paciente puede acceder al sistema."""
        return self.status != 'disabled' and self.user.is_active
    
    @property
    def status_color(self):
        """Retorna el color asociado al estado para el frontend."""
        if self.status == 'disabled':
            return '#ef4444'  # Rojo - Inhabilitado
        elif self.status == 'inactive':
            return '#f59e0b'  # Amarillo - Inactivo
        elif self.status == 'active':
            return '#10b981'  # Verde - Activo
        else:
            return '#6b7280'  # Gris por defecto
