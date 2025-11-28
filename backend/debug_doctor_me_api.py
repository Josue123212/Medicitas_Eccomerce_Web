#!/usr/bin/env python3
"""
🔍 DEBUG: API /api/doctors/me/
Script para verificar qué está devolviendo la API del perfil del doctor
"""

import os
import sys
import django
import json
from django.test import Client
from django.contrib.auth import get_user_model

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.doctors.models import DoctorProfile

def debug_doctor_me_api():
    """Debug de la API /api/doctors/me/"""
    
    print("🔍 DEBUG: API /api/doctors/me/")
    print("=" * 50)
    
    # Buscar un doctor activo
    try:
        doctor_user = User.objects.filter(role='doctor', is_active=True).first()
        if not doctor_user:
            print("❌ No se encontró ningún doctor activo")
            return
            
        print(f"✅ Doctor encontrado: {doctor_user.email}")
        print(f"   - ID: {doctor_user.id}")
        print(f"   - Nombre: {doctor_user.first_name} {doctor_user.last_name}")
        print(f"   - Role: {doctor_user.role}")
        
        # Verificar perfil de doctor
        try:
            doctor_profile = DoctorProfile.objects.get(user=doctor_user)
            print(f"✅ Perfil de doctor encontrado: ID {doctor_profile.id}")
            print(f"   - Especialización: {doctor_profile.specialization}")
            print(f"   - Licencia: {doctor_profile.medical_license}")
            print(f"   - Estado: {doctor_profile.status}")
            print(f"   - Disponible: {doctor_profile.is_available}")
        except DoctorProfile.DoesNotExist:
            print("❌ No se encontró perfil de doctor")
            return
        
        # Simular llamada a la API
        client = Client()
        
        # Hacer login para obtener token (simulando autenticación)
        login_response = client.post('/api/users/auth/login/', {
            'email_or_username': doctor_user.email,
            'password': 'password123'  # Asumiendo que todos tienen esta contraseña de prueba
        }, content_type='application/json')
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            access_token = login_data.get('access_token')
            
            if access_token:
                print(f"✅ Login exitoso, token obtenido")
                
                # Hacer llamada a /api/doctors/me/
                headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
                response = client.get('/api/doctors/me/', **headers)
                
                print(f"\n🔍 Respuesta de /api/doctors/me/:")
                print(f"   - Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   - Respuesta JSON:")
                    print(json.dumps(data, indent=2, ensure_ascii=False))
                    
                    # Verificar estructura
                    print(f"\n🔍 Análisis de estructura:")
                    print(f"   - Tiene 'user': {'user' in data}")
                    print(f"   - Tiene 'id': {'id' in data}")
                    print(f"   - Tiene 'specialization': {'specialization' in data}")
                    
                    if 'user' in data:
                        user_data = data['user']
                        print(f"   - user.first_name: {user_data.get('first_name', 'NO ENCONTRADO')}")
                        print(f"   - user.last_name: {user_data.get('last_name', 'NO ENCONTRADO')}")
                        print(f"   - user.email: {user_data.get('email', 'NO ENCONTRADO')}")
                    else:
                        print("   ❌ NO HAY CAMPO 'user' en la respuesta")
                        
                else:
                    print(f"   ❌ Error: {response.content.decode()}")
            else:
                print("❌ No se pudo obtener token de acceso")
        else:
            print(f"❌ Error en login: {login_response.status_code}")
            print(f"   Respuesta: {login_response.content.decode()}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_doctor_me_api()