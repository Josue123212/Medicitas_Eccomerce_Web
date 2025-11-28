# 🚀 Configuración de Celery - Sistema de Citas Médicas

## 📋 Resumen

Celery ha sido configurado exitosamente en el proyecto para manejar tareas asíncronas como:
- Envío de notificaciones por email
- Tareas de limpieza de datos
- Procesamiento en segundo plano
- Tareas programadas (cron jobs)

## ✅ Estado de la Configuración

### Completado ✅
- [x] Instalación de `celery[redis]`
- [x] Configuración de Redis como broker
- [x] Creación de `config/celery.py`
- [x] Configuración en `config/__init__.py`
- [x] Tareas básicas de prueba
- [x] Scripts de verificación

### Pendiente ⏳
- [ ] Instalación y configuración de Redis server
- [ ] Pruebas con Redis funcionando

## 🔧 Instalación de Redis

### Windows
```bash
# Opción 1: Descargar desde GitHub
# https://github.com/microsoftarchive/redis/releases

# Opción 2: Usar Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Opción 3: WSL + Ubuntu
wsl
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server
redis-server

# CentOS/RHEL
sudo yum install redis
redis-server
```

### macOS
```bash
# Con Homebrew
brew install redis
redis-server
```

### Docker (Recomendado)
```bash
# Ejecutar Redis en Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Verificar que está funcionando
docker ps
```

## 🚀 Uso de Celery

### 1. Iniciar Redis
```bash
# Si instalaste Redis localmente
redis-server

# Si usas Docker
docker start redis
```

### 2. Verificar Configuración
```bash
# Desde el directorio backend/
python check_celery_setup.py
```

### 3. Iniciar Worker de Celery
```bash
# Terminal 1: Worker de Celery
celery -A config worker --loglevel=info

# Terminal 2: (Opcional) Monitor Flower
celery -A config flower
```

### 4. Probar Tareas
```bash
# Ejecutar pruebas de Celery
python test_celery.py
```

## 📋 Tareas Disponibles

### Tareas de Prueba
```python
from core.tasks import test_celery_task, add_numbers
from config.celery import debug_task

# Tarea simple
result = test_celery_task.delay()

# Tarea matemática
result = add_numbers.delay(5, 3)

# Tarea de debug
result = debug_task.delay()
```

### Tareas del Sistema
```python
from core.tasks import (
    log_system_status,
    cleanup_old_data,
    send_notification_email,
    long_running_task
)

# Log del estado del sistema
log_system_status.delay()

# Limpieza de datos
cleanup_old_data.delay()

# Envío de email
send_notification_email.delay(
    subject="Test",
    message="Hello World",
    recipient_list=["user@example.com"]
)

# Tarea larga con progreso
long_running_task.delay(duration=10)
```

## 🔍 Monitoreo

### Flower (Monitor Web)
```bash
# Instalar Flower
pip install flower

# Iniciar monitor
celery -A config flower

# Acceder a http://localhost:5555
```

### Comandos de Monitoreo
```bash
# Ver workers activos
celery -A config status

# Ver tareas activas
celery -A config active

# Ver estadísticas
celery -A config stats

# Purgar todas las tareas
celery -A config purge
```

## 📁 Estructura de Archivos

```
backend/
├── config/
│   ├── __init__.py          # Importa Celery app
│   ├── celery.py           # Configuración principal
│   └── settings/
│       └── base.py         # Settings de Celery
├── core/
│   └── tasks.py            # Tareas del sistema
├── check_celery_setup.py   # Script de verificación
├── test_celery.py          # Script de pruebas
└── requirements/
    └── base.txt            # Incluye celery[redis]
```

## ⚙️ Configuración Actual

### Settings (config/settings/base.py)
```python
# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TIMEZONE = 'UTC'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_RESULT_EXPIRES = 60 * 60 * 24  # 24 hours
```

### Celery App (config/celery.py)
- Configuración automática desde Django settings
- Auto-descubrimiento de tareas
- Tareas de debug incluidas
- Configuración de Beat scheduler

## 🔧 Troubleshooting

### Error: "No se puede establecer conexión"
```bash
# Verificar que Redis esté funcionando
redis-cli ping
# Debería responder: PONG

# Si no funciona, iniciar Redis
redis-server
```

### Error: "Task not registered"
```bash
# Verificar que las tareas se importen correctamente
python check_celery_setup.py

# Reiniciar el worker
celery -A config worker --loglevel=info
```

### Error: "Permission denied"
```bash
# En Linux/Mac, usar sudo si es necesario
sudo redis-server

# O cambiar el puerto
redis-server --port 6380
```

## 📈 Próximos Pasos

1. **Instalar Redis** según tu sistema operativo
2. **Probar la configuración** con `python check_celery_setup.py`
3. **Iniciar worker** con `celery -A config worker --loglevel=info`
4. **Ejecutar pruebas** con `python test_celery.py`
5. **Implementar tareas específicas** para el sistema de citas médicas

## 🎯 Tareas Futuras para el Sistema de Citas

- Notificaciones de confirmación de citas
- Recordatorios automáticos
- Limpieza de citas expiradas
- Reportes periódicos
- Sincronización de datos

---

**✅ Celery está configurado y listo para usar una vez que Redis esté funcionando.**