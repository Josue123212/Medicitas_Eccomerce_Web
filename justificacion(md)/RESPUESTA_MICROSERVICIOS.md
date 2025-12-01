# Simulación de Pregunta y Respuesta sobre Arquitecturas y Microservicio

## Pregunta del profesor
Explique qué funcionalidades implementa su microservicio de logística y cómo su proyecto cumple con las arquitecturas solicitadas: Programación Orientada a Agentes (POA y LLM), Microservicios (Docker), Hexagonal, MVC + DAO, DAO (Active Record) y Cliente–Servidor–Datos (tres capas).

## Respuesta (como la daría yo)

- El microservicio de logística recibe eventos de órdenes del backend y aplica cambios de inventario centralizados. Maneja tres casos: creado, confirmado y cancelado.
  - Entrada del evento y orquestación: `microservices/logistics-service/src/main/java/com/farmacia/logistics/adapters/in/web/OrderWebhookController.java:23` (endpoint `/webhooks/order`).
  - Lógica de dominio para reservas: `microservices/logistics-service/src/main/java/com/farmacia/logistics/application/InventoryService.java:19` (reserve), `:31` (confirm), `:39` (cancel).
  - Aplicación del ajuste en el backend (puerto/adapter de salida): `microservices/logistics-service/src/main/java/com/farmacia/logistics/adapters/out/http/AdminInventoryClient.java:56` (confirm: `delta=-q` y `stock_delta=-q`) y `:66` (cancel: `delta=-q`).

- En el backend (Django) el flujo de pago garantiza consistencia aunque falle el microservicio:
  - Creación del PaymentIntent y notificación de “created”: `backend/apps/ecommerce/views.py:324–363`.
  - Confirmación explícita del pago y fallback local de inventario si el microservicio no responde: `backend/apps/ecommerce/views.py:368` (inicio de `stripe_confirm`) y `:389–401` (confirmado con `notify_logistics` + `adjust_inventory_fallback`).
  - Webhook de Stripe con confirmación y fallback: `backend/apps/ecommerce/views.py:416–487`.

- Programación Orientada a Agentes (POA y LLM):
  - Agente administrativo (no el del cliente) con LLM para apoyar decisiones de logística: `microservices/logistics-service/src/main/java/com/farmacia/logistics/adapters/in/web/AgentController.java` y cliente LLM OpenAI‑compatible: `microservices/logistics-service/src/main/java/com/farmacia/logistics/adapters/out/http/LlmClient.java`.
  - El agente del cliente se mantuvo separado en backend/frontend (no se mezcla con el microservicio), cumpliendo la separación de responsabilidades.

- Microservicios (Docker):
  - Servicios independientes en Docker Compose: `frontend` (Vite `5173`), `backend` (Django `8000`), `logistics-service` (Spring Boot `8081`) y `stripe-listen`.
  - Comunicación interna por nombre de servicio: el backend usa `LOGISTICS_URL=http://logistics-service:8081` (ver Compose) para notificar eventos.

- Hexagonal (puertos y adaptadores):
  - Adaptadores de entrada: controladores web (`OrderWebhookController`, `AuditController`, `AgentController`).
  - Dominio/servicios: `InventoryService` define operaciones de negocio (reservar/confirmar/cancelar) sin depender de HTTP.
  - Adaptadores de salida: `AdminInventoryClient` (HTTP hacia backend) y `LlmClient` (HTTP hacia proveedor LLM). Esto desacopla el dominio de la infraestructura.

- MVC + DAO y DAO (Active Record):
  - MVC en Spring: Controllers (C) → Services (M) → DTO/JSON (V).
  - DAO: repositorios JPA para persistir eventos locales y auditorías:
    - `microservices/logistics-service/src/main/java/com/farmacia/logistics/adapters/out/persistence/ReservationRepository.java` (reservas),
    - `.../MovementRepository.java` (movimientos),
    - `.../AuditLogRepository.java` (historial de auditoría) y `.../AuditService.java` registra acciones.
  - Persistencia local en H2 (dev) refleja el patrón Active Record/DAO; la fuente de verdad del stock está en Django.

- Cliente–Servidor–Datos (tres capas):
  - Cliente: React/Vite (`frontend`) consume `/api`.
  - Servidor: `backend` (Django) y `logistics-service` (Spring Boot) ejecutan la lógica.
  - Datos: BD del backend (inventario, órdenes, usuarios) y H2 en logística para historial/auditorías.

- Control de ráfagas y experiencia de usuario:
  - Rate limit relajado para lecturas públicas en backend: `backend/config/settings/base.py:340–351` (exención para productos/categorías/ofertas y límites por rol).
  - Frontend deduplica y cachea los fetch con React Query para evitar 429 en catálogo.

### Evidencia de funcionamiento del inventario
- “created”: sube `reserved_stock` (backend: `checkout_stripe` y notificación a logística `backend/apps/ecommerce/views.py:360–363`).
- “confirmed”: baja `reserved_stock` y `stock` (microservicio `AdminInventoryClient.java:56`), o fallback en backend `backend/apps/ecommerce/views.py:395–401`.
- “cancelled”: baja `reserved_stock` (microservicio `AdminInventoryClient.java:66`), con fallback en backend `backend/apps/ecommerce/views.py:407–412`.

### Resumen final
Con este diseño demuestro:
- POA/LLM: agente admin con razonamiento LLM, separado del agente cliente.
- Microservicios: servicios aislados en Docker y comunicación por HTTP.
- Hexagonal: dominio independiente de frameworks, puertos/adaptadores para HTTP y LLM.
- MVC + DAO: controladores Spring, servicios y repositorios JPA (H2) para auditorías y reservas.
- Tres capas: UI → servicios → datos, con inventario centralizado y auditoría local.

Si el evaluador requiere un listado del historial, el microservicio expone `GET /audits/history` para mostrar las entradas de `AuditLog`.
