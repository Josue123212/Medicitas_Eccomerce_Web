#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.patients.models import Patient

def check_josue_patient():
    try:
        user = User.objects.get(email='josue@gmail.com')
        print(f'✅ Usuario encontrado: {user.id} - {user.email}')
        print(f'   Rol: {user.role}')
        print(f'   Nombre: {user.first_name} {user.last_name}')
        
        # Verificar si tiene patient_profile
        print(f'\n🔍 Verificando patient_profile...')
        print(f'   hasattr(user, "patient_profile"): {hasattr(user, "patient_profile")}')
        
        try:
            patient = user.patient_profile
            print(f'✅ Patient profile encontrado: {patient.id}')
            print(f'   Allergies: "{patient.allergies}"')
            print(f'   Medical conditions: "{patient.medical_conditions}"')
            print(f'   Emergency contact: "{patient.emergency_contact_name}"')
            print(f'   Phone: "{patient.emergency_contact_phone}"')
        except Patient.DoesNotExist:
            print(f'❌ No existe patient_profile para este usuario')
            
            # Verificar si hay algún Patient con este user_id
            patients = Patient.objects.filter(user=user)
            print(f'   Patients con user={user.id}: {patients.count()}')
            
            if patients.exists():
                for p in patients:
                    print(f'   - Patient {p.id}: {p.user.email}')
        except Exception as e:
            print(f'❌ Error accediendo al patient_profile: {e}')
            
        # Verificar todos los patients
        print(f'\n📋 Todos los patients en la base de datos:')
        all_patients = Patient.objects.all()
        for p in all_patients:
            print(f'   Patient {p.id}: user={p.user.id} ({p.user.email})')
            
    except User.DoesNotExist:
        print(f'❌ Usuario josue@gmail.com no encontrado')
    except Exception as e:
        print(f'❌ Error: {e}')

if __name__ == '__main__':
    check_josue_patient()