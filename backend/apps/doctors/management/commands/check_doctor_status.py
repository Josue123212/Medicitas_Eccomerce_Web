from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor

class Command(BaseCommand):
    help = 'Verifica y corrige el status de los doctores'

    def handle(self, *args, **options):
        self.stdout.write("🔧 Verificando status de doctores...")
        
        doctors = Doctor.objects.all()
        self.stdout.write(f"📊 Total de doctores: {doctors.count()}")
        
        fixed_count = 0
        
        for doctor in doctors:
            # Verificar si el status es None o vacío
            if not doctor.status or doctor.status.strip() == '':
                self.stdout.write(f"🔧 Corrigiendo doctor {doctor.user.get_full_name()}: status vacío -> 'active'")
                doctor.status = 'active'
                doctor.save(update_fields=['status'])
                fixed_count += 1
        
        self.stdout.write(f"\n📈 Doctores corregidos: {fixed_count}")
        
        # Verificar que ahora todos tengan status válido
        self.stdout.write(f"\n🧪 Verificación de los primeros 5 doctores:")
        for i, doctor in enumerate(doctors[:5]):
            try:
                badge_text = doctor.status_badge_text
                color = doctor.status_color
                self.stdout.write(f"   Doctor {i+1}: {doctor.user.get_full_name()}")
                self.stdout.write(f"      status: '{doctor.status}'")
                self.stdout.write(f"      badge_text: '{badge_text}'")
                self.stdout.write(f"      color: '{color}'")
                self.stdout.write(f"      is_available: {doctor.is_available}")
            except Exception as e:
                self.stdout.write(f"   ❌ Error con doctor {i+1}: {e}")
        
        self.stdout.write("\n✅ Verificación completada!")