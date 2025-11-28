#!/usr/bin/env python
"""
Script para verificar usuarios y perfiles de pacientes
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.patients.models import Patient

def main():
    print("=== VERIFICACIÓN DE USUARIOS Y PERFILES DE PACIENTES ===\n")
    
    # Verificar usuarios
    users = User.objects.all()
    print(f"📊 Total de usuarios: {users.count()}")
    
    for user in users:
        print(f"👤 Usuario: {user.email}")
        print(f"   - ID: {user.id}")
        print(f"   - Role: {user.role}")
        print(f"   - Nombre: {user.first_name} {user.last_name}")
        print(f"   - Activo: {user.is_active}")
        print()
    
    # Verificar pacientes
    patients = Patient.objects.all()
    print(f"🏥 Total de perfiles de pacientes: {patients.count()}")
    
    for patient in patients:
        print(f"🩺 Paciente: {patient.user.email}")
        print(f"   - ID del perfil: {patient.id}")
        print(f"   - ID del usuario: {patient.user.id}")
        print(f"   - Teléfono: {patient.phone}")
        print(f"   - Fecha de nacimiento: {patient.date_of_birth}")
        print()
    
    # Verificar usuarios sin perfil de paciente
    users_without_patient_profile = []
    for user in users:
        if user.role == 'client':
            try:
                patient = Patient.objects.get(user=user)
            except Patient.DoesNotExist:
                users_without_patient_profile.append(user)
    
    if users_without_patient_profile:
        print("⚠️  USUARIOS CLIENTE SIN PERFIL DE PACIENTE:")
        for user in users_without_patient_profile:
            print(f"   - {user.email} (ID: {user.id})")
        print()
    else:
        print("✅ Todos los usuarios cliente tienen perfil de paciente")
        print()
    
    # Verificar la relación patient_profile_id
    print("🔗 VERIFICACIÓN DE PATIENT_PROFILE_ID:")
    for user in users:
        if user.role == 'client':
            try:
                patient = Patient.objects.get(user=user)
                print(f"✅ {user.email} -> patient_profile_id debería ser: {patient.id}")
            except Patient.DoesNotExist:
                print(f"❌ {user.email} -> NO TIENE PERFIL DE PACIENTE")

if __name__ == '__main__':
    main()