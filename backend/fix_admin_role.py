#!/usr/bin/env python
"""
Script para corregir el rol del usuario admin
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def fix_admin_role():
    """Corregir el rol del usuario admin"""
    try:
        # Buscar el usuario admin
        admin_user = User.objects.get(username='admin')
        
        print(f"👤 Usuario encontrado: {admin_user.username}")
        print(f"📧 Email: {admin_user.email}")
        print(f"🏷️ Rol actual: {admin_user.role}")
        print(f"🔧 is_staff: {admin_user.is_staff}")
        print(f"🔧 is_superuser: {admin_user.is_superuser}")
        
        # Cambiar el rol a admin
        if admin_user.role != 'admin':
            admin_user.role = 'admin'
            admin_user.save()
            print(f"✅ Rol cambiado a: {admin_user.role}")
        else:
            print("✅ El rol ya es correcto")
            
        # Verificar que tenga permisos de staff y superuser
        if not admin_user.is_staff:
            admin_user.is_staff = True
            admin_user.save()
            print("✅ is_staff activado")
            
        if not admin_user.is_superuser:
            admin_user.is_superuser = True
            admin_user.save()
            print("✅ is_superuser activado")
            
        print(f"\n🎉 Usuario admin configurado correctamente:")
        print(f"   - Rol: {admin_user.role}")
        print(f"   - is_staff: {admin_user.is_staff}")
        print(f"   - is_superuser: {admin_user.is_superuser}")
        
    except User.DoesNotExist:
        print("❌ Usuario admin no encontrado")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
        
    return True

if __name__ == "__main__":
    print("🔧 Corrigiendo rol del usuario admin...\n")
    success = fix_admin_role()
    
    if success:
        print("\n✅ Corrección completada exitosamente")
    else:
        print("\n❌ Error en la corrección")