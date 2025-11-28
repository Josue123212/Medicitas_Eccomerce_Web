#!/usr/bin/env python
"""
Script para sincronizar migraciones automáticamente
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.core.management.commands.migrate import Command as MigrateCommand

def check_table_exists(table_name):
    """Verificar si una tabla existe en la base de datos"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name=?;
        """, [table_name])
        return cursor.fetchone() is not None

def check_column_exists(table_name, column_name):
    """Verificar si una columna existe en una tabla"""
    with connection.cursor() as cursor:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [row[1] for row in cursor.fetchall()]
        return column_name in columns

def main():
    print("🔍 Verificando estado de la base de datos...")
    
    # Verificar tabla patients
    if check_table_exists('patients_patient'):
        print("✅ Tabla patients_patient existe")
        
        # Verificar columnas específicas
        has_date_of_birth = check_column_exists('patients_patient', 'date_of_birth')
        has_birth_date = check_column_exists('patients_patient', 'birth_date')
        has_medications = check_column_exists('patients_patient', 'medications')
        has_current_medications = check_column_exists('patients_patient', 'current_medications')
        
        print(f"  - date_of_birth: {'✅' if has_date_of_birth else '❌'}")
        print(f"  - birth_date: {'✅' if has_birth_date else '❌'}")
        print(f"  - medications: {'✅' if has_medications else '❌'}")
        print(f"  - current_medications: {'✅' if has_current_medications else '❌'}")
        
        if has_date_of_birth and has_medications:
            print("🎉 Los modelos ya están sincronizados con la base de datos")
            print("📝 Creando migración fake para sincronizar estado...")
            
            # Crear migración fake
            os.system('python manage.py makemigrations patients --empty --name sync_final_state')
            os.system('python manage.py migrate patients --fake')
            
            print("✅ Sincronización completada")
        else:
            print("⚠️  Necesita migración real")
    else:
        print("❌ Tabla patients_patient no existe")

if __name__ == '__main__':
    main()