#!/usr/bin/env python3
"""
Script para verificar el estado de autenticación de doctores
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.doctors.models import Doctor

def main():
    print("🔍 VERIFICANDO ESTADO DE DOCTORES Y AUTENTICACIÓN")
    print("=" * 60)
    
    # 1. Verificar usuarios con rol doctor
    print("\n1. USUARIOS CON ROL DOCTOR:")
    doctor_users = User.objects.filter(role='doctor')
    print(f"   Total usuarios doctor: {doctor_users.count()}")
    
    for user in doctor_users:
        print(f"   - ID: {user.id}, Email: {user.email}, Activo: {user.is_active}")
        print(f"     Nombre: {user.first_name} {user.last_name}")
        print(f"     Último login: {user.last_login}")
    
    # 2. Verificar perfiles de doctor
    print("\n2. PERFILES DE DOCTOR:")
    doctors = Doctor.objects.all()
    print(f"   Total perfiles doctor: {doctors.count()}")
    
    for doctor in doctors:
        print(f"   - ID: {doctor.id}, Usuario: {doctor.user.email}")
        print(f"     Especialización: {doctor.specialization}")
        print(f"     Estado: {doctor.status}, Disponible: {doctor.is_available}")
        print(f"     Licencia médica: {doctor.medical_license}")
    
    # 3. Verificar doctores activos
    print("\n3. DOCTORES ACTIVOS Y DISPONIBLES:")
    active_doctors = Doctor.objects.filter(
        user__is_active=True,
        status='active',
        is_available=True
    )
    print(f"   Total doctores activos: {active_doctors.count()}")
    
    for doctor in active_doctors:
        print(f"   - {doctor.user.email} ({doctor.specialization})")
    
    # 4. Crear un doctor de prueba si no existe ninguno
    if doctor_users.count() == 0:
        print("\n4. CREANDO DOCTOR DE PRUEBA:")
        try:
            # Crear usuario doctor
            doctor_user = User.objects.create_user(
                email='doctor.test@example.com',
                password='testpass123',
                first_name='Dr. Test',
                last_name='Doctor',
                role='doctor',
                phone='+1234567890'
            )
            
            # Crear perfil de doctor
            doctor_profile = Doctor.objects.create(
                user=doctor_user,
                medical_license='TEST123456',
                specialization='Medicina General',
                years_experience=5,
                consultation_fee=50.00,
                bio='Doctor de prueba para testing',
                status='active',
                is_available=True
            )
            
            print(f"   ✅ Doctor creado: {doctor_user.email}")
            print(f"   ✅ Perfil creado: ID {doctor_profile.id}")
            print(f"   📧 Email: doctor.test@example.com")
            print(f"   🔑 Password: testpass123")
            
        except Exception as e:
            print(f"   ❌ Error creando doctor: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada")

if __name__ == '__main__':
    main()