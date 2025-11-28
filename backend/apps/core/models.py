from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AuditLog(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Usuario",
        help_text="Usuario que realizó la acción"
    )
    action = models.CharField(
        max_length=100,
        verbose_name="Acción",
        help_text="Tipo de acción realizada (create, update, delete, view)"
    )
    resource = models.CharField(
        max_length=100,
        verbose_name="Recurso",
        help_text="Tipo de recurso afectado (appointments, patients, users, etc.)"
    )
    resource_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="ID del Recurso",
        help_text="ID específico del recurso afectado"
    )
    method = models.CharField(
        max_length=10,
        verbose_name="Método HTTP",
        help_text="Método HTTP utilizado (GET, POST, PUT, DELETE)"
    )
    path = models.CharField(
        max_length=500,
        verbose_name="Ruta",
        help_text="Ruta completa de la petición"
    )
    ip_address = models.GenericIPAddressField(
        verbose_name="Dirección IP",
        help_text="Dirección IP desde donde se realizó la petición"
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent",
        help_text="Información del navegador/cliente"
    )
    request_data = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Datos de la Petición",
        help_text="Datos enviados en la petición (sin información sensible)"
    )
    response_status = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Estado de la Respuesta",
        help_text="Código de estado HTTP de la respuesta"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha y Hora",
        help_text="Momento en que se realizó la acción"
    )

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        verbose_name = "Log de Auditoría"
        verbose_name_plural = "Logs de Auditoría"
        indexes = [
            models.Index(fields=['user', 'timestamp'], name='audit_user_time_idx'),
            models.Index(fields=['action', 'timestamp'], name='audit_action_time_idx'),
            models.Index(fields=['resource', 'timestamp'], name='audit_resource_time_idx'),
            models.Index(fields=['ip_address', 'timestamp'], name='audit_ip_time_idx'),
        ]

    def __str__(self):
        user_info = self.user.username if self.user else "Usuario Anónimo"
        return f"{user_info} - {self.action} {self.resource} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"

