from django.core.management.base import BaseCommand
from apps.patients.models import Patient
from apps.appointments.models import Appointment
from apps.users.models import User
import requests

class Command(BaseCommand):
    help = 'Debug patient history endpoint'

    def handle(self, *args, **options):
        self.stdout.write("🔍 DEBUGGING FRONTEND CALL TO PATIENT-HISTORY")
        self.stdout.write("=" * 50)

        # 1. Verificar usuario josue
        try:
            user = User.objects.get(username='josue')
            self.stdout.write(f"✅ Usuario encontrado: {user.username} ({user.email})")
            self.stdout.write(f"   - ID: {user.id}")
            self.stdout.write(f"   - Activo: {user.is_active}")
            
            # 2. Verificar perfil de paciente
            try:
                patient = Patient.objects.get(user=user)
                self.stdout.write(f"✅ Perfil de paciente encontrado: ID {patient.id}")
                self.stdout.write(f"   - Nombre completo: {patient.user.first_name} {patient.user.last_name}")
                
                # 3. Verificar citas del paciente
                appointments = Appointment.objects.filter(patient=patient)
                self.stdout.write(f"✅ Citas encontradas: {appointments.count()}")
                
                for apt in appointments:
                    self.stdout.write(f"   - Cita {apt.id}: {apt.date} {apt.time} - {apt.status}")
                
                # 4. Simular llamada HTTP al endpoint
                self.stdout.write("\n🌐 SIMULANDO LLAMADA HTTP")
                self.stdout.write("-" * 30)
                
                # URL que debería usar el frontend
                url = f"http://localhost:8000/api/appointments/patient-history/"
                params = {
                    'patient_id': patient.id,
                    'date_from': '2025-01-01',
                    'date_to': '2025-12-31'
                }
                
                self.stdout.write(f"URL: {url}")
                self.stdout.write(f"Parámetros: {params}")
                
                # Hacer la llamada (sin autenticación por ahora)
                try:
                    response = requests.get(url, params=params)
                    self.stdout.write(f"Status Code: {response.status_code}")
                    self.stdout.write(f"Response: {response.text[:500]}...")
                    
                    if response.status_code == 200:
                        data = response.json()
                        self.stdout.write(f"✅ Respuesta exitosa")
                        self.stdout.write(f"   - Appointments: {len(data.get('appointments', []))}")
                        
                        # Mostrar las primeras citas
                        appointments_data = data.get('appointments', [])
                        for i, apt in enumerate(appointments_data[:3]):
                            self.stdout.write(f"   - Cita {i+1}: {apt.get('date')} - {apt.get('status')}")
                    else:
                        self.stdout.write(f"❌ Error en la respuesta")
                        
                except Exception as e:
                    self.stdout.write(f"❌ Error en la llamada HTTP: {e}")
                
            except Patient.DoesNotExist:
                self.stdout.write(f"❌ No se encontró perfil de paciente para {user.username}")
                
        except User.DoesNotExist:
            self.stdout.write(f"❌ Usuario 'josue' no encontrado")