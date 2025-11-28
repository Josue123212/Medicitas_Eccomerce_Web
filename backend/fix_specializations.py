#!/usr/bin/env python
"""
Script para corregir problemas de codificación en las especialidades de los doctores
y normalizar los datos.
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.doctors.models import Doctor

def fix_specializations():
    """
    Corrige problemas de codificación en las especialidades y normaliza los datos.
    """
    print("🔍 Analizando especialidades actuales...")
    
    # Obtener todas las especialidades únicas
    doctors = Doctor.objects.all()
    specializations_found = {}
    
    for doctor in doctors:
        spec = doctor.specialization
        if spec:
            if spec in specializations_found:
                specializations_found[spec].append(doctor.id)
            else:
                specializations_found[spec] = [doctor.id]
    
    print(f"\n📊 Especialidades encontradas ({len(specializations_found)}):")
    for spec, doctor_ids in specializations_found.items():
        print(f"  - '{spec}' (Doctores: {doctor_ids})")
    
    # Mapeo de correcciones
    corrections = {
        'Cardiolog??a': 'Cardiología',
        'CardiologÃa': 'Cardiología', 
        'Traumatolog??a': 'Traumatología',
        'TraumatologÃa': 'Traumatología',
        'Medicina General': 'Medicina General',  # Ya está bien
    }
    
    print(f"\n🔧 Aplicando correcciones...")
    
    updated_count = 0
    for doctor in doctors:
        if doctor.specialization in corrections:
            old_spec = doctor.specialization
            new_spec = corrections[old_spec]
            
            if old_spec != new_spec:
                print(f"  - Doctor {doctor.id} ({doctor.user.get_full_name()}): '{old_spec}' → '{new_spec}'")
                doctor.specialization = new_spec
                doctor.save(update_fields=['specialization'])
                updated_count += 1
    
    print(f"\n✅ Correcciones completadas: {updated_count} doctores actualizados")
    
    # Mostrar especialidades finales
    print(f"\n📋 Especialidades después de la corrección:")
    final_specializations = Doctor.objects.values_list('specialization', flat=True).distinct().order_by('specialization')
    for spec in final_specializations:
        if spec:
            count = Doctor.objects.filter(specialization=spec).count()
            print(f"  - {spec} ({count} doctores)")

def create_sample_specializations():
    """
    Crea especialidades de ejemplo si no hay suficientes.
    """
    print("\n🏥 Verificando si necesitamos más especialidades...")
    
    current_specs = set(Doctor.objects.values_list('specialization', flat=True).distinct())
    current_specs = {spec for spec in current_specs if spec and spec.strip()}
    
    # Especialidades comunes que deberíamos tener
    common_specializations = {
        'Medicina General',
        'Cardiología', 
        'Traumatología',
        'Pediatría',
        'Ginecología',
        'Dermatología',
        'Neurología',
        'Psiquiatría',
        'Oftalmología',
        'Otorrinolaringología'
    }
    
    missing_specs = common_specializations - current_specs
    
    if missing_specs:
        print(f"📝 Especialidades faltantes: {missing_specs}")
        print("💡 Puedes agregar doctores con estas especialidades desde el admin de Django")
    else:
        print("✅ Tienes una buena variedad de especialidades")

if __name__ == '__main__':
    print("🚀 Iniciando corrección de especialidades...")
    fix_specializations()
    create_sample_specializations()
    print("\n🎉 ¡Proceso completado!")