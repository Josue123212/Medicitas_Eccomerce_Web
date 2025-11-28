from django.db import models
from django.utils import timezone


class ReportCache(models.Model):
    """
    Modelo para cachear resultados de reportes complejos
    que requieren mucho procesamiento
    """
    report_type = models.CharField(max_length=50)
    parameters = models.JSONField(default=dict)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        verbose_name = 'Cache de Reporte'
        verbose_name_plural = 'Cache de Reportes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.report_type} - {self.created_at}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class SystemMetrics(models.Model):
    """
    Modelo para almacenar métricas del sistema calculadas diariamente
    """
    date = models.DateField(unique=True)
    total_appointments = models.PositiveIntegerField(default=0)
    total_patients = models.PositiveIntegerField(default=0)
    total_doctors = models.PositiveIntegerField(default=0)
    completed_appointments = models.PositiveIntegerField(default=0)
    cancelled_appointments = models.PositiveIntegerField(default=0)
    no_show_appointments = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Métrica del Sistema'
        verbose_name_plural = 'Métricas del Sistema'
        ordering = ['-date']
    
    def __str__(self):
        return f"Métricas del {self.date}"
    
    @property
    def cancellation_rate(self):
        if self.total_appointments == 0:
            return 0
        return (self.cancelled_appointments / self.total_appointments) * 100
    
    @property
    def completion_rate(self):
        if self.total_appointments == 0:
            return 0
        return (self.completed_appointments / self.total_appointments) * 100
