# 🏥 Sistema de Reservación de Citas Médicas - Documentación Técnica

## 📋 Índice
1. [Visión General del Proyecto](#visión-general)
2. [Arquitectura del Sistema](#arquitectura)
3. [Tecnologías y Stack](#tecnologías)
4. [Estructura del Proyecto](#estructura)
5. [Modelos de Datos](#modelos)
6. [Sistema de Roles y Permisos](#roles)
7. [API Endpoints](#endpoints)
8. [Frontend React](#frontend)
9. [Proceso de Desarrollo](#desarrollo)
10. [Despliegue a Producción](#despliegue)
11. [Seguridad](#seguridad)
12. [Escalabilidad](#escalabilidad)

---

## 🎯 Visión General del Proyecto

### Objetivo
Desarrollar un sistema web escalable para la gestión de citas médicas en una clínica, con interfaz moderna y API robusta.

### Características Principales
- **Gestión de Citas**: Reservar, modificar, cancelar citas
- **Múltiples Roles**: Cliente, Administrador, SuperAdmin
- **Dashboard Intuitivo**: Interfaces específicas por rol
- **Notificaciones**: Email y SMS para recordatorios
- **Reportes**: Estadísticas y análisis de datos
- **Responsive**: Funciona en desktop, tablet y móvil

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Base de      │
│   React SPA     │◄──►│   Django API    │◄──►│   Datos         │
│                 │    │   REST Framework│    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Redis Cache   │    │   Media Files   │
│   (Producción)  │    │   Celery Tasks  │    │   AWS S3        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Patrón de Arquitectura
- **Frontend**: SPA (Single Page Application) con React
- **Backend**: API REST con Django REST Framework
- **Base de Datos**: PostgreSQL para producción, SQLite para desarrollo
- **Cache**: Redis para sesiones y cache
- **Tareas Asíncronas**: Celery para emails y notificaciones
- **Archivos**: AWS S3 para almacenamiento de archivos

---

## 🛠️ Tecnologías y Stack

### Backend
```python
# Tecnologías principales
Python 3.11+
Django 5.0+
Django REST Framework 3.15+
PostgreSQL 15+
Redis 7+
Celery 5+

# Librerías adicionales
django-cors-headers      # CORS para React
django-filter           # Filtrado avanzado
drf-spectacular         # Documentación OpenAPI
python-decouple         # Variables de entorno
Pillow                  # Manejo de imágenes
django-storages         # AWS S3 integration
boto3                   # AWS SDK
celery[redis]           # Tareas asíncronas
django-celery-beat      # Tareas programadas
```

### Frontend
```javascript
// Tecnologías principales
React 18+
TypeScript
Vite (Build tool)
Tailwind CSS

// Librerías adicionales
react-router-dom        // Routing
axios                   // HTTP client
react-query             // State management
react-hook-form         // Formularios
yup                     // Validaciones
date-fns                // Manejo de fechas
react-hot-toast         // Notificaciones
react-icons             // Iconos
```

---

## 📁 Estructura del Proyecto

```
proyecto-citas/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   ├── production.py
│   │   │   └── testing.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── authentication/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── users/
│   │   ├── appointments/
│   │   ├── doctors/
│   │   ├── patients/
│   │   ├── notifications/
│   │   └── reports/
│   ├── core/
│   │   ├── permissions.py
│   │   ├── pagination.py
│   │   ├── exceptions.py
│   │   └── utils.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🗄️ Modelos de Datos

### Modelo de Usuario Personalizado
```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('client', 'Cliente'),
        ('admin', 'Administrador'),
        ('superadmin', 'Super Administrador'),
    ]
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
```

### Modelo de Paciente
```python
# apps/patients/models.py
class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('M', 'Masculino'), ('F', 'Femenino')])
    address = models.TextField()
    emergency_contact = models.CharField(max_length=100)
    emergency_phone = models.CharField(max_length=15)
    medical_history = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()}"
```

### Modelo de Doctor
```python
# apps/doctors/models.py
class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    license_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    bio = models.TextField()
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()}"
```

### Modelo de Cita
```python
# apps/appointments/models.py
class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Programada'),
        ('confirmed', 'Confirmada'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('no_show', 'No se presentó'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    reason = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['doctor', 'date', 'time']
        ordering = ['date', 'time']
```

---

## 👥 Sistema de Roles y Permisos

### Definición de Roles

#### 1. Cliente (Patient)
**Permisos:**
- Ver sus propias citas
- Crear nuevas citas
- Modificar citas (hasta 24h antes)
- Cancelar citas
- Ver perfil personal
- Actualizar información personal

#### 2. Administrador
**Permisos:**
- Gestionar todas las citas
- Ver reportes básicos
- Gestionar pacientes
- Gestionar doctores
- Configurar horarios
- Enviar notificaciones

#### 3. Super Administrador
**Permisos:**
- Todos los permisos de administrador
- Gestionar usuarios y roles
- Acceso a reportes avanzados
- Configuración del sistema
- Backup y restauración
- Logs del sistema

### Implementación de Permisos
```python
# core/permissions.py
from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'superadmin']:
            return True
        return obj.patient.user == request.user

class IsAdminOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'superadmin']

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'superadmin'
```

---

## 🔌 API Endpoints

### Autenticación
```
POST /api/auth/login/          # Login
POST /api/auth/logout/         # Logout
POST /api/auth/register/       # Registro
POST /api/auth/refresh/        # Refresh token
POST /api/auth/password-reset/ # Reset password
```

### Usuarios
```
GET    /api/users/profile/     # Perfil actual
PUT    /api/users/profile/     # Actualizar perfil
GET    /api/users/            # Lista usuarios (admin)
POST   /api/users/            # Crear usuario (admin)
PUT    /api/users/{id}/       # Actualizar usuario (admin)
DELETE /api/users/{id}/       # Eliminar usuario (superadmin)
```

### Citas
```
GET    /api/appointments/           # Lista citas
POST   /api/appointments/           # Crear cita
GET    /api/appointments/{id}/      # Detalle cita
PUT    /api/appointments/{id}/      # Actualizar cita
DELETE /api/appointments/{id}/      # Cancelar cita
GET    /api/appointments/available/ # Horarios disponibles
```

### Doctores
```
GET    /api/doctors/              # Lista doctores
GET    /api/doctors/{id}/         # Detalle doctor
GET    /api/doctors/{id}/schedule/ # Horario doctor
```

---

## ⚛️ Frontend React

### Estructura de Componentes
```typescript
// Componente principal de citas
interface AppointmentProps {
  appointment: Appointment;
  onUpdate: (id: string) => void;
  onCancel: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentProps> = ({ 
  appointment, 
  onUpdate, 
  onCancel 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
          </h3>
          <p className="text-gray-600">{appointment.doctor.specialization}</p>
          <p className="text-sm text-gray-500">
            {format(new Date(appointment.date), 'dd/MM/yyyy')} - {appointment.time}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      
      <div className="mt-4">
        <p className="text-gray-700">{appointment.reason}</p>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => onUpdate(appointment.id)}
        >
          Modificar
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => onCancel(appointment.id)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};
```

### Gestión de Estado
```typescript
// hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { appointmentService } from '../services/appointmentService';

export const useAppointments = () => {
  const queryClient = useQueryClient();
  
  const {
    data: appointments,
    isLoading,
    error
  } = useQuery('appointments', appointmentService.getAll);
  
  const createMutation = useMutation(appointmentService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
      toast.success('Cita creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear la cita');
    }
  });
  
  return {
    appointments,
    isLoading,
    error,
    createAppointment: createMutation.mutate,
    isCreating: createMutation.isLoading
  };
};
```

---

## 🚀 Proceso de Desarrollo

### Fase 1: Setup Inicial (Semana 1)
1. **Configuración del entorno**
   - Crear entorno virtual Python
   - Instalar Django y dependencias
   - Configurar base de datos
   - Setup inicial de React

2. **Estructura base**
   - Crear apps Django
   - Configurar Django REST Framework
   - Setup de autenticación JWT
   - Estructura de carpetas React

### Fase 2: Autenticación y Usuarios (Semana 2)
1. **Backend**
   - Modelo User personalizado
   - Sistema de roles
   - Endpoints de autenticación
   - Permisos básicos

2. **Frontend**
   - Páginas de login/registro
   - Context de autenticación
   - Rutas protegidas
   - Layout básico

### Fase 3: Gestión de Citas (Semanas 3-4)
1. **Backend**
   - Modelos de Doctor, Patient, Appointment
   - Serializers y ViewSets
   - Validaciones de negocio
   - Filtros y búsquedas

2. **Frontend**
   - Dashboard por roles
   - Formularios de citas
   - Calendario de citas
   - Gestión de estados

### Fase 4: Funcionalidades Avanzadas (Semana 5)
1. **Notificaciones**
   - Setup Celery
   - Emails automáticos
   - Recordatorios

2. **Reportes**
   - Estadísticas básicas
   - Exportación de datos
   - Gráficos

### Fase 5: Testing y Optimización (Semana 6)
1. **Testing**
   - Tests unitarios Django
   - Tests de integración
   - Tests E2E con Cypress

2. **Optimización**
   - Performance backend
   - Optimización React
   - SEO básico

---

## 🌐 Despliegue a Producción

### Infraestructura Recomendada

#### Opción 1: AWS (Recomendada)
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: clinic_db
      POSTGRES_USER: clinic_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    
  backend:
    build: ./backend
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.production
      - DATABASE_URL=postgresql://clinic_user:${DB_PASSWORD}@db:5432/clinic_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
      
  celery:
    build: ./backend
    command: celery -A config worker -l info
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.production
    depends_on:
      - db
      - redis
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Configuración de Producción
```python
# config/settings/production.py
from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = ['tu-dominio.com', 'www.tu-dominio.com']

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Cache con Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Archivos estáticos en AWS S3
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME')

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.StaticS3Boto3Storage'

# Seguridad
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

### Proceso de Despliegue

1. **Preparación**
   ```bash
   # Build del frontend
   cd frontend
   npm run build
   
   # Recolección de archivos estáticos
   cd ../backend
   python manage.py collectstatic --noinput
   
   # Migraciones
   python manage.py migrate
   ```

2. **Docker Build**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Configuración SSL**
   ```bash
   # Usando Let's Encrypt
   certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
   ```

---

## 🔒 Seguridad

### Medidas de Seguridad Implementadas

1. **Autenticación y Autorización**
   - JWT tokens con refresh
   - Permisos granulares por rol
   - Rate limiting en endpoints
   - Validación de sesiones

2. **Protección de Datos**
   - Encriptación de contraseñas (bcrypt)
   - Validación de entrada
   - Sanitización de datos
   - HTTPS obligatorio en producción

3. **Configuración Segura**
   ```python
   # Configuraciones de seguridad
   SECURE_BROWSER_XSS_FILTER = True
   SECURE_CONTENT_TYPE_NOSNIFF = True
   SECURE_HSTS_SECONDS = 31536000
   SECURE_HSTS_INCLUDE_SUBDOMAINS = True
   SECURE_HSTS_PRELOAD = True
   
   # CORS configurado específicamente
   CORS_ALLOWED_ORIGINS = [
       "https://tu-frontend.com",
   ]
   
   # Rate limiting
   REST_FRAMEWORK = {
       'DEFAULT_THROTTLE_CLASSES': [
           'rest_framework.throttling.AnonRateThrottle',
           'rest_framework.throttling.UserRateThrottle'
       ],
       'DEFAULT_THROTTLE_RATES': {
           'anon': '100/hour',
           'user': '1000/hour'
       }
   }
   ```

---

## 📈 Escalabilidad

### Estrategias de Escalabilidad

1. **Base de Datos**
   - Índices optimizados
   - Particionamiento por fecha
   - Read replicas para consultas
   - Connection pooling

2. **Cache**
   - Redis para sesiones
   - Cache de consultas frecuentes
   - CDN para archivos estáticos

3. **Aplicación**
   - Load balancer (Nginx)
   - Múltiples instancias Django
   - Celery workers distribuidos
   - Monitoreo con Prometheus

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Service Workers
   - CDN para assets

### Métricas de Monitoreo
```python
# Métricas importantes a monitorear
- Tiempo de respuesta API
- Uso de memoria y CPU
- Conexiones de base de datos
- Errores 4xx/5xx
- Tiempo de carga frontend
- Conversión de citas
```

---

## 📊 Estimación de Tiempos

| Fase | Duración | Entregables |
|------|----------|-------------|
| Setup y Configuración | 1 semana | Entorno configurado, estructura base |
| Autenticación | 1 semana | Login, registro, roles |
| Gestión de Citas | 2 semanas | CRUD citas, validaciones |
| Dashboard y UI | 1 semana | Interfaces por rol |
| Funcionalidades Avanzadas | 1 semana | Notificaciones, reportes |
| Testing y Optimización | 1 semana | Tests, performance |
| **Total** | **7 semanas** | **Sistema completo** |

---

## 🎯 Próximos Pasos

1. **Configurar el entorno de desarrollo**
2. **Crear la estructura base del proyecto**
3. **Implementar autenticación y roles**
4. **Desarrollar el sistema de citas**
5. **Crear las interfaces de usuario**
6. **Implementar notificaciones**
7. **Testing y optimización**
8. **Despliegue a producción**

---

*Este documento será actualizado conforme avance el desarrollo del proyecto.*