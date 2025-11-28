from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Appointment
from apps.notifications.models import Notification
from apps.notifications.services import (
    NotificationService,
    notify_appointment_created,
    notify_appointment_status_change,
    notify_appointment_datetime_change
)
import logging
from datetime import datetime, timedelta

User = get_user_model()
logger = logging.getLogger(__name__)


@receiver(post_save, sender=Appointment)
def appointment_creation_notification(sender, instance, created, **kwargs):
    """
    Envía notificaciones cuando se crea una nueva cita.
    
    🎯 Objetivo: Notificar tanto al paciente como al doctor sobre la nueva cita
    💡 Concepto: Signal automático que se dispara al crear una cita
    """
    if created:
        logger.info(f"📅 Nueva cita creada: {instance.id}")
        
        # Usar el servicio de notificaciones
        notify_appointment_created(
            patient_user=instance.patient.user,
            doctor_user=instance.doctor.user,
            appointment=instance
        )
        
        # TODO: Aquí se podría agregar el envío de emails o SMS
        # cuando se configure Celery para tareas asíncronas


@receiver(pre_save, sender=Appointment)
def appointment_status_change_notification(sender, instance, **kwargs):
    """
    Detecta cambios en el estado de la cita y envía notificaciones.
    
    🎯 Objetivo: Notificar cambios de estado (cancelación, confirmación, etc.)
    💡 Concepto: Pre-save signal para comparar estados antes y después
    """
    if instance.pk:  # Solo si la instancia ya existe (no es nueva)
        try:
            # Obtener el estado anterior
            old_instance = Appointment.objects.get(pk=instance.pk)
            old_status = old_instance.status
            new_status = instance.status
            
            # Solo procesar si el estado cambió
            if old_status != new_status:
                logger.info(f"🔄 Cambio de estado en cita {instance.id}: {old_status} → {new_status}")
                
                # Usar el servicio de notificaciones
                notify_appointment_status_change(
                    patient_user=instance.patient.user,
                    doctor_user=instance.doctor.user,
                    appointment=instance,
                    old_status=old_status,
                    new_status=new_status
                )
                
        except Appointment.DoesNotExist:
            logger.warning(f"⚠️ No se pudo encontrar la cita anterior para {instance.id}")
        except Exception as e:
            logger.error(f"❌ Error al procesar cambio de estado para cita {instance.id}: {str(e)}")


@receiver(pre_save, sender=Appointment)
def appointment_datetime_change_notification(sender, instance, **kwargs):
    """
    Notifica cambios en la fecha/hora de la cita.
    
    🎯 Objetivo: Notificar reprogramaciones de citas
    💡 Concepto: Pre-save signal para detectar cambios de fecha/hora
    """
    if instance.pk:  # Solo para citas existentes (actualizaciones)
        try:
            # Obtener la fecha anterior
            old_instance = Appointment.objects.get(pk=instance.pk)
            
            # Verificar si cambió la fecha/hora
            if old_instance.date != instance.date or old_instance.time != instance.time:
                logger.info(
                    f"📅 Cambio de fecha/hora en cita {instance.id}: "
                    f"{old_instance.date} {old_instance.time} -> {instance.date} {instance.time}"
                )
                
                # Usar el servicio de notificaciones
                notify_appointment_datetime_change(
                    patient_user=instance.patient.user,
                    doctor_user=instance.doctor.user,
                    appointment=instance,
                    old_date=old_instance.date,
                    old_time=old_instance.time
                )
                
        except Appointment.DoesNotExist:
            logger.warning(f"⚠️ No se pudo encontrar la cita anterior para {instance.id}")
        except Exception as e:
            logger.error(f"❌ Error al procesar cambio de fecha/hora para la cita {instance.id}: {str(e)}")


@receiver(post_save, sender=Appointment)
def appointment_reminder_scheduler(sender, instance, created, **kwargs):
    """
    Signal que programa recordatorios automáticos para las citas.
    Se ejecuta cuando se crea o actualiza una cita.
    
    Args:
        sender: El modelo que envió la señal (Appointment)
        instance: La instancia de la cita que se guardó
        created: Boolean que indica si es una nueva instancia
        **kwargs: Argumentos adicionales
    """
    # Solo programar recordatorios para citas futuras y en estados apropiados
    if instance.status in ['scheduled', 'confirmed']:
        try:
            appointment_datetime = datetime.combine(instance.date, instance.time)
            now = datetime.now()
            
            # Solo programar si la cita es en el futuro
            if appointment_datetime > now:
                # Calcular cuándo enviar recordatorios
                reminder_24h = appointment_datetime - timedelta(hours=24)
                reminder_2h = appointment_datetime - timedelta(hours=2)
                
                logger.info(
                    f"⏰ Recordatorios programados para cita ID: {instance.id} - "
                    f"24h antes: {reminder_24h.strftime('%d/%m/%Y %H:%M')}, "
                    f"2h antes: {reminder_2h.strftime('%d/%m/%Y %H:%M')}"
                )
                
                # TODO: Implementar programación real de recordatorios con Celery Beat
                # schedule_appointment_reminder.apply_async(
                #     args=[instance.id, '24h'],
                #     eta=reminder_24h
                # )
                # schedule_appointment_reminder.apply_async(
                #     args=[instance.id, '2h'],
                #     eta=reminder_2h
                # )
                
        except Exception as e:
            logger.error(f"❌ Error al programar recordatorios para cita {instance.id}: {str(e)}")


@receiver(post_save, sender=Appointment)
def appointment_audit_log(sender, instance, created, **kwargs):
    """
    Signal para crear logs de auditoría de todas las operaciones con citas.
    Registra información detallada para trazabilidad.
    
    Args:
        sender: El modelo que envió la señal (Appointment)
        instance: La instancia de la cita que se guardó
        created: Boolean que indica si es una nueva instancia
        **kwargs: Argumentos adicionales
    """
    try:
        action = "CREADA" if created else "ACTUALIZADA"
        
        # Log detallado para auditoría
        audit_info = {
            'action': action,
            'appointment_id': instance.id,
            'patient_id': instance.patient.id,
            'patient_name': instance.patient.user.get_full_name(),
            'patient_email': instance.patient.user.email,
            'doctor_id': instance.doctor.id,
            'doctor_name': instance.doctor.user.get_full_name(),
            'doctor_email': instance.doctor.user.email,
            'date': instance.date.strftime('%Y-%m-%d'),
            'time': instance.time.strftime('%H:%M'),
            'status': instance.status,
            'reason': instance.reason[:100] + '...' if len(instance.reason) > 100 else instance.reason,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        logger.info(f"📋 [AUDITORÍA] Cita {action}: {audit_info}")
        
        # TODO: Implementar guardado en base de datos de auditoría
        # AuditLog.objects.create(
        #     model_name='Appointment',
        #     object_id=instance.id,
        #     action=action,
        #     details=audit_info,
        #     timestamp=datetime.now()
        # )
        
    except Exception as e:
        logger.error(f"❌ Error en log de auditoría para cita {instance.id}: {str(e)}")