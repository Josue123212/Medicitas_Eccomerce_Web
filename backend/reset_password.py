#!/usr/bin/env python3
"""
Script para resetear la contraseña del usuario josue@gmail.com
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_password():
    """Resetear la contraseña del usuario"""
    try:
        user = User.objects.get(email='josue@gmail.com')
        print(f"Usuario encontrado: {user.username} ({user.email})")
        
        # Resetear contraseña
        new_password = 'password123'
        user.set_password(new_password)
        user.save()
        
        print(f"✅ Contraseña reseteada exitosamente")
        print(f"Nueva contraseña: {new_password}")
        
        # Verificar que funciona
        from django.contrib.auth import authenticate
        auth_user = authenticate(username=user.username, password=new_password)
        if auth_user:
            print(f"✅ Autenticación verificada correctamente")
        else:
            print(f"❌ Error en la verificación de autenticación")
            
    except User.DoesNotExist:
        print("❌ Usuario no encontrado")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    reset_password()