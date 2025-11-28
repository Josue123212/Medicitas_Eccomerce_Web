#!/usr/bin/env python
"""
Script para depurar el problema de actualización del status del doctor.
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.doctors.models import Doctor
from apps.doctors.serializers import DoctorUpdateSerializer
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

def test_doctor_status_update():
    """Prueba la actualización del status del doctor"""
    
    # Buscar un doctor para probar
    try:
        doctor = Doctor.objects.get(id=21)
        print(f"✅ Doctor encontrado: {doctor.user.get_full_name()}")
        print(f"📊 Status actual: {doctor.status}")
        print(f"📊 Choices disponibles: {Doctor.STATUS_CHOICES}")
        
    except Doctor.DoesNotExist:
        print("❌ Doctor con ID 21 no encontrado")
        # Buscar cualquier doctor
        doctor = Doctor.objects.first()
        if not doctor:
            print("❌ No hay doctores en la base de datos")
            return
        print(f"✅ Usando doctor: {doctor.user.get_full_name()} (ID: {doctor.id})")
    
    # Datos para actualizar
    data = {'status': 'disabled'}
    print(f"📝 Datos a enviar: {data}")
    
    # Crear una instancia del serializador
    serializer = DoctorUpdateSerializer(instance=doctor, data=data, partial=True)
    
    print(f"🔍 Serializador creado: {serializer.__class__.__name__}")
    print(f"🔍 Campos del serializador: {serializer.fields.keys()}")
    
    # Validar los datos
    try:
        is_valid = serializer.is_valid()
        print(f"✅ Validación: {is_valid}")
        
        if not is_valid:
            print(f"❌ Errores de validación: {serializer.errors}")
            return
        
        # Intentar guardar
        updated_doctor = serializer.save()
        print(f"✅ Doctor actualizado exitosamente")
        print(f"📊 Nuevo status: {updated_doctor.status}")
        
        # Verificar en la base de datos
        doctor.refresh_from_db()
        print(f"📊 Status en DB: {doctor.status}")
        
    except Exception as e:
        print(f"❌ Error durante la actualización: {e}")
        print(f"❌ Tipo de error: {type(e).__name__}")
        import traceback
        traceback.print_exc()

def test_direct_model_update():
    """Prueba la actualización directa del modelo"""
    try:
        doctor = Doctor.objects.get(id=21)
        print(f"\n🔄 Prueba directa del modelo")
        print(f"📊 Status actual: {doctor.status}")
        
        # Actualización directa
        doctor.status = 'disabled'
        doctor.save()
        
        print(f"✅ Actualización directa exitosa")
        print(f"📊 Nuevo status: {doctor.status}")
        
        # Revertir para no afectar otros tests
        doctor.status = 'active'
        doctor.save()
        print(f"🔄 Status revertido a: {doctor.status}")
        
    except Exception as e:
        print(f"❌ Error en actualización directa: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando depuración del status del doctor...")
    test_doctor_status_update()
    test_direct_model_update()
    print("✅ Depuración completada")