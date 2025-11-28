#!/usr/bin/env python
"""
Script para verificar los permisos del usuario joan@gmail.com
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.core.permissions import IsAdminOrSuperAdmin

def check_user_permissions():
    """
    Verifica los permisos del usuario joan@gmail.com
    """
    
    try:
        # Buscar el usuario
        user = User.objects.get(email='joan@gmail.com')
        
        print(f"👤 Usuario encontrado: {user.username}")
        print(f"📧 Email: {user.email}")
        print(f"🎭 Rol: {user.role}")
        print(f"🔑 Es staff: {user.is_staff}")
        print(f"👑 Es superuser: {user.is_superuser}")
        print(f"✅ Está activo: {user.is_active}")
        
        # Verificar si cumple con IsAdminOrSuperAdmin
        print("\n🔍 Verificando permisos IsAdminOrSuperAdmin:")
        
        # Simular la lógica del permiso
        is_admin = user.role == 'admin'
        is_superuser = user.is_superuser
        
        print(f"  - Es admin (role='admin'): {is_admin}")
        print(f"  - Es superuser: {is_superuser}")
        
        has_permission = is_admin or is_superuser
        print(f"  - ✅ Tiene permiso para crear secretarias: {has_permission}")
        
        if not has_permission:
            print("\n❌ PROBLEMA IDENTIFICADO:")
            print("   El usuario no tiene permisos para crear secretarias.")
            print("   Necesita tener role='admin' o is_superuser=True")
            
            # Sugerir solución
            print("\n💡 SOLUCIONES:")
            print("   1. Cambiar el rol del usuario a 'admin':")
            print(f"      user = User.objects.get(email='{user.email}')")
            print("      user.role = 'admin'")
            print("      user.save()")
            print("\n   2. O hacer al usuario superuser:")
            print(f"      user = User.objects.get(email='{user.email}')")
            print("      user.is_superuser = True")
            print("      user.save()")
        
    except User.DoesNotExist:
        print("❌ Usuario joan@gmail.com no encontrado")
    except Exception as e:
        print(f"💥 Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    check_user_permissions()
