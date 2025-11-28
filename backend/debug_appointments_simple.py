#!/usr/bin/env python
"""
Script simple para debuggear la API de appointments
"""
import requests
import json

# URL base de la API
BASE_URL = "http://localhost:8000/api"

def test_appointments_api():
    """Prueba la API de appointments"""
    print("🔍 Testing Appointments API...")
    
    # Primero, hacer login para obtener token
    login_data = {
        "username": "Pedro",
        "password": "pedro123"
    }
    
    try:
        # Login
        print("📝 Logging in...")
        login_response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            print(f"Login response: {login_result}")
            token = login_result.get('access_token') or login_result.get('access') or login_result.get('token')
            if token:
                print(f"✅ Login successful, token: {token[:20]}...")
            else:
                print(f"❌ No token found in response: {login_result}")
                return
            
            # Headers con token
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Obtener appointments del doctor
            print("\n📅 Getting doctor appointments...")
            appointments_response = requests.get(f"{BASE_URL}/doctors/me/appointments/", headers=headers)
            print(f"Appointments status: {appointments_response.status_code}")
            
            if appointments_response.status_code == 200:
                appointments_data = appointments_response.json()
                print(f"✅ Appointments response structure:")
                print(f"Keys: {list(appointments_data.keys())}")
                
                if 'appointments' in appointments_data:
                    appointments = appointments_data['appointments']
                    print(f"📊 Found {len(appointments)} appointments")
                    
                    if appointments:
                        print("\n🔍 First appointment structure:")
                        first_appointment = appointments[0]
                        print(json.dumps(first_appointment, indent=2, default=str))
                        
                        # Verificar campos específicos
                        print("\n🎯 Checking specific fields:")
                        print(f"patient_info keys: {list(first_appointment.get('patient_info', {}).keys())}")
                        print(f"doctor_info keys: {list(first_appointment.get('doctor_info', {}).keys())}")
                        
                        patient_info = first_appointment.get('patient_info', {})
                        doctor_info = first_appointment.get('doctor_info', {})
                        
                        print(f"patient_info.full_name: {patient_info.get('full_name', 'NOT FOUND')}")
                        print(f"doctor_info.full_name: {doctor_info.get('full_name', 'NOT FOUND')}")
                    else:
                        print("⚠️ No appointments found")
                else:
                    print("❌ No 'appointments' key in response")
                    print(f"Response: {appointments_data}")
            else:
                print(f"❌ Failed to get appointments: {appointments_response.text}")
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_appointments_api()