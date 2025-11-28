#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.urls import get_resolver
from rest_framework.routers import DefaultRouter
from apps.appointments.views import AppointmentViewSet

def main():
    print("🔍 VERIFICANDO URLs DEL VIEWSET DE APPOINTMENTS")
    print("=" * 60)
    
    # Crear router y registrar ViewSet
    router = DefaultRouter()
    router.register(r'appointments', AppointmentViewSet, basename='appointment')
    
    # Obtener URLs del router
    urls = router.urls
    
    print("📋 URLs generadas por el router:")
    for url in urls:
        print(f"   - {url.pattern}")
        if hasattr(url, 'callback') and hasattr(url.callback, 'actions'):
            print(f"     Acciones: {url.callback.actions}")
    
    print("\n🎯 Verificando acciones específicas del ViewSet:")
    viewset = AppointmentViewSet()
    
    # Verificar si las acciones están definidas
    actions = ['confirm', 'cancel', 'complete', 'reschedule']
    for action in actions:
        if hasattr(viewset, action):
            method = getattr(viewset, action)
            if hasattr(method, 'url_path'):
                print(f"   ✅ {action}: {method.url_path}")
            else:
                print(f"   ✅ {action}: método existe")
        else:
            print(f"   ❌ {action}: NO encontrado")

if __name__ == "__main__":
    main()