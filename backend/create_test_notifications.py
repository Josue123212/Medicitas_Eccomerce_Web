#!/usr/bin/env python
import os
import django
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.notifications.models import Notification

User = get_user_model()

def create_test_notifications():
    """Crea notificaciones de prueba para el usuario josue"""
    
    try:
        # Buscar el usuario josue
        user = User.objects.get(username='josue')
        print(f"✅ Usuario encontrado: {user.username} (ID: {user.id})")
        
        # Crear notificaciones de prueba
        notifications_data = [
            {
                'type': 'appointment',
                'title': 'Cita Médica Programada',
                'message': 'Tienes una cita médica programada para mañana a las 10:00 AM con el Dr. García.',
                'is_read': False
            },
            {
                'type': 'result',
                'title': 'Resultados de Laboratorio',
                'message': 'Tus resultados de laboratorio están listos. Puedes revisarlos en tu historial médico.',
                'is_read': False
            },
            {
                'type': 'reminder',
                'title': 'Recordatorio de Medicamento',
                'message': 'No olvides tomar tu medicamento a las 8:00 PM.',
                'is_read': True
            },
            {
                'type': 'system',
                'title': 'Actualización del Sistema',
                'message': 'El sistema ha sido actualizado con nuevas funcionalidades.',
                'is_read': False
            }
        ]
        
        created_count = 0
        for notification_data in notifications_data:
            notification = Notification.objects.create(
                user=user,
                **notification_data
            )
            print(f"✅ Notificación creada: {notification.title}")
            created_count += 1
        
        print(f"\n🎉 Se crearon {created_count} notificaciones de prueba exitosamente")
        
        # Mostrar estadísticas
        total_notifications = Notification.objects.filter(user=user).count()
        unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
        
        print(f"📊 Estadísticas:")
        print(f"   - Total de notificaciones: {total_notifications}")
        print(f"   - Notificaciones no leídas: {unread_notifications}")
        
    except User.DoesNotExist:
        print("❌ Usuario 'josue' no encontrado")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_test_notifications()