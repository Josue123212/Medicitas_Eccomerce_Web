#!/usr/bin/env python
import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

print('=== PRUEBA DE ENDPOINT DE SECRETARIAS ===')

# Buscar un usuario admin
admin_user = User.objects.filter(role='admin').first()
if not admin_user:
    admin_user = User.objects.filter(is_superuser=True).first()

if admin_user:
    print(f'Usuario admin encontrado: {admin_user.email}')
    
    # Generar token JWT
    refresh = RefreshToken.for_user(admin_user)
    access_token = str(refresh.access_token)
    
    print(f'Token JWT generado: {access_token[:50]}...')
    
    # Hacer petición al endpoint
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get('http://localhost:8000/api/users/secretaries/', headers=headers)
        print(f'Status code: {response.status_code}')
        
        if response.status_code == 200:
            data = response.json()
            print(f'Secretarias encontradas: {data.get("count", 0)}')
            if data.get('results'):
                print('Primeras 3 secretarias:')
                for i, secretary in enumerate(data['results'][:3]):
                    user_data = secretary["user"]
                    print(f'  {i+1}. {user_data["first_name"]} {user_data["last_name"]} - {secretary["department"]}')
        else:
            print(f'Error: {response.text}')
            
    except Exception as e:
        print(f'Error en la petición: {e}')
        
else:
    print('No se encontró usuario admin')

print('\n=== VERIFICAR USUARIOS EN BD ===')
total_users = User.objects.count()
admin_count = User.objects.filter(role='admin').count()
secretary_count = User.objects.filter(role='secretary').count()

print(f'Total usuarios: {total_users}')
print(f'Usuarios admin: {admin_count}')
print(f'Usuarios secretary: {secretary_count}')