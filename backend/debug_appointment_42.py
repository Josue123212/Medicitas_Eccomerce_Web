import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.appointments.models import Appointment

User = get_user_model()

def debug_appointment():
    print("=== DEBUGGING CITA 42 ===")
    
    try:
        appointment = Appointment.objects.get(id=42)
        print(f"Cita encontrada: ID {appointment.id}")
        print(f"Paciente: {appointment.patient.user.email} (ID: {appointment.patient.id})")
        print(f"Doctor: {appointment.doctor.user.email}")
        print(f"Estado: {appointment.status}")
        print(f"Fecha: {appointment.date}")
        
        josue = User.objects.get(email='josue@gmail.com')
        print(f"\nUsuario josue: ID {josue.id}, Rol: {josue.role}")
        
        if hasattr(josue, 'patient_profile'):
            patient_id = josue.patient_profile.id
            print(f"Perfil paciente ID: {patient_id}")
            is_owner = appointment.patient.id == patient_id
            print(f"Es propietario de cita 42: {is_owner}")
            
            if not is_owner:
                print(f"PROBLEMA: josue (paciente {patient_id}) NO es propietario de cita 42 (paciente {appointment.patient.id})")
        else:
            print("PROBLEMA: josue NO tiene perfil de paciente")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_appointment()