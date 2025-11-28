# 🔄 SINCRONIZACIÓN BACKEND-FRONTEND
## Plan de Implementación para Alinear Django con React

---

## 🎯 **OBJETIVO**
Sincronizar completamente el backend Django con el frontend React, implementando todos los roles, endpoints y funcionalidades necesarias para que el sistema funcione de manera integral.

---

## 📊 **ESTADO ACTUAL**

### ✅ **Lo que YA funciona:**
- ✅ 3 roles básicos: `client`, `admin`, `superadmin`
- ✅ Autenticación JWT
- ✅ Sistema de permisos básico
- ✅ Apps: users, appointments, doctors, patients, reports

### ❌ **Lo que FALTA implementar:**
- ❌ Roles `doctor` y `secretary` en el modelo User
- ❌ Endpoints específicos para doctores y secretarias
- ❌ Permisos granulares por rol
- ❌ Modelos relacionados (Doctor profile, Secretary profile)
- ❌ APIs completas para el frontend

---

## 🚀 **FASE 1: ACTUALIZACIÓN DEL SISTEMA DE ROLES**

### 1.1 Modificar Modelo User ✅
**Archivo:** `backend/apps/users/models.py`

```python
# ANTES (3 roles)
ROLE_CHOICES = [
    ('client', 'Cliente'),
    ('admin', 'Administrador'),
    ('superadmin', 'Super Administrador'),
]

# DESPUÉS (5 roles)
ROLE_CHOICES = [
    ('client', 'Cliente'),
    ('doctor', 'Doctor'),
    ('secretary', 'Secretario/a'),
    ('admin', 'Administrador'),
    ('superadmin', 'Super Administrador'),
]
```

**Tareas:**
- [x] Actualizar `ROLE_CHOICES` en `User` model
- [x] Agregar métodos helper: `is_doctor()`, `is_secretary()`
- [x] Crear migración: `python manage.py makemigrations users`
- [x] Aplicar migración: `python manage.py migrate`

### 1.2 Actualizar Permisos ✅
**Archivo:** `backend/core/permissions.py`

**Nuevos permisos a crear:**
- [x] `IsDoctor` - Solo doctores
- [x] `IsSecretary` - Solo secretarias
- [x] `IsDoctorOrAdmin` - Doctores y administradores
- [x] `IsSecretaryOrAdmin` - Secretarias y administradores
- [x] `IsStaff` - Doctor, Secretary, Admin, SuperAdmin

### 1.3 Actualizar Serializers ✅
**Archivo:** `backend/apps/users/serializers.py`

- [x] Actualizar `UserSerializer` para incluir nuevos roles
- [x] Crear `DoctorProfileSerializer`
- [x] Crear `SecretaryProfileSerializer`

---

## 🏥 **FASE 2: MODELOS DE PERFIL EXTENDIDOS**

### 2.1 Modelo DoctorProfile ✅
**Archivo:** `backend/apps/doctors/models.py`

```python
class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    medical_license = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=100)
    years_experience = models.PositiveIntegerField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    bio = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    
    # Horarios de trabajo
    work_start_time = models.TimeField()
    work_end_time = models.TimeField()
    work_days = models.JSONField(default=list)  # ['monday', 'tuesday', ...]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 2.2 Modelo SecretaryProfile
**Archivo:** `backend/apps/users/models.py` (nueva sección)

```python
class SecretaryProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='secretary_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    shift_start = models.TimeField()
    shift_end = models.TimeField()
    can_manage_appointments = models.BooleanField(default=True)
    can_manage_patients = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Tareas:**
- [x] Crear `DoctorProfile` model
- [ ] Crear `SecretaryProfile` model
- [x] Crear signals para auto-crear perfiles
- [x] Crear migraciones y aplicar

---

## 🔗 **FASE 3: ENDPOINTS Y VIEWSETS**

### 3.1 Doctor ViewSets
**Archivo:** `backend/apps/doctors/views.py`

**Endpoints a implementar:**
- [ ] `GET /api/doctors/` - Lista de doctores (público)
- [ ] `GET /api/doctors/{id}/` - Detalle doctor (público)
- [ ] `GET /api/doctors/me/` - Perfil del doctor logueado
- [ ] `PUT /api/doctors/me/` - Actualizar perfil doctor
- [ ] `GET /api/doctors/me/appointments/` - Citas del doctor
- [ ] `GET /api/doctors/me/schedule/` - Horario del doctor
- [ ] `PUT /api/doctors/me/availability/` - Cambiar disponibilidad

### 3.2 Secretary ViewSets
**Archivo:** `backend/apps/users/views.py` (nueva sección)

**Endpoints a implementar:**
- [ ] `GET /api/secretaries/me/` - Perfil de secretaria
- [ ] `PUT /api/secretaries/me/` - Actualizar perfil
- [ ] `GET /api/secretaries/dashboard/` - Dashboard secretaria
- [ ] `GET /api/secretaries/appointments/` - Gestión de citas
- [ ] `POST /api/secretaries/appointments/` - Crear cita para paciente

### 3.3 Dashboard Endpoints
**Archivo:** `backend/apps/reports/views.py`

**Nuevos endpoints por rol:**
- [ ] `GET /api/dashboard/doctor/` - Stats para doctor
- [ ] `GET /api/dashboard/secretary/` - Stats para secretaria
- [ ] `GET /api/dashboard/admin/` - Stats para admin (actualizar)
- [ ] `GET /api/dashboard/client/` - Stats para cliente (actualizar)

---

## 🛡️ **FASE 4: SISTEMA DE PERMISOS GRANULAR**

### 4.1 Permisos por Endpoint
**Configuración de permisos:**

```python
# Doctores
'/api/doctors/me/' -> IsDoctor
'/api/doctors/me/appointments/' -> IsDoctor
'/api/doctors/{id}/appointments/' -> IsDoctorOwnerOrAdmin

# Secretarias  
'/api/secretaries/appointments/' -> IsSecretaryOrAdmin
'/api/patients/' -> IsSecretaryOrAdmin (lectura)

# Administradores
'/api/admin/users/' -> IsAdminOrSuperAdmin
'/api/admin/doctors/' -> IsAdminOrSuperAdmin

# Super Administradores
'/api/admin/system/' -> IsSuperAdmin
```

### 4.2 Middleware de Roles
**Archivo:** `backend/core/middleware.py`

- [ ] Crear middleware para logging de acciones por rol
- [ ] Implementar rate limiting por rol
- [ ] Crear audit trail para acciones administrativas

---

## 📱 **FASE 5: INTEGRACIÓN CON FRONTEND**

### 5.1 Servicios de API (Frontend)
**Archivos a crear/actualizar:**

- [ ] `frontend/src/services/doctorService.ts`
- [ ] `frontend/src/services/secretaryService.ts`
- [ ] `frontend/src/services/dashboardService.ts` (actualizar)

### 5.2 Tipos TypeScript
**Archivo:** `frontend/src/types/`

```typescript
// types/user.ts
export type UserRole = 'client' | 'doctor' | 'secretary' | 'admin' | 'superadmin';

// types/doctor.ts
export interface DoctorProfile {
  id: number;
  user: User;
  medical_license: string;
  specialization: string;
  years_experience: number;
  consultation_fee: number;
  bio: string;
  is_available: boolean;
  work_start_time: string;
  work_end_time: string;
  work_days: string[];
}

// types/secretary.ts
export interface SecretaryProfile {
  id: number;
  user: User;
  employee_id: string;
  department: string;
  shift_start: string;
  shift_end: string;
  can_manage_appointments: boolean;
  can_manage_patients: boolean;
}
```

### 5.3 Dashboards Específicos
**Archivos a crear:**

- [ ] `frontend/src/pages/dashboard/DoctorDashboard.tsx`
- [ ] `frontend/src/pages/dashboard/SecretaryDashboard.tsx`
- [ ] `frontend/src/pages/dashboard/AdminDashboard.tsx` (actualizar)
- [ ] `frontend/src/pages/dashboard/SuperAdminDashboard.tsx`

---

## 🧪 **FASE 6: TESTING Y VALIDACIÓN**

### 6.1 Tests Backend
- [ ] Tests unitarios para nuevos modelos
- [ ] Tests de permisos por rol
- [ ] Tests de endpoints específicos
- [ ] Tests de integración

### 6.2 Tests Frontend
- [ ] Tests de componentes por rol
- [ ] Tests de navegación protegida
- [ ] Tests de servicios API
- [ ] Tests E2E por flujo de usuario

### 6.3 Datos de Prueba
- [ ] Crear fixtures con usuarios de todos los roles
- [ ] Crear comando de management para datos demo
- [ ] Configurar seeds para desarrollo

---

## 📋 **FASE 7: MIGRACIÓN Y DEPLOYMENT**

### 7.1 Migración de Datos
- [ ] Script para migrar usuarios existentes
- [ ] Asignar roles por defecto
- [ ] Crear perfiles automáticamente

### 7.2 Configuración de Producción
- [ ] Variables de entorno para nuevos roles
- [ ] Configuración de permisos en servidor
- [ ] Backup antes de migración

---

## 🔄 **ORDEN DE IMPLEMENTACIÓN RECOMENDADO**

### Semana 1: Backend Core
1. ✅ Actualizar modelo User (roles)
2. ✅ Crear modelos de perfil
3. ✅ Actualizar sistema de permisos
4. ✅ Crear migraciones

### Semana 2: APIs y Endpoints
1. ✅ Implementar ViewSets para doctores
2. ✅ Implementar ViewSets para secretarias
3. ✅ Crear endpoints de dashboard
4. ✅ Configurar permisos granulares

### Semana 3: Frontend Integration
1. ✅ Actualizar tipos TypeScript
2. ✅ Crear servicios de API
3. ✅ Implementar dashboards específicos
4. ✅ Actualizar navegación y rutas

### Semana 4: Testing y Polish
1. ✅ Tests completos
2. ✅ Datos de prueba
3. ✅ Documentación
4. ✅ Deployment

---

## 🎯 **CRITERIOS DE ÉXITO**

### ✅ **Backend Completo:**
- [ ] 5 roles funcionando correctamente
- [ ] Todos los endpoints necesarios implementados
- [ ] Permisos granulares configurados
- [ ] Tests pasando al 100%

### ✅ **Frontend Sincronizado:**
- [ ] Todas las rutas funcionando
- [ ] Dashboards específicos por rol
- [ ] Navegación dinámica por permisos
- [ ] Integración completa con APIs

### ✅ **Sistema Integral:**
- [ ] Login/logout con todos los roles
- [ ] Redirección automática por rol
- [ ] Funcionalidades específicas por usuario
- [ ] Performance optimizada

---

## 📚 **RECURSOS Y REFERENCIAS**

### Documentación Relacionada:
- 📄 `GUIA_DESARROLLO_DJANGO.md`
- 📄 `GUIA_DESARROLLO_REACT.md`
- 📄 `DOCUMENTACION_SISTEMA_CITAS.md`
- 📄 `PATRONES_DISEÑO_DASHBOARD.md`

### Archivos Clave a Modificar:
- 🔧 `backend/apps/users/models.py`
- 🔧 `backend/core/permissions.py`
- 🔧 `frontend/src/types/auth.ts`
- 🔧 `frontend/src/App.tsx`
- 🔧 `frontend/src/config/navigation.ts`

---

## 🚀 **PRÓXIMOS PASOS**

1. **Revisar y aprobar este plan**
2. **Comenzar con Fase 1: Actualización de roles**
3. **Implementar paso a paso siguiendo el orden recomendado**
4. **Testing continuo en cada fase**
5. **Documentar cambios y decisiones**

---

*📝 Documento creado para sincronizar completamente el backend Django con el frontend React, asegurando compatibilidad total entre ambas partes del sistema.*