#!/usr/bin/env python
"""
Script para verificar si existe un usuario con correo específico en la base de datos
"""
import os
import sys

# Agregar el directorio del proyecto al path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_dir)

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from apps.users.models import User
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.users.models import Secretary

def check_user_by_email(email):
    """
    Verifica si existe un usuario con el email especificado
    """
    print(f"🔍 Verificando usuario con email: {email}")
    print("=" * 60)
    
    try:
        # Buscar en la tabla User
        user = User.objects.filter(email=email).first()
        
        if user:
            print(f"✅ Usuario encontrado:")
            print(f"   - ID: {user.id}")
            print(f"   - Email: {user.email}")
            print(f"   - Nombre: {user.first_name} {user.last_name}")
            print(f"   - Username: {user.username}")
            print(f"   - Rol: {user.role}")
            print(f"   - Activo: {user.is_active}")
            print(f"   - Staff: {user.is_staff}")
            print(f"   - Superuser: {user.is_superuser}")
            print(f"   - Fecha creación: {user.date_joined}")
            print(f"   - Último login: {user.last_login}")
            
            # Verificar perfiles relacionados según el rol
            print(f"\n📋 Verificando perfiles relacionados:")
            
            if user.role == 'patient':
                try:
                    patient = Patient.objects.get(user=user)
                    print(f"   ✅ Perfil de Paciente encontrado:")
                    print(f"      - ID: {patient.id}")
                    print(f"      - Teléfono: {patient.phone_number}")
                    print(f"      - Fecha nacimiento: {patient.date_of_birth}")
                    print(f"      - Género: {patient.gender}")
                    print(f"      - Estado: {patient.status}")
                except Patient.DoesNotExist:
                    print(f"   ❌ Perfil de Paciente NO encontrado")
                    
            elif user.role == 'doctor':
                try:
                    doctor = Doctor.objects.get(user=user)
                    print(f"   ✅ Perfil de Doctor encontrado:")
                    print(f"      - ID: {doctor.id}")
                    print(f"      - Especialización: {doctor.specialization}")
                    print(f"      - Teléfono: {doctor.phone_number}")
                    print(f"      - Estado: {doctor.status}")
                    print(f"      - Licencia médica: {doctor.medical_license}")
                except Doctor.DoesNotExist:
                    print(f"   ❌ Perfil de Doctor NO encontrado")
                    
            elif user.role == 'secretary':
                try:
                    secretary = Secretary.objects.get(user=user)
                    print(f"   ✅ Perfil de Secretaria encontrado:")
                    print(f"      - ID: {secretary.id}")
                    print(f"      - Teléfono: {secretary.phone_number}")
                    print(f"      - Departamento: {secretary.department}")
                except Secretary.DoesNotExist:
                    print(f"   ❌ Perfil de Secretaria NO encontrado")
            
            # Verificar citas si es paciente o doctor
            if user.role in ['patient', 'doctor']:
                from apps.appointments.models import Appointment
                
                if user.role == 'patient':
                    appointments = Appointment.objects.filter(patient__user=user)
                    print(f"\n📅 Citas como paciente: {appointments.count()}")
                    if appointments.exists():
                        for apt in appointments[:3]:  # Mostrar solo las primeras 3
                            print(f"   - Cita #{apt.id}: {apt.appointment_date} {apt.appointment_time} - {apt.status}")
                
                elif user.role == 'doctor':
                    appointments = Appointment.objects.filter(doctor__user=user)
                    print(f"\n📅 Citas como doctor: {appointments.count()}")
                    if appointments.exists():
                        for apt in appointments[:3]:  # Mostrar solo las primeras 3
                            print(f"   - Cita #{apt.id}: {apt.appointment_date} {apt.appointment_time} - {apt.status}")
            
            return True
            
        else:
            print(f"❌ No se encontró ningún usuario con el email: {email}")
            
            # Buscar emails similares
            print(f"\n🔍 Buscando emails similares...")
            similar_users = User.objects.filter(email__icontains=email.split('@')[0][:5])
            if similar_users.exists():
                print(f"   Usuarios con emails similares:")
                for user in similar_users[:5]:
                    print(f"   - {user.email} ({user.first_name} {user.last_name})")
            else:
                print(f"   No se encontraron emails similares")
            
            return False
            
    except Exception as e:
        print(f"❌ Error al verificar usuario: {str(e)}")
        return False

def main():
    """
    Función principal
    """
    email_to_check = "choquepumajosue@gmail.com"
    
    print("🏥 MEDICITAS - Verificación de Usuario")
    print("=" * 60)
    
    user_exists = check_user_by_email(email_to_check)
    
    print("\n" + "=" * 60)
    if user_exists:
        print("✅ RESULTADO: Usuario encontrado en la base de datos")
    else:
        print("❌ RESULTADO: Usuario NO encontrado en la base de datos")
    
    # Estadísticas generales
    print(f"\n📊 Estadísticas generales de usuarios:")
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    patients = User.objects.filter(role='patient').count()
    doctors = User.objects.filter(role='doctor').count()
    secretaries = User.objects.filter(role='secretary').count()
    admins = User.objects.filter(role='admin').count()
    
    print(f"   - Total usuarios: {total_users}")
    print(f"   - Usuarios activos: {active_users}")
    print(f"   - Pacientes: {patients}")
    print(f"   - Doctores: {doctors}")
    print(f"   - Secretarias: {secretaries}")
    print(f"   - Administradores: {admins}")

if __name__ == "__main__":
    main()