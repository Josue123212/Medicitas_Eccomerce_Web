#!/usr/bin/env python
"""
Script de debug para probar el SecretaryViewSet
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User, SecretaryProfile
from apps.users.serializers import SecretaryProfileSerializer

def debug_secretary():
    print("🔍 DEBUG: Probando SecretaryViewSet")
    
    # 1. Verificar usuario secretaria
    try:
        secretary_user = User.objects.get(email='secretary@test.com')
        print(f"✅ Usuario encontrado: {secretary_user}")
        print(f"   - Role: {secretary_user.role}")
        print(f"   - is_secretary(): {secretary_user.is_secretary()}")
    except User.DoesNotExist:
        print("❌ Usuario secretaria no encontrado")
        return
    
    # 2. Verificar perfil de secretaria
    try:
        secretary_profile = SecretaryProfile.objects.get(user=secretary_user)
        print(f"✅ Perfil encontrado: {secretary_profile}")
        print(f"   - Employee ID: {secretary_profile.employee_id}")
        print(f"   - Department: {secretary_profile.department}")
    except SecretaryProfile.DoesNotExist:
        print("❌ Perfil de secretaria no encontrado")
        return
    
    # 3. Probar serializer
    try:
        serializer = SecretaryProfileSerializer(secretary_profile)
        print("✅ Serializer funcionando:")
        print(f"   - Data keys: {list(serializer.data.keys())}")
        print(f"   - User data: {serializer.data.get('user', {})}")
    except Exception as e:
        print(f"❌ Error en serializer: {e}")
        import traceback
        traceback.print_exc()
    
    # 4. Probar queryset filtrado
    try:
        queryset = SecretaryProfile.objects.filter(user=secretary_user)
        print(f"✅ Queryset filtrado: {queryset.count()} resultados")
        if queryset.exists():
            first_profile = queryset.first()
            print(f"   - Primer perfil: {first_profile}")
    except Exception as e:
        print(f"❌ Error en queryset: {e}")

if __name__ == '__main__':
    debug_secretary()