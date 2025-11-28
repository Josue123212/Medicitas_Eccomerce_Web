#!/usr/bin/env python
"""
Script para configurar tareas periódicas de recordatorios automáticos
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json

def create_daily_reminder_task():
    """
    Crear tarea periódica para enviar recordatorios diarios
    Se ejecuta todos los días a las 9:00 AM
    """
    print("📅 CONFIGURANDO TAREA DE RECORDATORIOS DIARIOS")
    print("=" * 50)
    
    # Crear o obtener el schedule para las 9:00 AM todos los días
    schedule, created = CrontabSchedule.objects.get_or_create(
        minute=0,
        hour=9,
        day_of_week='*',
        day_of_month='*',
        month_of_year='*',
        timezone='America/Mexico_City'  # Ajusta según tu zona horaria
    )
    
    if created:
        print(f"✅ Nuevo schedule creado: Diario a las 9:00 AM")
    else:
        print(f"📋 Schedule existente encontrado: Diario a las 9:00 AM")
    
    # Crear o actualizar la tarea periódica
    task, created = PeriodicTask.objects.get_or_create(
        name='Enviar recordatorios diarios de citas',
        defaults={
            'crontab': schedule,
            'task': 'core.tasks.send_bulk_appointment_reminders',
            'args': json.dumps([]),  # Sin argumentos específicos
            'kwargs': json.dumps({
                'hours_before': 24,  # Recordar 24 horas antes
                'include_preparation': True
            }),
            'enabled': True,
            'description': 'Envía recordatorios automáticos a pacientes con citas programadas para el día siguiente'
        }
    )
    
    if created:
        print(f"✅ Tarea periódica creada: {task.name}")
    else:
        print(f"📋 Tarea periódica existente actualizada: {task.name}")
        # Actualizar configuración si es necesario
        task.crontab = schedule
        task.enabled = True
        task.save()
    
    return task

def create_weekly_cleanup_task():
    """
    Crear tarea periódica para limpieza semanal
    Se ejecuta todos los domingos a las 2:00 AM
    """
    print("\n🧹 CONFIGURANDO TAREA DE LIMPIEZA SEMANAL")
    print("=" * 45)
    
    # Crear o obtener el schedule para los domingos a las 2:00 AM
    schedule, created = CrontabSchedule.objects.get_or_create(
        minute=0,
        hour=2,
        day_of_week=0,  # Domingo
        day_of_month='*',
        month_of_year='*',
        timezone='America/Mexico_City'
    )
    
    if created:
        print(f"✅ Nuevo schedule creado: Domingos a las 2:00 AM")
    else:
        print(f"📋 Schedule existente encontrado: Domingos a las 2:00 AM")
    
    # Crear o actualizar la tarea periódica
    task, created = PeriodicTask.objects.get_or_create(
        name='Limpieza semanal del sistema',
        defaults={
            'crontab': schedule,
            'task': 'core.tasks.cleanup_old_data',
            'args': json.dumps([]),
            'kwargs': json.dumps({}),
            'enabled': True,
            'description': 'Limpia datos antiguos y optimiza el sistema semanalmente'
        }
    )
    
    if created:
        print(f"✅ Tarea periódica creada: {task.name}")
    else:
        print(f"📋 Tarea periódica existente actualizada: {task.name}")
        task.crontab = schedule
        task.enabled = True
        task.save()
    
    return task

def create_hourly_status_check():
    """
    Crear tarea periódica para verificación de estado del sistema
    Se ejecuta cada hora
    """
    print("\n🔍 CONFIGURANDO VERIFICACIÓN HORARIA DEL SISTEMA")
    print("=" * 50)
    
    # Crear o obtener el schedule para cada hora
    schedule, created = CrontabSchedule.objects.get_or_create(
        minute=0,
        hour='*',
        day_of_week='*',
        day_of_month='*',
        month_of_year='*',
        timezone='America/Mexico_City'
    )
    
    if created:
        print(f"✅ Nuevo schedule creado: Cada hora")
    else:
        print(f"📋 Schedule existente encontrado: Cada hora")
    
    # Crear o actualizar la tarea periódica
    task, created = PeriodicTask.objects.get_or_create(
        name='Verificación horaria del sistema',
        defaults={
            'crontab': schedule,
            'task': 'core.tasks.log_system_status',
            'args': json.dumps([]),
            'kwargs': json.dumps({}),
            'enabled': True,
            'description': 'Verifica el estado del sistema cada hora y registra métricas'
        }
    )
    
    if created:
        print(f"✅ Tarea periódica creada: {task.name}")
    else:
        print(f"📋 Tarea periódica existente actualizada: {task.name}")
        task.crontab = schedule
        task.enabled = True
        task.save()
    
    return task

def list_all_periodic_tasks():
    """
    Listar todas las tareas periódicas configuradas
    """
    print("\n📋 TAREAS PERIÓDICAS CONFIGURADAS")
    print("=" * 40)
    
    tasks = PeriodicTask.objects.all().order_by('name')
    
    if not tasks:
        print("❌ No hay tareas periódicas configuradas")
        return
    
    for i, task in enumerate(tasks, 1):
        status = "🟢 Activa" if task.enabled else "🔴 Inactiva"
        schedule_info = f"{task.crontab.hour}:{str(task.crontab.minute).zfill(2)}"
        
        print(f"{i}. {task.name}")
        print(f"   📋 Tarea: {task.task}")
        print(f"   ⏰ Horario: {schedule_info} ({task.crontab})")
        print(f"   📊 Estado: {status}")
        print(f"   📝 Descripción: {task.description or 'Sin descripción'}")
        print(f"   🔄 Última ejecución: {task.last_run_at or 'Nunca'}")
        print()

def main():
    """
    Función principal para configurar todas las tareas periódicas
    """
    print("🚀 CONFIGURANDO TAREAS PERIÓDICAS DEL SISTEMA")
    print("=" * 60)
    print("Este script configurará tareas automáticas para:")
    print("• Recordatorios diarios de citas (9:00 AM)")
    print("• Limpieza semanal del sistema (Domingos 2:00 AM)")
    print("• Verificación horaria del sistema")
    print()
    
    try:
        # Configurar tareas
        reminder_task = create_daily_reminder_task()
        cleanup_task = create_weekly_cleanup_task()
        status_task = create_hourly_status_check()
        
        # Mostrar resumen
        print("\n🎉 CONFIGURACIÓN COMPLETADA")
        print("=" * 35)
        print("✅ Todas las tareas periódicas han sido configuradas exitosamente")
        print()
        
        # Listar todas las tareas
        list_all_periodic_tasks()
        
        print("\n💡 PRÓXIMOS PASOS:")
        print("=" * 20)
        print("1. Inicia el scheduler de Celery Beat:")
        print("   celery -A config beat --loglevel=info")
        print("2. Asegúrate de que el worker de Celery esté ejecutándose")
        print("3. Las tareas se ejecutarán automáticamente según su programación")
        print("4. Puedes administrar las tareas desde el Django Admin en /admin/")
        
    except Exception as e:
        print(f"❌ Error durante la configuración: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    success = main()
    if success:
        print("\n🎯 ¡Configuración exitosa! El sistema de tareas periódicas está listo.")
    else:
        print("\n⚠️ Hubo errores durante la configuración. Revisa los logs.")
        sys.exit(1)