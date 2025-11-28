#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from apps.patients.models import Patient
from apps.users.models import User

print("=== VERIFICACIÓN DE BASE DE DATOS ===")
print(f"Total pacientes: {Patient.objects.count()}")
print(f"Usuarios admin: {User.objects.filter(role='admin').count()}")
print(f"Usuarios doctor: {User.objects.filter(role='doctor').count()}")
print(f"Usuarios secretary: {User.objects.filter(role='secretary').count()}")
print(f"Usuarios client: {User.objects.filter(role='client').count()}")

# Verificar usuario específico
admin_user = User.objects.filter(email='joan@gmail.com').first()
if admin_user:
    print(f"\nUsuario joan@gmail.com:")
    print(f"  - Rol: {admin_user.role}")
    print(f"  - Activo: {admin_user.is_active}")
    print(f"  - Staff: {admin_user.is_staff}")
    print(f"  - Autenticado: {admin_user.is_authenticated}")
else:
    print("\nUsuario joan@gmail.com: No encontrado")

# Mostrar algunos pacientes de ejemplo
print(f"\nPrimeros 5 pacientes:")
for patient in Patient.objects.select_related('user')[:5]:
    print(f"  - {patient.user.get_full_name()} ({patient.user.email})")