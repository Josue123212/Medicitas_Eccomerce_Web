from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, time


class Appointment(models.Model):
    """
    Modelo para gestionar las citas médicas entre pacientes y doctores.
    
    Este modelo maneja el sistema de citas con validaciones de negocio
    para evitar conflictos de horarios y garantizar la integridad de los datos.
    """
    
    STATUS_CHOICES = [
        ('scheduled', 'Programada'),
        ('confirmed', 'Confirmada'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('no_show', 'No se presentó'),
    ]
    
    # Relaciones
    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Paciente'
    )
    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Doctor'
    )
    
    # Información de la cita
    date = models.DateField(
        verbose_name='Fecha de la cita',
        help_text='Fecha en que se realizará la cita'
    )
    time = models.TimeField(
        verbose_name='Hora de la cita',
        help_text='Hora en que se realizará la cita'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled',
        verbose_name='Estado de la cita'
    )
    reason = models.TextField(
        verbose_name='Motivo de la consulta',
        help_text='Descripción del motivo de la cita'
    )
    notes = models.TextField(
        blank=True,
        verbose_name='Notas adicionales',
        help_text='Notas o comentarios adicionales sobre la cita'
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
    
    class Meta:
        app_label = 'appointments'
        verbose_name = 'Cita'
        verbose_name_plural = 'Citas'
        unique_together = ['doctor', 'date', 'time']
        ordering = ['date', 'time']
        indexes = [
            models.Index(fields=['date', 'time']),
            models.Index(fields=['doctor', 'date']),
            models.Index(fields=['patient', 'date']),
            models.Index(fields=['status']),
            models.Index(fields=['reason']),
            models.Index(fields=['notes']),
        ]
    
    def __str__(self):
        return f"Cita: {self.patient.get_full_name()} con Dr. {self.doctor.get_full_name()} - {self.date} {self.time}"
    
    def clean(self):
        """
        Validaciones personalizadas del modelo.
        """
        super().clean()
        
        # Validar que la fecha no sea en el pasado
        if self.date and self.date < timezone.now().date():
            raise ValidationError({
                'date': 'No se pueden programar citas en fechas pasadas.'
            })
        
        # Validar que la hora esté en horario laboral (8:00 AM - 6:00 PM)
        if self.time:
            start_time = time(8, 0)  # 8:00 AM
            end_time = time(18, 0)   # 6:00 PM
            
            if not (start_time <= self.time <= end_time):
                raise ValidationError({
                    'time': 'Las citas solo pueden programarse entre 8:00 AM y 6:00 PM.'
                })
        
        # Validar que el doctor esté disponible
        if hasattr(self, 'doctor') and self.doctor and not self.doctor.is_available:
            raise ValidationError({
                'doctor': 'El doctor seleccionado no está disponible para citas.'
            })
    
    def save(self, *args, **kwargs):
        """
        Sobrescribir el método save para ejecutar validaciones.
        """
        self.full_clean()
        super().save(*args, **kwargs)
    
    def get_status_display_color(self):
        """
        Retorna un color asociado al estado de la cita para uso en interfaces.
        """
        colors = {
            'scheduled': 'blue',
            'confirmed': 'green',
            'completed': 'gray',
            'cancelled': 'red',
            'no_show': 'orange',
        }
        return colors.get(self.status, 'gray')
    
    def can_be_cancelled(self):
        """
        Determina si la cita puede ser cancelada.
        Solo se pueden cancelar citas programadas o confirmadas.
        """
        return self.status in ['scheduled', 'confirmed']
    
    def can_be_rescheduled(self):
        """
        Determina si la cita puede ser reprogramada.
        Solo se pueden reprogramar citas programadas.
        """
        return self.status == 'scheduled'
    
    def can_be_confirmed(self):
        """
        Determina si la cita puede ser confirmada.
        Solo se pueden confirmar citas programadas.
        """
        return self.status == 'scheduled'
    
    def can_be_completed(self):
        """
        Determina si la cita puede ser marcada como completada.
        Solo se pueden completar citas confirmadas.
        """
        return self.status == 'confirmed'
    
    def confirm(self):
        """
        Confirma la cita.
        
        Raises:
            ValidationError: Si la cita no puede ser confirmada
        """
        if not self.can_be_confirmed():
            raise ValidationError(
                f'No se puede confirmar una cita {self.get_status_display().lower()}'
            )
        
        self.status = 'confirmed'
        self.save(update_fields=['status', 'updated_at'])
    
    def complete(self, notes=None):
        """
        Marca la cita como completada.
        
        Args:
            notes (str, optional): Notas adicionales sobre la cita completada
            
        Raises:
            ValidationError: Si la cita no puede ser completada
        """
        if not self.can_be_completed():
            raise ValidationError(
                f'No se puede completar una cita {self.get_status_display().lower()}'
            )
        
        self.status = 'completed'
        if notes:
            # Agregar las notas de completación
            completion_note = f"COMPLETADA: {notes}"
            if self.notes:
                self.notes = f"{self.notes}\n\n{completion_note}"
            else:
                self.notes = completion_note
        self.save(update_fields=['status', 'notes', 'updated_at'])
    
    def cancel(self, reason=None):
        """
        Cancela la cita.
        
        Args:
            reason (str, optional): Razón de la cancelación
            
        Raises:
            ValidationError: Si la cita no puede ser cancelada
        """
        if not self.can_be_cancelled():
            raise ValidationError(
                f'No se puede cancelar una cita {self.get_status_display().lower()}'
            )
        
        self.status = 'cancelled'
        if reason:
            # Agregar la razón de cancelación a las notas
            cancellation_note = f"CANCELADA: {reason}"
            if self.notes:
                self.notes = f"{self.notes}\n\n{cancellation_note}"
            else:
                self.notes = cancellation_note
        self.save(update_fields=['status', 'notes', 'updated_at'])
    
    @property
    def is_today(self):
        """
        Verifica si la cita es para el día de hoy.
        """
        return self.date == timezone.now().date()
    
    @property
    def is_past(self):
        """
        Verifica si la cita ya pasó.
        """
        now = timezone.now()
        appointment_datetime = timezone.make_aware(
            datetime.combine(self.date, self.time)
        )
        return appointment_datetime < now
