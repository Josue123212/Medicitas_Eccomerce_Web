#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear usuario admin de prueba
admin_user, created = User.objects.get_or_create(
    email='admin@test.com',
    defaults={
        'first_name': 'Admin',
        'last_name': 'Test',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True
    }
)

if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print("✅ Usuario admin creado: admin@test.com / admin123")
else:
    print("ℹ️ Usuario admin ya existe: admin@test.com / admin123")

print("🎯 Puedes usar este usuario para probar los endpoints de dashboard")