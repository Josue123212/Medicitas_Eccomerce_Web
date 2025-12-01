# Plan Integrador — Admin E‑commerce + Spring Boot

## Objetivo
- Cumplir requisitos mínimos (POA + LLM, Microservicios/Docker, Hexagonal, MVC + DAO, Cliente‑Servidor‑Datos) integrando un microservicio Spring Boot para logística/auditoría con el admin del e‑commerce (Django/React).

## Alcance
- Inventario avanzado: reservas, confirmaciones, cancelaciones, traslados, auditorías.
- Ofertas: activación única y edición desde agente/admin.
- Admin Chatbot (LLM): comandos operativos para admin.
- Contenerización y orquestación con Docker Compose.

## Arquitectura
- Cliente: React (admin y catálogo).
- Servidor:
  - Django API (e‑commerce): catálogo, precios, ofertas, órdenes, favoritos.
  - Spring Boot (logística/auditoría): inventario, movimientos, auditorías, agentes.
- Datos: PostgreSQL (uno con dos esquemas o dos instancias).
- Mensajería: RabbitMQ/Kafka (opcional MVP con webhooks HTTP).
- Contenedores: Dockerfiles y `docker-compose.yml` para frontend, Django, Spring Boot, DB y broker.

## Requisitos mínimos mapeados
- POA + LLM: agentes en Spring Boot y Chatbot Admin.
- Microservicios/Docker: servicios separados y `docker-compose`.
- Hexagonal: ports/adapters en Spring Boot.
- MVC + DAO: controllers, services, repos JPA.
- Cliente‑Servidor‑Datos: React → Django/Spring → PostgreSQL.

## Entregables
- Dockerfiles y `docker-compose` funcional.
- Spring Boot con módulos domain/application/adapters.
- Endpoints de integración (webhooks de orden, activación oferta, inventario).
- Chatbot Admin con orquestación de comandos.
- Pruebas funcionales y criterios de aceptación.

## Paso a paso
1. Contenedores
   - Crear `Dockerfile` para frontend, backend Django y Spring Boot.
   - Generar `docker-compose.yml` con redes, variables y volúmenes.
2. Spring Boot (hexagonal)
   - Módulos: `domain` (entidades y reglas), `application` (casos de uso), `adapters` (rest, repos, http clients).
   - MVC + DAO: controllers → services → JPA repositories.
3. Agentes y LLM
   - `AgentController` (`/agent/execute`) que mapea comandos de lenguaje natural a casos de uso.
   - Comandos iniciales: activar oferta, ajustar mínimo, reservar stock.
   - Configuración Local AI (Msty) para LLM:
     - Ruta de modelos: `C:\Users\Usuario\AppData\Local\Programs\MstyStudio\localai\models`
     - Estado del servicio: En ejecución
     - Endpoint local: `http://localhost:11964` (OpenAI‑compatible)
     - Versión del servicio: `0.13.0`
     - Integración:
       - En desarrollo (host): `LLM_BASE_URL=http://localhost:11964`
       - En contenedor: `LLM_BASE_URL=http://host.docker.internal:11964`
       - Selección de modelo: `LLM_MODEL=<id>` obtenido de `GET /v1/models`
4. Integración Django
   - Webhooks: `order.created`, `order.confirmed`, `order.cancelled`.
   - Cliente HTTP en Spring Boot para activar oferta única vía admin endpoint.
5. Inventario
   - Reglas:
     - created: `reserved_stock += qty`.
     - confirmed: `stock -= qty`, `reserved_stock -= qty`.
     - cancelled: `reserved_stock -= qty`.
   - Endpoints de movimientos: entradas/salidas/traslados.
6. Auditorías
   - Entidad auditoría, checklist, resultados; opción de bloquear lote/stock.
7. Admin Chatbot UI
   - Componente en React admin para prompts y ejecución; logs y feedback.
8. Pruebas
   - Casos de reserva/confirmación/cancelación; activación de oferta; auditoría.
   - Validar errores y estados.
9. Observabilidad y seguridad
   - Spring Actuator, logs y trazas.
   - JWT/API Key entre servicios; roles en acciones sensibles.
10. Despliegue
   - Arranque con docker-compose; verificación de health y rutas.

## Criterios de aceptación
- Activación de oferta única desde admin y agente.
- Reserva/liberación/confirmación de stock según eventos de orden.
- Chatbot admin ejecuta comandos básicos con feedback correcto.
- Servicios levantan con `docker-compose` y exponen health.

## Actualización de TASK_LIST
- Al finalizar cada bloque, se marcarán completados y se añadirá resumen en `justificacion(md)/TASK_LIST.md`.

## Checklist de ejecución
- [x] Dockerfiles y `docker-compose` creados
- [x] Endpoint `/agent/execute` y comandos básicos
- [x] Configuración LLM Local AI (Msty) con endpoint `http://localhost:11964` y versión `0.13.0`
- [x] Esqueleto Spring Boot (hexagonal) y repos JPA
- [x] Webhooks de orden conectados
- [x] Reglas de inventario aplicadas
- [x] Auditorías iniciales
- [x] Chatbot Admin UI
- [x] Pruebas y validación
- [x] Observabilidad y seguridad
- [x] Despliegue y revisión final

## Estado final
- Módulos implementados y verificados en entorno de desarrollo.
- LLM operativo con `LLM_BASE_URL` configurado y comandos ejecutando casos de uso.
- Webhooks de órdenes integrados; inventario se actualiza según eventos `created`, `confirmed` y `cancelled`.
- Servicios exponen health y métricas; seguridad mediante API Key/JWT aplicada en acciones sensibles.
- Documentación actualizada y checklist completado.
