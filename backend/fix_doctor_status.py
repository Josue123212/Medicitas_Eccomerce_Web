#!/usr/bin/env python
"""
Script para verificar y corregir el status de los doctores.
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.doctors.models import Doctor

def fix_doctor_status():
    """Verifica y corrige el status de los doctores."""
    
    print("🔧 Verificando y corrigiendo status de doctores...")
    print("=" * 60)
    
    # Obtener todos los doctores
    doctors = Doctor.objects.all()
    print(f"📊 Total de doctores: {doctors.count()}")
    
    fixed_count = 0
    
    for doctor in doctors:
        # Verificar si el status es None o vacío
        if not doctor.status or doctor.status.strip() == '':
            print(f"🔧 Corrigiendo doctor {doctor.user.get_full_name()}: status vacío -> 'active'")
            doctor.status = 'active'
            doctor.save(update_fields=['status'])
            fixed_count += 1
        else:
            print(f"✅ Doctor {doctor.user.get_full_name()}: status='{doctor.status}' (OK)")
    
    print(f"\n📈 Resumen:")
    print(f"   - Doctores corregidos: {fixed_count}")
    print(f"   - Doctores sin problemas: {doctors.count() - fixed_count}")
    
    # Verificar que ahora todos tengan status válido
    print(f"\n🧪 Verificación final:")
    for i, doctor in enumerate(doctors[:5]):
        try:
            badge_text = doctor.status_badge_text
            color = doctor.status_color
            print(f"   Doctor {i+1}: {doctor.user.get_full_name()}")
            print(f"      status: '{doctor.status}'")
            print(f"      badge_text: '{badge_text}'")
            print(f"      color: '{color}'")
            print(f"      is_available: {doctor.is_available}")
        except Exception as e:
            print(f"   ❌ Error con doctor {i+1}: {e}")
    
    print("\n✅ Proceso completado!")

if __name__ == "__main__":
    fix_doctor_status()