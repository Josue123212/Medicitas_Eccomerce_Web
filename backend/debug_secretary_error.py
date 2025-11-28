#!/usr/bin/env python
"""
Script para debuggear el error al crear secretarias
"""
import os
import sys
import django
import json
import requests
from datetime import datetime, time

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import Secretary
from apps.users.serializers import SecretaryCreateSerializer

User = get_user_model()

def test_serializer_validation():
    """Probar la validación del serializer directamente"""
    print("🔍 Probando validación del serializer...")
    
    # Datos que envía el frontend (simulados)
    frontend_data = {
        "username": "test_secretary",
        "email": "test@example.com", 
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "Secretary",
        "phone_number": "1234567890",
        "employee_id": "EMP001",
        "department": "Recepción",
        "shift_start": "08:00",
        "shift_end": "16:00", 
        "hire_date": "2024-01-15",
        "can_manage_appointments": True,
        "can_manage_patients": False,
        "can_view_reports": False
    }
    
    print(f"📤 Datos enviados: {json.dumps(frontend_data, indent=2)}")
    
    # Probar el serializer
    serializer = SecretaryCreateSerializer(data=frontend_data)
    
    if serializer.is_valid():
        print("✅ Serializer válido")
        print(f"📥 Datos validados: {json.dumps(serializer.validated_data, indent=2, default=str)}")
        return True
    else:
        print("❌ Errores de validación:")
        for field, errors in serializer.errors.items():
            print(f"  - {field}: {errors}")
        return False

def test_api_endpoint():
    """Probar el endpoint de API directamente"""
    print("\n🌐 Probando endpoint de API...")
    
    # Primero obtener token de admin
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Login
        login_response = requests.post(
            "http://localhost:8000/api/users/auth/login/",
            json=login_data
        )
        
        if login_response.status_code != 200:
            print(f"❌ Error en login: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
            
        token = login_response.json().get('access')
        print(f"✅ Token obtenido: {token[:20]}...")
        
        # Datos para crear secretaria
        secretary_data = {
            "username": "api_test_secretary",
            "email": "apitest@example.com",
            "password": "testpass123", 
            "first_name": "API",
            "last_name": "Test",
            "phone_number": "9876543210",
            "employee_id": "API001",
            "department": "Recepción",
            "shift_start": "09:00",
            "shift_end": "17:00",
            "hire_date": "2024-01-15",
            "can_manage_appointments": True,
            "can_manage_patients": False,
            "can_view_reports": False
        }
        
        # Crear secretaria
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        create_response = requests.post(
            "http://localhost:8000/api/users/secretaries/",
            json=secretary_data,
            headers=headers
        )
        
        print(f"📊 Status Code: {create_response.status_code}")
        print(f"📄 Response: {create_response.text}")
        
        if create_response.status_code == 201:
            print("✅ Secretaria creada exitosamente")
            return True
        else:
            print("❌ Error al crear secretaria")
            return False
            
    except Exception as e:
        print(f"❌ Error en la prueba: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando debug de creación de secretarias...\n")
    
    # Probar serializer
    serializer_ok = test_serializer_validation()
    
    # Probar API
    api_ok = test_api_endpoint()
    
    print(f"\n📋 Resumen:")
    print(f"  - Serializer: {'✅' if serializer_ok else '❌'}")
    print(f"  - API: {'✅' if api_ok else '❌'}")