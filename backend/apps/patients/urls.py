from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PatientViewSet

# Router para ViewSets
router = DefaultRouter()
router.register(r'', PatientViewSet, basename='patient')

app_name = 'patients'

urlpatterns = [
    # Router de DRF (ViewSet) - Rutas principales
    path('', include(router.urls)),
]

"""
Estructura de URLs resultante:

# ViewSet Routes (Principales)
/api/patients/                          - GET (list), POST (create)
/api/patients/{id}/                     - GET (retrieve), PUT (update), PATCH (partial_update), DELETE (destroy)
/api/patients/{id}/medical-history/     - GET (historial médico del paciente)
/api/patients/{id}/appointments/        - GET (citas del paciente)
/api/patients/{id}/statistics/          - GET (estadísticas del paciente)

# Filtros disponibles en la lista:
# ?search=texto                         - Búsqueda general
# ?blood_type=A+                        - Filtrar por tipo de sangre
# ?age_min=18&age_max=65               - Filtrar por rango de edad
# ?medical_conditions=diabetes          - Filtrar por condiciones médicas
# ?allergies=penicilina                - Filtrar por alergias
# ?ordering=first_name,-date_of_birth  - Ordenar resultados

Ejemplos de uso:
- GET /api/patients/ - Lista todos los pacientes
- GET /api/patients/?search=juan - Busca pacientes con 'juan' en nombre/apellido
- GET /api/patients/?blood_type=O+ - Pacientes con tipo de sangre O+
- GET /api/patients/1/medical_history/ - Historial médico del paciente 1
- GET /api/patients/1/appointments/ - Citas del paciente 1
- POST /api/patients/ - Crear nuevo paciente
- PUT /api/patients/1/ - Actualizar paciente completo
- PATCH /api/patients/1/ - Actualización parcial del paciente
- DELETE /api/patients/1/ - Eliminar paciente
"""