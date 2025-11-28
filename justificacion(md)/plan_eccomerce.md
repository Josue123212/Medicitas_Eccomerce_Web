# Plan de Implementación del Módulo E-commerce — MediCitas (Farmacia Digital)

Este documento define el alcance, arquitectura y plan de trabajo para integrar un módulo de E-commerce en MediCitas. El objetivo es vender servicios médicos (consultas, paquetes, exámenes) y, a futuro, productos físicos (ej. insumos), con pagos en línea, órdenes y facturación.

## 1. Alcance y supuestos
- Enfoque principal: venta de productos farmacéuticos (medicamentos y insumos) bajo el módulo "Farmacia Digital".
- Catálogo navegable sin iniciar sesión (público) tanto en Web como en App móvil (Android). Para comprar y ver historial es obligatorio crear cuenta e iniciar sesión.
- Los clientes existentes conservan su misma cuenta y credenciales; el acceso y las compras son compartidas entre Web y App móvil (misma API y base de datos).
- Checkout requiere usuario autenticado (paciente). Carrito persistente por usuario; soporte de "carrito invitado" en cliente con fusión al iniciar sesión.
- Productos con receta: si un producto requiere receta, se deberá cargar y validar una receta antes del despacho.
- MVP: Stripe como pasarela de pago (tarjeta); extensible a PayPal u otras.
- Servicios médicos (consultas, paquetes, exámenes) quedan como fase posterior; la integración con citas seguirá disponible cuando aplique.

## 2. Arquitectura
- Backend (Django + DRF): API REST unificada para Web y App móvil; JWT (access/refresh), CSRF, drf-spectacular, Celery (webhooks, emails), Stripe SDK.
- Frontend Web (React + Vite): React Router, React Query, Stripe Elements, Axios; UI con Tailwind + cva.
- App móvil (Android Kotlin): consumir la misma API; autenticación compartida; manejo de carrito local y sincronización.
- Integraciones: usuarios/roles existentes, appointments (fase posterior para servicios), notificaciones/email, direcciones/envíos.
- Idempotencia y consistencia transaccional en checkout; validación de inventario y recetas.

## 3. Modelo de datos (MVP)
| Entidad | Campos clave | Relaciones |
|---|---|---|
| Category | name, slug | 1–N Products |
| Product | name, slug, description, is_active, service_type(product por defecto), prescription_required, manufacturer, expiration_date, base_price | N–1 Category |
| Price | product, amount, currency, valid_from, valid_to | N–1 Product |
| Inventory | product, stock, reserved_stock, updated_at | N–1 Product |
| Cart | user, status(active) | 1–N CartItem |
| CartItem | cart, product, quantity, unit_price, subtotal | N–1 Cart, N–1 Product |
| Order | user, status, total, currency, payment_intent_id, appointment_id(opcional), coupon_id(opcional), delivery_mode, shipping_address_id(opcional) | 1–N OrderItem |
| OrderItem | order, product, quantity, unit_price, subtotal | N–1 Order |
| Payment | order, status, gateway(stripe), amount, currency, transaction_id | N–1 Order |
| Coupon | code, discount_type(%/valor), value, max_uses, used_count, valid_from/to | — |
| Address | user, line1, city, region, postal_code, country, phone, is_default | — |
| Delivery | order, status, provider(opc), tracking_code(opc), scheduled_date(opc), delivered_at(opc) | 1–1 Order |

Notas:
- Precios y totales se calculan del lado servidor. Nunca se confía en totals del cliente.
- Para servicios vinculados a citas (fase posterior): order.appointment_id referencia a appointments.
- Inventario y reservas: reservar stock en checkout; confirmar descuenta; cancelar libera.

### 3.1. Requisitos de receta
- `Product.prescription_required = true` obliga a que el usuario cargue una receta válida antes del despacho.
- La verificación puede ser manual (rol farmacéutico) o automatizada con reglas básicas; el pedido no avanza a "preparing" sin receta aprobada.
- La receta y su estado se registran y auditan; se asocian a Order/OrderItem.

## 4. Flujos principales
1) Navegación y compra (Web y App móvil)
- Catálogo (público) → Detalle → Agregar al carrito (invitado o autenticado) → Ver carrito → Iniciar sesión/crear cuenta → Checkout → Validaciones backend (precios, stock, receta si aplica) → Pago → Orden confirmada → Email/SMS → Preparación/Envío.

2) Validación de receta (si aplica)
- Producto requiere receta → subir documento(s) en checkout → revisión/aprobación → si aprobado, continuar con preparación/entrega; si rechazado, cancelar item/orden y reembolsar si corresponde.

3) Cancelación/Reembolso
- Usuario solicita cancelación → reglas por estado → si aplica, reembolso vía Stripe → actualizar orden y notificar → liberar stock reservado.

4) Administración
- CRUD productos/categorías/precios/cupones/inventario → revisión de recetas → ver órdenes → gestionar envíos y reembolsos.

## 5. Backend (Django + DRF)
### Dependencias nuevas
- stripe, django-filter (búsqueda/orden), moneyed/decimal para moneda.
- django-storages (opcional) para archivos de receta.

### Endpoints (MVP)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | /api/ecommerce/products/ | Listar productos | Pública |
| GET | /api/ecommerce/products/:id/ | Detalle producto | Pública |
| GET | /api/ecommerce/categories/ | Listar categorías | Pública |
| GET | /api/ecommerce/inventory/:product_id/ | Ver stock de producto | Pública |
| GET | /api/ecommerce/cart/ | Obtener carrito actual | JWT |
| POST | /api/ecommerce/cart/items/ | Agregar/actualizar item | JWT |
| DELETE | /api/ecommerce/cart/items/:id/ | Quitar item | JWT |
| POST | /api/ecommerce/coupons/validate/ | Validar cupón | JWT |
| POST | /api/ecommerce/checkout/ | Crear orden y PaymentIntent | JWT |
| POST | /api/ecommerce/prescriptions/ | Subir receta | JWT |
| GET | /api/ecommerce/prescriptions/ | Listar recetas del usuario | JWT |
| POST | /api/ecommerce/orders/:id/attach-prescription/ | Asociar receta a items | JWT |
| GET | /api/ecommerce/addresses/ | Listar direcciones | JWT |
| POST | /api/ecommerce/addresses/ | Crear/editar dirección | JWT |
| GET | /api/ecommerce/orders/ | Historial de órdenes | JWT |
| GET | /api/ecommerce/orders/:id/ | Detalle orden | JWT |
| POST | /api/ecommerce/orders/:id/cancel/ | Solicitar cancelación | JWT |
| POST | /api/ecommerce/orders/:id/refund/ | Solicitar reembolso | JWT |
| POST | /api/ecommerce/deliveries/:id/update-status/ | Actualizar estado de envío | Roles |
| POST | /api/ecommerce/webhooks/stripe/ | Webhook de Stripe | Firma (sin JWT) |

### Consideraciones de seguridad
- Autenticación: JWT; CSRF para métodos mutables en panel admin.
- Precios/totales calculados en servidor; validar cupón/stock/receta en backend.
- Idempotency keys en creación de PaymentIntent/checkout.
- Verificación de firma de webhooks Stripe; logs de eventos.
- Permisos: solo admin puede CRUD de catálogo/precios/cupones/inventario; rol farmacéutico valida recetas.
- Rate limiting en endpoints sensibles; auditoría (logging) y trazabilidad.
- Restricciones legales: impedir compra/entrega de productos con receta sin receta aprobada.

### Integración con appointments (fase posterior)
- order.appointment_id (FK/nullable) para relacionar compras con citas.
- Post-pago: si el producto es un servicio de consulta, crear/confirmar cita via appointments API.

## 6. Frontend Web (React)
### Dependencias nuevas
- @stripe/stripe-js, @stripe/react-stripe-js.

### Páginas
- CatalogPage, ProductDetailPage.
- CartPage (o Drawer). 
- CheckoutPage (Stripe Elements: CardElement, verificación, cupón, carga de receta si aplica).
- OrderSuccessPage (resumen + acciones).
- OrdersHistoryPage.
- AddressesPage (gestión de direcciones de envío).
- Admin: AdminProductsPage, AdminInventoryPage, AdminOrdersPage, AdminPrescriptionsPage (según roles existentes).

### Componentes clave
- ProductCard, PriceTag, QuantitySelector, CouponInput.
- CartSummary, CartItemRow.
- CheckoutForm (validación con RHF + Zod), PaymentStatus, PrescriptionUpload.
- AddressForm, DeliveryStatusBadge.

### Servicios y tipos
- src/services/ecommerceService.ts: products, categories, inventory, cart, checkout, orders, coupons, prescriptions, addresses, deliveries.
- src/types/ecommerce.ts: Product, Category, Inventory, Cart, CartItem, Order, OrderItem, PaymentIntentResponse, CouponValidation, Prescription, Address, Delivery.

### Flujo de checkout
- Cargar carrito → validaciones backend (precios/cupones/stock/receta) → crear PaymentIntent → Stripe Elements → confirmar → success → mostrar orden → email/SMS.

## 7. Plan por fases
1) Diseño y dependencias (backend y frontend Web/App móvil compartiendo API)
2) Modelos y migraciones (Category/Product/Price/Inventory/Cart/Order/Payment/Coupon/Address/Delivery/Prescription)
3) Serializers, filtros y permisos; endpoints públicos y protegidos; documentación drf-spectacular
4) Integración Stripe (PaymentIntent, webhooks, idempotencia)
5) UI catálogo/carrito/checkout en Web; sincronización de carrito invitado al iniciar sesión
6) App móvil: consumo de catálogo público; autenticación y checkout; sincronización de carrito
7) Validación de recetas y flujo de despacho/envío
8) Pruebas unitarias/integración/E2E (Web y App), observabilidad
9) Seguridad (rate limit, logs, auditoría, restricciones legales) y despliegue

## 8. Pruebas y calidad
- Unit: serializers, cálculos de totales, validación cupones, inventario, recetas.
- API: endpoints de catálogo público, cart/checkout/orders/addresses/prescriptions (JWT, permisos, errores).
- Integración: Stripe webhooks, idempotencia, flujo de validación de receta.
- E2E: flujo compra completo en frontend Web y App móvil; sincronización de carrito.

## 9. Configuración y despliegue
- ENV backend: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CURRENCY (ej. USD/PEN), ECOMMERCE_ENABLED, PRESCRIPTION_STORAGE_BACKEND.
- CORS y rutas documentadas con drf-spectacular; la misma API sirve Web y App.
- Celery para tareas async (emails/recibos/notificaciones de receta y envíos).
- Políticas de retención de recetas y cumplimiento normativo local.

## 10. Riesgos y mitigación
- Doble cobro: usar idempotency keys y validar estado de orden.
- Inconsistencia totales: recalcular siempre en backend.
- Fallo de webhook: reintentos y colas; logs + alertas.
- Abuso de cupones: límites y verificación por usuario/orden.
- Cumplimiento farmacéutico: bloquear venta de productos con receta sin verificación; auditoría de recetas; almacenamiento seguro de documentos.
- Sincronización de carrito invitado: pruebas de fusión y resolución de conflictos.

Este plan sirve como guía base para implementar el módulo E-commerce en MediCitas, asegurando seguridad, mantenibilidad y alineación con la arquitectura actual.