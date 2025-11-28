#!/usr/bin/env python
"""
Script para encontrar y arreglar registros huérfanos y conflictos de ID.
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
from django.db import connection

def find_orphaned_records():
    """Encuentra registros huérfanos y conflictos."""
    
    print("🔍 Buscando registros huérfanos y conflictos...")
    
    # 1. Doctores que apuntan a usuarios que no existen
    orphaned_doctors = []
    for doctor in Doctor.objects.all():
        try:
            user = doctor.user
            if not user:
                orphaned_doctors.append(doctor)
        except User.DoesNotExist:
            orphaned_doctors.append(doctor)
    
    if orphaned_doctors:
        print(f"👻 Doctores huérfanos encontrados: {len(orphaned_doctors)}")
        for doctor in orphaned_doctors:
            print(f"   - Doctor ID: {doctor.id}, user_id: {doctor.user_id}")
    else:
        print("✅ No hay doctores huérfanos")
    
    # 2. Verificar user_ids que están en doctores pero no en usuarios
    doctor_user_ids = set(Doctor.objects.values_list('user_id', flat=True))
    existing_user_ids = set(User.objects.values_list('id', flat=True))
    
    missing_user_ids = doctor_user_ids - existing_user_ids
    if missing_user_ids:
        print(f"❌ User IDs en doctores que no existen en usuarios: {missing_user_ids}")
    else:
        print("✅ Todos los user_ids en doctores existen en usuarios")
    
    # 3. Verificar el próximo ID que se asignará
    with connection.cursor() as cursor:
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='users_user';")
        result = cursor.fetchone()
        next_user_id = result[0] + 1 if result else 1
        print(f"📊 Próximo user_id que se asignará: {next_user_id}")
        
        # Verificar si ese ID ya está en uso en doctores
        conflicting_doctor = Doctor.objects.filter(user_id=next_user_id).first()
        if conflicting_doctor:
            print(f"⚠️ CONFLICTO: El próximo user_id ({next_user_id}) ya está en uso por doctor ID {conflicting_doctor.id}")
        else:
            print(f"✅ El próximo user_id ({next_user_id}) está libre")
    
    return orphaned_doctors, missing_user_ids

def fix_orphaned_records(orphaned_doctors, missing_user_ids):
    """Arregla los registros huérfanos."""
    
    if not orphaned_doctors and not missing_user_ids:
        print("✅ No hay nada que arreglar")
        return
    
    print("\n🔧 Arreglando registros huérfanos...")
    
    # Eliminar doctores huérfanos
    for doctor in orphaned_doctors:
        print(f"🗑️ Eliminando doctor huérfano ID: {doctor.id}")
        doctor.delete()
    
    # Verificar doctores con user_ids que no existen
    for user_id in missing_user_ids:
        doctors_with_missing_user = Doctor.objects.filter(user_id=user_id)
        for doctor in doctors_with_missing_user:
            print(f"🗑️ Eliminando doctor ID: {doctor.id} con user_id inexistente: {user_id}")
            doctor.delete()

def reset_sequences():
    """Resetea las secuencias de auto-incremento."""
    
    print("\n🔄 Reseteando secuencias...")
    
    with connection.cursor() as cursor:
        # Obtener el máximo ID actual de usuarios
        max_user_id = User.objects.aggregate(max_id=models.Max('id'))['max_id'] or 0
        
        # Actualizar la secuencia
        cursor.execute(f"UPDATE sqlite_sequence SET seq = {max_user_id} WHERE name = 'users_user';")
        
        print(f"✅ Secuencia de usuarios actualizada a: {max_user_id}")

if __name__ == "__main__":
    # Importar models después de setup
    from django.db import models
    
    orphaned_doctors, missing_user_ids = find_orphaned_records()
    
    if orphaned_doctors or missing_user_ids:
        print("\n" + "="*50)
        print("¿Deseas arreglar estos problemas? (Automático: SÍ)")
        fix_orphaned_records(orphaned_doctors, missing_user_ids)
        reset_sequences()
        
        print("\n" + "="*50)
        print("🔍 Verificando después de la corrección:")
        find_orphaned_records()
    
    print("\n🎉 ¡Corrección completada!")