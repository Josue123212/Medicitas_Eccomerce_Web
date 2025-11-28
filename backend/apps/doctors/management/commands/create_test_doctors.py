"""
Comando Django para crear datos de prueba de doctores con horarios disponibles
para el 24 de septiembre de 2025.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.doctors.models import Doctor
from decimal import Decimal
from datetime import time

User = get_user_model()


class Command(BaseCommand):
    help = 'Crear doctores de prueba con horarios disponibles para el 24 de septiembre de 2025'

    def handle(self, *args, **options):
        """Ejecutar el comando."""
        self.stdout.write("🏥 Creando datos de prueba de doctores...")
        self.stdout.write("=" * 50)
        
        # Crear doctores
        doctors = self.create_test_doctors()
        
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(f"✅ Proceso completado. Se procesaron {len(doctors)} doctores.")
        
        # Mostrar resumen
        self.stdout.write("\n📋 Resumen de doctores creados:")
        for doctor in doctors:
            self.stdout.write(f"- Dr. {doctor.user.get_full_name()} ({doctor.specialization})")
            self.stdout.write(f"  📧 Email: {doctor.user.email}")
            self.stdout.write(f"  📞 Teléfono: {doctor.user.phone}")
            self.stdout.write(f"  🕒 Horario: {doctor.get_work_schedule()}")
            self.stdout.write(f"  💰 Tarifa: €{doctor.consultation_fee}")
            self.stdout.write("")
        
        self.stdout.write("🎯 Los doctores están configurados para trabajar de lunes a viernes.")
        self.stdout.write("📅 Fecha objetivo para pruebas: 24 de septiembre de 2025 (miércoles)")
        self.stdout.write("🔑 Contraseña temporal para todos los doctores: 'doctor123'")

    def create_test_doctors(self):
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
                    self.stdout.write(f"✅ Usuario creado: {user.username}")
                else:
                    self.stdout.write(f"ℹ️  Usuario ya existe: {user.username}")
                
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
                    self.stdout.write(f"✅ Doctor creado: Dr. {user.get_full_name()} - {doctor.specialization}")
                else:
                    self.stdout.write(f"ℹ️  Doctor ya existe: Dr. {user.get_full_name()} - {doctor.specialization}")
                
                created_doctors.append(doctor)
                
            except Exception as e:
                self.stdout.write(f"❌ Error creando doctor {doctor_data['username']}: {str(e)}")
        
        return created_doctors