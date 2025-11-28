Nota: Semana 9 se consolidó con Semana 10 en semanas-implementacion/semana-9-10.md. Para el trabajo actual, usaremos ese documento como referencia única.

# Semana 9 – Diagnóstico y Refactorización (Backend Django y Frontend React)

Resumen alineado al plan general
- Según el documento "Plan de Implementación Post 8 Semanas (Semana 9 a 16)", la Semana 9 se centra en refactorización de vistas/endpoints, corrección de fallas en Django y estabilización del backend con mejoras en pruebas y observabilidad. Aquí se detalla el plan operativo con mayor granularidad y se incorporan las notas reportadas por el usuario.

Objetivos específicos
- Verificar que al registrarse un nuevo cliente se asigna correctamente el rol y permisos por defecto para reservar; enfocar el trabajo en el resto de objetivos (endpoints, observabilidad, jerarquización de theme.css y errores UI).
- Estandarizar respuestas y manejo de errores en vistas/endpoints clave (citas, usuarios, secretarias, médicos).
- Implementar endpoints faltantes referenciados por el frontend (especialmente Secretaría y Médicos), reduciendo TODOs.
- Mejorar observabilidad: logging estructurado, trazas y métricas básicas.
- En frontend, aplicar jerarquización de estilos según theme.css y remover estilos “trackeados” no alineados.
- Homogeneizar el manejo de errores en UI, reemplazando console.error por notificaciones/toasts y un servicio de logs.
- Mantener Spring Boot pausado hasta semana 12; esta semana es estabilización Django/React.

Fuentes y pasos para obtener información de errores
- Backend (Django/DRF):
  - Scripts de diagnóstico y reproducción (ejecutar mediante shell para cargar el contexto de Django):
    - python manage.py shell < backend/debug_secretary_error.py
    - python manage.py shell < backend/debug_doctor_patch.py
    - python manage.py shell < backend/debug_doctor_appointments.py
    - python manage.py shell < backend/debug_patient_history_endpoint.py
    - python manage.py shell < backend/debug_frontend_call.py
    - python manage.py shell < backend/debug_constraint.py
  - Chequeos y validadores:
    - python manage.py shell < backend/check_user_permissions.py (roles/permissions por usuario)
    - python manage.py shell < backend/check_urls.py (mapeo y salud de endpoints)
    - python manage.py shell < backend/validate_production_config.py (flags y cabeceras)
  - Configuración de logging:
    - Revisar backend/core/logging_hooks.py y config/settings.py (LOGGING) para formateadores, niveles y request-id.
    - Añadir logger.error/exception en puntos críticos de vistas y serializers.
  - Documentación de contratos:
    - backend/schema.yml para endpoints esperados y respuestas.
    - backend/TESTING_SECRETARIES_ENDPOINTS.md para flujos de secretarías.
- Frontend (React):
  - Localizar y estandarizar console.error y paneles de debug:
    - Revisar src/services/api.ts, authService.ts, appointmentService.ts, hooks/useNotifications.ts y páginas clave.
    - Desactivar componentes de debug en producción: src/components/debug/* (LocationDebugger, PatientsDebug, AuthDebug, ModalDebugger).
  - Herramientas de depuración:
    - Habilitar React Query DevTools en desarrollo (ver justificacion(md)/GUIA_DESARROLLO_REACT.md).

Hallazgos priorizados (incluye notas del usuario)
- Permisos post-registro: verificado que se asigna rol por defecto al registrarse; revisar si existen casos de restricción residual en reservas y documentarlos.
- Jerarquización de estilos: en algunas vistas y componentes no se respeta theme.css; hay estilos “trackeados” fuera del sistema de diseño.
- Funcionalidad por rol: faltan capacidades en vistas de ciertos roles (Secretaria, Médico, Paciente) según alcance esperado.
- Backend: flujos PATCH y constraints reportan errores (ver scripts de debug mencionados).
- Frontend: uso extendido de console.error sin canalización a UI; tokens impresos en consola (api.ts) deben limitarse a entorno de desarrollo.
- Sincronización Back/Front: checklist con ítems pendientes en justificacion(md)/SINCRONIZACION_BACKEND_FRONTEND.md.

Plan técnico detallado
- Backend Django / DRF
  - Verificación de roles y permisos (confirmado)
    - Confirmar mediante backend/check_user_permissions.py que el nuevo usuario recibe Group + Permissions adecuados.
    - Documentar el mapeo rol→permisos en backend/core/permissions.py y fixtures; no se requiere implementar nueva señal post_save.
    - Foco en endpoints y validaciones por rol; corregir respuestas y contratos.
  - Roles y permisos (alta prioridad):
    - Definir rol por defecto al registrarse (Paciente) y asignación automática de permisos mínimos para reservar.
    - Implementar señal post_save en el modelo User (apps/users) o pipeline de creación que asigne Group + Permissions.
    - Revisar y actualizar backend/core/permissions.py; documentar el mapeo rol→permisos.
    - Añadir fixtures de grupos/permisos y script de sincronización.
  - Vistas y serializers clave:
    - Citas, Usuarios, Secretarias, Médicos: unificar estructura de respuesta {status, data, error}, códigos HTTP y manejo de excepciones.
    - Eliminar duplicaciones y estandarizar validaciones y permisos por endpoint.
  - Endpoints pendientes y contratos:
    - Implementar/ajustar endpoints usados por frontend (ver src/services/secretaryService.ts y schema.yml).
    - Mantener tests de contrato básicos para endpoints críticos.
  - Observabilidad y seguridad:
    - LOGGING estructurado con correlación (request-id), contadores de errores y tiempos de respuesta.
    - validate_production_config.py: asegurar que en producción DEBUG=False y cabeceras seguras.
  - Pruebas:
    - Unitarias e integración para creación/edición/cancelación de citas y gestión de perfiles.
    - Convertir scripts de debug en tests reproducibles cuando sea viable.

- Frontend React
  - Manejo de errores y notificaciones:
    - Reemplazar console.error por servicio de logging en desarrollo y toasts/alerts en UI para el usuario.
    - Añadir un ErrorBoundary global y mensajes consistentes.
  - Jerarquización de estilos:
    - Auditar componentes que no usan theme.css; migrar estilos “trackeados” a tokens/variables del tema.
    - Unificar tipografías, colores y espaciados siguiendo el Design System base.
  - Flujos y componentes con TODO:
    - ProtectedRoute.tsx: conectar con AuthContext real y estados.
    - AppointmentCard.tsx: modal de reprogramación y validaciones.
    - DoctorProfile.tsx: navegación hacia formulario de cita.
  - Accesibilidad y performance:
    - Mejoras en LCP/CLS, memoización de listas y lazy loading donde aplique.

Entregables de la semana
- Informe de diagnóstico con problemas reproducidos, trazas y referencias (archivo + tickets).
- Backend: vistas/endpoints refactorizados, mapeo rol→permisos verificado y documentado, fixtures confirmados.
- Suite de pruebas con cobertura ≥ 60% en módulos críticos del backend; pruebas de integración de flujos clave.
- Frontend: manejo de errores homogéneo y prototipos/wireframes de nuevas funciones.

Criterios de aceptación
- Un usuario recién registrado puede reservar una cita sin intervención manual.
- Respuestas API consistentes (códigos de estado y formato) y tiempo medio < 300ms en dev para endpoints críticos.
- Reducción de errores en logs y ausencia de impresión de secretos en consola en producción.
- UI con toasts/alerts para errores y sin componentes de debug visibles en producción.
- Pipeline CI/CD en verde para ramas principales.

Métricas
- Tiempo medio de respuesta < 300ms en endpoints críticos (dev).
- Errores por 1000 requests disminuyen ≥ 30% respecto a la línea base.
- Cobertura de pruebas: backend ≥ 60%, frontend ≥ 50% en componentes afectados.

Checklist operativo
- Backend
  - Verificar roles/permisos y comprobar con check_user_permissions.py (en lugar de sincronizar).
  - Ejecutar scripts de debug y fijar fallas: secretary_error, doctor_patch, doctor_appointments, patient_history, frontend_call, constraint.
  - Ajustar LOGGING en settings.py y revisar hooks en core/logging_hooks.py.
  - Implementar endpoints faltantes y validar con schema.yml y tests.
  - Sincronizar roles/permisos y verificar con check_user_permissions.py.
- Frontend
  - Sustituir console.error por servicio central y notificaciones.
  - Integrar ProtectedRoute con AuthContext y estados.
  - Aplicar jerarquización de theme.css y retirar estilos “trackeados”.
  - Desactivar paneles de debugging en producción.

Comandos útiles
- cd backend; python manage.py shell < backend/debug_secretary_error.py
- cd backend; python manage.py shell < backend/debug_doctor_patch.py
- cd backend; python manage.py shell < backend/debug_doctor_appointments.py
- cd backend; python manage.py shell < backend/check_user_permissions.py
- cd backend; python manage.py shell < backend/check_urls.py
- cd backend; python manage.py shell < backend/validate_production_config.py

Riesgos y mitigación
- Regresiones por cambios profundos: mitigar con pruebas, feature flags y despliegues graduales.
- Desalineación Back/Front: usar contratos compartidos (schema.yml) y mocks donde falte el backend.
- Sobrecarga en estilos: aplicar cambios por lotes y validar visualmente en rutas críticas.

Cronograma sugerido (7 días)
- Días 1-2: Diagnóstico (scripts, logs, trazas) y definición de tickets.
- Días 3-4: Correcciones Backend (roles/permisos, endpoints, respuestas, logging).
- Días 5-6: Refactor Frontend (theme.css, errores UI, ProtectedRoute, componentes clave).
- Día 7: QA, pruebas de integración/E2E y reporte final.

Notas
- La integración de Spring Boot iniciará en la semana 12, una vez estabilizado Django/React.

Mis notas:
-Note que al registrarme como nuevo usuario no se me dan los permisos para poder hacer mi reserva
-Vi que algunas vistas no se esta usando la jeraquizacion de theme.css y algunos componentes tambien,se estan usanod estilos trackeados.
-Falta implementar funcionalidad a las vistas de algunos roles