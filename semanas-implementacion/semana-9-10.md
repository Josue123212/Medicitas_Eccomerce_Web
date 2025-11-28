# Semanas 9 y 10 – Consolidado: Completar funcionalidades Frontend por roles (Doctor, Secretaría, Cliente) y estabilizar contratos Backend

Resumen y alcance
- Unificamos Semana 9 y Semana 10 en un solo sprint operativo para acelerar la entrega funcional.
- Prioridad: completar las funcionalidades faltantes del frontend para los roles Doctor, Secretaría y Cliente, con contratos backend validados.
- Se posponen maquetaciones de Farmacia, Telemedicina y Reputación hasta estabilizar estos flujos por rol.

Objetivos principales
- Frontend: terminar vistas, rutas y componentes por rol con manejo de errores homogéneo y ProtectedRoute + AuthContext.
- Backend: asegurar endpoints y respuestas consistentes para los flujos de Doctor, Secretaría y Cliente.
- Observabilidad: logs útiles en frontend (toasts + servicio de logging en dev) y trazas en backend.

Cómo obtendremos la información
- Backend (Django/DRF):
  - python manage.py shell < backend/debug_doctor_me_api.py
  - python manage.py shell < backend/debug_doctor_appointments.py
  - python manage.py shell < backend/debug_doctor_patch.py
  - python manage.py shell < backend/debug_secretary_error.py
  - python manage.py shell < backend/check_user_permissions.py
  - python manage.py shell < backend/check_urls.py
  - Referencia: backend/TESTING_SECRETARIES_ENDPOINTS.md y backend/schema.yml.
- Frontend (React):
  - Revisar src/services/* (api.ts, authService.ts, appointmentService.ts).
  - React DevTools/React Query DevTools (solo dev) y eliminar console.error en producción.

Plan por rol (Frontend)

Doctor
- Vistas: Panel del Doctor (listado de citas, filtros por estado/fecha), Detalle de cita, Mi perfil.
- Acciones: confirmar/rechazar/completar cita; editar notas; ver historial del paciente relacionado.
- Servicios/API: appointmentService.getDoctorAppointments(), appointmentService.updateAppointmentStatus(), api.get('/doctor/me').
- UI: componentes para lista de citas (virtualizada si es larga), modal de cambio de estado, toasts de éxito/error.
- Contratos: validar PATCH/PUT de citas (ver debug_doctor_patch.py) y estructura de respuesta homogénea.

Secretaría
- Vistas: Panel de Secretaría (crear/editar/cancelar citas), gestión de pacientes, asignación/reasignación a doctores.
- Acciones: crear cita desde formulario, editar horarios, cancelar/reprogramar, ver conflictos/solapamientos.
- Servicios/API: appointmentService.createAppointment(), appointmentService.patchAppointment(), appointmentService.cancelAppointment().
- UI: formularios con validación (400/422), feedback de estados, listados con filtros.
- Contratos: seguir backend/TESTING_SECRETARIES_ENDPOINTS.md y backend/schema.yml.

Cliente (Paciente)
- Vistas: catálogo de doctores/especialidades, reserva de cita, mis citas (listar, cancelar, reprogramar).
- Acciones: alta y login; reservar cita; cancelar/reprogramar; ver detalles/ubicación.
- Servicios/API: appointmentService.getPatientAppointments(), appointmentService.bookAppointment(), appointmentService.cancelAppointment().
- UI: wizard/flow de reserva, confirmaciones, toasts; ErrorBoundary para fallos de render.
- Contratos: verificar que el usuario nuevo ya trae rol/permisos adecuados (check_user_permissions.py).

Tareas transversales (Frontend)
- Rutas y roles: ProtectedRoute + AuthContext, guards por rol y fallback 403.
- Errores y notificaciones: servicio central + toasts, sin console.error en producción.
- Estilos: respetar jerarquía de theme.css; migrar estilos “trackeados” a tokens/variables.

Tareas transversales (Backend)
- Vistas/serializers: respuestas homogéneas {status, data, error}, códigos HTTP consistentes.
- Endpoints: completar los usados por frontend; cubrir PATCH/PUT de citas y validaciones por rol.
- Logging: request-id, contadores de errores y tiempos de respuesta.

Entregables
- Frontend: rutas, vistas y componentes por rol (Doctor, Secretaría, Cliente) completos y probados.
- Backend: endpoints clave validados; documentación mínima de contratos usada por frontend.
- Informe de cambios y tickets cerrados.

Criterios de aceptación
- Flujos por rol funcionales end-to-end en dev: Doctor (gestión de citas), Secretaría (gestión/creación de citas), Cliente (reserva/cancelación).
- Errores visibles manejados con UI (toasts/alerts); sin tokens en consola en producción.
- ProtectedRoute y guards por rol funcionando; fallback 403 consistente.

Checklist operativo
- Backend: ejecutar scripts de debug (doctor, secretaria); check_user_permissions.py y check_urls.py.
- Frontend: implementar servicios y componentes por rol; integrar notificaciones; auditar theme.css.
- Pruebas: unitarias e integración; smoke E2E de flujos principales.

Cronograma sugerido (5-7 días)
- Día 1: Auditoría de contratos y definición de endpoints/servicios por rol.
- Día 2-3: Implementar vistas y servicios de Doctor; pruebas.
- Día 3-4: Implementar vistas y servicios de Secretaría; pruebas.
- Día 4-5: Implementar vistas y servicios de Cliente; pruebas.
- Día 6-7: Pulido, accesibilidad/performance, documentación y validación interna.

Riesgos y mitigación
- Desalineación Back/Front: usar schema.yml y docs de secretaría; mocks temporales si falta endpoint.
- Regresiones visuales: revisión en PRs y pruebas de integración.

Notas del usuario (preservadas de Semana 9)

- Vi que algunas vistas no se está usando la jerarquización de theme.css y algunos componentes también; se están usando estilos “trackeados”.
- Falta implementar funcionalidad a las vistas de algunos roles.