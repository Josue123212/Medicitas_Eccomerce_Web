Nota: Este plan de Semana 10 se consolidó junto con Semana 9 en semanas-implementacion/semana-9-10.md. La prioridad es completar las funcionalidades faltantes del frontend por roles (Doctor, Secretaría, Cliente).

# Semana 10 – Refactorización Frontend React y Maquetación de Funciones Adicionales

Objetivo
- Mejorar la estabilidad y experiencia de usuario del frontend.
- Unificar estilos y diseño (Design System) respetando la jerarquización de theme.css.
- Avanzar con la maquetación de nuevas funcionalidades: Farmacia, Telemedicina y Reputación.
- Mantener el foco en correcciones y mejoras de calidad antes de integraciones externas.

Contexto (alineado al plan general Semana 10)
- Refactorizar componentes y rutas: patrones de estado, manejo de errores y accesibilidad.
- Unificar diseño y estilos; base de Design System (tipografías, colores, componentes comunes).
- Maquetación inicial (wireframes/prototipos) de funciones adicionales: Farmacia, Telemedicina, Reputación.
- Corrección de bugs en modales, formularios y listado de citas.

Cómo obtener información y evidencias (fuentes y pasos)
- React DevTools: inspeccionar renders, props y estado de componentes; detectar renders repetidos.
- React Query DevTools: observar estados de queries/mutations, errores y retries.
- ESLint/TS: ejecutar linters y compilar en modo estricto para encontrar errores y tipos faltantes.
  - npm run lint
  - npm run build (ver warnings) / npm run type-check (si existe)
- Logs del frontend:
  - Reemplazar console.error por un servicio de logging (dev) + toasts/notificaciones (UI).
  - Asegurar que tokens y datos sensibles no se imprimen en producción (import.meta.env.MODE === 'production').
- Contratos con backend: revisar llamadas en src/services/* y los TODO en secretaryService.ts; usar mocks si falta endpoint.

Hallazgos esperados (a confirmar durante la semana)
- Uso inconsistente de theme.css y estilos “trackeados” (inline o locales) en algunas vistas.
- Falta de integración completa de ProtectedRoute con AuthContext real y roles.
- Manejo de errores heterogéneo (console.error, mensajes no amigables).
- Modales y formularios con estados no controlados o validaciones insuficientes.
- Listados de citas/doctores con renders costosos y sin virtualización.

Plan de trabajo detallado

1) Design System y estilos (theme.css)
- Revisar jerarquía de estilos: consolidar tokens (colores, tipografías, espaciados) en styles/theme.css.
- Reemplazar estilos “trackeados” por clases utilitarias y/o componentes estilizados comunes.
- Crear componentes básicos del sistema de diseño (Button, Input, Select, Modal, Card, Alert/Toast).
- Documentar patrones de uso (README en frontend/src/docs o en justificacion(md)).

2) Rutas, autenticación y roles
- Integrar ProtectedRoute con AuthContext (estados: authenticated, loading, unauthorized).
- Implementar guards por rol: ocultar/inhabilitar vistas para usuarios sin permisos.
- Fallback UI amigable (403/No autorizado) y redirecciones coherentes.
- Sincronizar con backend claims/roles disponibles (ver backend/check_user_permissions.py) y
  definir contrato mínimo esperado para el frontend.

3) Manejo de errores y notificaciones
- Implementar ErrorBoundary global para capturar errores de render.
- Servicio de notificaciones (ToastProvider) y API de errores con mapeos comunes:
  - 400/422: validación; 401: sesión; 403: rol/permisos; 404: recurso; 5xx: genérico.
- Desactivar console.error en producción, manteniendo logging interno en dev.
- Homogeneizar mensajes para formularios y modales.

4) Componentes clave (refactor y TODOs)
- ProtectedRoute.tsx: conexión con AuthContext y redirecciones.
- AppointmentCard.tsx: modal de reprogramación y estados claros.
- DoctorProfile.tsx: navegación a formulario de cita.
- SecretaryModal/Pages: revisión de flujos y validaciones.
- NotificationCenter.tsx: unificación de lectura/estado con React Query.

5) Prototipos (wireframes navegables)
- Farmacia: catálogo, detalle, carrito; sin lógica de compra todavía.
- Telemedicina: pantalla de “join” y sala placeholder; sin media real.
- Reputación: componentes de rating y listado de reseñas (mock data).

6) Performance y accesibilidad
- Medir y mejorar LCP/CLS (usar Web Vitals en dev).
- Virtualizar listas largas y memoizar componentes costosos.
- Accesibilidad: roles ARIA, foco, navegación por teclado, contraste.

7) Pruebas
- Unitarias con React Testing Library para componentes críticos.
- Integración: rutas protegidas y flujos de formularios.
- Básicas de e2e (si procede) para flujos clave (login -> cita -> notificación).

Entregables de la semana
- Design System base (documentado) + componentes comunes.
- Vistas/rutas protegidas con roles y manejo de errores homogéneo.
- Prototipos navegables de Farmacia, Telemedicina y Reputación.
- Informe de cambios y lista de bugs resueltos.

Criterios de aceptación
- No hay console.error en producción y tokens no se imprimen en ningún entorno.
- theme.css se usa como fuente de estilos; componentes comunes implementados.
- Rutas protegidas funcionan según roles; fallback UI consistente.
- Prototipos navegables validados por stakeholders internos.

Métricas
- LCP y CLS mejoran ≥ 20% respecto a la línea base en dev.
- Bundle size: reducción o no incremento significativo (>10%) tras refactor.
- Cobertura de pruebas frontend ≥ 50% en componentes afectados.
- Disminución de errores visibles reportados por usuarios internos.

Checklist operativo
- Design System: tokens, componentes base, documentación.
- Auth/Routes: ProtectedRoute + AuthContext + guards por rol.
- Errores/Toasts: ErrorBoundary + servicio de notificaciones.
- Componentes clave: AppointmentCard, DoctorProfile, Secretary views, NotificationCenter.
- Performance/Accesibilidad: virtualización, memoización, ARIA.
- Pruebas: unitarias/integración, CI en verde.
- Contratos: mocks temporales para endpoints faltantes; alinear con backend.

Cronograma sugerido (7 días)
- Día 1: Auditoría de estilos y adopción de theme.css; plan de Design System.
- Día 2: Implementar componentes comunes (Button, Input, Modal) y ToastProvider.
- Día 3: Integrar ProtectedRoute + AuthContext y guards por rol; fallback UI.
- Día 4: Refactor de componentes clave (AppointmentCard, DoctorProfile, NotificationCenter).
- Día 5: Maquetación de prototipos (Farmacia, Telemedicina, Reputación).
- Día 6: Performance (virtualización/memoización) + Accesibilidad + pruebas.
- Día 7: Pulido final, documentación, validación interna y merge.

Comandos útiles
- npm run dev: levantar frontend.
- npm run build: compilar y verificar warnings.
- npm run lint: revisar estilos/código.
- npm run test: ejecutar pruebas.

Riesgos y mitigación
- Desalineación con backend: usar mocks y contratos mínimos; sincronización en Semana 11.
- Incremento de bundle por nuevos componentes: revisar code splitting y lazy loading.
- Cambios de estilo generan regresiones visuales: snapshots y revisión en PRs.

Referencias
- PLAN_IMPLEMENTACION_SEMANAS_9_A_16.md (Semana 10).
- justificacion(md)/GUIA_DESARROLLO_REACT.md y PATRONES_DISEÑO_DASHBOARD.md.
- justificacion(md)/SINCRONIZACION_BACKEND_FRONTEND.md.

Notas (equipo)
- Espacio para observaciones y hallazgos adicionales durante la semana.