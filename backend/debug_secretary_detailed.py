#!/usr/bin/env python3
"""
Script de depuración detallado para analizar el problema de creación de secretarias.
"""

import os
import django
import json
import requests
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import SecretaryProfile
from apps.users.serializers import SecretaryCreateSerializer
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APIRequestFactory, force_authenticate

User = get_user_model()

def test_serializer_validation():
    """Probar validación del serializer directamente"""
    print("🔍 Probando validación del SecretaryCreateSerializer...")
    
    # Datos de prueba que simula lo que envía el frontend
    test_data = {
        "username": "test_secretary_debug",
        "email": "test_debug@example.com",
        "first_name": "Test",
        "last_name": "Secretary",
        "phone_number": "1234567890",
        "password": "testpassword123",
        "employee_id": "SEC001",
        "department": "Administración",
        "shift_start": "08:00:00",
        "shift_end": "16:00:00",
        "hire_date": "2025-09-27",
        "can_manage_appointments": True,
        "can_manage_patients": False,
        "can_view_reports": True
    }
    
    print(f"📋 Datos de prueba: {json.dumps(test_data, indent=2)}")
    
    # Probar el serializer
    serializer = SecretaryCreateSerializer(data=test_data)
    
    if serializer.is_valid():
        print("✅ Serializer válido")
        print(f"📊 Datos validados: {serializer.validated_data}")
        return True, test_data
    else:
        print("❌ Errores de validación del serializer:")
        for field, errors in serializer.errors.items():
            print(f"  - {field}: {errors}")
        return False, test_data

def test_viewset_permissions():
    """Probar permisos del ViewSet"""
    print("\n🔍 Probando permisos del SecretaryViewSet...")
    
    from apps.users.views import SecretaryViewSet
    from rest_framework.test import APIRequestFactory
    
    factory = APIRequestFactory()
    
    # Crear usuario admin para la prueba
    try:
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.filter(is_staff=True).first()
        
        if not admin_user:
            print("❌ No se encontró usuario admin para la prueba")
            return False
            
        print(f"👤 Usuario admin encontrado: {admin_user.username} (role: {admin_user.role})")
        
        # Crear request simulado
        request = factory.post('/api/users/secretaries/', {}, format='json')
        force_authenticate(request, user=admin_user)
        
        # Probar permisos
        view = SecretaryViewSet()
        view.action = 'create'
        view.request = request
        
        permissions = view.get_permissions()
        print(f"🔐 Permisos requeridos: {[p.__class__.__name__ for p in permissions]}")
        
        # Verificar cada permiso
        for permission in permissions:
            has_permission = permission.has_permission(request, view)
            print(f"  - {permission.__class__.__name__}: {'✅' if has_permission else '❌'}")
            
            if not has_permission:
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ Error al probar permisos: {e}")
        return False

def test_api_endpoint_with_auth():
    """Probar el endpoint con autenticación real"""
    print("\n🔍 Probando endpoint con autenticación real...")
    
    try:
        # Obtener token CSRF
        csrf_response = requests.get('http://127.0.0.1:8000/api/users/auth/csrf/')
        if csrf_response.status_code != 200:
            print("❌ No se pudo obtener token CSRF")
            return False
            
        csrf_token = csrf_response.json().get('csrf_token')
        print(f"🔑 Token CSRF obtenido: {csrf_token[:20]}...")
        
        # Intentar login como admin
        login_data = {
            "email_or_username": "admin@example.com",  # Ajustar según tu admin
            "password": "admin123"  # Ajustar según tu admin
        }
        
        login_response = requests.post(
            'http://127.0.0.1:8000/api/users/auth/login/',
            json=login_data,
            headers={'X-CSRFToken': csrf_token}
        )
        
        if login_response.status_code != 200:
            print(f"❌ Error en login: {login_response.status_code}")
            print(f"📄 Respuesta: {login_response.text}")
            return False
            
        # Obtener token de acceso
        login_data = login_response.json()
        access_token = login_data.get('data', {}).get('access_token')
        
        if not access_token:
            print("❌ No se obtuvo token de acceso")
            return False
            
        print("✅ Login exitoso")
        
        # Datos para crear secretaria
        secretary_data = {
            "username": "test_secretary_api",
            "email": "test_api@example.com",
            "first_name": "Test",
            "last_name": "Secretary",
            "phone_number": "1234567890",
            "password": "testpassword123",
            "employee_id": "SEC002",
            "department": "Administración",
            "shift_start": "08:00:00",
            "shift_end": "16:00:00",
            "hire_date": "2025-09-27",
            "can_manage_appointments": True,
            "can_manage_patients": False,
            "can_view_reports": True
        }
        
        # Headers con autenticación y CSRF
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}',
            'X-CSRFToken': csrf_token,
        }
        
        print(f"📋 Enviando datos: {json.dumps(secretary_data, indent=2)}")
        
        # Crear secretaria
        response = requests.post(
            'http://127.0.0.1:8000/api/users/secretaries/',
            json=secretary_data,
            headers=headers
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Respuesta completa: {response.text}")
        
        if response.status_code == 201:
            print("✅ Secretaria creada exitosamente")
            return True
        else:
            print(f"❌ Error {response.status_code}")
            try:
                error_data = response.json()
                print(f"📋 Detalles del error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"📋 Respuesta no JSON: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def cleanup_test_data():
    """Limpiar datos de prueba"""
    print("\n🧹 Limpiando datos de prueba...")
    
    test_usernames = ['test_secretary_debug', 'test_secretary_api']
    
    for username in test_usernames:
        try:
            user = User.objects.get(username=username)
            user.delete()
            print(f"🗑️ Usuario {username} eliminado")
        except User.DoesNotExist:
            print(f"ℹ️ Usuario {username} no existe")
        except Exception as e:
            print(f"❌ Error eliminando {username}: {e}")

if __name__ == "__main__":
    print("🧪 Iniciando depuración detallada de creación de secretarias...")
    print("=" * 60)
    
    # Limpiar datos previos
    cleanup_test_data()
    
    # Probar serializer
    serializer_ok, test_data = test_serializer_validation()
    
    if serializer_ok:
        # Probar permisos
        permissions_ok = test_viewset_permissions()
        
        if permissions_ok:
            # Probar endpoint completo
            api_ok = test_api_endpoint_with_auth()
        else:
            print("❌ Falló la prueba de permisos")
    else:
        print("❌ Falló la validación del serializer")
    
    # Limpiar al final
    cleanup_test_data()
    
    print("\n🏁 Depuración completada")