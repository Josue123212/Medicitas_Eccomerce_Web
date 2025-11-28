from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.patients.models import Patient

class Command(BaseCommand):
    help = 'Verificar usuarios y perfiles de pacientes'

    def handle(self, *args, **options):
        self.stdout.write("=== VERIFICACIÓN DE USUARIOS Y PERFILES DE PACIENTES ===\n")
        
        # Verificar usuarios
        users = User.objects.all()
        self.stdout.write(f"📊 Total de usuarios: {users.count()}")
        
        for user in users:
            self.stdout.write(f"👤 Usuario: {user.email}")
            self.stdout.write(f"   - ID: {user.id}")
            self.stdout.write(f"   - Role: {user.role}")
            self.stdout.write(f"   - Nombre: {user.first_name} {user.last_name}")
            self.stdout.write(f"   - Activo: {user.is_active}")
            self.stdout.write("")
        
        # Verificar pacientes
        patients = Patient.objects.all()
        self.stdout.write(f"🏥 Total de perfiles de pacientes: {patients.count()}")
        
        for patient in patients:
            self.stdout.write(f"🩺 Paciente: {patient.user.email}")
            self.stdout.write(f"   - ID del perfil: {patient.id}")
            self.stdout.write(f"   - ID del usuario: {patient.user.id}")
            self.stdout.write(f"   - Teléfono: {patient.phone_number}")
            self.stdout.write(f"   - Fecha de nacimiento: {patient.date_of_birth}")
            self.stdout.write("")
        
        # Verificar usuarios sin perfil de paciente
        users_without_patient_profile = []
        for user in users:
            if user.role == 'client':
                try:
                    patient = Patient.objects.get(user=user)
                except Patient.DoesNotExist:
                    users_without_patient_profile.append(user)
        
        if users_without_patient_profile:
            self.stdout.write("⚠️  USUARIOS CLIENTE SIN PERFIL DE PACIENTE:")
            for user in users_without_patient_profile:
                self.stdout.write(f"   - {user.email} (ID: {user.id})")
            self.stdout.write("")
        else:
            self.stdout.write("✅ Todos los usuarios cliente tienen perfil de paciente")
            self.stdout.write("")
        
        # Verificar la relación patient_profile_id
        self.stdout.write("🔗 VERIFICACIÓN DE PATIENT_PROFILE_ID:")
        for user in users:
            if user.role == 'client':
                try:
                    patient = Patient.objects.get(user=user)
                    self.stdout.write(f"✅ {user.email} -> patient_profile_id debería ser: {patient.id}")
                except Patient.DoesNotExist:
                    self.stdout.write(f"❌ {user.email} -> NO TIENE PERFIL DE PACIENTE")