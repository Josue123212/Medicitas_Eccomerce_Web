#!/usr/bin/env python
"""
Script para crear datos de prueba de doctores con horarios disponibles
para el 24 de septiembre de 2025.
"""

import os
import sys
import django
from datetime import datetime, time
from decimal import Decimal

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar después de configurar Django
from django.contrib.auth import get_user_model
from apps.doctors.models import Doctor

User = get_user_model()

def create_test_doctors():
    """Crear doctores de prueba con diferentes especialidades."""
    
    doctors_data = [
        {
            'username': 'dr_antonio_fernandez',
            'email': 'antonio.fernandez@hospital.com',
            'first_name': 'Antonio',
            'last_name': 'Fernández',
            'phone': '+34-600-123-456',
            'medical_license': 'LIC-OFT-001',
            'specialization': 'Oftalmología',
            'years_experience': 15,
            'consultation_fee': Decimal('80.00'),
            'bio': 'Especialista en cirugía de cataratas y enfermedades de la retina.',
            'work_start_time': time(9, 0),  # 9:00 AM
            'work_end_time': time(17, 0),   # 5:00 PM
            'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        {
            'username': 'dr_elena_garcia',
            'email': 'elena.garcia@hospital.com',
            'first_name': 'Elena',
            'last_name': 'García',
            'phone': '+34-600-234-567',
            'medical_license': 'LIC-TRA-002',
            'specialization': 'Traumatología',
            'years_experience': 12,
            'consultation_fee': Decimal('75.00'),
            'bio': 'Experta en cirugía ortopédica y medicina deportiva.',
            'work_start_time': time(8, 0),  # 8:00 AM
            'work_end_time': time(16, 0),   # 4:00 PM
            'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        {
            'username': 'dr_francisco_gomez',
            'email': 'francisco.gomez@hospital.com',
            'first_name': 'Francisco',
            'last_name': 'Gómez',
            'phone': '+34-600-345-678',
            'medical_license': 'LIC-MED-003',
            'specialization': 'Medicina General',
            'years_experience': 20,
            'consultation_fee': Decimal('60.00'),
            'bio': 'Médico de familia con amplia experiencia en atención primaria.',
            'work_start_time': time(9, 0),  # 9:00 AM
            'work_end_time': time(18, 0),   # 6:00 PM
            'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        {
            'username': 'dr_manuel_moreno',
            'email': 'manuel.moreno@hospital.com',
            'first_name': 'Manuel',
            'last_name': 'Moreno',
            'phone': '+34-600-456-789',
            'medical_license': 'LIC-CAR-004',
            'specialization': 'Cardiología',
            'years_experience': 18,
            'consultation_fee': Decimal('90.00'),
            'bio': 'Cardiólogo especializado en enfermedades cardiovasculares y ecocardiografía.',
            'work_start_time': time(10, 0), # 10:00 AM
            'work_end_time': time(17, 0),   # 5:00 PM
            'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        {
            'username': 'dr_manuel_ruiz',
            'email': 'manuel.ruiz@hospital.com',
            'first_name': 'Manuel',
            'last_name': 'Ruiz',
            'phone': '+34-600-567-890',
            'medical_license': 'LIC-MED-005',
            'specialization': 'Medicina General',
            'years_experience': 10,
            'consultation_fee': Decimal('65.00'),
            'bio': 'Médico general con enfoque en medicina preventiva y salud familiar.',
            'work_start_time': time(8, 30), # 8:30 AM
            'work_end_time': time(16, 30),  # 4:30 PM
            'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
    ]
    
    created_doctors = []
    
    for doctor_data in doctors_data:
        try:
            # Crear o obtener el usuario
            user, user_created = User.objects.get_or_create(
                username=doctor_data['username'],
                defaults={
                    'email': doctor_data['email'],
                    'first_name': doctor_data['first_name'],
                    'last_name': doctor_data['last_name'],
                    'phone': doctor_data['phone'],
                    'role': 'doctor',
                    'is_active': True,
                }
            )
            
            if user_created:
                user.set_password('doctor123')  # Contraseña temporal
                user.save()
                print(f"✅ Usuario creado: {user.username}")
            else:
                print(f"ℹ️  Usuario ya existe: {user.username}")
            
            # Crear o obtener el doctor
            doctor, doctor_created = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    'medical_license': doctor_data['medical_license'],
                    'specialization': doctor_data['specialization'],
                    'years_experience': doctor_data['years_experience'],
                    'consultation_fee': doctor_data['consultation_fee'],
                    'bio': doctor_data['bio'],
                    'is_available': True,
                    'work_start_time': doctor_data['work_start_time'],
                    'work_end_time': doctor_data['work_end_time'],
                    'work_days': doctor_data['work_days'],
                }
            )
            
            if doctor_created:
                print(f"✅ Doctor creado: Dr. {user.get_full_name()} - {doctor.specialization}")
            else:
                print(f"ℹ️  Doctor ya existe: Dr. {user.get_full_name()} - {doctor.specialization}")
            
            created_doctors.append(doctor)
            
        except Exception as e:
            print(f"❌ Error creando doctor {doctor_data['username']}: {str(e)}")
    
    return created_doctors

def main():
    """Función principal del script."""
    print("🏥 Creando datos de prueba de doctores...")
    print("=" * 50)
    
    # Crear doctores
    doctors = create_test_doctors()
    
    print("\n" + "=" * 50)
    print(f"✅ Proceso completado. Se procesaron {len(doctors)} doctores.")
    
    # Mostrar resumen
    print("\n📋 Resumen de doctores creados:")
    for doctor in doctors:
        print(f"- Dr. {doctor.user.get_full_name()} ({doctor.specialization})")
        print(f"  📧 Email: {doctor.user.email}")
        print(f"  📞 Teléfono: {doctor.user.phone}")
        print(f"  🕒 Horario: {doctor.get_work_schedule()}")
        print(f"  💰 Tarifa: €{doctor.consultation_fee}")
        print()
    
    print("🎯 Los doctores están configurados para trabajar de lunes a viernes.")
    print("📅 Fecha objetivo para pruebas: 24 de septiembre de 2025 (miércoles)")
    print("🔑 Contraseña temporal para todos los doctores: 'doctor123'")

if __name__ == '__main__':
    main()