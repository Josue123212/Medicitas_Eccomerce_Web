"""
Signals para la app users.
Maneja la creación automática de perfiles según el rol del usuario.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import SecretaryProfile
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_secretary_profile(sender, instance, created, **kwargs):
    """
    Signal para crear automáticamente un SecretaryProfile cuando se crea un usuario con rol 'secretary'.
    """
    if created and instance.role == 'secretary':
        try:
            # Generar employee_id único basado en el ID del usuario
            employee_id = f"SEC{instance.id:04d}"
            
            SecretaryProfile.objects.create(
                user=instance,
                employee_id=employee_id,
                department='Administración',  # Departamento por defecto
                shift_start='08:00',  # Turno por defecto 8:00 AM
                shift_end='17:00',    # Turno por defecto 5:00 PM
                can_manage_appointments=True,
                can_manage_patients=True,
                can_view_reports=False,  # Por defecto no puede ver reportes
                hire_date=None  # Se puede establecer después
            )
            
            logger.info(f"✅ SecretaryProfile creado para usuario: {instance.username} (ID: {instance.id})")
            
        except Exception as e:
            logger.error(f"❌ Error creando SecretaryProfile para usuario {instance.username}: {str(e)}")


@receiver(post_save, sender=User)
def update_secretary_profile(sender, instance, created, **kwargs):
    """
    Signal para actualizar SecretaryProfile cuando se actualiza un usuario.
    """
    if not created and instance.role == 'secretary':
        try:
            # Verificar si existe el perfil, si no, crearlo
            if not hasattr(instance, 'secretary_profile'):
                # Generar employee_id único basado en el ID del usuario
                employee_id = f"SEC{instance.id:04d}"
                
                SecretaryProfile.objects.create(
                    user=instance,
                    employee_id=employee_id,
                    department='Administración',
                    shift_start='08:00',
                    shift_end='17:00',
                    can_manage_appointments=True,
                    can_manage_patients=True
                )
                
                logger.info(f"✅ SecretaryProfile creado (actualización) para usuario: {instance.username}")
            
        except Exception as e:
            logger.error(f"❌ Error actualizando SecretaryProfile para usuario {instance.username}: {str(e)}")


@receiver(post_save, sender=User)
def handle_role_change_to_secretary(sender, instance, created, **kwargs):
    """
    Signal para manejar cambios de rol a 'secretary'.
    """
    if not created:
        try:
            # Verificar si el usuario cambió a rol secretary y no tiene perfil
            if instance.role == 'secretary' and not hasattr(instance, 'secretary_profile'):
                # Generar employee_id único basado en el ID del usuario
                employee_id = f"SEC{instance.id:04d}"
                
                SecretaryProfile.objects.create(
                    user=instance,
                    employee_id=employee_id,
                    department='Administración',
                    shift_start='08:00',
                    shift_end='17:00',
                    can_manage_appointments=True,
                    can_manage_patients=True
                )
                
                logger.info(f"✅ SecretaryProfile creado por cambio de rol para usuario: {instance.username}")
                
        except Exception as e:
            logger.error(f"❌ Error manejando cambio de rol a secretary para usuario {instance.username}: {str(e)}")


@receiver(post_delete, sender=User)
def delete_secretary_profile(sender, instance, **kwargs):
    """
    Signal para limpiar cuando se elimina un usuario.
    El SecretaryProfile se elimina automáticamente por CASCADE, pero podemos hacer logging.
    """
    if instance.role == 'secretary':
        logger.info(f"🗑️ Usuario secretary eliminado: {instance.username} (ID: {instance.id})")