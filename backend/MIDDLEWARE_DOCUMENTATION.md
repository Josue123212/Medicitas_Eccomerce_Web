# 🛡️ DOCUMENTACIÓN DEL MIDDLEWARE PERSONALIZADO

## 📋 RESUMEN

Se ha implementado un sistema completo de middleware personalizado para el proyecto Django que incluye:

- **🔒 SecurityHeadersMiddleware**: Headers de seguridad automáticos
- **⏱️ RoleBasedRateLimitMiddleware**: Rate limiting basado en roles de usuario
- **📝 RoleBasedLoggingMiddleware**: Logging y auditoría de acciones por rol

## 🏗️ ARQUITECTURA

### Archivos Implementados

```
backend/
├── core/
│   ├── middleware.py          # Middleware personalizado
│   ├── models.py             # Modelos AuditLog y SystemMetrics
│   └── migrations/           # Migraciones de base de datos
├── config/
│   └── settings.py           # Configuración del middleware
├── logs/                     # Directorio para archivos de log
└── test_middleware.py        # Script de pruebas
```

## 🔧 CONFIGURACIÓN

### 1. Middleware en settings.py

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'core.middleware.SecurityHeadersMiddleware',           # ← NUEVO
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'core.middleware.RoleBasedRateLimitMiddleware',        # ← NUEVO
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'core.middleware.RoleBasedLoggingMiddleware',          # ← NUEVO
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### 2. Configuraciones Específicas

#### Rate Limiting
```python
ROLE_BASED_RATE_LIMITING = {
    'ENABLED': True,
    'RATE_LIMITS': {
        'client': 60,
        'doctor': 120,
        'secretary': 180,
        'admin': 300,
        'superadmin': 500,
        'anonymous': 20,
    },
    'EXEMPT_PATHS': [
        '/api/auth/login/',
        '/api/auth/refresh/',
        '/api/health/',
        '/admin/',
    ]
}
```

#### Audit Trail
```python
ROLE_BASED_AUDIT_TRAIL = {
    'ENABLED': True,
    'LOG_SENSITIVE_DATA': False,
    'SENSITIVE_FIELDS': ['password', 'token', 'secret', 'key'],
    'CRITICAL_RESOURCES': ['/api/users/', '/api/admin/', '/api/reports/'],
    'LOG_ANONYMOUS_USERS': False,
    'SKIP_GET_REQUESTS': True,
}
```

#### Security Headers
```python
SECURITY_HEADERS_CONFIG = {
    'ENABLED': True,
    'HEADERS': {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;",
    }
}
```

## 🔍 FUNCIONALIDADES

### 1. SecurityHeadersMiddleware

**Propósito**: Agregar headers de seguridad automáticamente a todas las respuestas.

**Headers incluidos**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: [política personalizada]`

**Configuración**: Completamente configurable desde `settings.py`

### 2. RoleBasedRateLimitMiddleware

**Propósito**: Implementar rate limiting diferenciado por rol de usuario.

**Límites por defecto**:
- `client`: 60 peticiones/minuto
- `doctor`: 120 peticiones/minuto
- `secretary`: 180 peticiones/minuto
- `admin`: 300 peticiones/minuto
- `superadmin`: 500 peticiones/minuto
- `anonymous`: 20 peticiones/minuto

**Características**:
- Cache en memoria para tracking de peticiones
- Ventana deslizante de 1 minuto
- Paths exentos configurables
- Respuesta HTTP 429 cuando se excede el límite

### 3. RoleBasedLoggingMiddleware

**Propósito**: Logging y auditoría de acciones basado en roles.

**Características**:
- Logging diferenciado por rol de usuario
- Filtrado de datos sensibles
- Audit trail en base de datos
- Logging de acciones críticas
- Métricas de tiempo de respuesta

**Acciones loggeadas por rol**:
- `admin/superadmin`: Todas las acciones en `/api/admin/`, `/api/users/`, `/api/reports/`
- `doctor`: Acciones en `/api/patients/`, `/api/appointments/`, `/api/medical-records/`
- `secretary`: Acciones en `/api/appointments/`, `/api/patients/`

## 📊 MODELOS DE BASE DE DATOS

### AuditLog
```python
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    resource = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=50, null=True, blank=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    request_data = models.JSONField(null=True, blank=True)
    response_status = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

### SystemMetrics
```python
class SystemMetrics(models.Model):
    cpu_usage = models.FloatField()
    memory_usage = models.FloatField()
    disk_usage = models.FloatField()
    active_users = models.IntegerField(default=0)
    request_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
```

## 🧪 PRUEBAS

### Script de Pruebas
Se incluye `test_middleware.py` que verifica:

1. **Headers de Seguridad**: Verifica que todos los headers estén presentes
2. **Rate Limiting**: Prueba el límite de peticiones por minuto
3. **Headers CORS**: Verifica configuración CORS
4. **Endpoints API**: Prueba conectividad con endpoints principales

### Ejecutar Pruebas
```bash
# Activar entorno virtual
source venv/bin/activate  # Linux/Mac
venv\Scripts\Activate.ps1  # Windows

# Ejecutar pruebas
python test_middleware.py
```

### Resultados de Pruebas
```
🎯 RESULTADO FINAL: 3/4 pruebas pasaron
✅ PASÓ Headers de Seguridad
❌ FALLÓ Rate Limiting (endpoint /api/health/ no existe)
✅ PASÓ Headers CORS
✅ PASÓ Endpoints API
```

## 📝 LOGGING

### Configuración de Logging
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'audit': {
            'format': '[{asctime}] {levelname} AUDIT: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'audit_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'audit.log'),
            'formatter': 'audit',
        },
    },
    'loggers': {
        'audit': {
            'handlers': ['audit_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### Archivos de Log
- `logs/audit.log`: Logs de auditoría y acciones de usuarios
- `logs/django.log`: Logs generales de Django
- `logs/middleware.log`: Logs específicos del middleware

## 🚀 DESPLIEGUE

### Pasos para Activar
1. Asegurar que el middleware esté en `MIDDLEWARE` en settings.py
2. Ejecutar migraciones: `python manage.py migrate`
3. Crear directorio de logs: `mkdir logs`
4. Reiniciar el servidor: `python manage.py runserver`

### Verificación
```bash
# Verificar que el middleware está activo
python test_middleware.py

# Revisar logs
tail -f logs/audit.log
tail -f logs/django.log
```

## 🔧 MANTENIMIENTO

### Monitoreo
- Revisar logs regularmente
- Monitorear métricas del sistema
- Verificar que el rate limiting no sea muy restrictivo

### Optimización
- Ajustar límites de rate limiting según uso real
- Configurar rotación de logs
- Implementar alertas para acciones críticas

### Troubleshooting
- Si rate limiting no funciona: verificar configuración en settings.py
- Si no se generan logs: verificar permisos del directorio logs/
- Si headers de seguridad faltan: verificar orden del middleware

## 📚 RECURSOS ADICIONALES

- [Django Middleware Documentation](https://docs.djangoproject.com/en/5.0/topics/http/middleware/)
- [Security Headers Best Practices](https://owasp.org/www-project-secure-headers/)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**Implementado por**: Senior Django Developer  
**Fecha**: Septiembre 2025  
**Versión**: 1.0.0