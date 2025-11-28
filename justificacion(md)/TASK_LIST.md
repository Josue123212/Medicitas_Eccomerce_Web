# Task List — FARMACIA-WEB

## Agentes a utilizar
- backend-architect: APIs Django, seguridad y pagos reales.
- frontend-architect: UI/estado en React e integración con APIs.
- ui-designer: UX/UI de catálogo y panel admin ecommerce.
- api-test-pro: pruebas contractuales, checkout, pagos y webhooks.
- devops-architect: CI/CD, gestión de secretos y protecciones de rama.
- performance-expert: caché selectiva, índices y perfilado.
- search: exploración rápida de código y referencias.
- ai-integration-eng (opcional): recomendaciones y búsqueda avanzada.

## Tareas
- Externalizar credenciales SMTP y claves a `.env`
- Persistir carrito y favoritos (endpoints y modelos)
- Integrar carrito/favoritos en frontend
- Crear endpoints de historial y detalle de pedidos
- Implementar pagos reales con Stripe (intents)
- Configurar webhooks de pago y estados
- Panel admin ecommerce (CRUD productos, precios, inventario)
- Emails transaccionales (orden confirmada/fallida)
- Mejoras de seguridad (CSRF, rate limiting, cabeceras)
- Optimización de performance (caché, índices DB)
- Pruebas API de checkout y pagos
- CI/CD con GitHub Actions y gestión de secretos

## Priorización (rápido a más complejo)
1. Externalizar credenciales SMTP y claves a `.env`
2. Persistir carrito y favoritos (backend)
3. Integrar carrito/favoritos en frontend
4. Endpoints de historial/detalle de pedidos
5. Emails transaccionales
6. Mejoras de seguridad
7. Pruebas API básicas de checkout
8. Stripe: intents y confirmación
9. Webhooks y estados de pago
10. Admin ecommerce (CRUD)
11. Optimización de performance
12. CI/CD y protecciones de rama

## Checklist (completado)
- [x] Externalizar credenciales SMTP y claves a `.env`
- [x] Persistir carrito y favoritos (backend)
- [x] Integrar carrito/favoritos en frontend
- [x] Endpoints de historial y detalle de pedidos
- [x] Emails transaccionales en checkout
- [x] Stripe: intents y confirmación (backend)
- [x] Webhooks y estados de pago (backend)
- [x] Mejoras de seguridad (CSRF, headers, rate limiting)
- [x] Pruebas API básicas de checkout y favoritos
