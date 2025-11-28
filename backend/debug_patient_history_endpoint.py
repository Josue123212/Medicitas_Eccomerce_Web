#!/usr/bin/env python3
"""
Script para debuggear el endpoint de historial médico del paciente
"""

import os
import sys
import django
from datetime import datetime, date

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.patients.models import Patient
from apps.appointments.models import Appointment
from apps.appointments.views import PatientHistoryView
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

def debug_patient_history():
    print("🔍 DEBUGGING PATIENT HISTORY ENDPOINT")
    print("=" * 50)
    
    # 1. Verificar usuario Josué
    try:
        user = User.objects.get(email='josue@gmail.com')
        print(f"✅ Usuario encontrado: {user.email} (ID: {user.id})")
        print(f"   - Rol: {user.role}")
        print(f"   - Activo: {user.is_active}")
    except User.DoesNotExist:
        print("❌ Usuario josue@gmail.com no encontrado")
        return
    
    # 2. Verificar perfil de paciente
    try:
        patient = Patient.objects.get(user=user)
        print(f"✅ Paciente encontrado: ID {patient.id}")
        print(f"   - Teléfono: {patient.phone_number}")
        print(f"   - Dirección: {patient.address}")
    except Patient.DoesNotExist:
        print("❌ Perfil de paciente no encontrado")
        return
    
    # 3. Verificar citas del paciente
    appointments = Appointment.objects.filter(patient=patient)
    print(f"\n📅 CITAS DEL PACIENTE (Total: {appointments.count()})")
    print("-" * 30)
    
    for i, appointment in enumerate(appointments, 1):
        print(f"{i}. ID: {appointment.id}")
        print(f"   - Fecha: {appointment.date}")
        print(f"   - Hora: {appointment.time}")
        print(f"   - Doctor: {appointment.doctor.full_name}")
        print(f"   - Especialidad: {appointment.doctor.specialization}")
        print(f"   - Estado: {appointment.status}")
        print(f"   - Creado: {appointment.created_at}")
        print()
    
    # 4. Filtrar por año 2025
    appointments_2025 = appointments.filter(
        date__year=2025
    )
    print(f"📅 CITAS EN 2025: {appointments_2025.count()}")
    
    # 5. Simular llamada al endpoint
    print("\n🌐 SIMULANDO LLAMADA AL ENDPOINT")
    print("-" * 40)
    
    factory = RequestFactory()
    
    # Simular request GET con parámetros
    request = factory.get('/appointments/patient-history/', {
        'patient_id': patient.id,
        'date_from': '2025-01-01',
        'date_to': '2025-12-31'
    })
    request.user = user
    
    # Crear vista y procesar
    view = PatientHistoryView()
    view.request = request
    
    try:
        response = view.get(request)
        print(f"✅ Status Code: {response.status_code}")
        
        if hasattr(response, 'data'):
            data = response.data
            print(f"📊 Respuesta del endpoint:")
            print(f"   - appointments: {len(data.get('appointments', []))}")
            print(f"   - summary: {data.get('summary', {})}")
            
            if data.get('appointments'):
                print("\n📋 CITAS EN LA RESPUESTA:")
                for i, apt in enumerate(data['appointments'], 1):
                    print(f"   {i}. {apt.get('date')} - {apt.get('doctor_name')} ({apt.get('status')})")
        else:
            print(f"❌ No hay data en la respuesta")
            
    except Exception as e:
        print(f"❌ Error al procesar endpoint: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_patient_history()