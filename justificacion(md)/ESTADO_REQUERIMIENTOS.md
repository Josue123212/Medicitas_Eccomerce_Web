# Estado Breve de Requerimientos — FARMACIA-WEB

## Tenemos
- Backend: Django + DRF con JWT, apps modulares (users, patients, doctors, appointments, reports, notifications, ecommerce), migraciones y URLs.
- API: Catálogo de productos/categorías, inventario, carrito, direcciones y checkout con pago simulado; búsqueda, filtros y paginación; documentación con drf-spectacular.
- Frontend: React + Vite + React Query; páginas de farmacia (landing, catálogo, gate, login/register), componentes UI, servicios REST y AuthContext; ProtectedRoute; botón de Google OAuth.
- Ecommerce: Modelos y serializers completos (Category, Product, Price, ProductImage, Inventory, Cart, CartItem, Address, Order, OrderItem, Payment); flujo de checkout confirma orden y simula pago exitoso.
- Configuración: Entornos `development` y `production` con variables de entorno; CORS configurado; plantillas de email; Celery configurado.

## Falta
- Pago real: Integración con Stripe/PayPal (claves en `.env`), endpoints de intent/confirm, webhooks y estados de pago robustos.
- Carrito persistente: Endpoints para añadir/actualizar/eliminar y persistencia de favoritos; sincronización con frontend.
- Gestión de pedidos: Historial, detalle, cancelación/reembolsos y estados; vistas y endpoints asociados.
- Seguridad: Mover credenciales SMTP a variables de entorno; revisar CSRF en endpoints personalizados; endurecer rate limiting y cabeceras.
- Admin ecommerce: CRUD de productos, precios, inventario y carga de imágenes; descuentos/promociones.
- Emails transaccionales: Orden confirmada/cancelada, pago fallido; notificaciones al usuario.
- Performance: Índices adicionales y caché selectiva en listados; optimización de imágenes.

## Siguientes acciones (prioridad)
- Implementar Stripe (intent + confirm + webhooks) y estados de pago.
- Persistir carrito/favoritos y exponer endpoints; integrar en frontend.
- Crear endpoints y UI para historial/detalle de pedidos.
- Externalizar credenciales (SMTP, OAuth) a `.env` y validar en arranque.
- Añadir vistas/admin para gestión de ecommerce.
- Agregar emails transaccionales y notificaciones.
