# Plan de Implementación Post 8 Semanas (Semana 9 a 16)

Este documento consolida y ordena, por semana, lo que se implementará a partir de la semana 9. Se apoya en los documentos de justificación existentes (estrategia frontend/backend, integración Spring Boot, OAuth, reputación, farmacia online, sincronización, etc.). Cada semana incluye: objetivo, entregables, criterios de aceptación, dependencias y riesgos.

Principios guía:
- Iteraciones con entregables verificables al final de cada semana.
- Integración continua (CI/CD), observabilidad y pruebas automatizadas desde el inicio.
- Seguridad y cumplimiento: auditoría, protección de datos, mínimos privilegios.
- Mantener compatibilidad con el stack actual Django + React y ampliar con Spring Boot donde aporte valor claro.

Resumen de hitos:
- Semanas 9-11: Refactorización de vistas y corrección de fallas en Django/React; inicio de maquetación de funciones adicionales.
- Semanas 12-16: Reanudar roadmap: Microservicio de notificaciones (Spring Boot), Telemedicina MVP, Calendarios externos, Analítica/Reportes, FHIR.

---

Semana 9: Refactorización Backend Django (vistas/endpoints) y deuda técnica
- Objetivo: Mejorar la calidad, estabilidad y mantenibilidad del backend enfocándose en vistas/endpoints y corrección de fallas.
- Alcance:
  - Refactorizar vistas y serializers: eliminación de duplicaciones, estandarizar respuestas y códigos de estado.
  - Revisión de permisos/roles y middleware; endurecimiento de seguridad en endpoints críticos.
  - Correcciones de bugs conocidos en citas, usuarios y notificaciones (Django).
  - Aumentar cobertura de pruebas unitarias e integración; mejorar logging y manejo de errores.
- Entregables:
  - Vistas y endpoints refactorizados con documentación breve.
  - Suite de pruebas con cobertura ≥ 60% en módulos críticos.
  - Registro de cambios y lista de bugs resueltos.
- Criterios de aceptación:
  - Los flujos de creación/edición de citas y gestión de usuarios pasan pruebas sin regresiones.
  - Respuestas de API consistentes y tiempo medio < 300ms en dev.
- Dependencias: GUIA_DESARROLLO_DJANGO.md, MIDDLEWARE_DOCUMENTATION.md, SINCRONIZACION_BACKEND_FRONTEND.md.
- Riesgos: regresiones por cambios profundos (mitigar con pruebas y feature flags).

Semana 10: Refactorización Frontend React y maquetación de funciones adicionales
- Objetivo: Mejorar la estabilidad y experiencia de usuario del frontend, y avanzar con maquetación de nuevas funcionalidades.
- Alcance:
  - Refactorizar componentes y rutas: patrones de estado, manejo de errores y accesibilidad.
  - Unificar diseño y estilos; base de Design System (tipografías, colores, componentes comunes).
  - Maquetación inicial (wireframes/ prototipos) de funciones adicionales: Farmacia, Telemedicina, Reputación.
  - Corrección de bugs reportados en modales, formularios y listado de citas.
- Entregables:
  - Componentes clave refactorizados y guía breve de patrones.
  - Prototipos navegables de nuevas funciones.
  - Mejora de rendimiento (bundle y render) con métricas base.
- Criterios de aceptación:
  - Interacciones críticas sin errores visibles; mejoras en CLS/LCP en dev.
  - Prototipos validados con stakeholders internos.
- Dependencias: GUIA_DESARROLLO_REACT.md, PATRONES_DISEÑO_DASHBOARD.md, PLAN_FRONTEND_ADMIN_PANEL.md.
- Riesgos: desalineación con backend (mitigar con contratos y mocks compartidos).

Semana 11: Sincronización Back/Front y estabilización (QA + CI/CD)
- Objetivo: Alinear contratos de datos y estabilizar flujos críticos entre backend y frontend.
- Alcance:
  - Revisión de esquemas y endpoints; corrección de desajustes y mapeos.
  - Pruebas E2E para flujos de citas, usuarios y notificaciones (solo Django).
  - Trazabilidad y observabilidad básicas (logs correlados, métricas).
  - Mejora de pipelines CI/CD y chequeos de calidad (lint, tests, seguridad).
- Entregables:
  - Suite E2E estable y reportes de calidad automatizados.
  - Backlog de bugs críticos reducido y documentado.
- Criterios de aceptación:
  - Flujos críticos pasan E2E y regresiones se mantienen controladas.
  - Pipeline CI/CD verde en dev/main de forma consistente.
- Dependencias: SINCRONIZACION_BACKEND_FRONTEND.md, CONEXION_FRONTEND_BACKEND.md.
- Riesgos: tiempo de estabilización mayor al previsto (mitigar con alcance acotado y priorización).

Semana 12: Microservicio de Notificaciones (Spring Boot) – Fase 1
- Objetivo: Desplegar un microservicio Spring Boot para notificaciones (email/SMS/push) y conectarlo con Django.
- Alcance:
  - Definir contrato OpenAPI (endpoints: /notify, /health, /events) y tipos de notificación.
  - Seguridad: API Key/JWT, rate limiting básico.
  - Observabilidad: Actuator, logs estructurados, métricas.
  - Infra: Dockerfile, docker-compose local; variables de entorno.
  - Integración: Hook en Django para disparar notificaciones de eventos de citas.
- Entregables:
  - Repositorio/ módulo Spring Boot con build reproducible.
  - Especificación OpenAPI y tests de contrato.
  - Composición Docker integrada con el backend Django.
- Criterios de aceptación:
  - Django puede invocar /notify y se registra la entrega en logs.
  - Actuator expone /actuator/health y métricas básicas.
- Dependencias: GUIA_INTEGRACION_SPRING_BOOT.md, SINCRONIZACION_BACKEND_FRONTEND.md.
- Riesgos: configuración de correo/SMS; gestionar sandbox de proveedor (mitigar con adaptadores simulados).

Semana 13: Telemedicina MVP
- Objetivo: Habilitar consultas por video vinculadas a citas.
- Alcance:
  - Señalización WebSocket (Django) o servicio dedicado; salas por cita.
  - UI mínima: join, mute, end; consentimiento.
  - Enlace con notificaciones (recordatorios y enlace de sala).
  - Grabación opcional en dev; sin almacenamiento en prod hasta cumplir requisitos.
- Entregables:
  - Servicio de señalización y página de sala funcional.
  - Integración con citas y notificaciones.
- Criterios de aceptación:
  - Dos clientes pueden establecer sesión con audio/video estable.
  - Trazabilidad básica (logs, métricas de sesión).
- Dependencias: DOCUMENTACION_SISTEMA_CITAS.md, DEMO_RECUPERACION_CONTRASEÑA.md (flujos de usuario), SINCRONIZACION_BACKEND_FRONTEND.md.
- Riesgos: NAT/WebRTC; privacidad (mitigar con STUN/TURN gestionado y políticas de datos).

Semana 14: Integración de Calendarios Externos
- Objetivo: Sincronizar citas con Google Calendar y exportar ICS.
- Alcance:
  - OAuth Google (scopes mínimos), mapping de eventos.
  - Sincronización unidireccional inicial; luego bidireccional.
  - Exportación ICS para otros calendarios.
- Entregables:
  - Servicio/ módulo de sincronización con Google.
- Criterios de aceptación:
  - Crear/actualizar/eliminar citas refleja cambios en Google en <2 min.
  - Exportación ICS descargable desde UI.
- Dependencias: GOOGLE_OAUTH_SETUP.md, SINCRONIZACION_BACKEND_FRONTEND.md.
- Riesgos: límites API Google; revocación de tokens (mitigar con refresh y reintentos backoff).

Semana 15: Analítica Avanzada y Reportes
- Objetivo: Tableros y reportes de negocio/uso.
- Alcance:
  - Métricas: no-shows, tiempos de atención, ingresos farmacia, uso telemedicina.
  - ETL ligero y agregaciones; endpoints para dashboards.
  - Reportes CSV/PDF y programación de envíos.
- Entregables:
  - API de analítica y componentes UI para visualización.
  - Jobs programados para generación y entrega de reportes.
- Criterios de aceptación:
  - Dashboard muestra KPIs con actualización diaria.
  - Exportación CSV/PDF y envío por email funcional.
- Dependencias: EXPORTACION_CSV_DOCS.md, PLAN_FRONTEND_ADMIN_PANEL.md.
- Riesgos: calidad de datos; performance agregaciones (mitigar con materialización/ caché).

Semana 16: Interoperabilidad Clínica (FHIR)
- Objetivo: Exponer/consumir recursos FHIR (Patient, Appointment, Practitioner) para interoperar.
- Alcance:
  - Modelado y mapeo de entidades actuales a FHIR.
  - Endpoints FHIR read-only inicial; validaciones de perfil.
  - Auditoría y control de acceso.
- Entregables:
  - API FHIR básica con documentación.
  - Pruebas de conformidad y ejemplos de intercambio.
- Criterios de aceptación:
  - Validación contra perfiles FHIR seleccionados sin errores críticos.
  - Accesos auditados y autorizados.
- Dependencias: DOCUMENTACION_SISTEMA_CITAS.md, MIDDLEWARE_DOCUMENTATION.md.
- Riesgos: complejidad de perfiles; seguridad de datos (mitigar con reglas de acceso y mascarado).

Hitos posteriores (Semana 17+): Multi-tenancy, Auditoría/Compliance y Reputación Bidireccional (MVP)
- Aislamiento por clínica/tenant, auditoría de eventos sensibles y reputación inicial.
- Planificar según capacidad tras validar semanas 12-16.

---

Capas transversales continuas (todas las semanas)
- CI/CD: pipelines para backend Django, frontend React y servicios Spring Boot; tests unitarios, e2e y seguridad básica.
- Observabilidad: métricas, logs, tracing; alertas mínimas.
- Seguridad: hardening de endpoints, tokens de acceso rotados, manejo de secretos.
- Documentación: actualización de guías y diagramas.

Métricas de éxito
- Disponibilidad servicios > 99% en dev/staging.
- Tiempo medio de respuesta API < 300ms para endpoints críticos.
- Cobertura de pruebas: backend ≥ 60%, frontend ≥ 50%, microservicios ≥ 60%.
- Adopción: ≥ 30% de citas usan recordatorios; ≥ 10% de usuarios prueba telemedicina.

Riesgos globales y mitigación
- Complejidad técnica multistack (Django + React + Spring Boot): estandarizar contratos y observabilidad.
- Gestión de datos sensibles: aplicar mínimos privilegios, auditoría y cifrado en reposo/ tránsito.
- Cambios de esquema: migraciones versionadas y pruebas de regresión.

Referencias y justificación
- Todos los documentos de soporte se han movido a la carpeta justificacion(md) para consulta y trazabilidad.