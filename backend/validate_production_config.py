#!/usr/bin/env python
"""
Script para validar la configuración de producción del sistema de citas médicas.
Verifica que todas las variables de entorno necesarias estén configuradas.
"""

import os
import sys
from pathlib import Path

# Configurar Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Primero importar decouple para verificar variables
try:
    from decouple import config
except ImportError as e:
    print(f"❌ Error importando decouple: {e}")
    sys.exit(1)

def validate_production_config():
    """Valida la configuración de producción."""
    print("🔍 VALIDANDO CONFIGURACIÓN DE PRODUCCIÓN")
    print("=" * 50)
    
    errors = []
    warnings = []
    
    # Variables críticas requeridas para producción
    critical_vars = {
        'SECRET_KEY': 'Clave secreta de Django',
        'ALLOWED_HOSTS': 'Hosts permitidos',
        'CORS_ALLOWED_ORIGINS': 'Orígenes CORS permitidos',
    }
    
    # Variables de base de datos (solo para PostgreSQL)
    db_vars = {
        'DB_NAME': 'Nombre de la base de datos',
        'DB_USER': 'Usuario de la base de datos', 
        'DB_PASSWORD': 'Contraseña de la base de datos',
        'DB_HOST': 'Host de la base de datos',
    }
    
    # Variables opcionales pero recomendadas
    optional_vars = {
        'EMAIL_HOST_USER': 'Usuario de email SMTP',
        'EMAIL_HOST_PASSWORD': 'Contraseña de email SMTP',
        'REDIS_URL': 'URL de Redis para cache',
        'CELERY_BROKER_URL': 'URL del broker de Celery',
    }
    
    print("📋 Verificando variables críticas:")
    for var, description in critical_vars.items():
        try:
            value = config(var, default='')
            if value and value != 'your-super-secret-key-here-change-in-production':
                print(f"  ✅ {var}: {description}")
            elif not value:
                errors.append(f"❌ {var}: {description} - NO CONFIGURADA")
            else:
                errors.append(f"❌ {var}: {description} - USAR VALOR DE EJEMPLO")
        except Exception:
            errors.append(f"❌ {var}: {description} - ERROR AL LEER")
    
    print("\n📋 Verificando variables de base de datos:")
    db_engine = config('DB_ENGINE', default='django.db.backends.sqlite3')
    if 'postgresql' in db_engine:
        print("  🔍 Detectado PostgreSQL, verificando variables...")
        for var, description in db_vars.items():
            try:
                value = config(var, default='')
                if value:
                    print(f"    ✅ {var}: {description}")
                else:
                    errors.append(f"❌ {var}: {description} - REQUERIDA para PostgreSQL")
            except Exception:
                errors.append(f"❌ {var}: {description} - ERROR AL LEER")
    else:
        print(f"  ⚠️  Usando {db_engine} - Recomendado PostgreSQL para producción")
    
    print("\n📋 Verificando variables opcionales:")
    for var, description in optional_vars.items():
        try:
            value = config(var, default='')
            if value:
                print(f"  ✅ {var}: {description}")
            else:
                warnings.append(f"⚠️  {var}: {description} - NO CONFIGURADA")
        except Exception:
            warnings.append(f"⚠️  {var}: {description} - ERROR AL LEER")
    
    # Verificar configuración básica
    print("\n📋 Verificando configuración básica:")
    
    # Verificar DEBUG
    debug_value = config('DEBUG', default='True')
    if debug_value.lower() == 'false':
        print("  ✅ DEBUG: False (correcto para producción)")
    else:
        warnings.append("⚠️  DEBUG está en True - Cambiar a False para producción")
    
    # Verificar SECRET_KEY
    secret_key = config('SECRET_KEY', default='')
    if secret_key and 'django-insecure' not in secret_key and len(secret_key) > 20:
        print("  ✅ SECRET_KEY: Configurada correctamente")
    elif 'django-insecure' in secret_key:
        errors.append("❌ SECRET_KEY contiene 'django-insecure' - Cambiar por una clave segura")
    else:
        errors.append("❌ SECRET_KEY no configurada o muy corta")
    
    # Verificar JWT tokens
    jwt_access = config('JWT_ACCESS_TOKEN_LIFETIME', default='15')
    jwt_refresh = config('JWT_REFRESH_TOKEN_LIFETIME', default='1440')
    print(f"  ✅ JWT configurado: Access {jwt_access}min, Refresh {jwt_refresh}min")
    
    # Mostrar resultados
    print("\n" + "=" * 50)
    
    if errors:
        print("❌ ERRORES CRÍTICOS:")
        for error in errors:
            print(f"  {error}")
    
    if warnings:
        print("\n⚠️  ADVERTENCIAS:")
        for warning in warnings:
            print(f"  {warning}")
    
    if not errors and not warnings:
        print("🎉 ¡CONFIGURACIÓN DE PRODUCCIÓN VÁLIDA!")
        return True
    elif not errors:
        print("✅ Configuración básica válida (con advertencias)")
        return True
    else:
        print("❌ Configuración inválida - Corregir errores antes de desplegar")
        return False

def show_deployment_checklist():
    """Muestra una lista de verificación para despliegue."""
    print("\n📋 LISTA DE VERIFICACIÓN PARA DESPLIEGUE:")
    print("=" * 50)
    
    checklist = [
        "□ Configurar todas las variables de entorno críticas",
        "□ Cambiar SECRET_KEY por una clave segura única",
        "□ Configurar base de datos PostgreSQL",
        "□ Configurar servidor Redis para cache",
        "□ Configurar SMTP para envío de emails",
        "□ Configurar dominio en ALLOWED_HOSTS",
        "□ Configurar URLs del frontend en CORS_ALLOWED_ORIGINS",
        "□ Configurar certificado SSL/TLS",
        "□ Configurar servidor web (Nginx/Apache)",
        "□ Configurar servidor WSGI (Gunicorn/uWSGI)",
        "□ Configurar logs y monitoreo",
        "□ Realizar backup de la base de datos",
        "□ Probar todas las funcionalidades críticas",
    ]
    
    for item in checklist:
        print(f"  {item}")

if __name__ == '__main__':
    try:
        is_valid = validate_production_config()
        show_deployment_checklist()
        
        if is_valid:
            print("\n🚀 Listo para continuar con el despliegue!")
            sys.exit(0)
        else:
            print("\n🛑 Corregir errores antes de continuar")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error durante la validación: {e}")
        sys.exit(1)