#!/usr/bin/env python
"""
Script para verificar que las citas se muestran correctamente
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def verify_appointments_display():
    """Verifica que las citas se muestren correctamente"""
    print("🔍 Verificando visualización de citas...")
    
    # Login
    login_data = {
        "username": "Pedro",
        "password": "pedro123"
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('access')
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Obtener appointments
            appointments_response = requests.get(f"{BASE_URL}/doctors/me/appointments/", headers=headers)
            
            if appointments_response.status_code == 200:
                data = appointments_response.json()
                appointments = data['data']['appointments']
                
                print(f"✅ Se encontraron {len(appointments)} citas")
                print("\n📋 Estructura de datos verificada:")
                
                if appointments:
                    first_apt = appointments[0]
                    print(f"✅ ID: {first_apt['id']}")
                    print(f"✅ Paciente: {first_apt['patient']['name']}")
                    print(f"✅ Email: {first_apt['patient']['email']}")
                    print(f"✅ Fecha: {first_apt['appointment_date']}")
                    print(f"✅ Hora: {first_apt['appointment_time']}")
                    print(f"✅ Estado: {first_apt['status']}")
                    print(f"✅ Motivo: {first_apt['reason']}")
                    
                    print("\n🎯 Campos que el frontend ahora puede mostrar:")
                    print(f"- Nombre del paciente: {first_apt['patient']['name']}")
                    print(f"- Fecha de la cita: {first_apt['appointment_date']}")
                    print(f"- Hora de la cita: {first_apt['appointment_time']}")
                    print(f"- Estado: {first_apt['status']}")
                    
                    print("\n✅ ¡Los datos están correctamente estructurados para el frontend!")
                else:
                    print("⚠️ No hay citas disponibles para mostrar")
            else:
                print(f"❌ Error al obtener citas: {appointments_response.text}")
        else:
            print(f"❌ Error de login: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    verify_appointments_display()