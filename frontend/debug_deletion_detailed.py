#!/usr/bin/env python3
"""
Script detallado para debuggear la eliminación de pacientes
"""
import requests
import json

# URLs
BASE_URL = "http://localhost:8000"
CSRF_URL = f"{BASE_URL}/api/users/auth/csrf/"
LOGIN_URL = f"{BASE_URL}/api/users/auth/login/"
PATIENTS_URL = f"{BASE_URL}/api/patients/"

def debug_patient_deletion():
    session = requests.Session()
    
    try:
        # 1. Obtener token CSRF
        print("🔐 1. Obteniendo token CSRF...")
        csrf_response = session.get(CSRF_URL)
        if csrf_response.status_code == 200:
            csrf_data = csrf_response.json()
            csrf_token = csrf_data.get('csrf_token')
            print(f"✅ Token CSRF obtenido: {csrf_token[:20]}...")
        else:
            print(f"❌ Error obteniendo CSRF: {csrf_response.status_code}")
            return False
        
        # 2. Login
        print("\n🔑 2. Iniciando sesión...")
        login_data = {
            "email_or_username": "test@admin.com",
            "password": "testpass123"
        }
        
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token,
            'Referer': BASE_URL
        }
        
        login_response = session.post(LOGIN_URL, json=login_data, headers=headers)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            access_token = login_result.get('data', {}).get('access')
            print(f"✅ Login exitoso")
        else:
            print(f"❌ Error en login: {login_response.status_code}")
            return False
        
        # 3. Obtener TODOS los pacientes (sin paginación)
        print("\n📋 3. Obteniendo TODOS los pacientes...")
        auth_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Obtener todos los pacientes con un límite alto
        all_patients_url = f"{PATIENTS_URL}?page_size=1000"
        patients_response = session.get(all_patients_url, headers=auth_headers)
        
        if patients_response.status_code == 200:
            patients_data = patients_response.json()
            patients = patients_data.get('results', [])
            total_count = patients_data.get('count', 0)
            print(f"✅ Se encontraron {len(patients)} pacientes de {total_count} totales")
            
            if not patients:
                print("❌ No hay pacientes para eliminar")
                return False
                
            # Mostrar los primeros 5 pacientes con detalles
            print("\n📝 Primeros 5 pacientes:")
            for i, patient in enumerate(patients[:5]):
                print(f"  {i+1}. ID: {patient.get('id')} - {patient.get('full_name')} - Email: {patient.get('email')}")
            
            # Seleccionar el primer paciente para eliminar
            patient_to_delete = patients[0]
            patient_id = patient_to_delete.get('id')
            patient_name = patient_to_delete.get('full_name')
            print(f"\n🎯 Paciente seleccionado para eliminar: {patient_name} (ID {patient_id})")
            
        else:
            print(f"❌ Error obteniendo pacientes: {patients_response.status_code}")
            print(f"Respuesta: {patients_response.text}")
            return False
        
        # 4. Eliminar paciente
        print(f"\n🗑️ 4. Eliminando paciente ID {patient_id}...")
        delete_url = f"{PATIENTS_URL}{patient_id}/"
        
        # Incluir CSRF token en headers para DELETE
        delete_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token,
            'Referer': BASE_URL
        }
        
        delete_response = session.delete(delete_url, headers=delete_headers)
        
        print(f"Status Code: {delete_response.status_code}")
        print(f"Response Headers: {dict(delete_response.headers)}")
        
        if delete_response.status_code == 204:
            print(f"✅ Paciente ID {patient_id} eliminado exitosamente")
        else:
            print(f"❌ Error eliminando paciente: {delete_response.status_code}")
            print(f"Respuesta: {delete_response.text}")
            return False
        
        # 5. Verificar eliminación con nueva consulta
        print(f"\n🔍 5. Verificando eliminación...")
        verify_response = session.get(all_patients_url, headers=auth_headers)
        
        if verify_response.status_code == 200:
            new_patients_data = verify_response.json()
            new_patients = new_patients_data.get('results', [])
            new_total_count = new_patients_data.get('count', 0)
            print(f"✅ Ahora hay {len(new_patients)} pacientes de {new_total_count} totales")
            print(f"📊 Diferencia: {len(patients) - len(new_patients)} pacientes")
            
            # Verificar que el paciente específico ya no existe
            deleted_patient_exists = any(p.get('id') == patient_id for p in new_patients)
            if not deleted_patient_exists:
                print(f"✅ Confirmado: Paciente ID {patient_id} ya no existe en la lista")
                return True
            else:
                print(f"❌ Error: Paciente ID {patient_id} aún existe en la lista")
                # Mostrar información del paciente que aún existe
                existing_patient = next((p for p in new_patients if p.get('id') == patient_id), None)
                if existing_patient:
                    print(f"📋 Paciente encontrado: {json.dumps(existing_patient, indent=2)}")
                return False
        else:
            print(f"❌ Error verificando eliminación: {verify_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Debug detallado de eliminación de pacientes...")
    success = debug_patient_deletion()
    if success:
        print("\n🎉 ¡Eliminación exitosa!")
    else:
        print("\n💥 Eliminación falló")