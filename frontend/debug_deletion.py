import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:8000/api"
LOGIN_URL = f"{BASE_URL}/auth/login/"
PATIENTS_URL = f"{BASE_URL}/patients/"

def test_patient_deletion():
    """
    Prueba la eliminación de pacientes desde el frontend
    """
    print("🔍 Probando eliminación de pacientes desde el frontend...")
    
    # 1. Obtener token de autenticación
    print("\n1. Obteniendo token de autenticación...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"✅ Token obtenido: {token[:20]}...")
        else:
            print(f"❌ Error al obtener token: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # Headers con autenticación
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Obtener lista de pacientes
    print("\n2. Obteniendo lista de pacientes...")
    try:
        response = requests.get(PATIENTS_URL, headers=headers)
        if response.status_code == 200:
            patients = response.json().get('results', [])
            print(f"✅ Pacientes encontrados: {len(patients)}")
            
            # Mostrar algunos pacientes
            for i, patient in enumerate(patients[:3]):
                print(f"   - Paciente {i+1}: {patient.get('full_name')} (ID: {patient.get('id')})")
        else:
            print(f"❌ Error al obtener pacientes: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 3. Intentar eliminar un paciente específico
    if patients:
        patient_to_delete = patients[0]  # Tomar el primer paciente
        patient_id = patient_to_delete.get('id')
        patient_name = patient_to_delete.get('full_name')
        
        print(f"\n3. Intentando eliminar paciente: {patient_name} (ID: {patient_id})")
        
        delete_url = f"{PATIENTS_URL}{patient_id}/"
        
        try:
            response = requests.delete(delete_url, headers=headers)
            print(f"Status Code: {response.status_code}")
            print(f"Headers de respuesta: {dict(response.headers)}")
            
            if response.status_code == 204:
                print("✅ Paciente eliminado exitosamente")
            elif response.status_code == 400:
                error_data = response.json()
                print(f"⚠️ Error de validación: {error_data}")
            else:
                print(f"❌ Error inesperado: {response.status_code}")
                print(f"Respuesta: {response.text}")
                
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
    
    # 4. Verificar que la lista se actualizó
    print("\n4. Verificando lista actualizada...")
    try:
        response = requests.get(PATIENTS_URL, headers=headers)
        if response.status_code == 200:
            updated_patients = response.json().get('results', [])
            print(f"✅ Pacientes después de eliminación: {len(updated_patients)}")
            
            if len(updated_patients) < len(patients):
                print("✅ La eliminación fue exitosa - lista actualizada")
            else:
                print("⚠️ La lista no cambió - posible problema")
        else:
            print(f"❌ Error al verificar lista: {response.status_code}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_patient_deletion()