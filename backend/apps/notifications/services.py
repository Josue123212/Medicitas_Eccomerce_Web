"""
Servicios para el manejo de notificaciones.
Centraliza la lógica de creación y gestión de notificaciones.
"""

from django.contrib.auth import get_user_model
from .models import Notification
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Servicio para gestionar notificaciones del sistema.
    
    🎯 Objetivo: Centralizar la creación de notificaciones
    💡 Concepto: Factory pattern para diferentes tipos de notificaciones
    """
    
    @staticmethod
    def create_appointment_notification(user, title, message, notification_type='appointment'):
        """
        Crea una notificación relacionada con citas médicas.
        
        Args:
            user: Usuario que recibirá la notificación
            title: Título de la notificación
            message: Mensaje de la notificación
            notification_type: Tipo de notificación (default: 'appointment')
        
        Returns:
            Notification: La notificación creada
        """
        try:
            notification = Notification.objects.create(
                user=user,
                type=notification_type,
                title=title,
                message=message
            )
            logger.info(f"✅ Notificación creada: {title} para {user.email}")
            return notification
        except Exception as e:
            logger.error(f"❌ Error al crear notificación para {user.email}: {str(e)}")
            return None
    
    @staticmethod
    def create_system_notification(user, title, message):
        """
        Crea una notificación del sistema.
        
        Args:
            user: Usuario que recibirá la notificación
            title: Título de la notificación
            message: Mensaje de la notificación
        
        Returns:
            Notification: La notificación creada
        """
        return NotificationService.create_appointment_notification(
            user=user,
            title=title,
            message=message,
            notification_type='system'
        )
    
    @staticmethod
    def create_reminder_notification(user, title, message):
        """
        Crea una notificación de recordatorio.
        
        Args:
            user: Usuario que recibirá la notificación
            title: Título de la notificación
            message: Mensaje de la notificación
        
        Returns:
            Notification: La notificación creada
        """
        return NotificationService.create_appointment_notification(
            user=user,
            title=title,
            message=message,
            notification_type='reminder'
        )
    
    @staticmethod
    def create_result_notification(user, title, message):
        """
        Crea una notificación de resultados médicos.
        
        Args:
            user: Usuario que recibirá la notificación
            title: Título de la notificación
            message: Mensaje de la notificación
        
        Returns:
            Notification: La notificación creada
        """
        return NotificationService.create_appointment_notification(
            user=user,
            title=title,
            message=message,
            notification_type='result'
        )
    
    @staticmethod
    def create_bulk_notifications(users, title, message, notification_type='system'):
        """
        Crea notificaciones masivas para múltiples usuarios.
        
        Args:
            users: Lista de usuarios que recibirán la notificación
            title: Título de la notificación
            message: Mensaje de la notificación
            notification_type: Tipo de notificación (default: 'system')
        
        Returns:
            int: Número de notificaciones creadas exitosamente
        """
        created_count = 0
        for user in users:
            notification = NotificationService.create_appointment_notification(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type
            )
            if notification:
                created_count += 1
        
        logger.info(f"✅ Notificaciones masivas creadas: {created_count}/{len(users)}")
        return created_count
    
    @staticmethod
    def mark_all_as_read_for_user(user):
        """
        Marca todas las notificaciones de un usuario como leídas.
        
        Args:
            user: Usuario cuyas notificaciones se marcarán como leídas
        
        Returns:
            int: Número de notificaciones marcadas como leídas
        """
        try:
            updated_count = Notification.objects.filter(
                user=user,
                is_read=False
            ).update(is_read=True)
            
            logger.info(f"✅ {updated_count} notificaciones marcadas como leídas para {user.email}")
            return updated_count
        except Exception as e:
            logger.error(f"❌ Error al marcar notificaciones como leídas para {user.email}: {str(e)}")
            return 0
    
    @staticmethod
    def get_unread_count_for_user(user):
        """
        Obtiene el número de notificaciones no leídas para un usuario.
        
        Args:
            user: Usuario del cual obtener el conteo
        
        Returns:
            int: Número de notificaciones no leídas
        """
        try:
            count = Notification.objects.filter(
                user=user,
                is_read=False
            ).count()
            return count
        except Exception as e:
            logger.error(f"❌ Error al obtener conteo de notificaciones para {user.email}: {str(e)}")
            return 0
    
    # Métodos de conveniencia con nombres más cortos
    @staticmethod
    def get_unread_count(user):
        """Alias para get_unread_count_for_user"""
        return NotificationService.get_unread_count_for_user(user)
    
    @staticmethod
    def mark_all_as_read(user):
        """Alias para mark_all_as_read_for_user"""
        return NotificationService.mark_all_as_read_for_user(user)
    
    @staticmethod
    def get_notification_stats(user):
        """Obtiene estadísticas detalladas de notificaciones del usuario"""
        from django.db.models import Count, Q
        
        notifications = Notification.objects.filter(user=user)
        
        stats = {
            'total': notifications.count(),
            'unread': notifications.filter(is_read=False).count(),
            'read': notifications.filter(is_read=True).count(),
            'by_type': {}
        }
        
        # Estadísticas por tipo
        type_stats = notifications.values('type').annotate(
            count=Count('id'),
            unread_count=Count('id', filter=Q(is_read=False))
        )
        
        for stat in type_stats:
            stats['by_type'][stat['type']] = {
                'total': stat['count'],
                'unread': stat['unread_count'],
                'read': stat['count'] - stat['unread_count']
            }
        
        return stats


# Funciones de conveniencia para usar en signals
def notify_appointment_created(patient_user, doctor_user, appointment):
    """
    Notifica sobre la creación de una nueva cita.
    
    Args:
        patient_user: Usuario paciente
        doctor_user: Usuario doctor
        appointment: Instancia de la cita
    """
    # Notificación al paciente
    patient_message = (
        f"Su cita ha sido programada para el {appointment.date.strftime('%d/%m/%Y')} "
        f"a las {appointment.time.strftime('%H:%M')} con el Dr. {doctor_user.get_full_name()}. "
        f"Motivo: {appointment.reason}"
    )
    
    NotificationService.create_appointment_notification(
        user=patient_user,
        title='🎯 Cita Médica Programada',
        message=patient_message
    )
    
    # Notificación al doctor
    doctor_message = (
        f"Nueva cita programada para el {appointment.date.strftime('%d/%m/%Y')} "
        f"a las {appointment.time.strftime('%H:%M')} con {patient_user.get_full_name()}. "
        f"Motivo: {appointment.reason}"
    )
    
    NotificationService.create_appointment_notification(
        user=doctor_user,
        title='📅 Nueva Cita Programada',
        message=doctor_message
    )


def notify_appointment_status_change(patient_user, doctor_user, appointment, old_status, new_status):
    """
    Notifica sobre cambios en el estado de una cita.
    
    Args:
        patient_user: Usuario paciente
        doctor_user: Usuario doctor
        appointment: Instancia de la cita
        old_status: Estado anterior
        new_status: Nuevo estado
    """
    if new_status == 'cancelled':
        # Notificación de cancelación
        cancel_message_patient = (
            f"Su cita del {appointment.date.strftime('%d/%m/%Y')} "
            f"a las {appointment.time.strftime('%H:%M')} con el Dr. {doctor_user.get_full_name()} "
            f"ha sido cancelada."
        )
        
        NotificationService.create_appointment_notification(
            user=patient_user,
            title='❌ Cita Cancelada',
            message=cancel_message_patient
        )
        
        cancel_message_doctor = (
            f"La cita del {appointment.date.strftime('%d/%m/%Y')} "
            f"a las {appointment.time.strftime('%H:%M')} con {patient_user.get_full_name()} "
            f"ha sido cancelada."
        )
        
        NotificationService.create_appointment_notification(
            user=doctor_user,
            title='❌ Cita Cancelada',
            message=cancel_message_doctor
        )
    
    elif new_status == 'confirmed':
        # Notificación de confirmación
        confirmed_message_patient = (
            f"Su cita del {appointment.date.strftime('%d/%m/%Y')} "
            f"a las {appointment.time.strftime('%H:%M')} con el Dr. {doctor_user.get_full_name()} "
            f"ha sido confirmada. ¡No olvide asistir!"
        )
        
        NotificationService.create_appointment_notification(
            user=patient_user,
            title='✅ Cita Confirmada',
            message=confirmed_message_patient
        )
        
        confirmed_message_doctor = (
            f"La cita del {appointment.date.strftime('%d/%m/%Y')} "
            f"a las {appointment.time.strftime('%H:%M')} con {patient_user.get_full_name()} "
            f"ha sido confirmada."
        )
        
        NotificationService.create_appointment_notification(
            user=doctor_user,
            title='✅ Cita Confirmada',
            message=confirmed_message_doctor
        )
    
    elif new_status == 'completed':
        # Notificación de cita completada
        completed_message = (
            f"Su cita del {appointment.date.strftime('%d/%m/%Y')} "
            f"a las {appointment.time.strftime('%H:%M')} con el Dr. {doctor_user.get_full_name()} "
            f"ha sido completada. Gracias por su visita."
        )
        
        NotificationService.create_appointment_notification(
            user=patient_user,
            title='✅ Cita Completada',
            message=completed_message
        )


def notify_appointment_datetime_change(patient_user, doctor_user, appointment, old_date, old_time):
    """
    Notifica sobre cambios en la fecha/hora de una cita.
    
    Args:
        patient_user: Usuario paciente
        doctor_user: Usuario doctor
        appointment: Instancia de la cita
        old_date: Fecha anterior
        old_time: Hora anterior
    """
    # Notificación al paciente sobre reprogramación
    reschedule_message_patient = (
        f"Su cita ha sido reprogramada. "
        f"Nueva fecha: {appointment.date.strftime('%d/%m/%Y')} "
        f"a las {appointment.time.strftime('%H:%M')} con el Dr. {doctor_user.get_full_name()}. "
        f"Fecha anterior: {old_date.strftime('%d/%m/%Y')} a las {old_time.strftime('%H:%M')}"
    )
    
    NotificationService.create_appointment_notification(
        user=patient_user,
        title='📅 Cita Reprogramada',
        message=reschedule_message_patient
    )
    
    # Notificación al doctor sobre reprogramación
    reschedule_message_doctor = (
        f"La cita con {patient_user.get_full_name()} ha sido reprogramada. "
        f"Nueva fecha: {appointment.date.strftime('%d/%m/%Y')} "
        f"a las {appointment.time.strftime('%H:%M')}. "
        f"Fecha anterior: {old_date.strftime('%d/%m/%Y')} a las {old_time.strftime('%H:%M')}"
    )
    
    NotificationService.create_appointment_notification(
        user=doctor_user,
        title='📅 Cita Reprogramada',
        message=reschedule_message_doctor
    )