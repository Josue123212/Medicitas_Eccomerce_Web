#!/usr/bin/env python
"""
Script para debuggear el problema de constraint en la base de datos.
"""

import os
import sys
import django
from datetime import datetime

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.doctors.models import Doctor
from apps.users.models import User
from django.db import connection

def investigate_constraint():
    """Investiga el problema de constraint."""
    
    print("🔍 Investigando el problema de constraint...")
    
    # 1. Verificar el esquema de la tabla
    with connection.cursor() as cursor:
        cursor.execute("PRAGMA table_info(doctors_doctor);")
        columns = cursor.fetchall()
        
        print("\n📋 Esquema de la tabla doctors_doctor:")
        for col in columns:
            print(f"   - {col[1]} ({col[2]}) - NOT NULL: {col[3]} - DEFAULT: {col[4]} - PK: {col[5]}")
        
        # 2. Verificar índices y constraints
        cursor.execute("PRAGMA index_list(doctors_doctor);")
        indexes = cursor.fetchall()
        
        print("\n🔗 Índices en doctors_doctor:")
        for idx in indexes:
            print(f"   - {idx[1]} - UNIQUE: {idx[2]}")
            
            # Obtener detalles del índice
            cursor.execute(f"PRAGMA index_info({idx[1]});")
            idx_info = cursor.fetchall()
            for info in idx_info:
                print(f"     └─ Columna: {info[2]}")
    
    # 3. Verificar datos actuales
    print(f"\n📊 Datos actuales:")
    print(f"   - Total usuarios: {User.objects.count()}")
    print(f"   - Total doctores: {Doctor.objects.count()}")
    
    # 4. Verificar si hay user_ids duplicados o None
    user_ids = Doctor.objects.values_list('user_id', flat=True)
    print(f"   - User IDs en doctores: {list(user_ids)}")
    
    # 5. Intentar crear un usuario y ver qué pasa
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    
    try:
        print(f"\n🧪 Creando usuario de prueba...")
        user = User.objects.create_user(
            username=f'debug_user_{timestamp}',
            email=f'debug.{timestamp}@test.com',
            first_name='Debug',
            last_name='User',
            password='DebugPass123!',
            role='doctor'
        )
        print(f"✅ Usuario creado con ID: {user.id}")
        
        # Verificar si este user_id ya existe en doctores
        existing_doctor = Doctor.objects.filter(user_id=user.id).first()
        if existing_doctor:
            print(f"⚠️ Ya existe un doctor con user_id {user.id}: {existing_doctor.id}")
        else:
            print(f"✅ No hay doctor existente con user_id {user.id}")
        
        # Intentar crear el doctor
        print(f"🧪 Creando doctor...")
        doctor = Doctor(
            user=user,
            medical_license=f'DEBUG{timestamp}',
            specialization='Debug Specialty',
            years_experience=1,
            consultation_fee=50.00,
            bio='Debug doctor',
            work_days=['monday'],
            work_start_time='09:00',
            work_end_time='17:00',
            is_available=True
        )
        
        # Guardar paso a paso
        print(f"💾 Guardando doctor...")
        doctor.save()
        print(f"✅ Doctor creado con ID: {doctor.id}")
        
        # Limpiar
        doctor.delete()
        user.delete()
        print(f"🧹 Limpieza completada")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"   Tipo: {type(e)}")
        
        # Intentar limpiar en caso de error
        try:
            if 'user' in locals():
                user.delete()
        except:
            pass

if __name__ == "__main__":
    investigate_constraint()