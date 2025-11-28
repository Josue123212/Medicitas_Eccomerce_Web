# Guía de integración de Spring Boot en MediCitas (alternativas y pasos)

## Objetivo
Explorar formas prácticas de incorporar Spring Boot al ecosistema actual (Django/DRF + React/TS), sin romper funcionalidades ya implementadas y aportando valor en módulos específicos (pagos, farmacia, notificaciones, reportes, interoperabilidad).

## Alternativas de integración (de menor a mayor impacto)

1) Microservicio de pagos (Stripe/PayPal) con Spring Boot
- Caso de uso: aislar procesamiento de pagos, webhooks, conciliación y antifraude.
- Stack sugerido: spring-boot-starter-web, spring-boot-starter-security, springdoc-openapi, spring-boot-starter-validation, actuator.
- Autenticación: OAuth2/JWT como recurso protegido; Django actúa como cliente/gateway.
- Pros: Desacopla pagos; escalado independiente; menor riesgo regulatorio.
- Contras: Orquestación de estados de pedido/factura; coordinación con citas.

2) Microservicio de Farmacia Online (catálogo/carrito/órdenes)
- Caso de uso: implementar el roadmap de PROYECTO_FUTURO_FARMACIA_ONLINE.md como servicio dedicado.
- Stack: web + data-jpa + validation + actuator; opcional WebFlux si se requiere alta concurrencia.
- Base de datos: propia del servicio (evitar acoplamiento); contrato API con OpenAPI.
- Pros: Dominios farmacéuticos aislados; escalado por demanda; equipo separado.
- Contras: Complejidad de sincronización (recetas, pacientes, doctores).

3) Servicio de notificaciones (email, in-app, webhooks)
- Caso de uso: centralizar envío de correos, recordatorios, eventos.
- Stack: spring-boot-starter-mail, scheduler (Spring), actuator; opcional Kafka/RabbitMQ.
- Integración: Django publica eventos (REST/Kafka) y Spring notifica.
- Pros: Observabilidad; colas; reintentos robustos.
- Contras: Añade infraestructura (broker, colas).

4) Servicio de reportes y analítica
- Caso de uso: KPIs, exportaciones, agregaciones; evitar sobrecargar DRF.
- Stack: data-jpa + QueryDSL/Hibernate + springdoc; opcional Elasticsearch.
- Pros: Consultas pesadas aisladas; caché; exportaciones grandes.
- Contras: Duplicación de datos o ETL; latencia de sincronización.

5) Interoperabilidad clínica (FHIR/HL7) con HAPI FHIR (Spring)
- Caso de uso: intercambio de datos clínicos con terceros.
- Stack: HAPI FHIR en Spring Boot.
- Pros: Estándar del sector; facilita integraciones externas.
- Contras: Curva de aprendizaje; gobierno de datos.

6) IAM/gateway con Keycloak + API Gateway
- Caso de uso: unificar identidad y tokens para Django y Spring.
- Stack: Keycloak (OIDC), gateway (Kong/Traefik/NGINX), OAuth2 resource-server en Spring.
- Pros: SSO; control centralizado; RBAC avanzado.
- Contras: Complejidad de despliegue; migración de flujos de auth.

7) Event-driven con Kafka/RabbitMQ (Spring Cloud Stream)
- Caso de uso: desacoplar módulos; recordatorios de citas; sincronización farmacia.
- Pros: Resiliencia; escalado; auditabilidad.
- Contras: Operación de broker; diseño de contratos de eventos.

8) Búsqueda avanzada con Elasticsearch (Spring Data)
- Caso de uso: búsqueda de doctores/medicamentos; autosuggest.
- Pros: Mejor UX; filtros complejos; alta performance.
- Contras: Operación y costos; indexación.

9) ETL/batch con Spring Batch
- Caso de uso: cargas de datos, deduplicación, limpieza, métricas nocturnas.
- Pros: Jobs robustos; reintentos; control de estados.
- Contras: Mantenimiento de pipelines; coordinación con ventanas de BD.

10) Reemplazo progresivo del backend (DRF -> Spring Boot)
- Caso de uso: migración por módulos (usuarios, citas, perfiles).
- Pros: Homogeneidad tecnológica si el equipo prefiere Java.
- Contras: Alto esfuerzo; riesgo de regresiones; requiere plan detallado.

## Cómo meter Spring Boot al proyecto (enfoques)

Opción A: Monorepo
- Estructura propuesta:
  - backend-django/
  - backend-spring/
  - frontend/
  - gateway/
- Pros: Versionado conjunto; sincronización fácil.
- Contras: Pipelines más complejos; riesgo de acoplamiento.

Opción B: Multi-repo
- Pros: Autonomía de equipos; despliegues independientes.
- Contras: Coordinación de versiones; gestión de contratos.

Infra recomendada
- Gateway/API: NGINX/Kong/Traefik.
- IAM/SSO: Keycloak (OIDC).
- Observabilidad: Actuator (Spring), Prometheus, Grafana, ELK.
- Mensajería: Kafka/RabbitMQ (si se requiere eventos).

Autenticación/Autorización
- Mantener Django como proveedor de identidad inicial (via allauth) o migrar a Keycloak.
- Spring como resource server (OAuth2 JWT); validar scopes/roles.
- Compartir dominios/cookies solo si imprescindible; preferir tokens de acceso.

Contratos y comunicación
- Definir OpenAPI/Swagger por servicio; versionar (v1, v2).
- REST (JSON) para simplicidad; gRPC si se requiere alta performance interna.
- CORS y CSRF: habilitar dominios del frontend y gateway.

Base de datos y datos
- Cada servicio con su propia BD (principio de independencia) para evitar bloqueos cruzados.
- Si se requiere CDC: Debezium para replicación/eventos.
- Migraciones por servicio (Flyway/Liquibase en Spring, Django migrations en DRF).

## Pasos concretos para crear un servicio Spring Boot

1) Crear el proyecto (Spring Initializr)
- Dependencias base: Web, Validation, Security, Actuator, Springdoc OpenAPI.
- Opcionales según caso: Data JPA (Postgres), Mail, OAuth2 Resource Server, Kafka/RabbitMQ, WebFlux.

2) Estructura mínima
```text
backend-spring/
  ├── pom.xml (o build.gradle)
  ├── src/main/java/com/medicitas/payments
  │   ├── PaymentsApplication.java
  │   ├── controller/
  │   ├── service/
  │   ├── repository/
  │   └── model/
  └── src/main/resources/
      ├── application.yml
      └── logback-spring.xml
```

3) Configuración de seguridad (resource server)
```yaml
# application.yml
spring:
  application:
    name: payments-service
server:
  port: 8081

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus

springdoc:
  api-docs:
    enabled: true
  swagger-ui:
    enabled: true

# Si usas JWT (Keycloak o emisor propio)
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.medicitas.local/realms/medicitas
```

4) Ejemplo de controlador REST
```java
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
  @PostMapping("/charge")
  public ResponseEntity<PaymentResponse> charge(@Valid @RequestBody PaymentRequest req) {
    // Lógica de cobro (Stripe/PayPal) y registro
    return ResponseEntity.ok(new PaymentResponse("approved", req.getAmount()));
  }
}
```

5) OpenAPI y contratos
- Publicar /v3/api-docs (springdoc) y validar desde frontend.
- Documentar errores y estados (aprobado, pendiente, fallido).

6) Integración con Django/React
- Django: crear endpoints/gateway que llamen al servicio Spring (por ejemplo, POST /payments/charge redirige a http://backend-spring:8081/api/payments/charge).
- React: actualizar services para consumir el gateway (evitar múltiples orígenes) y manejar tokens.

## DevOps y despliegue

Docker Compose (ejemplo simplificado)
```yaml
version: "3.9"
services:
  backend-django:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env.example

  backend-spring:
    build: ./backend-spring
    ports: ["8081:8081"]
    environment:
      - SPRING_PROFILES_ACTIVE=prod

  gateway:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./gateway/nginx.conf:/etc/nginx/nginx.conf:ro
```

CI/CD
- Pipelines separados por servicio; pruebas unitarias, integración y seguridad (SAST/DAST).
- Publicar artefactos (Docker registry); despliegue a staging/production.

Observabilidad
- Actuator + Prometheus para métricas; logs centralizados (ELK/Graylog).
- Healthchecks expuestos (/actuator/health) y alertas.

## Criterios de selección de alternativa
- Impacto en usuarios: priorizar módulos con valor directo (pagos, farmacia, notificaciones).
- Complejidad técnica: empezar por servicios bien delimitados (pagos/notificaciones).
- Regulación: si hay requisitos de cumplimiento, considerar FHIR/Keycloak.
- Equipo: experiencia con Java/Spring; capacidad de operación (Kafka/Keycloak/Elasticsearch).

## Roadmap sugerido (3 fases)
- Fase 1 (4-6 semanas): servicio de pagos + gateway + observabilidad básica.
- Fase 2 (6-12 semanas): servicio de notificaciones + batch/ETL + búsqueda.
- Fase 3 (12-24 semanas): farmacia online en Spring + FHIR + IAM centralizado.

## Riesgos y mitigaciones
- Duplicación de lógica/estados: definir fuente de verdad (orquestación en gateway/DBs por servicio).
- Latencia entre servicios: caché y colas; timeouts y circuit breakers.
- Seguridad: tokens cortos; scopes claros; auditoría y rotación de secretos.
- Operación: IaC (Terraform/Ansible), monitoreo, backups y DR.

## Próximos pasos
- Elegir el primer servicio (recomendado: pagos o notificaciones).
- Definir contratos OpenAPI y esquema de datos.
- Preparar repo/monorepo y pipeline.
- Implementar MVP y pruebas de integración end-to-end.