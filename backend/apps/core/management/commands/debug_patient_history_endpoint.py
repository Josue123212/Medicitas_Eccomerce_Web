from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.patients.models import Patient
from apps.appointments.models import Appointment
from apps.appointments.views import PatientHistoryView
from django.test import RequestFactory
from datetime import datetime, date

User = get_user_model()

class Command(BaseCommand):
    help = 'Debug patient history endpoint'

    def handle(self, *args, **options):
        self.stdout.write("🔍 DEBUGGING PATIENT HISTORY ENDPOINT")
        self.stdout.write("=" * 50)
        
        # 1. Verificar usuario Josué
        try:
            user = User.objects.get(email='josue@gmail.com')
            self.stdout.write(f"✅ Usuario encontrado: {user.email} (ID: {user.id})")
            self.stdout.write(f"   - Rol: {user.role}")
            self.stdout.write(f"   - Activo: {user.is_active}")
        except User.DoesNotExist:
            self.stdout.write("❌ Usuario josue@gmail.com no encontrado")
            return
        
        # 2. Verificar perfil de paciente
        try:
            patient = Patient.objects.get(user=user)
            self.stdout.write(f"✅ Paciente encontrado: ID {patient.id}")
            self.stdout.write(f"   - Teléfono: {patient.phone_number}")
            self.stdout.write(f"   - Dirección: {patient.address}")
        except Patient.DoesNotExist:
            self.stdout.write("❌ Perfil de paciente no encontrado")
            return
        
        # 3. Verificar citas del paciente
        appointments = Appointment.objects.filter(patient=patient)
        self.stdout.write(f"\n📅 CITAS DEL PACIENTE (Total: {appointments.count()})")
        self.stdout.write("-" * 30)
        
        for i, appointment in enumerate(appointments, 1):
            self.stdout.write(f"{i}. ID: {appointment.id}")
            self.stdout.write(f"   - Fecha: {appointment.date}")
            self.stdout.write(f"   - Hora: {appointment.time}")
            self.stdout.write(f"   - Doctor: {appointment.doctor.full_name}")
            self.stdout.write(f"   - Especialidad: {appointment.doctor.specialization}")
            self.stdout.write(f"   - Estado: {appointment.status}")
            self.stdout.write(f"   - Creado: {appointment.created_at}")
            self.stdout.write("")
        
        # 4. Filtrar por año 2025
        appointments_2025 = appointments.filter(
            date__year=2025
        )
        self.stdout.write(f"📅 CITAS EN 2025: {appointments_2025.count()}")
        
        # 5. Filtrar por rango específico
        appointments_range = appointments.filter(
            date__gte='2025-01-01',
            date__lte='2025-12-31'
        )
        self.stdout.write(f"📅 CITAS EN RANGO 2025-01-01 a 2025-12-31: {appointments_range.count()}")
        
        # 6. Simular llamada al endpoint
        self.stdout.write("\n🌐 SIMULANDO LLAMADA AL ENDPOINT")
        self.stdout.write("-" * 40)
        
        factory = RequestFactory()
        
        # Simular request GET con parámetros
        request = factory.get('/appointments/patient-history/', {
            'patient_id': patient.id,
            'date_from': '2025-01-01',
            'date_to': '2025-12-31'
        })
        request.user = user
        
        # Crear vista y procesar
        view = PatientHistoryView()
        view.request = request
        
        try:
            response = view.get(request)
            self.stdout.write(f"✅ Status Code: {response.status_code}")
            
            if hasattr(response, 'data'):
                data = response.data
                self.stdout.write(f"📊 Respuesta del endpoint:")
                self.stdout.write(f"   - appointments: {len(data.get('appointments', []))}")
                self.stdout.write(f"   - summary: {data.get('summary', {})}")
                
                if data.get('appointments'):
                    self.stdout.write("\n📋 CITAS EN LA RESPUESTA:")
                    for i, apt in enumerate(data['appointments'], 1):
                        self.stdout.write(f"   {i}. {apt.get('date')} - {apt.get('doctor_name')} ({apt.get('status')})")
                else:
                    self.stdout.write("❌ No hay citas en la respuesta")
            else:
                self.stdout.write(f"❌ No hay data en la respuesta")
                
        except Exception as e:
            self.stdout.write(f"❌ Error al procesar endpoint: {e}")
            import traceback
            traceback.print_exc()