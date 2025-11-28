from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Patient
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_patient_profile(sender, instance, created, **kwargs):
    """
    Signal para crear automáticamente un perfil de paciente
    cuando se registra un nuevo usuario con rol 'client'.
    
    Args:
        sender: El modelo que envió la señal (User)
        instance: La instancia del usuario que se guardó
        created: Boolean que indica si es una nueva instancia
        **kwargs: Argumentos adicionales
    """
    if created and instance.role == 'client':
        try:
            # Verificar que no exista ya un perfil de paciente
            if not hasattr(instance, 'patient_profile'):
                # Usar fecha de nacimiento del usuario o una fecha por defecto
                from datetime import date
                birth_date = instance.date_of_birth if instance.date_of_birth else date(1990, 1, 1)
                
                # Crear perfil con datos básicos del usuario si están disponibles
                patient_data = {
                    'user': instance,
                    'date_of_birth': birth_date,
                    'gender': 'O',  # Valor por defecto "Otro"
                    'phone_number': instance.phone if instance.phone else '+1234567890',
                    'address': instance.address if instance.address else 'Dirección por completar',
                    'emergency_contact_name': 'Por definir',
                    'emergency_contact_phone': '+1234567890',
                    'emergency_contact_relationship': 'Por definir',
                    'allergies': '',
                    'medical_conditions': '',
                    'medications': ''
                }
                
                Patient.objects.create(**patient_data)
                logger.info(f"✅ Perfil de paciente creado automáticamente para: {instance.username} (ID: {instance.id})")
                
        except Exception as e:
            logger.error(f"❌ Error al crear perfil de paciente para {instance.username}: {str(e)}")


@receiver(post_save, sender=User)
def update_patient_profile(sender, instance, created, **kwargs):
    """
    Signal para actualizar información del perfil de paciente
    cuando se actualiza la información del usuario.
    
    Args:
        sender: El modelo que envió la señal (User)
        instance: La instancia del usuario que se guardó
        created: Boolean que indica si es una nueva instancia
        **kwargs: Argumentos adicionales
    """
    if not created and instance.role == 'client':
        try:
            # Verificar si existe el perfil de paciente y tiene ID (ya está guardado)
            if hasattr(instance, 'patient_profile'):
                patient = instance.patient_profile
                
                # Solo actualizar si el perfil ya tiene ID (está guardado en BD)
                if patient.pk:
                    updated_fields = []
                    
                    # Sincronizar campos relevantes del usuario con el perfil de paciente
                    if instance.phone and patient.phone_number != instance.phone:
                        patient.phone_number = instance.phone
                        updated_fields.append('phone_number')
                    
                    if instance.address and patient.address != instance.address:
                        patient.address = instance.address
                        updated_fields.append('address')
                    
                    if instance.date_of_birth and patient.date_of_birth != instance.date_of_birth:
                        patient.date_of_birth = instance.date_of_birth
                        updated_fields.append('date_of_birth')
                    
                    # Guardar solo si hay cambios
                    if updated_fields:
                        patient.save(update_fields=updated_fields)
                    logger.info(f"🔄 Perfil de paciente actualizado para {instance.username}. Campos: {', '.join(updated_fields)}")
                    
        except Exception as e:
            logger.error(f"❌ Error al actualizar perfil de paciente para {instance.username}: {str(e)}")