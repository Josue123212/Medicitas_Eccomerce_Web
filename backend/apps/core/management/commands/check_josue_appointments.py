from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.patients.models import Patient
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor
from datetime import datetime, date, time

User = get_user_model()

class Command(BaseCommand):
    help = 'Verificar y crear citas para el usuario Josué'

    def handle(self, *args, **options):
        self.stdout.write("🔍 VERIFICANDO CITAS DEL USUARIO JOSUÉ")
        
        try:
            # Buscar usuario Josué
            user = User.objects.get(email="josue@gmail.com")
            self.stdout.write(f"✅ Usuario encontrado: {user.email} (ID: {user.id})")
            
            # Verificar si tiene patient_profile
            if hasattr(user, 'patient_profile'):
                patient = user.patient_profile
                self.stdout.write(f"✅ Patient profile encontrado: {patient.id}")
                
                # Verificar citas existentes
                appointments = Appointment.objects.filter(patient=patient)
                self.stdout.write(f"📋 Total de citas: {appointments.count()}")
                
                if appointments.exists():
                    self.stdout.write("📅 Citas existentes:")
                    for apt in appointments:
                        self.stdout.write(f"  - {apt.date} {apt.time} - {apt.status} - Dr. {apt.doctor.user.get_full_name()}")
                else:
                    self.stdout.write("❌ No hay citas para este paciente")
                    
                    # Crear algunas citas de prueba
                    self.stdout.write("🔧 Creando citas de prueba...")
                    
                    # Buscar un doctor para las citas
                    doctor = Doctor.objects.first()
                    if doctor:
                        self.stdout.write(f"👨‍⚕️ Doctor encontrado: {doctor.user.get_full_name()}")
                        
                        # Crear citas de prueba para 2025
                        test_appointments = [
                            {
                                'date': date(2025, 1, 15),
                                'time': time(10, 0),
                                'status': 'completed',
                                'notes': 'Consulta general - Cita de prueba'
                            },
                            {
                                'date': date(2025, 2, 20),
                                'time': time(14, 30),
                                'status': 'completed',
                                'notes': 'Seguimiento - Cita de prueba'
                            },
                            {
                                'date': date(2025, 3, 10),
                                'time': time(9, 15),
                                'status': 'scheduled',
                                'notes': 'Control rutinario - Cita de prueba'
                            }
                        ]
                        
                        for apt_data in test_appointments:
                            appointment = Appointment.objects.create(
                                patient=patient,
                                doctor=doctor,
                                date=apt_data['date'],
                                time=apt_data['time'],
                                status=apt_data['status'],
                                notes=apt_data['notes']
                            )
                            self.stdout.write(f"✅ Cita creada: {appointment.date} {appointment.time}")
                        
                        self.stdout.write("🎉 Citas de prueba creadas exitosamente")
                    else:
                        self.stdout.write("❌ No se encontró ningún doctor para crear las citas")
            else:
                self.stdout.write("❌ El usuario no tiene patient_profile")
                
        except User.DoesNotExist:
            self.stdout.write("❌ Usuario josue@gmail.com no encontrado")
        except Exception as e:
            self.stdout.write(f"❌ Error: {str(e)}")