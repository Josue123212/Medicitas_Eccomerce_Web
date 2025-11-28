from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Doctor

User = get_user_model()


# TEMPORALMENTE DESHABILITADO - Ahora se maneja desde el formulario dinámico
# @receiver(post_save, sender=User)
# def create_doctor_profile(sender, instance, created, **kwargs):
#     """
#     Signal para crear automáticamente un perfil de doctor
#     cuando se crea un usuario con rol 'doctor'.
#     """
#     if created and instance.role == 'doctor':
#         Doctor.objects.create(
#             user=instance,
#             medical_license=f"LIC-{instance.id:06d}",  # Licencia temporal
#             specialization="Medicina General",  # Especialización por defecto
#             years_experience=0,
#             consultation_fee=50.00,  # Tarifa por defecto
#             bio="",
#             is_available=True,
#             work_days=['monday', 'tuesday', 'wednesday', 'thursday', 'friday']  # Días laborales por defecto
#         )


# TEMPORALMENTE DESHABILITADO - Ahora se maneja desde el formulario dinámico
# @receiver(post_save, sender=User)
# def update_doctor_profile(sender, instance, created, **kwargs):
#     """
#     Signal para actualizar el perfil de doctor cuando se actualiza el usuario.
#     """
#     if not created and instance.role == 'doctor':
#         try:
#             # Si el usuario ya tiene un perfil de doctor, no hacer nada
#             instance.doctor
#         except Doctor.DoesNotExist:
#             # Si no tiene perfil de doctor pero ahora es doctor, crear uno
#             Doctor.objects.create(
#                 user=instance,
#                 medical_license=f"LIC-{instance.id:06d}",
#                 specialization="Medicina General",
#                 years_experience=0,
#                 consultation_fee=50.00,
#                 bio="",
#                 is_available=True,
#                 work_days=['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
#             )