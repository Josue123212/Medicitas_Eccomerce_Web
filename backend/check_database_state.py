#!/usr/bin/env python
"""
Script para verificar el estado de la base de datos y limpiar registros problemáticos.
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.doctors.models import Doctor
from apps.users.models import User

def check_database_state():
    """Verifica el estado actual de la base de datos."""
    
    print("🔍 Verificando estado de la base de datos...")
    
    # Contar usuarios
    total_users = User.objects.count()
    doctor_users = User.objects.filter(role='doctor').count()
    
    print(f"👥 Total usuarios: {total_users}")
    print(f"👨‍⚕️ Usuarios doctor: {doctor_users}")
    
    # Contar doctores
    total_doctors = Doctor.objects.count()
    print(f"🏥 Total doctores: {total_doctors}")
    
    # Verificar doctores sin usuario o con usuario duplicado
    doctors_without_user = Doctor.objects.filter(user__isnull=True).count()
    print(f"❌ Doctores sin usuario: {doctors_without_user}")
    
    # Buscar usuarios duplicados en doctores
    user_ids_in_doctors = Doctor.objects.values_list('user_id', flat=True)
    duplicate_user_ids = []
    seen_user_ids = set()
    
    for user_id in user_ids_in_doctors:
        if user_id in seen_user_ids:
            duplicate_user_ids.append(user_id)
        else:
            seen_user_ids.add(user_id)
    
    if duplicate_user_ids:
        print(f"⚠️ User IDs duplicados en doctores: {duplicate_user_ids}")
        
        # Mostrar detalles de los duplicados
        for user_id in duplicate_user_ids:
            doctors_with_same_user = Doctor.objects.filter(user_id=user_id)
            print(f"   User ID {user_id} está asociado a {doctors_with_same_user.count()} doctores:")
            for doctor in doctors_with_same_user:
                print(f"     - Doctor ID: {doctor.id}, Especialidad: {doctor.specialization}")
    else:
        print("✅ No hay user IDs duplicados en doctores")
    
    # Mostrar últimos doctores creados
    print("\n📋 Últimos 5 doctores creados:")
    recent_doctors = Doctor.objects.select_related('user').order_by('-created_at')[:5]
    for doctor in recent_doctors:
        print(f"   - ID: {doctor.id}, Usuario: {doctor.user.username if doctor.user else 'Sin usuario'}, Especialidad: {doctor.specialization}")

def clean_duplicate_doctors():
    """Limpia doctores duplicados manteniendo solo el más reciente."""
    
    print("\n🧹 Limpiando doctores duplicados...")
    
    # Buscar user IDs duplicados
    user_ids_in_doctors = Doctor.objects.values_list('user_id', flat=True)
    duplicate_user_ids = []
    seen_user_ids = set()
    
    for user_id in user_ids_in_doctors:
        if user_id in seen_user_ids:
            duplicate_user_ids.append(user_id)
        else:
            seen_user_ids.add(user_id)
    
    if not duplicate_user_ids:
        print("✅ No hay duplicados para limpiar")
        return
    
    for user_id in set(duplicate_user_ids):  # Usar set para evitar duplicados
        doctors_with_same_user = Doctor.objects.filter(user_id=user_id).order_by('-created_at')
        
        if doctors_with_same_user.count() > 1:
            # Mantener el más reciente, eliminar los demás
            doctors_to_delete = doctors_with_same_user[1:]  # Todos excepto el primero (más reciente)
            
            print(f"   🗑️ Eliminando {len(doctors_to_delete)} doctores duplicados para user_id {user_id}")
            for doctor in doctors_to_delete:
                print(f"      - Eliminando Doctor ID: {doctor.id}")
                doctor.delete()

if __name__ == "__main__":
    check_database_state()
    
    # Preguntar si limpiar duplicados
    print("\n" + "="*50)
    print("¿Deseas limpiar los doctores duplicados? (y/n)")
    # Para script automático, siempre limpiar
    clean_duplicate_doctors()
    
    print("\n" + "="*50)
    print("🔍 Estado después de la limpieza:")
    check_database_state()