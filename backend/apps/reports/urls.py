from django.urls import path
from . import views


# 🔄 CONFIGURACIÓN DE URLs PARA REPORTES
# Estas rutas proporcionan acceso a todos los endpoints de reportes y analytics

app_name = 'reports'

urlpatterns = [
    # 📊 Estadísticas básicas del sistema
    path(
        'stats/basic/',
        views.basic_stats,
        name='basic_stats'
    ),
    
    # 📅 Reporte de citas por período
    path(
        'appointments/period/',
        views.appointments_by_period,
        name='appointments_by_period'
    ),
    
    # 👨‍⚕️ Doctores más populares/solicitados
    path(
        'doctors/popular/',
        views.popular_doctors,
        name='popular_doctors'
    ),
    
    # ❌ Métricas de cancelaciones
    path(
        'cancellations/metrics/',
        views.cancellation_metrics,
        name='cancellation_metrics'
    ),
    
    # 🎯 Resumen ejecutivo para dashboard
    path(
        'dashboard/summary/',
        views.dashboard_summary,
        name='dashboard_summary'
    ),
    
    # =============================================================================
    # 🎯 DASHBOARD ENDPOINTS ESPECÍFICOS POR ROL
    # =============================================================================
    
    # 👨‍⚕️ Dashboard para doctores
    path(
        'dashboard/doctor/',
        views.doctor_dashboard,
        name='doctor_dashboard'
    ),
    
    # 👩‍💼 Dashboard para secretarias
    path(
        'dashboard/secretary/',
        views.secretary_dashboard,
        name='secretary_dashboard'
    ),
    
    # 👨‍💼 Dashboard para administradores (actualizado)
    path(
        'dashboard/admin/',
        views.admin_dashboard,
        name='admin_dashboard'
    ),
    
    # 👤 Dashboard para clientes/pacientes
    path(
        'dashboard/client/',
        views.client_dashboard,
        name='client_dashboard'
    ),
    
    # 🔧 Dashboard para super administradores
    path(
        'dashboard/superadmin/',
        views.superadmin_dashboard,
        name='superadmin_dashboard'
    ),
    
    # =============================================================================
    # 📥 ENDPOINTS DE EXPORTACIÓN CSV
    # =============================================================================
    
    # 📋 Exportar citas a CSV con filtros
    path(
        'export/appointments/',
        views.export_appointments_csv,
        name='export_appointments_csv'
    ),
    
    # 👥 Exportar pacientes a CSV
    path(
        'export/patients/',
        views.export_patients_csv,
        name='export_patients_csv'
    ),
    
    # 👨‍⚕️ Exportar doctores a CSV
    path(
        'export/doctors/',
        views.export_doctors_csv,
        name='export_doctors_csv'
    ),
    
    # 📊 Exportar reporte completo del sistema
    path(
        'export/full-report/',
        views.export_full_report_csv,
        name='export_full_report_csv'
    ),
]


# 📋 DOCUMENTACIÓN DE ENDPOINTS:
"""
🔗 RUTAS DISPONIBLES:

1. /api/reports/stats/basic/
   - Método: GET
   - Permisos: Admin/SuperAdmin
   - Descripción: Estadísticas generales del sistema
   - Parámetros: Ninguno

2. /api/reports/appointments/period/
   - Método: GET
   - Permisos: Admin/SuperAdmin
   - Descripción: Reporte de citas agrupadas por fecha
   - Parámetros: start_date, end_date, doctor_id (opcionales)

3. /api/reports/doctors/popular/
   - Método: GET
   - Permisos: Admin/SuperAdmin
   - Descripción: Ranking de doctores por número de citas
   - Parámetros: start_date, end_date (opcionales)

4. /api/reports/cancellations/metrics/
   - Método: GET
   - Permisos: Admin/SuperAdmin
   - Descripción: Análisis detallado de cancelaciones
   - Parámetros: start_date, end_date (opcionales)

5. /api/reports/dashboard/summary/
   - Método: GET
   - Permisos: Admin/SuperAdmin
   - Descripción: Resumen ejecutivo para dashboard
   - Parámetros: Ninguno

🎯 DASHBOARD ENDPOINTS POR ROL:

6. /api/reports/dashboard/doctor/
   - Método: GET
   - Permisos: IsDoctor
   - Descripción: Dashboard personalizado para doctores
   - Incluye: citas del doctor, pacientes, horarios, próximas citas

7. /api/reports/dashboard/secretary/
   - Método: GET
   - Permisos: IsSecretary
   - Descripción: Dashboard para secretarias
   - Incluye: citas del día, pacientes nuevos, tareas pendientes

8. /api/reports/dashboard/admin/
   - Método: GET
   - Permisos: IsAdminOrSuperAdmin
   - Descripción: Dashboard completo para administradores
   - Incluye: métricas del sistema, top doctores, tasas de rendimiento

9. /api/reports/dashboard/client/
   - Método: GET
   - Permisos: IsClient
   - Descripción: Dashboard personalizado para pacientes
   - Incluye: próximas citas, historial, doctores frecuentes

🔒 SEGURIDAD:
- Todos los endpoints requieren autenticación
- Permisos específicos por rol implementados
- Cada usuario solo ve sus propios datos
- Los filtros de fecha son validados automáticamente

📊 EJEMPLOS DE USO:
- GET /api/reports/stats/basic/
- GET /api/reports/appointments/period/?start_date=2024-01-01&end_date=2024-01-31
- GET /api/reports/doctors/popular/?start_date=2024-01-01
- GET /api/reports/cancellations/metrics/
- GET /api/reports/dashboard/summary/
- GET /api/reports/dashboard/doctor/
- GET /api/reports/dashboard/secretary/
- GET /api/reports/dashboard/admin/
- GET /api/reports/dashboard/client/
"""