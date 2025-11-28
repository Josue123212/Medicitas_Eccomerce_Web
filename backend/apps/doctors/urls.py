from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, DoctorProfileViewSet, DoctorListViewSet, public_doctors_list, doctor_me_view

# Router principal para DoctorViewSet
router = DefaultRouter()
router.register(r'', DoctorViewSet, basename='doctor')

# Router separado para DoctorProfileViewSet (para otros endpoints)
profile_router = DefaultRouter()
profile_router.register(r'', DoctorProfileViewSet, basename='doctor-profile')

# Router para endpoints públicos de doctores
public_router = DefaultRouter()
public_router.register(r'', DoctorListViewSet, basename='doctor-public')

app_name = 'doctors'

urlpatterns = [
    # Ruta simple para doctores públicos (debe ir ANTES del router)
    path('public/', public_doctors_list, name='doctor-public-list'),
    # Router para endpoints públicos de doctores (especializations, stats, search)
    path('public/', include(public_router.urls)),
    # Ruta directa para el perfil del doctor
    path('me/', doctor_me_view, name='doctor-me'),
    # Router para otros endpoints de perfil de doctor
    path('me/', include(profile_router.urls)),
    # Router principal de DRF (ViewSet) - Rutas principales
    path('', include(router.urls)),
]

"""
Estructura de URLs resultante:

# ViewSet Routes (Principales)
/api/doctors/                           - GET (list), POST (create)
/api/doctors/{id}/                      - GET (retrieve), PUT (update), PATCH (partial_update), DELETE (destroy)
/api/doctors/{id}/available_slots/      - GET (horarios disponibles del doctor)
/api/doctors/{id}/schedule/             - GET (agenda completa del doctor)
/api/doctors/{id}/statistics/           - GET (estadísticas del doctor)
/api/doctors/{id}/toggle_availability/  - POST (cambiar disponibilidad del doctor)
/api/doctors/{id}/public_profile/       - GET (perfil público del doctor)

# Filtros disponibles en la lista:
# ?search=texto                         - Búsqueda general
# ?specialization=cardiologia           - Filtrar por especialización
# ?is_available=true                    - Filtrar por disponibilidad
# ?consultation_fee_min=50              - Filtrar por tarifa mínima
# ?consultation_fee_max=200             - Filtrar por tarifa máxima
# ?years_of_experience_min=5            - Filtrar por años de experiencia mínimos
# ?ordering=first_name,-years_of_experience - Ordenar resultados

Ejemplos de uso:
- GET /api/doctors/ - Lista todos los doctores
- GET /api/doctors/?search=cardio - Busca doctores con 'cardio' en nombre/especialización
- GET /api/doctors/?specialization=cardiologia - Doctores cardiólogos
- GET /api/doctors/?is_available=true - Solo doctores disponibles
- GET /api/doctors/1/available_slots/ - Horarios disponibles del doctor 1
- GET /api/doctors/1/schedule/ - Agenda completa del doctor 1
- GET /api/doctors/1/statistics/ - Estadísticas del doctor 1
- POST /api/doctors/1/toggle_availability/ - Cambiar disponibilidad
- GET /api/doctors/1/public_profile/ - Perfil público del doctor 1
- POST /api/doctors/ - Crear nuevo doctor
- PUT /api/doctors/1/ - Actualizar doctor completo
- PATCH /api/doctors/1/ - Actualización parcial del doctor
- DELETE /api/doctors/1/ - Eliminar doctor
"""