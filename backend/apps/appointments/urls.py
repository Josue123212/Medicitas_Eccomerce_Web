from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet

# Router para ViewSets
router = DefaultRouter()
router.register(r'', AppointmentViewSet, basename='appointment')

app_name = 'appointments'

urlpatterns = [
    # Router de DRF (ViewSet) - Rutas principales
    path('', include(router.urls)),
]

"""
Estructura de URLs resultante:

# ViewSet Routes (Principales)
/api/appointments/                      - GET (list), POST (create)
/api/appointments/{id}/                 - GET (retrieve), PUT (update), PATCH (partial_update), DELETE (destroy)
/api/appointments/{id}/confirm/         - POST (confirmar cita)
/api/appointments/{id}/cancel/          - POST (cancelar cita)
/api/appointments/{id}/complete/        - POST (completar cita)
/api/appointments/{id}/reschedule/      - POST (reprogramar cita)
/api/appointments/patient-history/      - GET (historial de citas de un paciente)
/api/appointments/doctor_schedule/      - GET (agenda de un doctor)
/api/appointments/available_slots/      - GET (horarios disponibles)

# Filtros disponibles en la lista:
# ?status=scheduled                     - Filtrar por estado
# ?date=2024-01-15                     - Filtrar por fecha específica
# ?date_from=2024-01-01&date_to=2024-01-31 - Filtrar por rango de fechas
# ?doctor=1                            - Filtrar por doctor
# ?patient=1                           - Filtrar por paciente
# ?search=texto                        - Búsqueda general
# ?future=true                         - Solo citas futuras
# ?past=true                           - Solo citas pasadas
# ?ordering=appointment_date,-created_at - Ordenar resultados

Ejemplos de uso:
- GET /api/appointments/ - Lista todas las citas
- GET /api/appointments/?status=scheduled - Solo citas programadas
- GET /api/appointments/?doctor=1 - Citas del doctor 1
- GET /api/appointments/?patient=1 - Citas del paciente 1
- GET /api/appointments/?future=true - Solo citas futuras
- GET /api/appointments/?date=2024-01-15 - Citas del 15 de enero
- POST /api/appointments/1/confirm/ - Confirmar cita 1
- POST /api/appointments/1/cancel/ - Cancelar cita 1
- POST /api/appointments/1/complete/ - Completar cita 1
- POST /api/appointments/1/reschedule/ - Reprogramar cita 1
- GET /api/appointments/patient_history/?patient_id=1 - Historial del paciente 1
- GET /api/appointments/doctor_schedule/?doctor_id=1 - Agenda del doctor 1
- GET /api/appointments/available_slots/?doctor_id=1&date=2024-01-15 - Horarios disponibles
- POST /api/appointments/ - Crear nueva cita
- PUT /api/appointments/1/ - Actualizar cita completa
- PATCH /api/appointments/1/ - Actualización parcial de la cita
- DELETE /api/appointments/1/ - Eliminar cita
"""