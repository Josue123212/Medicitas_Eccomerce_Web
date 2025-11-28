"""
Comando para generar datos de prueba para el sistema de gestión médica.

Este comando crea usuarios, pacientes, doctores y citas de prueba
para facilitar el desarrollo y testing del sistema.

Uso:
    python manage.py generate_test_data
    python manage.py generate_test_data --users 20 --appointments 50
    python manage.py generate_test_data --clear  # Limpia datos existentes
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import random
from datetime import datetime, timedelta, time

from apps.users.models import User
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.appointments.models import Appointment

User = get_user_model()


class Command(BaseCommand):
    help = 'Genera datos de prueba para el sistema de gestión médica'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Número de usuarios a crear (default: 10)'
        )
        parser.add_argument(
            '--doctors',
            type=int,
            default=5,
            help='Número de doctores a crear (default: 5)'
        )
        parser.add_argument(
            '--patients',
            type=int,
            default=15,
            help='Número de pacientes a crear (default: 15)'
        )
        parser.add_argument(
            '--appointments',
            type=int,
            default=30,
            help='Número de citas a crear (default: 30)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todos los datos de prueba antes de crear nuevos'
        )

    def handle(self, *args, **options):
        """Método principal que ejecuta la generación de datos."""
        try:
            with transaction.atomic():
                self.stdout.write('🏥 Iniciando generación de datos de prueba...')
                
                # Limpiar datos existentes si se especifica
                if options['clear']:
                    self.clear_test_data()
                
                # Crear usuarios base solo si se especifica
                users = []
                if options['users'] > 0:
                    users = self.create_users(options['users'])
                
                # Crear doctores
                doctors = []
                if options['doctors'] > 0:
                    doctors = self.create_doctors(options['doctors'])
                
                # Crear pacientes
                patients = []
                if options['patients'] > 0:
                    patients = self.create_patients(options['patients'])
                
                # Crear citas
                appointments = self.create_appointments(
                    options['appointments'], 
                    doctors, 
                    patients
                )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Datos de prueba generados exitosamente!\n'
                        f'   👥 Usuarios: {len(users)}\n'
                        f'   👨‍⚕️ Doctores: {len(doctors)}\n'
                        f'   🏥 Pacientes: {len(patients)}\n'
                        f'   📅 Citas: {len(appointments)}'
                    )
                )
            
        except Exception as e:
            raise CommandError(f'Error al generar datos de prueba: {str(e)}')

    def clear_test_data(self):
        """Elimina todos los datos de prueba existentes."""
        self.stdout.write('🗑️  Eliminando datos existentes...')
        
        # Buscar por patrones de emails de prueba
        test_patterns = ['@test.com', '@example.com', 'test', 'doctor', 'patient']
        
        # Eliminar en orden para evitar problemas de FK
        for pattern in test_patterns:
            # Eliminar citas
            Appointment.objects.filter(
                patient__user__email__contains=pattern
            ).delete()
            
            Appointment.objects.filter(
                doctor__user__email__contains=pattern
            ).delete()
            
            # Eliminar pacientes
            Patient.objects.filter(
                user__email__contains=pattern
            ).delete()
            
            # Eliminar doctores
            Doctor.objects.filter(
                user__email__contains=pattern
            ).delete()
            
            # Eliminar usuarios
            User.objects.filter(
                email__contains=pattern
            ).delete()
            
            # También eliminar por username
            User.objects.filter(
                username__contains=pattern
            ).delete()
        
        self.stdout.write(
            self.style.WARNING('   Datos anteriores eliminados')
        )

    def create_users(self, count):
        """Crea usuarios base para el sistema."""
        self.stdout.write(f'👥 Creando {count} usuarios...')
        
        users = []
        for i in range(count):
            # Generar username único
            timestamp = int(timezone.now().timestamp())
            username = f'testuser{i+1}_{timestamp}'
            email = f'test.user{i+1}_{timestamp}@example.com'
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password='testpass123',
                first_name=self.get_random_first_name(),
                last_name=self.get_random_last_name(),
                phone=self.get_random_phone(),
                role='client'
            )
            users.append(user)
        
        return users

    def create_doctors(self, count):
        """Crea doctores con sus perfiles completos."""
        self.stdout.write(f'👨‍⚕️ Creando {count} doctores...')
        
        specializations = [
            'Medicina General', 'Cardiología', 'Dermatología',
            'Pediatría', 'Ginecología', 'Neurología',
            'Traumatología', 'Psiquiatría', 'Oftalmología',
            'Otorrinolaringología'
        ]
        
        doctors = []
        for i in range(count):
            # Generar username único para doctor
            import uuid
            unique_id = str(uuid.uuid4())[:8]
            username = f'doctor{i+1}_{unique_id}'
            email = f'doctor{i+1}_{unique_id}@test.com'
            
            # Crear usuario doctor - el signal automáticamente creará el perfil Doctor
            user = User.objects.create_user(
                username=username,
                email=email,
                password='doctorpass123',
                first_name=self.get_random_first_name(),
                last_name=self.get_random_last_name(),
                phone=self.get_random_phone(),
                role='doctor'  # Esto activará el signal que crea automáticamente el Doctor
            )
            
            # El signal ya creó el doctor, solo necesitamos obtenerlo y actualizarlo
            try:
                doctor = user.doctor  # Relación OneToOne creada por el signal
                
                # Actualizar con datos más específicos (mantener la licencia generada por el signal)
                # El signal ya asignó una licencia única basada en el user.id
                doctor.specialization = random.choice(specializations)
                doctor.years_experience = random.randint(1, 25)
                doctor.consultation_fee = Decimal(str(random.randint(50, 200)))
                doctor.bio = f'Doctor especializado en {doctor.specialization.lower()} con amplia experiencia.'
                doctor.is_available = True
                doctor.work_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
                doctor.save()
                
                doctors.append(doctor)
                
            except Doctor.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Error: No se pudo crear el perfil de doctor para {username}')
                )
        
        return doctors

    def create_patients(self, count):
        """Crea pacientes con sus perfiles completos."""
        self.stdout.write(f'🏥 Creando {count} pacientes...')
        
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        genders = ['M', 'F']
        
        patients = []
        for i in range(count):
            # Generar username único para paciente
            timestamp = int(timezone.now().timestamp())
            username = f'patient{i+1}_{timestamp}'
            email = f'patient{i+1}_{timestamp}@test.com'
            
            # Crear usuario paciente - el signal automáticamente creará el perfil Patient
            user = User.objects.create_user(
                username=username,
                email=email,
                password='patientpass123',
                first_name=self.get_random_first_name(),
                last_name=self.get_random_last_name(),
                phone=self.get_random_phone(),
                role='client'  # Esto activará el signal que crea automáticamente el Patient
            )
            
            # El signal ya creó el paciente, solo necesitamos obtenerlo y actualizarlo
            try:
                patient = user.patient_profile  # Relación OneToOne creada por el signal
                
                # Actualizar con datos más específicos
                birth_date = self.get_random_birth_date()
                patient.date_of_birth = birth_date
                patient.gender = random.choice(genders)
                patient.phone_number = self.get_random_phone()
                patient.address = self.get_random_address()
                patient.blood_type = random.choice(blood_types)
                patient.emergency_contact_name = f'{self.get_random_first_name()} {self.get_random_last_name()}'
                patient.emergency_contact_phone = self.get_random_phone()
                patient.medical_history = self.get_random_medical_history()
                patient.allergies = self.get_random_allergies()
                patient.save()
                
                patients.append(patient)
                
            except Patient.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Error: No se pudo crear el perfil de paciente para {username}')
                )
        
        return patients

    def create_appointments(self, count, doctors, patients):
        """Crea citas médicas entre doctores y pacientes."""
        self.stdout.write(f'📅 Creando {count} citas...')
        
        if not doctors or not patients:
            self.stdout.write(
                self.style.WARNING('No hay doctores o pacientes disponibles para crear citas')
            )
            return []
        
        statuses = ['scheduled', 'confirmed', 'completed', 'cancelled']
        reasons = [
            'Consulta general', 'Control de rutina', 'Dolor de cabeza',
            'Revisión médica', 'Seguimiento', 'Consulta especializada',
            'Chequeo anual', 'Dolor abdominal', 'Consulta preventiva',
            'Evaluación médica'
        ]
        
        appointments = []
        for i in range(count):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            
            # Generar fecha y hora aleatoria
            appointment_date = self.get_random_appointment_date()
            appointment_time = self.get_random_appointment_time()
            
            # Verificar que no haya conflicto de horario
            existing = Appointment.objects.filter(
                doctor=doctor,
                date=appointment_date,
                time=appointment_time
            ).exists()
            
            if existing:
                continue  # Saltar si hay conflicto
            
            appointment = Appointment.objects.create(
                patient=patient,
                doctor=doctor,
                date=appointment_date,
                time=appointment_time,
                status=random.choice(statuses),
                reason=random.choice(reasons),
                notes=f'Notas de la cita #{i+1}' if random.choice([True, False]) else ''
            )
            appointments.append(appointment)
        
        return appointments

    # Métodos auxiliares para generar datos aleatorios
    def get_random_first_name(self):
        names = [
            'Ana', 'Carlos', 'María', 'José', 'Laura', 'Miguel',
            'Carmen', 'Antonio', 'Isabel', 'Francisco', 'Pilar',
            'Manuel', 'Rosa', 'David', 'Elena', 'Javier'
        ]
        return random.choice(names)

    def get_random_last_name(self):
        surnames = [
            'García', 'Rodríguez', 'González', 'Fernández', 'López',
            'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
            'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
        ]
        return random.choice(surnames)

    def get_random_phone(self):
        return f'+34{random.randint(600000000, 699999999)}'

    def get_random_address(self):
        streets = [
            'Calle Mayor', 'Avenida Principal', 'Plaza Central',
            'Calle del Sol', 'Avenida de la Paz', 'Calle Nueva'
        ]
        return f'{random.choice(streets)} {random.randint(1, 100)}, {random.randint(10000, 99999)} Madrid'

    def get_random_birth_date(self):
        start_date = datetime(1950, 1, 1)
        end_date = datetime(2010, 12, 31)
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        return start_date + timedelta(days=random_days)

    def get_random_appointment_date(self):
        # Citas entre hoy y 30 días en el futuro
        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=30)
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        return start_date + timedelta(days=random_days)

    def get_random_appointment_time(self):
        # Horarios de consulta: 9:00 - 17:00
        hours = list(range(9, 18))
        minutes = [0, 30]  # Solo en punto o y media
        return time(random.choice(hours), random.choice(minutes))

    def get_random_medical_history(self):
        conditions = [
            'Hipertensión arterial', 'Diabetes tipo 2', 'Asma',
            'Migrañas frecuentes', 'Artritis', 'Sin antecedentes relevantes'
        ]
        return random.choice(conditions)

    def get_random_allergies(self):
        allergies = [
            'Penicilina', 'Aspirina', 'Frutos secos', 'Mariscos',
            'Polen', 'Sin alergias conocidas'
        ]
        return random.choice(allergies)