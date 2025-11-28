#!/usr/bin/env python
"""
Script para depurar el problema específico del PATCH /doctors/21/
"""
import os
import sys
import django
import json

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.doctors.models import Doctor
from apps.doctors.serializers import DoctorUpdateSerializer
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.request import Request
from django.contrib.auth import get_user_model

User = get_user_model()

def test_doctor_patch():
    """Prueba el endpoint PATCH con los datos exactos del frontend"""
    try:
        # Obtener el doctor ID 21
        doctor = Doctor.objects.get(id=21)
        print(f"🔍 Doctor encontrado: {doctor.full_name}")
        print(f"📊 Status actual: {doctor.status}")
        print(f"📊 Usuario activo: {doctor.user.is_active}")
        
        # Crear un usuario admin para la autenticación
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.filter(is_staff=True).first()
        
        if not admin_user:
            print("❌ No se encontró usuario admin")
            return
            
        print(f"👤 Usuario para autenticación: {admin_user.username}")
        
        # Datos exactos que envía el frontend
        data = {"status": "disabled"}
        print(f"📤 Datos a enviar: {json.dumps(data, indent=2)}")
        
        # Crear request factory
        factory = APIRequestFactory()
        request = factory.patch(
            f'/api/doctors/{doctor.id}/', 
            data=data,
            format='json'
        )
        force_authenticate(request, user=admin_user)
        
        # Probar el serializer directamente
        print(f"\n🧪 Probando serializer directamente...")
        serializer = DoctorUpdateSerializer(doctor, data=data, partial=True)
        
        if serializer.is_valid():
            print("✅ Serializer válido")
            print(f"📊 Datos validados: {serializer.validated_data}")
            
            # Intentar guardar
            try:
                updated_doctor = serializer.save()
                print(f"✅ Doctor actualizado exitosamente")
                print(f"📊 Nuevo status: {updated_doctor.status}")
                print(f"📊 Usuario activo: {updated_doctor.user.is_active}")
                
                # Revertir cambios
                doctor.status = 'active'
                doctor.user.is_active = True
                doctor.user.save()
                doctor.save()
                print(f"🔄 Cambios revertidos")
                
            except Exception as save_error:
                print(f"❌ Error al guardar: {save_error}")
                print(f"❌ Tipo de error: {type(save_error).__name__}")
                import traceback
                traceback.print_exc()
        else:
            print("❌ Serializer inválido")
            print(f"❌ Errores: {serializer.errors}")
            
        # Probar también con la vista directamente
        print(f"\n🌐 Probando vista directamente...")
        from apps.doctors.views import DoctorViewSet
        
        view = DoctorViewSet()
        view.action = 'partial_update'
        view.request = request
        view.format_kwarg = None
        
        try:
            # Simular get_object
            view.kwargs = {'pk': doctor.id}
            response = view.partial_update(request, pk=doctor.id)
            print(f"✅ Vista ejecutada exitosamente")
            print(f"📊 Status code: {response.status_code}")
            print(f"📊 Response data: {response.data}")
        except Exception as view_error:
            print(f"❌ Error en vista: {view_error}")
            print(f"❌ Tipo de error: {type(view_error).__name__}")
            import traceback
            traceback.print_exc()
            
    except Doctor.DoesNotExist:
        print("❌ Doctor con ID 21 no encontrado")
    except Exception as e:
        print(f"❌ Error general: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Iniciando debug del PATCH /doctors/21/...")
    test_doctor_patch()
    print("✅ Debug completado")