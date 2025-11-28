#!/usr/bin/env python
"""
Script para debuggear la creación de secretarias
"""
import os
import sys
import django
import json
import requests

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import SecretaryProfile
from apps.users.serializers import SecretaryCreateSerializer

User = get_user_model()

def test_serializer_directly():
    """Prueba el serializer directamente"""
    print("🧪 Probando SecretaryCreateSerializer directamente...")
    
    test_data = {
        'username': 'test_secretary',
        'email': 'test@example.com',
        'first_name': 'Test',
        'last_name': 'Secretary',
        'phone_number': '1234567890',
        'password': 'testpass123',
        'employee_id': 'EMP001',
        'department': 'Administración',
        'shift_start': '08:00',
        'shift_end': '16:00',
        'hire_date': '2024-01-01',
        'can_manage_appointments': True,
        'can_manage_patients': True,
        'can_view_reports': False
    }
    
    serializer = SecretaryCreateSerializer(data=test_data)
    
    if serializer.is_valid():
        print("✅ Serializer es válido")
        try:
            secretary = serializer.save()
            print(f"✅ Secretaria creada exitosamente: {secretary}")
            
            # Limpiar después de la prueba
            secretary.user.delete()  # Esto también eliminará el perfil por CASCADE
            print("🧹 Datos de prueba limpiados")
            
        except Exception as e:
            print(f"❌ Error al crear secretaria: {e}")
    else:
        print("❌ Serializer no es válido")
        print(f"Errores: {serializer.errors}")

def test_api_endpoint():
    """Prueba el endpoint de API directamente"""
    print("\n🌐 Probando endpoint de API...")
    
    # Primero necesitamos autenticarnos
    login_data = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/auth/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            access_token = tokens.get('access')
            
            # Datos para crear secretaria
            secretary_data = {
                'username': 'api_test_secretary',
                'email': 'apitest@example.com',
                'first_name': 'API',
                'last_name': 'Test',
                'phone_number': '9876543210',
                'password': 'testpass123',
                'employee_id': 'EMP002',
                'department': 'Administración',
                'shift_start': '08:00',
                'shift_end': '16:00',
                'hire_date': '2024-01-01',
                'can_manage_appointments': True,
                'can_manage_patients': True,
                'can_view_reports': False
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Crear secretaria
            response = requests.post(
                'http://127.0.0.1:8000/api/users/secretaries/',
                json=secretary_data,
                headers=headers
            )
            
            print(f"Create secretary status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 201:
                print("✅ Secretaria creada exitosamente via API")
                # Limpiar
                secretary_id = response.json().get('id')
                if secretary_id:
                    delete_response = requests.delete(
                        f'http://127.0.0.1:8000/api/users/secretaries/{secretary_id}/',
                        headers=headers
                    )
                    print(f"Delete status: {delete_response.status_code}")
            else:
                print("❌ Error al crear secretaria via API")
                
        else:
            print("❌ Error en login")
            print(f"Response: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error en prueba de API: {e}")

if __name__ == '__main__':
    print("🔍 Iniciando diagnóstico de creación de secretarias...\n")
    
    # Verificar que existe un usuario admin
    if not User.objects.filter(email='admin@example.com').exists():
        print("⚠️  No existe usuario admin, creando uno para las pruebas...")
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("✅ Usuario admin creado")
    
    test_serializer_directly()
    test_api_endpoint()
    
    print("\n🏁 Diagnóstico completado")