from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.patients.models import Patient
from apps.appointments.models import Appointment
import json

class Command(BaseCommand):
    help = 'Debug user mapping between backend and frontend'

    def handle(self, *args, **options):
        self.stdout.write('🔍 DEBUGGING USER MAPPING')
        self.stdout.write('=' * 50)
        
        try:
            # Buscar usuario josue
            user = User.objects.get(email='josue@gmail.com')
            self.stdout.write(f'✅ Usuario encontrado: {user.email}')
            self.stdout.write(f'   - ID: {user.id}')
            self.stdout.write(f'   - Nombre: {user.first_name} {user.last_name}')
            self.stdout.write(f'   - Role: {user.role}')
            self.stdout.write(f'   - Activo: {user.is_active}')
            
            # Buscar perfil de paciente
            try:
                patient = Patient.objects.get(user=user)
                self.stdout.write(f'✅ Perfil de paciente encontrado: ID {patient.id}')
                self.stdout.write(f'   - Nombre completo: {patient.full_name}')
                self.stdout.write(f'   - Teléfono: {patient.phone_number}')
                self.stdout.write(f'   - Fecha nacimiento: {patient.date_of_birth}')
                self.stdout.write(f'   - Género: {patient.gender}')
                self.stdout.write(f'   - Dirección: {patient.address}')
                
                # Verificar citas
                appointments = Appointment.objects.filter(patient=patient)
                self.stdout.write(f'✅ Citas encontradas: {appointments.count()}')
                for apt in appointments:
                    self.stdout.write(f'   - Cita {apt.id}: {apt.date} {apt.time} - {apt.status}')
                
                # Simular respuesta del backend como la vería el frontend
                self.stdout.write('\n🌐 SIMULANDO RESPUESTA DEL BACKEND')
                self.stdout.write('-' * 30)
                
                backend_user_data = {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'role': user.role,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'patient_profile_id': patient.id  # ¡ESTE ES EL CAMPO CLAVE!
                }
                
                self.stdout.write('Backend User Data:')
                self.stdout.write(json.dumps(backend_user_data, indent=2, default=str))
                
                # Simular mapeo del frontend
                self.stdout.write('\n📱 SIMULANDO MAPEO DEL FRONTEND')
                self.stdout.write('-' * 30)
                
                frontend_user_data = {
                    'id': str(backend_user_data['id']),
                    'email': backend_user_data['email'],
                    'firstName': backend_user_data['first_name'] or backend_user_data['email'].split('@')[0],
                    'lastName': backend_user_data['last_name'] or '',
                    'phone': backend_user_data['phone'] or '',
                    'role': backend_user_data['role'] or 'client',
                    'isActive': backend_user_data['is_active'] or True,
                    'dateJoined': backend_user_data['date_joined'] or '',
                    'lastLogin': backend_user_data['last_login'],
                    'patient_profile_id': backend_user_data.get('patient_profile_id')  # ¡VERIFICAR ESTE MAPEO!
                }
                
                self.stdout.write('Frontend User Data:')
                self.stdout.write(json.dumps(frontend_user_data, indent=2, default=str))
                
                # Verificar si patient_profile_id está presente
                if frontend_user_data.get('patient_profile_id'):
                    self.stdout.write(f'\n✅ patient_profile_id mapeado correctamente: {frontend_user_data["patient_profile_id"]}')
                else:
                    self.stdout.write(f'\n❌ patient_profile_id NO está presente en el mapeo del frontend')
                
            except Patient.DoesNotExist:
                self.stdout.write('❌ No se encontró perfil de paciente para este usuario')
                
        except User.DoesNotExist:
            self.stdout.write('❌ Usuario josue@gmail.com no encontrado')
        except Exception as e:
            self.stdout.write(f'❌ Error: {str(e)}')