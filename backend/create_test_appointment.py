#!/usr/bin/env python
"""
Script para crear una cita de prueba en estado 'scheduled'
"""

import os
import sys
import django
from datetime import date, time, timedelta

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.appointments.models import Appointment
from apps.patients.models import Patient
from apps.doctors.models import Doctor

def create_test_appointment():
    """Crear una cita de prueba para testing"""
    
    print("🏥 CREANDO CITA DE PRUEBA")
    print("=" * 50)
    
    try:
        # Buscar un paciente y un doctor
        patient = Patient.objects.first()
        doctor = Doctor.objects.first()
        
        if not patient:
            print("❌ No se encontró ningún paciente")
            return
            
        if not doctor:
            print("❌ No se encontró ningún doctor")
            return
        
        # Crear cita para mañana
        tomorrow = date.today() + timedelta(days=1)
        appointment_time = time(10, 0)  # 10:00 AM
        
        # Verificar si ya existe una cita en esa fecha/hora
        existing = Appointment.objects.filter(
            doctor=doctor,
            date=tomorrow,
            time=appointment_time
        ).first()
        
        if existing:
            print(f"✅ Ya existe una cita de prueba: ID {existing.id}")
            print(f"   Paciente: {existing.patient.get_full_name()}")
            print(f"   Doctor: {existing.doctor.get_full_name()}")
            print(f"   Fecha: {existing.date}")
            print(f"   Hora: {existing.time}")
            print(f"   Estado: {existing.status}")
            return existing.id
        
        # Crear nueva cita
        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            date=tomorrow,
            time=appointment_time,
            status='scheduled',
            reason='Consulta de prueba para testing',
            notes='Cita creada automáticamente para probar funcionalidad de confirmación'
        )
        
        print(f"✅ Cita creada exitosamente: ID {appointment.id}")
        print(f"   Paciente: {appointment.patient.get_full_name()}")
        print(f"   Doctor: {appointment.doctor.get_full_name()}")
        print(f"   Fecha: {appointment.date}")
        print(f"   Hora: {appointment.time}")
        print(f"   Estado: {appointment.status}")
        
        return appointment.id
        
    except Exception as e:
        print(f"❌ Error al crear la cita: {e}")
        return None

if __name__ == "__main__":
    appointment_id = create_test_appointment()
    if appointment_id:
        print(f"\n🎯 Puedes usar la cita ID {appointment_id} para probar la confirmación")