#!/usr/bin/env python
import os
import sys
import django
from datetime import time

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User, SecretaryProfile
from django.contrib.auth.hashers import make_password

def create_test_secretaries():
    """Crear secretarias de prueba para testing"""
    
    print("🏥 Creando secretarias de prueba...")
    
    # Datos de secretarias de prueba
    secretaries_data = [
        {
            'username': 'maria.garcia',
            'email': 'maria.garcia@hospital.com',
            'first_name': 'María',
            'last_name': 'García',
            'employee_id': 'SEC001',
            'department': 'Recepción',
            'shift_start': time(8, 0),
            'shift_end': time(16, 0),
            'can_manage_appointments': True,
            'can_manage_patients': True,
            'can_view_reports': False
        },
        {
            'username': 'ana.lopez',
            'email': 'ana.lopez@hospital.com',
            'first_name': 'Ana',
            'last_name': 'López',
            'employee_id': 'SEC002',
            'department': 'Administración',
            'shift_start': time(9, 0),
            'shift_end': time(17, 0),
            'can_manage_appointments': True,
            'can_manage_patients': False,
            'can_view_reports': True
        },
        {
            'username': 'carmen.ruiz',
            'email': 'carmen.ruiz@hospital.com',
            'first_name': 'Carmen',
            'last_name': 'Ruiz',
            'employee_id': 'SEC003',
            'department': 'Archivo',
            'shift_start': time(7, 0),
            'shift_end': time(15, 0),
            'can_manage_appointments': False,
            'can_manage_patients': True,
            'can_view_reports': False
        },
        {
            'username': 'lucia.martinez',
            'email': 'lucia.martinez@hospital.com',
            'first_name': 'Lucía',
            'last_name': 'Martínez',
            'employee_id': 'SEC004',
            'department': 'Enfermería',
            'shift_start': time(14, 0),
            'shift_end': time(22, 0),
            'can_manage_appointments': True,
            'can_manage_patients': True,
            'can_view_reports': True
        },
        {
            'username': 'sofia.hernandez',
            'email': 'sofia.hernandez@hospital.com',
            'first_name': 'Sofía',
            'last_name': 'Hernández',
            'employee_id': 'SEC005',
            'department': 'Recepción',
            'shift_start': time(16, 0),
            'shift_end': time(23, 59),
            'can_manage_appointments': True,
            'can_manage_patients': False,
            'can_view_reports': False
        }
    ]
    
    created_count = 0
    
    for secretary_data in secretaries_data:
        # Extraer datos del usuario
        user_data = {
            'username': secretary_data['username'],
            'email': secretary_data['email'],
            'first_name': secretary_data['first_name'],
            'last_name': secretary_data['last_name'],
            'role': 'secretary',
            'is_active': True,
            'password': make_password('password123')  # Contraseña temporal
        }
        
        # Extraer datos del perfil
        profile_data = {
            'employee_id': secretary_data['employee_id'],
            'department': secretary_data['department'],
            'shift_start': secretary_data['shift_start'],
            'shift_end': secretary_data['shift_end'],
            'can_manage_appointments': secretary_data['can_manage_appointments'],
            'can_manage_patients': secretary_data['can_manage_patients'],
            'can_view_reports': secretary_data['can_view_reports']
        }
        
        try:
            # Verificar si el usuario ya existe
            if User.objects.filter(username=user_data['username']).exists():
                print(f"⚠️  Usuario {user_data['username']} ya existe, saltando...")
                continue
                
            # Crear usuario
            user = User.objects.create(**user_data)
            
            # Crear perfil de secretaria
            profile = SecretaryProfile.objects.create(
                user=user,
                **profile_data
            )
            
            print(f"✅ Secretaria creada: {user.first_name} {user.last_name} ({profile.department})")
            created_count += 1
            
        except Exception as e:
            print(f"❌ Error creando secretaria {user_data['username']}: {str(e)}")
    
    print(f"\n🎉 Proceso completado. {created_count} secretarias creadas.")
    
    # Mostrar resumen
    total_secretaries = User.objects.filter(role='secretary').count()
    total_profiles = SecretaryProfile.objects.count()
    
    print(f"\n📊 Resumen:")
    print(f"   Total usuarios secretarias: {total_secretaries}")
    print(f"   Total perfiles secretarias: {total_profiles}")
    
    if total_secretaries > 0:
        print(f"\n👥 Secretarias en el sistema:")
        for i, secretary in enumerate(User.objects.filter(role='secretary'), 1):
            try:
                profile = secretary.secretaryprofile
                print(f"   {i}. {secretary.first_name} {secretary.last_name} - {profile.department}")
            except:
                print(f"   {i}. {secretary.first_name} {secretary.last_name} - Sin perfil")

if __name__ == '__main__':
    create_test_secretaries()