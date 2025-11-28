#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User, SecretaryProfile

print("=== SECRETARIAS EN LA BASE DE DATOS ===")
secretaries_count = User.objects.filter(role='secretary').count()
profiles_count = SecretaryProfile.objects.count()
print(f"Usuarios con rol secretary: {secretaries_count}")
print(f"Perfiles SecretaryProfile: {profiles_count}")
print()

if secretaries_count > 0:
    secretaries = User.objects.filter(role='secretary')
    for i, sec in enumerate(secretaries, 1):
        print(f"{i}. {sec.username} - {sec.first_name} {sec.last_name}")
        print(f"   Email: {sec.email}")
        print(f"   Activo: {sec.is_active}")
        print(f"   Fecha: {sec.date_joined.strftime('%Y-%m-%d %H:%M')}")
        try:
            profile = sec.secretaryprofile
            print(f"   Perfil: SI")
            print(f"   Departamento: {profile.department}")
            print(f"   Permisos: Citas={profile.can_manage_appointments}, Pacientes={profile.can_manage_patients}")
        except:
            print(f"   Perfil: NO")
        print()
else:
    print("No hay secretarias registradas.")