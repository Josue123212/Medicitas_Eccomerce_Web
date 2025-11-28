#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.users.models import User
from apps.patients.models import Patient

def debug_user_permissions():
    """Verificar si existe usuario con email específico"""
    email_to_check = 'choquepumajosue@gmail.com'
    print(f"🔍 VERIFICANDO USUARIO CON EMAIL: {email_to_check}")
    print("=" * 60)
    
    try:
        # Buscar usuario por email
        user = User.objects.get(email=email_to_check)
        print(f"✅ Usuario encontrado:")
        print(f"   - ID: {user.id}")
        print(f"   - Username: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Nombre: {user.first_name} {user.last_name}")
        print(f"   - Rol: {user.role}")
        print(f"   - Activo: {user.is_active}")
        print(f"   - Staff: {user.is_staff}")
        print(f"   - Superuser: {user.is_superuser}")
        print(f"   - Fecha creación: {user.date_joined}")
        print(f"   - Último login: {user.last_login}")
        
        # Verificar si tiene patient_profile
        print(f"\n📋 Verificando perfiles relacionados:")
        if hasattr(user, 'patient_profile'):
            patient_profile = user.patient_profile
            print(f"   ✅ Perfil de Paciente encontrado:")
            print(f"      - Patient ID: {patient_profile.id}")
            print(f"      - Nombre completo: {patient_profile.full_name}")
            print(f"      - Teléfono: {getattr(patient_profile, 'phone_number', 'N/A')}")
            print(f"      - Estado: {getattr(patient_profile, 'status', 'N/A')}")
        else:
            print(f"   ❌ No tiene patient_profile")
            
        # Verificar si tiene doctor_profile
        if hasattr(user, 'doctor_profile'):
            doctor_profile = user.doctor_profile
            print(f"   ✅ Perfil de Doctor encontrado:")
            print(f"      - Doctor ID: {doctor_profile.id}")
            print(f"      - Especialización: {getattr(doctor_profile, 'specialization', 'N/A')}")
        else:
            print(f"   ❌ No tiene doctor_profile")
            
        # Verificar si tiene secretary_profile
        if hasattr(user, 'secretary_profile'):
            secretary_profile = user.secretary_profile
            print(f"   ✅ Perfil de Secretaria encontrado:")
            print(f"      - Secretary ID: {secretary_profile.id}")
        else:
            print(f"   ❌ No tiene secretary_profile")
            
        # Verificar citas si es paciente
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            from apps.appointments.models import Appointment
            appointments = Appointment.objects.filter(patient=user.patient_profile)
            print(f"\n📅 Citas como paciente: {appointments.count()}")
            if appointments.exists():
                for apt in appointments[:3]:  # Mostrar solo las primeras 3
                    print(f"   - Cita #{apt.id}: {apt.appointment_date} {apt.appointment_time} - {apt.status}")
                    
    except User.DoesNotExist:
        print(f"❌ Usuario con email '{email_to_check}' NO encontrado")
        
        # Buscar emails similares
        print(f"\n🔍 Buscando emails similares...")
        similar_users = User.objects.filter(email__icontains='choque')
        if similar_users.exists():
            print(f"   Usuarios con emails similares:")
            for user in similar_users[:5]:
                print(f"   - {user.email} ({user.first_name} {user.last_name})")
        else:
            print(f"   No se encontraron emails similares")
    
    # Estadísticas generales
    print(f"\n📊 Estadísticas generales:")
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    patients = User.objects.filter(role='patient').count()
    doctors = User.objects.filter(role='doctor').count()
    
    print(f"   - Total usuarios: {total_users}")
    print(f"   - Usuarios activos: {active_users}")
    print(f"   - Pacientes: {patients}")
    print(f"   - Doctores: {doctors}")

if __name__ == '__main__':
    debug_user_permissions()