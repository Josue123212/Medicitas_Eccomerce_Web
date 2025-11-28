#!/usr/bin/env python3
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

def main():
    print("🔍 Verificando usuario admin...")
    
    # Buscar usuario admin
    admin = User.objects.filter(role='admin').first()
    
    if admin:
        print(f"✅ Usuario admin existe: {admin.email}")
        print(f"🔑 Verificando password 'admin123'...")
        if admin.check_password('admin123'):
            print("✅ Password correcto")
        else:
            print("❌ Password incorrecto, actualizando...")
            admin.set_password('admin123')
            admin.save()
            print("✅ Password actualizado a 'admin123'")
    else:
        print("❌ No existe usuario admin, creando...")
        admin = User.objects.create_user(
            email='admin@test.com',
            password='admin123',
            first_name='Admin',
            last_name='Test',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"✅ Usuario admin creado: {admin.email}")
    
    print(f"\n📋 Credenciales:")
    print(f"   Email: {admin.email}")
    print(f"   Password: admin123")
    print(f"   Role: {admin.role}")

if __name__ == "__main__":
    main()