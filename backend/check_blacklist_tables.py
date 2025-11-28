#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

def check_blacklist_tables():
    """Verificar si las tablas del blacklist existen"""
    print("🔍 Verificando tablas del blacklist...")
    print("=" * 50)
    
    with connection.cursor() as cursor:
        # Listar todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        all_tables = [row[0] for row in cursor.fetchall()]
        
        print("📋 Todas las tablas en la base de datos:")
        for table in sorted(all_tables):
            print(f"  - {table}")
        
        print("\n🔍 Buscando tablas relacionadas con blacklist:")
        blacklist_tables = [table for table in all_tables if 'blacklist' in table.lower()]
        
        if blacklist_tables:
            print("✅ Tablas de blacklist encontradas:")
            for table in blacklist_tables:
                print(f"  - {table}")
                
                # Mostrar estructura de la tabla
                cursor.execute(f"PRAGMA table_info({table});")
                columns = cursor.fetchall()
                print(f"    Columnas:")
                for col in columns:
                    print(f"      - {col[1]} ({col[2]})")
                
                # Contar registros
                cursor.execute(f"SELECT COUNT(*) FROM {table};")
                count = cursor.fetchone()[0]
                print(f"    Registros: {count}")
                print()
        else:
            print("❌ No se encontraron tablas de blacklist")
            print("   Esto significa que rest_framework_simplejwt.token_blacklist")
            print("   no está correctamente instalado o migrado.")

if __name__ == "__main__":
    check_blacklist_tables()