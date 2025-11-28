#!/usr/bin/env python
"""
Script para verificar los datos del departamento de las secretarias
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import SecretaryProfile, User

def check_secretary_departments():
    print("🔍 Verificando departamentos de secretarias...")
    print("=" * 50)
    
    secretaries = SecretaryProfile.objects.select_related('user').all()
    
    if not secretaries.exists():
        print("❌ No se encontraron secretarias en la base de datos")
        return
    
    print(f"📊 Total de secretarias: {secretaries.count()}")
    print()
    
    for secretary in secretaries:
        print(f"👤 Secretaria: {secretary.user.first_name} {secretary.user.last_name}")
        print(f"   📧 Email: {secretary.user.email}")
        print(f"   🆔 Employee ID: {secretary.employee_id}")
        print(f"   🏢 Departamento: '{secretary.department}'")
        print(f"   📱 Teléfono: {secretary.user.phone}")
        print(f"   ✅ Activa: {secretary.user.is_active}")
        print("-" * 30)

if __name__ == "__main__":
    check_secretary_departments()