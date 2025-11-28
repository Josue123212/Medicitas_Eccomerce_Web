#!/usr/bin/env python
import os
import sys
import django
from datetime import time

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User, SecretaryProfile

def fix_secretary_profiles():
    """Arreglar perfiles de secretarias faltantes"""
    
    print("🔧 Arreglando perfiles de secretarias...")
    
    # Obtener todas las secretarias sin perfil
    secretaries_without_profile = User.objects.filter(role='secretary').exclude(
        id__in=SecretaryProfile.objects.values_list('user_id', flat=True)
    )
    
    print(f"📋 Encontradas {secretaries_without_profile.count()} secretarias sin perfil")
    
    # Departamentos disponibles
    departments = ['Recepción', 'Administración', 'Archivo', 'Enfermería']
    
    fixed_count = 0
    
    for i, secretary in enumerate(secretaries_without_profile):
        try:
            # Crear perfil básico
            profile = SecretaryProfile.objects.create(
                user=secretary,
                employee_id=f'SEC{secretary.id:03d}',  # SEC001, SEC002, etc.
                department=departments[i % len(departments)],  # Rotar departamentos
                shift_start=time(8, 0),
                shift_end=time(16, 0),
                can_manage_appointments=True,
                can_manage_patients=True,
                can_view_reports=False
            )
            
            print(f"✅ Perfil creado para: {secretary.first_name} {secretary.last_name} - {profile.department}")
            fixed_count += 1
            
        except Exception as e:
            print(f"❌ Error creando perfil para {secretary.username}: {str(e)}")
    
    print(f"\n🎉 Proceso completado. {fixed_count} perfiles creados.")
    
    # Mostrar resumen final
    total_secretaries = User.objects.filter(role='secretary').count()
    total_profiles = SecretaryProfile.objects.count()
    
    print(f"\n📊 Resumen final:")
    print(f"   Total usuarios secretarias: {total_secretaries}")
    print(f"   Total perfiles secretarias: {total_profiles}")
    
    if total_secretaries > 0:
        print(f"\n👥 Secretarias con perfiles:")
        for i, secretary in enumerate(User.objects.filter(role='secretary'), 1):
            try:
                profile = secretary.secretaryprofile
                print(f"   {i}. {secretary.first_name} {secretary.last_name} - {profile.department} ({profile.employee_id})")
            except:
                print(f"   {i}. {secretary.first_name} {secretary.last_name} - ❌ Sin perfil")

if __name__ == '__main__':
    fix_secretary_profiles()