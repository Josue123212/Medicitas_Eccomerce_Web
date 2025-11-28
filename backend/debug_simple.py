import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from apps.appointments.models import Appointment

User = get_user_model()

print("=== DEBUG APPOINTMENT 42 ===")

# Buscar usuario josue
try:
    user = User.objects.get(email='josue@gmail.com')
    print(f"Usuario encontrado: {user.email} (ID: {user.id})")
    print(f"Rol: {user.role}")
    print(f"Es staff: {user.is_staff}")
    print(f"Tiene patient_profile: {hasattr(user, 'patient_profile')}")
    if hasattr(user, 'patient_profile'):
        print(f"Patient profile ID: {user.patient_profile.id}")
    print(f"Tiene doctor_profile: {hasattr(user, 'doctor_profile')}")
    if hasattr(user, 'doctor_profile'):
        print(f"Doctor profile ID: {user.doctor_profile.id}")
except User.DoesNotExist:
    print("Usuario josue@gmail.com no encontrado")
    sys.exit(1)

print("\n=== APPOINTMENT 42 ===")

# Buscar cita 42
try:
    appointment = Appointment.objects.get(id=42)
    print(f"Cita ID: {appointment.id}")
    print(f"Paciente: {appointment.patient.user.email} (Patient ID: {appointment.patient.id})")
    print(f"Doctor: {appointment.doctor.user.email} (Doctor ID: {appointment.doctor.id})")
    print(f"Estado: {appointment.status}")
    print(f"Fecha: {appointment.date}")
    print(f"Hora: {appointment.time}")
except Appointment.DoesNotExist:
    print("Cita 42 no encontrada")
    sys.exit(1)

print("\n=== VERIFICACIÓN DE PERMISOS ===")

# Verificar si el usuario puede modificar la cita
can_modify = False

# Staff/admin puede modificar cualquier cita
if user.is_staff:
    can_modify = True
    print("✓ Usuario es staff - PUEDE modificar")
else:
    print("✗ Usuario NO es staff")

# El paciente puede modificar sus propias citas
if hasattr(user, 'patient_profile') and appointment.patient == user.patient_profile:
    can_modify = True
    print("✓ Usuario es el paciente de la cita - PUEDE modificar")
else:
    print("✗ Usuario NO es el paciente de la cita")
    if hasattr(user, 'patient_profile'):
        print(f"  - User patient ID: {user.patient_profile.id}")
        print(f"  - Appointment patient ID: {appointment.patient.id}")

# El doctor puede modificar sus propias citas
if hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile:
    can_modify = True
    print("✓ Usuario es el doctor de la cita - PUEDE modificar")
else:
    print("✗ Usuario NO es el doctor de la cita")

print(f"\nRESULTADO FINAL: {'PUEDE' if can_modify else 'NO PUEDE'} modificar la cita")