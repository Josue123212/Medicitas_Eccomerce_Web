#!/usr/bin/env python
"""
Script para debuggear las citas del doctor y verificar por qué no aparecen
"""

import os
import sys
import django
from datetime import date, timedelta

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.appointments.models import Appointment
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.users.models import User

def debug_doctor_appointments():
    """Debuggear las citas del doctor"""
    
    print("🔍 DEBUGGING CITAS DEL DOCTOR")
    print("=" * 60)
    
    # 1. Verificar todos los usuarios doctor
    print("👨‍⚕️ USUARIOS DOCTOR:")
    doctors = User.objects.filter(role='doctor')
    for doctor_user in doctors:
        try:
            doctor_profile = doctor_user.doctor
            print(f"   - {doctor_user.username} (ID: {doctor_user.id}) -> Doctor Profile ID: {doctor_profile.id}")
        except:
            print(f"   - {doctor_user.username} (ID: {doctor_user.id}) -> ❌ SIN PERFIL DE DOCTOR")
    
    print()
    
    # 2. Verificar todas las citas
    print("📅 TODAS LAS CITAS:")
    appointments = Appointment.objects.all().order_by('-created_at')[:10]
    for apt in appointments:
        print(f"   - ID: {apt.id} | Paciente: {apt.patient.get_full_name()} | Doctor: {apt.doctor.get_full_name()} | Fecha: {apt.date} | Estado: {apt.status}")
    
    print()
    
    # 3. Verificar citas por doctor específico
    print("🎯 CITAS POR DOCTOR:")
    for doctor_user in doctors:
        try:
            doctor_profile = doctor_user.doctor
            doctor_appointments = Appointment.objects.filter(doctor=doctor_profile)
            print(f"   Dr. {doctor_user.get_full_name()} ({doctor_profile.id}): {doctor_appointments.count()} citas")
            for apt in doctor_appointments[:3]:  # Mostrar solo las primeras 3
                print(f"      - ID: {apt.id} | {apt.date} {apt.time} | {apt.status}")
        except Exception as e:
            print(f"   {doctor_user.username}: Error - {e}")
    
    print()
    
    # 4. Verificar citas recientes (últimas 24 horas)
    print("🕐 CITAS RECIENTES (últimas 24 horas):")
    from django.utils import timezone
    yesterday = timezone.now() - timedelta(hours=24)
    recent_appointments = Appointment.objects.filter(created_at__gte=yesterday).order_by('-created_at')
    
    if recent_appointments:
        for apt in recent_appointments:
            print(f"   - ID: {apt.id} | Creada: {apt.created_at} | Paciente: {apt.patient.get_full_name()} | Doctor: {apt.doctor.get_full_name()}")
    else:
        print("   ❌ No hay citas creadas en las últimas 24 horas")
    
    print()
    
    # 5. Verificar el usuario que está logueado (simulando el que está en la sesión)
    print("🔐 SIMULANDO USUARIO LOGUEADO:")
    # Buscar el primer doctor disponible
    first_doctor = doctors.first()
    if first_doctor:
        try:
            doctor_profile = first_doctor.doctor
            print(f"   Usuario: {first_doctor.username} (ID: {first_doctor.id})")
            print(f"   Doctor Profile: {doctor_profile.id}")
            print(f"   Especialización: {doctor_profile.specialization}")
            
            # Simular la consulta que hace el frontend
            user_appointments = Appointment.objects.filter(doctor=doctor_profile)
            print(f"   Sus citas: {user_appointments.count()}")
            
            for apt in user_appointments:
                print(f"      - ID: {apt.id} | {apt.date} {apt.time} | {apt.status} | Paciente: {apt.patient.get_full_name()}")
                
        except Exception as e:
            print(f"   Error: {e}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    debug_doctor_appointments()