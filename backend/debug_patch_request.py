#!/usr/bin/env python
"""
Script para debuggear la petición PATCH que está fallando
"""

import os
import sys
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.doctors.models import Doctor
from apps.doctors.views import DoctorViewSet
import json

User = get_user_model()

def test_patch_request():
    """Simula la petición PATCH del frontend"""
    
    # Obtener el usuario admin
    try:
        user = User.objects.get(id=78)
        print(f"✅ Usuario encontrado: {user.username} (admin: {user.is_admin()})")
    except User.DoesNotExist:
        print("❌ Usuario admin no encontrado")
        return
    
    # Obtener el doctor
    try:
        doctor = Doctor.objects.get(id=21)
        print(f"✅ Doctor encontrado: {doctor.user.get_full_name()} (status: {doctor.status})")
    except Doctor.DoesNotExist:
        print("❌ Doctor no encontrado")
        return
    
    # Crear factory de requests
    factory = RequestFactory()
    
    # Datos que envía el frontend
    data = {'status': 'disabled'}
    print(f"📝 Datos a enviar: {data}")
    
    # Crear la petición PATCH
    request = factory.patch(
        f'/api/doctors/{doctor.id}/',
        data=json.dumps(data),
        content_type='application/json'
    )
    request.user = user
    
    # Crear la vista
    view = DoctorViewSet()
    view.action = 'partial_update'
    view.request = request
    view.format_kwarg = None
    
    # Simular kwargs
    view.kwargs = {'pk': str(doctor.id)}
    
    try:
        # Ejecutar la vista
        response = view.partial_update(request, pk=doctor.id)
        print(f"✅ Respuesta exitosa: {response.status_code}")
        print(f"📄 Contenido: {response.data}")
        
    except Exception as e:
        print(f"❌ Error en la vista: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_patch_request()