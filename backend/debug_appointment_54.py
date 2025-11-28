#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor

User = get_user_model()

def main():
    print("🔍 DEBUGGING CITA 54 Y RELACIÓN CON DOCTOR")
    print("=" * 60)
    
    try:
        # Buscar la cita 54
        appointment = Appointment.objects.get(id=54)
        print(f"📅 Cita encontrada:")
        print(f"   ID: {appointment.id}")
        print(f"   Estado: {appointment.status}")
        print(f"   Fecha: {appointment.date}")
        print(f"   Hora: {appointment.time}")
        print(f"   Doctor ID: {appointment.doctor.id if appointment.doctor else 'None'}")
        print(f"   Doctor User ID: {appointment.doctor.user.id if appointment.doctor and appointment.doctor.user else 'None'}")
        print(f"   Paciente ID: {appointment.patient.id if appointment.patient else 'None'}")
        
        # Buscar el doctor con role='doctor'
        doctor_user = User.objects.filter(role='doctor').first()
        if doctor_user:
            print(f"\n👨‍⚕️ Doctor encontrado:")
            print(f"   User ID: {doctor_user.id}")
            print(f"   Username: {doctor_user.username}")
            print(f"   Role: {doctor_user.role}")
            
            # Verificar si tiene perfil de doctor
            try:
                doctor_profile = Doctor.objects.get(user=doctor_user)
                print(f"   Doctor Profile ID: {doctor_profile.id}")
                print(f"   Especialización: {doctor_profile.specialization}")
            except Doctor.DoesNotExist:
                print(f"   ❌ No tiene perfil de doctor")
                
            # Verificar si es el doctor asignado a la cita
            if appointment.doctor and appointment.doctor.user.id == doctor_user.id:
                print(f"   ✅ ES el doctor asignado a la cita 54")
            else:
                print(f"   ❌ NO es el doctor asignado a la cita 54")
                
        # Listar todos los doctores disponibles
        print(f"\n📋 Todos los doctores en el sistema:")
        doctors = Doctor.objects.all()
        for doc in doctors:
            print(f"   - Doctor ID: {doc.id}, User ID: {doc.user.id}, Username: {doc.user.username}")
            
    except Appointment.DoesNotExist:
        print("❌ La cita 54 no existe")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()