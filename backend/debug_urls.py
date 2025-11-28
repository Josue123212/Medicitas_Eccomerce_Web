#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from rest_framework.routers import DefaultRouter
from apps.appointments.views import AppointmentViewSet

def test_router():
    """Probar el router de appointments"""
    print("=== TESTING APPOINTMENTS ROUTER ===")
    
    # Crear router
    router = DefaultRouter()
    router.register(r'appointments', AppointmentViewSet, basename='appointment')
    
    print("\nURLs generadas por el router:")
    for i, pattern in enumerate(router.urls):
        print(f"{i+1}. {pattern.pattern} -> {pattern.callback}")
        
    print("\n=== TESTING VIEWSET ACTIONS ===")
    
    # Verificar acciones del ViewSet usando la clase
    for attr_name in dir(AppointmentViewSet):
        attr = getattr(AppointmentViewSet, attr_name)
        if hasattr(attr, 'mapping') and hasattr(attr, 'url_path'):
            print(f"Acción encontrada: {attr_name}")
            print(f"  - URL path: {attr.url_path}")
            print(f"  - Methods: {attr.mapping}")
            print(f"  - Detail: {getattr(attr, 'detail', 'N/A')}")
            print()

if __name__ == '__main__':
    test_router()