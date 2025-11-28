# Sistema de Notificaciones 🔔

## Descripción General

El sistema de notificaciones proporciona una solución completa para gestionar notificaciones en tiempo real para usuarios del sistema médico. Incluye diferentes tipos de notificaciones, gestión de estados y una API REST completa.

## Características Principales

- ✅ **Múltiples tipos de notificaciones**: Citas, sistema, recordatorios, resultados
- ✅ **Estados de lectura**: Leídas/No leídas con timestamps
- ✅ **Notificaciones automáticas**: Para eventos de citas médicas
- ✅ **API REST completa**: CRUD y operaciones especiales
- ✅ **Estadísticas detalladas**: Conteos por tipo y estado
- ✅ **Serialización optimizada**: Con campos calculados y metadatos

## Tipos de Notificaciones

### 1. Appointment (Citas)
- **Creación de cita**: Notifica a paciente y doctor
- **Confirmación**: Cuando se confirma una cita
- **Reprogramación**: Cuando cambia fecha/hora
- **Cancelación**: Cuando se cancela una cita

### 2. System (Sistema)
- Notificaciones administrativas
- Actualizaciones del sistema
- Mensajes importantes

### 3. Reminder (Recordatorios)
- Recordatorios de citas próximas
- Recordatorios de medicamentos
- Tareas pendientes

### 4. Result (Resultados)
- Resultados de exámenes disponibles
- Informes médicos listos

## API Endpoints

### Listar Notificaciones
```http
GET /api/notifications/
```
**Parámetros de consulta:**
- `is_read`: true/false - Filtrar por estado de lectura
- `type`: appointment/system/reminder/result - Filtrar por tipo
- `ordering`: created_at/-created_at - Ordenamiento

**Respuesta:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/notifications/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "type": "appointment",
      "type_display": "Cita médica",
      "title": "🎯 Cita Médica Programada",
      "message": "Su cita con Dr. García ha sido programada para el 15/01/2024 a las 10:00",
      "is_read": false,
      "created_at": "2024-01-10T14:30:00Z",
      "formatted_date": "10/01/2024 14:30",
      "time_ago": "hace 2 horas",
      "icon": "calendar"
    }
  ]
}
```

### Conteo de Notificaciones No Leídas
```http
GET /api/notifications/count/
```
**Respuesta:**
```json
{
  "unread_count": 5
}
```

### Estadísticas Detalladas
```http
GET /api/notifications/stats/
```
**Respuesta:**
```json
{
  "total": 25,
  "unread": 5,
  "read": 20,
  "by_type": {
    "appointment": {
      "total": 10,
      "unread": 2,
      "read": 8
    },
    "system": {
      "total": 8,
      "unread": 1,
      "read": 7
    },
    "reminder": {
      "total": 5,
      "unread": 2,
      "read": 3
    },
    "result": {
      "total": 2,
      "unread": 0,
      "read": 2
    }
  }
}
```

### Marcar Como Leída (Individual)
```http
POST /api/notifications/{id}/mark_read/
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

### Marcar Todas Como Leídas
```http
POST /api/notifications/mark-all-read/
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Todas las notificaciones han sido marcadas como leídas",
  "updated_count": 5
}
```

### Marcar Múltiples Como Leídas
```http
POST /api/notifications/bulk-mark-read/
```
**Body:**
```json
{
  "notification_ids": [1, 2, 3, 4]
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "4 notificaciones marcadas como leídas",
  "updated_count": 4
}
```

### Eliminar Notificación
```http
DELETE /api/notifications/{id}/delete/
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación eliminada correctamente"
}
```

### Actualizar Notificación
```http
PUT /api/notifications/{id}/
PATCH /api/notifications/{id}/
```
**Body (PATCH):**
```json
{
  "is_read": true
}
```

### Crear Notificación (Testing)
```http
POST /api/notifications/create/
```
**Body:**
```json
{
  "type": "system",
  "title": "Notificación de prueba",
  "message": "Este es un mensaje de prueba"
}
```

## Uso del Servicio

### Importar el Servicio
```python
from apps.notifications.services import NotificationService
```

### Crear Notificaciones

#### Notificación de Sistema
```python
NotificationService.create_system_notification(
    user=user,
    title="Actualización del Sistema",
    message="El sistema se actualizará el próximo domingo"
)
```

#### Notificación de Recordatorio
```python
NotificationService.create_reminder_notification(
    user=user,
    title="Recordatorio de Cita",
    message="Su cita es mañana a las 10:00 AM"
)
```

#### Notificación de Cita (Automática)
```python
# Se crean automáticamente cuando:
# - Se crea una nueva cita
# - Se cambia el estado de una cita
# - Se modifica la fecha/hora de una cita
```

### Obtener Estadísticas
```python
stats = NotificationService.get_notification_stats(user)
print(f"Total: {stats['total']}")
print(f"No leídas: {stats['unread']}")
```

### Marcar Como Leídas
```python
# Una notificación específica
NotificationService.mark_notification_as_read(notification_id, user)

# Todas las notificaciones del usuario
NotificationService.mark_all_as_read(user)

# Conteo de no leídas
count = NotificationService.get_unread_count(user)
```

## Integración con Frontend

### React Query Hook Ejemplo
```javascript
// hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';

export const useNotifications = (filters = {}) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationAPI.getNotifications(filters),
    refetchInterval: 30000, // Refetch cada 30 segundos
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: notificationAPI.getStats,
    refetchInterval: 60000, // Refetch cada minuto
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notification-stats']);
    },
  });
};
```

### Componente de Notificaciones
```javascript
// components/NotificationBell.jsx
import { useNotificationStats } from '../hooks/useNotifications';

const NotificationBell = () => {
  const { data: stats } = useNotificationStats();
  
  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      {stats?.unread > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {stats.unread > 99 ? '99+' : stats.unread}
        </span>
      )}
    </div>
  );
};
```

## Signals Automáticos

El sistema incluye signals que crean notificaciones automáticamente:

### Citas Médicas
- **post_save**: Cuando se crea una nueva cita
- **post_save**: Cuando cambia el estado de una cita
- **post_save**: Cuando se modifica fecha/hora

### Configuración en `signals.py`
```python
@receiver(post_save, sender=Appointment)
def create_appointment_notifications(sender, instance, created, **kwargs):
    if created:
        # Notificación de nueva cita
        NotificationService.create_appointment_notification(
            patient=instance.patient.user,
            doctor=instance.doctor.user,
            appointment=instance,
            notification_type='created'
        )
```

## Configuración

### Settings
```python
# settings/base.py
INSTALLED_APPS = [
    # ...
    'apps.notifications',
]

# Configuración de notificaciones
NOTIFICATION_SETTINGS = {
    'AUTO_CREATE_ON_APPOINTMENT': True,
    'RETENTION_DAYS': 90,  # Días para mantener notificaciones
}
```

### URLs
```python
# urls.py
urlpatterns = [
    path('api/notifications/', include('apps.notifications.urls')),
]
```

## Testing

### Crear Datos de Prueba
```python
# En Django shell
from apps.users.models import User
from apps.notifications.services import NotificationService

user = User.objects.first()

# Crear notificaciones de prueba
NotificationService.create_system_notification(
    user=user,
    title="Bienvenido al Sistema",
    message="Gracias por registrarte en nuestro sistema médico"
)

NotificationService.create_reminder_notification(
    user=user,
    title="Cita Próxima",
    message="Recuerda tu cita de mañana a las 10:00 AM"
)
```

### Verificar Funcionamiento
```python
# Obtener estadísticas
stats = NotificationService.get_notification_stats(user)
print(f"Estadísticas: {stats}")

# Listar notificaciones
notifications = user.notifications.all()[:5]
for notif in notifications:
    print(f"{notif.title} - {notif.type} - Leída: {notif.is_read}")
```

## Próximas Mejoras

- [ ] **WebSockets**: Notificaciones en tiempo real
- [ ] **Push Notifications**: Notificaciones del navegador
- [ ] **Email Integration**: Envío por correo electrónico
- [ ] **Templates**: Plantillas personalizables
- [ ] **Scheduling**: Notificaciones programadas
- [ ] **Analytics**: Métricas de engagement

## Troubleshooting

### Problemas Comunes

1. **Notificaciones no se crean automáticamente**
   - Verificar que los signals estén registrados
   - Comprobar que `apps.notifications` esté en `INSTALLED_APPS`

2. **Error de encoding en caracteres especiales**
   - Verificar configuración UTF-8 en la base de datos
   - Usar caracteres ASCII en lugar de emojis si es necesario

3. **API endpoints no responden**
   - Verificar que las URLs estén incluidas correctamente
   - Comprobar autenticación del usuario

### Logs Útiles
```python
import logging
logger = logging.getLogger('notifications')

# En el servicio
logger.info(f"Notificación creada para {user.username}: {title}")
```

---

**Desarrollado para el Sistema Médico Django-React**  
*Versión: 1.0.0*  
*Última actualización: Enero 2024*