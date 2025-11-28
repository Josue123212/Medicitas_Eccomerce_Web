#!/usr/bin/env python3
"""
Script para crear citas de prueba para el doctor Pedro García
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.appointments.models import Appointment

def create_test_appointments():
    """Crear citas de prueba para el doctor Pedro"""
    
    # Buscar al doctor Pedro
    try:
        pedro_user = User.objects.get(username='pedro')
        pedro_doctor = Doctor.objects.get(user=pedro_user)
        print(f"✅ Doctor encontrado: {pedro_doctor.user.get_full_name()}")
    except (User.DoesNotExist, Doctor.DoesNotExist):
        print("❌ Doctor Pedro no encontrado")
        return
    
    # Buscar algunos pacientes
    patients = Patient.objects.all()[:5]
    if not patients:
        print("❌ No hay pacientes disponibles")
        return
    
    print(f"✅ Pacientes encontrados: {len(patients)}")
    
    # Crear citas para los próximos días
    base_date = datetime.now().date()
    time_slots = ['09:00', '10:30', '14:00', '15:30', '17:00']
    statuses = ['pending', 'confirmed', 'completed']
    reasons = [
        'Consulta general',
        'Control de seguimiento',
        'Revisión de tratamiento',
        'Primera consulta',
        'Urgencia médica'
    ]
    
    appointments_created = 0
    
    for i in range(10):  # Crear 10 citas
        appointment_date = base_date + timedelta(days=i % 7)  # Distribuir en una semana
        patient = patients[i % len(patients)]
        time_slot = time_slots[i % len(time_slots)]
        status = statuses[i % len(statuses)]
        reason = reasons[i % len(reasons)]
        
        # Verificar si ya existe una cita similar
        existing = Appointment.objects.filter(
            doctor=pedro_doctor,
            patient=patient,
            date=appointment_date,
            time=time_slot
        ).first()
        
        if not existing:
            appointment = Appointment.objects.create(
                doctor=pedro_doctor,
                patient=patient,
                date=appointment_date,
                time=time_slot,
                reason=reason,
                status=status,
                notes=f"Cita de prueba #{i+1}",
                duration=30
            )
            appointments_created += 1
            print(f"✅ Cita creada: {appointment.date} {appointment.time} - {patient.user.get_full_name()}")
    
    print(f"\n🎉 Total de citas creadas: {appointments_created}")
    
    # Mostrar resumen de citas del doctor
    total_appointments = Appointment.objects.filter(doctor=pedro_doctor).count()
    print(f"📊 Total de citas del Dr. {pedro_doctor.user.get_full_name()}: {total_appointments}")

if __name__ == '__main__':
    create_test_appointments()