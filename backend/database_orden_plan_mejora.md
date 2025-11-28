# Análisis de Base de Datos (API) — Orden y Plan de Mejora

## Resumen Ejecutivo
- Desarrollo usa `SQLite` (`backend/config/settings/development.py:21`), producción está preparado para `PostgreSQL` vía variables (`backend/config/settings/production.py:26`).
- Esquema principal bien modelado: `users`, `patients`, `doctors`, `appointments`, `notifications`, `ecommerce`, `reports`.
- Índices adecuados en `appointments` y tokens de usuarios; faltan optimizaciones en `ecommerce` y búsquedas de texto.
- Problema crítico de orden/organización: duplicidad de la app `core` (`apps.core` vs `core`) con modelos en `core` no activados.
- Riesgos de orden por `Meta.ordering` en campos de modelos relacionados (p. ej., doctores ordenados por `user__last_name`).

## Configuración y Motor
- `SQLite` en dev: limitado en concurrencia y sin índices avanzados; adecuado para desarrollo pero no para pruebas de rendimiento.
- `PostgreSQL` en prod: definido con `CONN_MAX_AGE=60` para pooling (`backend/config/settings/production.py:149`).
- Recomendación: validar que `.env` tenga `DB_*` definidos y ejecutar pruebas de carga en un entorno staging con Postgres.

## Esquema y Relaciones
- `User` personalizado (`backend/apps/users/models.py:9`) con email único.
- `Patient` y `Doctor` en relación `OneToOne` con `User` (`backend/apps/patients/migrations/0002_initial.py:21`, `backend/apps/doctors/migrations/0002_initial.py:21`).
- `Appointment` con FKs a `Patient` y `Doctor`, `unique_together` en `(doctor, date, time)` e índices compuestos (`backend/apps/appointments/migrations/0003_initial.py:24`–`41`).
- `Notifications` simples por `User` (`backend/apps/notifications/models.py:16`).
- `Ecommerce` con entidades `Product`, `Price`, `Inventory`, `Order`, `OrderItem`, `Cart`, `CartItem` (`backend/apps/ecommerce/models.py:18`–`100`).

## Aspectos Críticos de Orden
- `Meta.ordering` por campos relacionados:
  - `Doctor` ordena por `user__last_name, user__first_name` (`backend/apps/doctors/models.py:107`). Este orden produce `JOIN + SORT`, costoso en listas grandes.
  - `Appointment` ordenado por `date, time` (`backend/apps/appointments/models.py:77`) está bien y cuenta con índices.
- Duplicidad de apps `core`:
  - App instalada: `apps.core` (`backend/config/settings/base.py:21`–`41`).
  - App paralela no instalada: `core` con modelos `AuditLog` y `SystemMetrics` (`backend/core/models.py:13`–`102`, `127`–`171`). Sus migraciones (`backend/core/migrations/`) no corren, generando incoherencia.
- Duplicidad conceptual de `SystemMetrics`:
  - En `core` (`backend/core/models.py:127`–`171`) y en `reports` (`backend/apps/reports/models.py:29`–`61`) con propósitos distintos; confunde origen y uso.
- Campos redundantes en `Inventory`: `reserved` y `reserved_stock` (`backend/apps/ecommerce/models.py:46`–`55`) con riesgo de desalineación.

## Rendimiento y Consultas
- Buen uso de `select_related` en citas (`backend/apps/appointments/views.py:72`, `153`–`155`).
- Filtros frecuentes por texto (`icontains`) en `patients` (`backend/apps/patients/filters.py:81`–`89`) y `appointments` (`backend/apps/appointments/views.py:224`–`234`) que se benefician de `GIN` + `pg_trgm` en Postgres.
- Índices existentes:
  - `appointments`: `date+time`, `doctor+date`, `patient+date`, `status`.
  - `users.PasswordResetToken`: índices en `token`, `user,-created_at`, `expires_at` (`backend/apps/users/migrations/0001_initial.py:64`–`69`).
- Índices faltantes en `ecommerce` para consultas típicas: `Product.is_active`, `Price.is_active`, `Order.user`, `Order.status`, `CartItem.cart`, `OrderItem.order`.

## Integridad y Concurrencia
- `Appointment.save()` valida horario y disponibilidad pero no usa bloqueo transaccional (`backend/apps/appointments/models.py:116`–`121`). En alta concurrencia, podrían darse carreras antes de que el `unique_together` dispare.
- `on_delete=CASCADE` en citas: borrar paciente/doctor elimina historial (`backend/apps/appointments/models.py:24`–`35`). Considerar políticas de retención.
- `Inventory` carece de restricciones que garanticen stock no negativo y consistencia entre `stock`, `reserved`, `reserved_stock`.

## Plan de Mejora Prioritario

### 1) Organización (alto impacto)
- Unificar `core`:
  - Eliminar o desactivar `backend/core` o, preferentemente, migrar sus modelos a `apps.core` y activar en `INSTALLED_APPS`. Evitar dos apps homónimas.
  - Decidir una única fuente para `SystemMetrics`: consolidar en `apps.reports` o en `apps.core` y remover duplicado.
- Orden por campos relacionados:
  - Remover `Meta.ordering` en `Doctor` por `user__…` y mover ordenamiento a consultas con `annotate` cuando sea necesario, o denormalizar `full_name` en `Doctor` con índice (`btree`) para ordenar sin `JOIN`.

### 2) Índices y Búsquedas (quick wins)
- `Postgres`: habilitar `pg_trgm` y crear índices `GIN`:
  - `patients.Patient.address`, `emergency_contact_name`, `emergency_contact_phone`.
  - `appointments.reason`, `appointments.notes`, `doctors.specialization`.
- `Ecommerce`: añadir índices `btree`:
  - `Product(is_active, category_id, created_at)`.
  - `Price(is_active, product_id, valid_from)`.
  - `Order(user_id, status, created_at)`.
  - `OrderItem(order_id)`, `CartItem(cart_id)`, `ProductImage(product_id, position)`.

### 3) Concurrencia y Consistencia
- `Appointment`:
  - En la creación, envolver en transacción y usar `SELECT ... FOR UPDATE` sobre `Doctor` y ventana de horario para garantizar atomicidad antes de insertar.
  - Convertir `unique_together` en `UniqueConstraint` nombrado con índice parcial si se decide permitir duplicados cuando `status='cancelled'`.
- `Inventory`:
  - Añadir `CheckConstraint` para `stock >= 0`, `reserved >= 0`, `reserved_stock >= 0` y `reserved + reserved_stock <= stock` si aplica.
  - Unificar `reserved` vs `reserved_stock` y definir única semántica.

### 4) Retención y Particionado
- `AuditLog` (si se activa): definir política de retención (p. ej., 90 días) y considerar particionado por mes en Postgres.
- `SystemMetrics`: mantener solo agregados necesarios y limpiar entradas antiguas.

### 5) Mantenimiento del Esquema
- `Migrations`:
  - Revisar y “squash” migraciones largas en `ecommerce` para simplificar despliegues.
  - Auditar coherencia de `NOT NULL` y `DEFAULT` en columnas recientes (`backend/apps/ecommerce/migrations/0011_inventory_reserved_stock.py`, `0013_inventory_min_stock.py`).

## Recomendaciones de Consultas
- Usar `select_related('patient__user','doctor__user')` en listados de `appointments` (ya aplicado).
- Preferir `only/defer` en serializers para evitar fetch de columnas grandes (`notes`, `bio`) cuando no se muestran.
- Añadir `prefetch_related('images','items')` en `ecommerce` para órdenes y carritos.

## Validación y Métricas
- Definir objetivos:
  - Búsqueda texto: P95 < 200 ms con 100k registros.
  - Listado de citas: P95 < 150 ms para filtros por fecha.
  - Órdenes e-commerce: P95 < 250 ms con `items` prefetch.
- Pruebas de carga: k6/JMeter con escenarios de 50–200 rps mixtos (listados, creación de citas, compras).
- Monitorizar: tiempos de consulta, `locks`, y `deadlocks` en Postgres; tasa de errores.

## Próximos Pasos
- Activar y consolidar `core` y `SystemMetrics`.
- Crear migraciones de índices y `CheckConstraint`.
- Implementar transacciones en creación de citas.
- Ejecutar pruebas de carga en staging y ajustar índices según planes de ejecución.

---

### Referencias de Código
- Configuración DB dev: `backend/config/settings/development.py:21`–`26`
- Configuración DB prod: `backend/config/settings/production.py:26`–`35`
- App instalada `apps.core`: `backend/config/settings/base.py:21`–`41`
- Modelos `core` no instalados: `backend/core/models.py:13`–`102`, `127`–`171`
- `Doctor` ordering relacionado: `backend/apps/doctors/models.py:107`
- Índices de `appointments`: `backend/apps/appointments/migrations/0003_initial.py:24`–`41`
- Filtros texto pacientes: `backend/apps/patients/filters.py:81`–`89`
- Listado citas con `select_related`: `backend/apps/appointments/views.py:72`, `153`–`155`
