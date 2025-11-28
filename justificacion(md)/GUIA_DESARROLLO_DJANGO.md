# 🐍 Guía de Desarrollo Django Backend - Sistema de Citas Médicas

## 📋 Lista de Verificación Completa

### 🚀 Fase 1: Configuración Inicial del Entorno

#### 1.1 Setup del Entorno Python
- [x] Verificar Python 3.11+ instalado
- [x] Crear entorno virtual: `python -m venv venv`
- [x] Activar entorno virtual: `source venv/bin/activate` (Linux/Mac) o `venv\Scripts\activate` (Windows)
- [x] Actualizar pip: `python -m pip install --upgrade pip`
- [x] Crear archivo `.gitignore` para Python/Django

#### 1.2 Instalación de Dependencias Base
- [x] Crear carpeta `backend/`
- [x] Crear `requirements/base.txt` con dependencias principales:
  ```
  Django==5.0.1
  djangorestframework==3.14.0
  django-cors-headers==4.3.1
  python-decouple==3.8
  Pillow==11.3.0
  ```
- [x] Instalar dependencias: `pip install -r requirements/base.txt`
- [x] Crear `requirements/development.txt` y `requirements/production.txt`

#### 1.3 Creación del Proyecto Django
- [x] Crear proyecto: `django-admin startproject config .`
- [x] Verificar estructura inicial creada
- [x] Probar servidor: `python manage.py runserver`
- [x] Confirmar que Django funciona en http://localhost:8000

---

### 🏗️ Fase 2: Configuración de Django REST Framework

#### 2.1 Configuración Básica de DRF
- [x] Agregar apps a `INSTALLED_APPS` en `settings.py`:
  ```python
  'rest_framework',
  'corsheaders',
  ```
- [x] Configurar middleware de CORS en `settings.py`
- [x] Configurar DRF en `settings.py`:
  ```python
  REST_FRAMEWORK = {
      'DEFAULT_AUTHENTICATION_CLASSES': [
          'rest_framework.authentication.TokenAuthentication',
      ],
      'DEFAULT_PERMISSION_CLASSES': [
          'rest_framework.permissions.IsAuthenticated',
      ],
  }
  ```

#### 2.2 Configuración de Base de Datos
- [x] Configurar SQLite para desarrollo en `settings.py`
- [x] Crear migraciones iniciales: `python manage.py makemigrations`
- [x] Aplicar migraciones: `python manage.py migrate`
- [x] Crear superusuario: `python manage.py createsuperuser`

#### 2.3 Estructura de Settings
- [x] Crear carpeta `config/settings/`
- [x] Crear `base.py`, `development.py`, `production.py`
- [x] Mover configuraciones comunes a `base.py`
- [x] Configurar variables de entorno con `python-decouple`
- [x] Crear archivo `.env` para variables locales

---

### 👤 Fase 3: Sistema de Usuarios y Autenticación

#### 3.1 Modelo User Personalizado
- [x] Crear app `users`: `python manage.py startapp users`
- [x] Mover app a carpeta `apps/users/`
- [x] Crear modelo `User` personalizado en `apps/users/models.py`:
  ```python
  class User(AbstractUser):
      ROLE_CHOICES = [
          ('client', 'Cliente'),
          ('admin', 'Administrador'),
          ('superadmin', 'Super Administrador'),
      ]
      email = models.EmailField(unique=True)
      phone = models.CharField(max_length=15, blank=True)
      role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
      # ... otros campos
  ```
- [x] Configurar `AUTH_USER_MODEL` en settings
- [x] Crear y aplicar migraciones: `python manage.py makemigrations users`
- [x] Aplicar migraciones: `python manage.py migrate`

#### 3.2 Autenticación JWT
- [x] Instalar `djangorestframework-simplejwt`
- [x] Configurar JWT en settings:
  ```python
  from datetime import timedelta
  SIMPLE_JWT = {
      'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
      'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
      'ROTATE_REFRESH_TOKENS': True,
  }
  ```
- [x] Crear serializers de autenticación en `apps/users/serializers.py`
- [x] Crear views de login/logout/register en `apps/users/views.py`
- [x] Configurar URLs de autenticación en `apps/users/urls.py`

#### 3.3 Sistema de Permisos
- [x] Crear `core/permissions.py` con permisos personalizados:
  ```python
  class IsOwnerOrAdmin(permissions.BasePermission):
      def has_object_permission(self, request, view, obj):
          # Lógica de permisos
  ```
- [x] Implementar `IsAdminOrSuperAdmin` permission
- [x] Implementar `IsSuperAdmin` permission
- [x] Probar permisos con diferentes roles

---

### 🏥 Fase 4: Modelos del Dominio Médico

#### 4.1 Modelo de Paciente
- [x] Crear app `patients`: `python manage.py startapp patients`
- [x] Mover a `apps/patients/`
- [x] Crear modelo `Patient` en `apps/patients/models.py`:
  ```python
  class Patient(models.Model):
      user = models.OneToOneField(User, on_delete=models.CASCADE)
      date_of_birth = models.DateField()
      gender = models.CharField(max_length=10, choices=[('M', 'Masculino'), ('F', 'Femenino')])
      address = models.TextField()
      emergency_contact = models.CharField(max_length=100)
      emergency_phone = models.CharField(max_length=15)
      medical_history = models.TextField(blank=True)
      allergies = models.TextField(blank=True)
  ```
- [x] Crear y aplicar migraciones

#### 4.2 Modelo de Doctor ✅
- [x] Crear app `doctors`: `python manage.py startapp doctors`
- [x] Mover a `apps/doctors/`
- [x] Crear modelo `Doctor` en `apps/doctors/models.py`:
  ```python
  class Doctor(models.Model):
      user = models.OneToOneField(User, on_delete=models.CASCADE)
      license_number = models.CharField(max_length=50, unique=True)
      specialization = models.CharField(max_length=100)
      experience_years = models.PositiveIntegerField()
      consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
      bio = models.TextField()
      is_available = models.BooleanField(default=True)
  ```
- [x] Crear y aplicar migraciones

#### 4.3 Modelo de Citas ✅
- [x] Crear app `appointments`: `python manage.py startapp appointments`
- [x] Mover a `apps/appointments/`
- [x] Crear modelo `Appointment` en `apps/appointments/models.py`:
  ```python
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
- [x] Crear y aplicar migraciones

---

### 🔄 Fase 5: Serializers y API

#### 5.1 Serializers de Usuario ✅
- [x] Crear `UserSerializer` en `apps/users/serializers.py`
- [x] Crear `UserRegistrationSerializer`
- [x] Crear `UserProfileSerializer`
- [x] Implementar validaciones personalizadas

#### 5.2 Serializers de Dominio ✅
- [x] Crear `PatientSerializer` en `apps/patients/serializers.py`
- [x] Crear `DoctorSerializer` en `apps/doctors/serializers.py`
- [x] Crear `AppointmentSerializer` en `apps/appointments/serializers.py`
- [x] Implementar serializers anidados para relaciones
- [x] Agregar validaciones de negocio (ej: no citas en el pasado)

#### 5.3 ViewSets y Views
- [x] Crear `UserViewSet` en `apps/users/views.py`
- [x] Crear `PatientViewSet` en `apps/patients/views.py`
- [x] Crear `DoctorViewSet` en `apps/doctors/views.py`
- [x] Crear `AppointmentViewSet` en `apps/appointments/views.py`
- [x] Implementar acciones personalizadas (ej: `available_slots`)
- [x] Aplicar permisos apropiados a cada ViewSet

#### 5.4 Configuración de URLs
- [x] Crear `apps/users/urls.py` con rutas de usuarios
- [x] Crear `apps/patients/urls.py`
- [x] Crear `apps/doctors/urls.py`
- [x] Crear `apps/appointments/urls.py`
- [x] Configurar router de DRF en cada app
- [x] Incluir URLs de apps en `config/urls.py`

---

### 🔍 Fase 6: Funcionalidades Avanzadas

#### 6.1 Filtros y Búsquedas ✅
- [x] Instalar `django-filter`
- [x] Crear filtros personalizados para citas por fecha
- [x] Implementar búsqueda por nombre de doctor
- [x] Agregar filtros por especialización
- [x] Implementar paginación personalizada

#### 6.2 Validaciones de Negocio ✅
- [x] Validar que no se puedan crear citas en horarios ocupados
- [x] Validar que las citas sean en horario laboral
- [x] Implementar validación de 24h para modificaciones
- [x] Crear validadores personalizados para fechas

#### 6.3 Signals y Hooks
- [x] Crear signal para crear perfil de paciente automáticamente
- [x] Implementar signal para envío de notificaciones
- [x] Crear hooks para logging de acciones importantes

---

### 📧 Fase 7: Sistema de Notificaciones

#### 7.1 Configuración de Celery
- [x] Instalar `celery[redis]`
- [x] Configurar Redis como broker
- [x] Crear `config/celery.py`
- [x] Configurar Celery en `config/__init__.py`
- [x] Crear tareas básicas de prueba

#### 7.2 Notificaciones por Email
- [x] Configurar SMTP en settings
- [x] Crear templates de email
- [x] Implementar tarea de envío de confirmación de cita
- [x] Crear tarea de recordatorio de cita
- [x] Implementar notificación de cancelación

#### 7.3 Tareas Programadas
- [x] Instalar `django-celery-beat`
- [x] Configurar tareas periódicas
- [x] Crear tarea de recordatorios diarios
- [x] Implementar limpieza de datos antiguos

---

### 🔧 Fase 8: Tareas Pendientes para MVP (ALTERNATIVA 1 DÍA)

#### 8.1 Modelo SecretaryProfile (PRIORIDAD ALTA)
- [x] **PRIORIDAD ALTA**: Crear modelo `SecretaryProfile` en `apps/users/models.py`
- [x] **PRIORIDAD ALTA**: Crear migración para `SecretaryProfile`
- [x] **PRIORIDAD ALTA**: Agregar `SecretaryProfile` al admin
- [x] **PRIORIDAD ALTA**: Crear serializer para `SecretaryProfile`

#### 8.2 Endpoints de Dashboard por Rol (PRIORIDAD ALTA)
- [x] **PRIORIDAD ALTA**: Crear `GET /api/dashboard/doctor/` - Stats para doctor
- [x] **PRIORIDAD ALTA**: Crear `GET /api/dashboard/secretary/` - Stats para secretaria
- [x] **PRIORIDAD ALTA**: Crear `GET /api/dashboard/admin/` - Stats para admin
- [x] **PRIORIDAD ALTA**: Implementar permisos específicos por rol

#### 8.3 Autenticación Completa (PRIORIDAD ALTA)
- [x] **PRIORIDAD ALTA**: Verificar que JWT funcione correctamente
- [x] **PRIORIDAD ALTA**: Implementar refresh token
- [x] **PRIORIDAD ALTA**: Crear endpoint de verificación de rol
- [x] **PRIORIDAD ALTA**: Configurar CORS para frontend

#### 8.4 Datos de Prueba (PRIORIDAD MEDIA)
- [x] **PRIORIDAD MEDIA**: Crear comando para generar datos de prueba
- [x] **PRIORIDAD MEDIA**: Crear usuarios de ejemplo (doctor, secretaria, admin)
- [x] **PRIORIDAD MEDIA**: Crear citas de ejemplo
- [x] **PRIORIDAD MEDIA**: Crear pacientes de ejemplo

---

### 📊 Fase 9: Reportes y Analytics (OMITIR PARA MVP)

#### 9.1 OMITIR COMPLETAMENTE PARA ALTERNATIVA 1 DÍA
- [ ] **NOTA**: Los reportes son funcionalidades avanzadas
- [ ] **IMPLEMENTAR EN**: Versión 2.0 del sistema
- [ ] **ALTERNATIVA MVP**: Usar datos básicos en dashboards

---

### 🧪 Fase 10: Testing (OMITIR PARA MVP)

#### 10.1 OMITIR COMPLETAMENTE PARA ALTERNATIVA 1 DÍA
- [ ] **NOTA**: Testing se implementará después del MVP
- [ ] **PRIORIDAD**: Funcionalidad básica primero

---

### 🚀 Fase 11: Optimización y Producción (BÁSICO PARA MVP)

#### 11.1 Optimización de Performance (OMITIR)
- [ ] **OMITIR**: Optimizaciones complejas para MVP
- [ ] **IMPLEMENTAR EN**: Versión 2.0

#### 11.2 Configuración de Producción (ESENCIAL)
- [x] **PRIORIDAD ALTA**: Crear `settings/production.py` básico
- [x] **PRIORIDAD ALTA**: Configurar variables de entorno básicas
- [ ] **OMITIR**: Logging complejo
- [ ] **OMITIR**: Manejo de errores avanzado

#### 11.3 Seguridad (BÁSICA)
- [x] **PRIORIDAD ALTA**: Configurar CORS básico
- [ ] **OMITIR**: Rate limiting
- [ ] **OMITIR**: HTTPS settings (para MVP local)

#### 11.4 Documentación API (BÁSICA)
- [x] **PRIORIDAD MEDIA**: Instalar `drf-spectacular`
- [x] **PRIORIDAD MEDIA**: Configurar OpenAPI schema básico
- [ ] **OMITIR**: Documentación detallada

---

### 📦 Fase 12: Deployment (RÁPIDO PARA MVP)

#### 12.1 Deployment Rápido
- [ ] **PRIORIDAD ALTA**: Configurar deployment en Railway/Render
- [ ] **PRIORIDAD ALTA**: Configurar variables de entorno en plataforma
- [ ] **OMITIR**: Docker para MVP
- [ ] **OMITIR**: Nginx

#### 12.2 Configuración Mínima
- [ ] **PRIORIDAD ALTA**: Configurar base de datos PostgreSQL en la nube
- [ ] **PRIORIDAD ALTA**: Configurar archivos estáticos
- [ ] **OMITIR**: SSL/TLS complejo
- [ ] **OMITIR**: Health checks

#### 12.3 CI/CD (OMITIR)
- [ ] **OMITIR**: GitHub Actions para MVP
- [ ] **NOTA**: Deploy manual para MVP

---

## 🎯 Comandos Útiles de Desarrollo

### Comandos Django Frecuentes
```bash
# Activar entorno virtual
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Servidor de desarrollo
python manage.py runserver

# Migraciones
python manage.py makemigrations
python manage.py migrate

# Shell interactivo
python manage.py shell

# Crear superusuario
python manage.py createsuperuser

# Recolectar archivos estáticos
python manage.py collectstatic

# Tests
python manage.py test
pytest  # si usas pytest
```

### Comandos Celery
```bash
# Iniciar worker
celery -A config worker -l info

# Iniciar beat scheduler
celery -A config beat -l info

# Monitor de tareas
celery -A config flower
```

---

## 📝 Notas Importantes

- ✅ **Siempre activar el entorno virtual antes de trabajar**
- ✅ **Hacer commit frecuente de cambios pequeños**
- ✅ **Probar cada funcionalidad antes de continuar**
- ✅ **Mantener requirements.txt actualizado**
- ✅ **Documentar decisiones importantes**
- ✅ **Seguir convenciones de nomenclatura de Django**
- ✅ **Usar migraciones para todos los cambios de modelo**
- ✅ **Implementar validaciones tanto en modelo como en serializer**

---

## 🔧 Troubleshooting Común

### Problemas de Migraciones
- [ ] Verificar que todas las apps estén en INSTALLED_APPS
- [ ] Revisar dependencias entre migraciones
- [ ] Usar `--fake` solo cuando sea necesario

### Problemas de Permisos
- [ ] Verificar que el usuario esté autenticado
- [ ] Revisar que los permisos estén aplicados correctamente
- [ ] Probar con diferentes roles de usuario

### Problemas de CORS
- [ ] Verificar configuración de CORS_ALLOWED_ORIGINS
- [ ] Revisar que corsheaders esté en MIDDLEWARE
- [ ] Probar con CORS_ALLOW_ALL_ORIGINS = True (solo desarrollo)

---

*Esta guía debe seguirse paso a paso, marcando cada checkbox al completar la tarea correspondiente.*