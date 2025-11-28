#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.appointments.models import Appointment

def main():
    print("🔍 VERIFICANDO CITAS EN LA BASE DE DATOS")
    print("=" * 50)
    
    # Total de citas
    total_citas = Appointment.objects.count()
    print(f"📊 Total de citas: {total_citas}")
    
    # Verificar cita 54
    cita_54 = Appointment.objects.filter(id=54).first()
    if cita_54:
        print(f"✅ Cita 54 existe:")
        print(f"   - ID: {cita_54.id}")
        print(f"   - Status: {cita_54.status}")
        print(f"   - Fecha: {cita_54.date}")
        print(f"   - Hora: {cita_54.time}")
        print(f"   - Doctor ID: {cita_54.doctor.id}")
        print(f"   - Paciente ID: {cita_54.patient.id}")
    else:
        print("❌ Cita 54 NO existe")
    
    # Mostrar algunas citas existentes
    print("\n📋 Últimas 5 citas:")
    citas = Appointment.objects.all().order_by('-id')[:5]
    for cita in citas:
        print(f"   - ID: {cita.id}, Status: {cita.status}, Fecha: {cita.date}")

if __name__ == "__main__":
    main()