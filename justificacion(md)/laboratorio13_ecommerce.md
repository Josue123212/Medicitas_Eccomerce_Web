# E‑Commerce MediCitas — Laboratorio 13

## Objetivos de la Aplicación
- Facilitar la compra de productos farmacéuticos y médicos.
- Integrar la experiencia con módulos clínicos (citas, historial, perfiles).
- Ofrecer navegación simple por categorías, búsqueda y filtros.
- Soportar campañas de marketing (promos y descuentos) y recomendaciones.

## Público Objetivo
- Pacientes y usuarios finales que compran productos de farmacia.
- Personal médico/administrativo que requiere insumos puntuales.
- Secretarías que necesitan reabastecer inventario básico.

## Características Clave (Resumen)
- Catálogo responsivo con categorías, filtros y búsqueda.
- Gestión básica de inventario (stock/reservas) en backend.
- Promociones visibles en hero del catálogo.
- Preparado para recomendaciones por categoría.
- Integración con autenticación JWT y CSRF.

## Implementaciones y Evidencias (con capturas)

### 1) Responsivo y amigable para móviles
- Estado: Implementado.
- Evidencia UI: Captura del catálogo en móvil con chips y botón “Filtrar” (drawer).
  - Ruta para captura: `http://localhost:5173/pharmacy/catalog` en viewport móvil.
  - Elementos a capturar:
    - Chips horizontales (categorías).
    - Botón “Filtrar” (abre drawer) y drawer con lista de categorías.
- Código relevante:
  - `frontend/src/components/pharmacy/CategoriesNav.tsx`
  - `frontend/src/components/pharmacy/FiltersDrawer.tsx`
  - `frontend/src/pages/pharmacy/PharmacyCatalogPage.tsx:…` (chips + drawer + grid responsivo)

### 2) Gestión básica de inventario
- Estado: Implementado en backend.
- Evidencia API: Captura del endpoint de inventario y del modelo.
  - Ruta para captura: `http://localhost:8000/api/ecommerce/inventory/<product_id>/` (respuesta JSON).
  - Modelos:
    - `backend/apps/ecommerce/models.py:46–56` (Inventory con `stock`, `reserved_stock`, `min_stock`).
  - Vistas:
    - `backend/apps/ecommerce/views.py:31–38` (InventoryViewSet `retrieve`).
- Nota: El front muestra productos pero no expone aún el stock; puede añadirse a la tarjeta de producto.

### 3) Visualización de productos, filtrado y búsqueda
- Estado: Implementado.
- Evidencia UI: Captura del catálogo con chips seleccionando una categoría y grid filtrado.
  - Ruta para captura (categoría): `http://localhost:5173/pharmacy/catalog?category=<id>`.
  - Ruta para captura (búsqueda): `http://localhost:5173/pharmacy/catalog?search=vitamina`.
- Evidencia backend: Filtro manual por categoría y búsqueda.
  - `backend/apps/ecommerce/views.py:22` (FK a categoría en Product).
  - `backend/apps/ecommerce/views.py:…` (ProductViewSet `get_queryset` con `category_id` y `search`).
- Evidencia servicio front:
  - `frontend/src/services/ecommerceService.ts:39–46` (`getProducts` acepta `category`).

### 4) Marketing: Promociones y descuentos
- Estado: Implementado (hero y slides; soporte de `sale_amount` en precio).
- Evidencia UI: Captura del hero de promociones.
  - Ruta para captura: `http://localhost:5173/pharmacy/catalog` (banner “Semana del Resfriado”).
- Evidencia precio con descuento:
  - `frontend/src/pages/pharmacy/PharmacyCatalogPage.tsx:…` (muestra `sale_amount` si existe).
  - `backend/apps/ecommerce/serializers.py:11–15` (PriceSerializer incluye `sale_amount`).

### 5) Recomendación de productos
- Estado: Disponible para implementación rápida (por categoría actual).
- Plan de evidencia UI: Captura de bloque “Recomendados” al final del grid mostrando productos de la misma categoría.
  - Implementación sugerida:
    - Consultar `getProducts({ category: selectedId })` y mostrar 4 elementos “También te puede interesar”.
  - Ubicación sugerida:
    - `frontend/src/pages/pharmacy/PharmacyCatalogPage.tsx` (sección al final de la lista).

### 6) Opcional: Analytics (Google Analytics)
- Estado: Pendiente.
- Plan de evidencia UI: Captura del tag GA cargado y eventos básicos (view_item_list, select_item).
  - Implementación sugerida:
    - Añadir `gtag.js` en `frontend/index.html` con `VITE_GA_MEASUREMENT_ID` y disparos en vistas de catálogo/producto.

## Arquitectura y Rutas
- Frontend
  - Catálogo autenticado: `frontend/src/pages/pharmacy/PharmacyCatalogPage.tsx`
  - Catálogo invitado: `frontend/src/pages/pharmacy/GuestCatalogPage.tsx`
  - UI de categorías: `frontend/src/components/pharmacy/CategoriesNav.tsx`, `FiltersDrawer.tsx`, `CategoriesSidebar.tsx`
  - Servicio e-commerce: `frontend/src/services/ecommerceService.ts`
- Backend
  - Modelos: `backend/apps/ecommerce/models.py`
  - Serializers: `backend/apps/ecommerce/serializers.py`
  - Vistas: `backend/apps/ecommerce/views.py`
  - URLs: `backend/apps/ecommerce/urls.py`
  - Seed: `backend/apps/ecommerce/management/commands/seed_ecommerce.py`

## Cómo Tomar las Capturas
- Usa viewport móvil para chips + botón “Filtrar” (drawer) y desktop para sidebar.
- Captura el hero y al menos una tarjeta de producto con precio formateado.
- Captura el catálogo con `?category=<id>` y con `?search=<texto>` para evidenciar filtrado/búsqueda.
- Captura el endpoint de inventario (`/api/ecommerce/inventory/<id>/`) en navegador o Swagger/Redoc.

## Próximos Pasos
- Mostrar stock en tarjetas o en detalles de producto.
- Bloque “Recomendados” por categoría (misma consulta del grid, limit 4).
- Integrar `google-analytics` con eventos básicos.

## Anexos
- Diseño responsivo y tokens en `theme.css` aseguran consistencia visual.
- Favicon dinámico con color del tema (UI branding).
