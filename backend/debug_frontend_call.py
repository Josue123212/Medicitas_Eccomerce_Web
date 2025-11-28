"""
Script para debuggear la llamada del frontend al endpoint patient-history
Ejecutar con: python manage.py shell < debug_frontend_call.py
"""

from apps.patients.models import Patient
from apps.appointments.models import Appointment
from django.contrib.auth.models import User
import requests

print("🔍 DEBUGGING FRONTEND CALL TO PATIENT-HISTORY")
print("=" * 50)

# 1. Verificar usuario josue
try:
    user = User.objects.get(username='josue')
    print(f"✅ Usuario encontrado: {user.username} ({user.email})")
    print(f"   - ID: {user.id}")
    print(f"   - Activo: {user.is_active}")
    
    # 2. Verificar perfil de paciente
    try:
        patient = Patient.objects.get(user=user)
        print(f"✅ Perfil de paciente encontrado: ID {patient.id}")
        print(f"   - Nombre completo: {patient.user.first_name} {patient.user.last_name}")
        
        # 3. Verificar citas del paciente
        appointments = Appointment.objects.filter(patient=patient)
        print(f"✅ Citas encontradas: {appointments.count()}")
        
        for apt in appointments:
            print(f"   - Cita {apt.id}: {apt.date} {apt.time} - {apt.status}")
        
        # 4. Simular llamada HTTP al endpoint
        print("\n🌐 SIMULANDO LLAMADA HTTP")
        print("-" * 30)
        
        # URL que debería usar el frontend
        url = f"http://localhost:8000/api/appointments/patient-history/"
        params = {
            'patient_id': patient.id,
            'date_from': '2025-01-01',
            'date_to': '2025-12-31'
        }
        
        print(f"URL: {url}")
        print(f"Parámetros: {params}")
        
        # Hacer la llamada (sin autenticación por ahora)
        try:
            response = requests.get(url, params=params)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Respuesta exitosa")
                print(f"   - Appointments: {len(data.get('appointments', []))}")
            else:
                print(f"❌ Error en la respuesta")
                
        except Exception as e:
            print(f"❌ Error en la llamada HTTP: {e}")
        
    except Patient.DoesNotExist:
        print(f"❌ No se encontró perfil de paciente para {user.username}")
        
except User.DoesNotExist:
    print(f"❌ Usuario 'josue' no encontrado")