# Resumen Ejecutivo
- La base del frontend en React + TypeScript y Tailwind está bien estructurada con layouts, rutas protegidas y componentes reutilizables. Hay oportunidades claras para mejorar accesibilidad, lazy‑loading, consistencia de tokens y SEO.
- La navegación funciona, pero mezcla estilos inline y utilidades, y carece de ARIA consistente en iconos y selects personalizados.
- Rendimiento puede mejorar significativamente con división de código en rutas, vendors, y virtualización de listas grandes.
# Prioridades
- Alta
  - Unificar tokens CSS y Tailwind; eliminar estilos inline en navegación.
  - Añadir lazy‑loading de rutas y chunks manuales de vendors.
  - Corregir accesibilidad en Select , iconos e idioma del documento.
  - Arreglar duplicación de rutas y opciones de React Query v5.
- Media
  - Estandarizar iconografía y estados “loading” en Button .
  - Rutas anidadas por layout para roles y páginas administrativas.
  - Virtualizar listas largas y paginación visible.
- Baja
  - Completar escala tipográfica/espaciado como tokens; modo oscuro con variables.
  - Optimizar fuentes ( preconnect , display=swap ) y metadatos SEO extendidos.
# Navegación
- Fortalezas
  - navigation.ts y useNavigation proporcionan estructura y breadcrumbs; Sidebar y Header separan controles.
  - Rutas protegidas con ProtectedRoute .
- Oportunidades
  - Sustituir estilos inline y handlers de hover/focus por clases Tailwind basadas en tokens para mantenibilidad y coherencia de foco.
  - Iconos decorativos sin aria-hidden ; mezclar bibliotecas (Heroicons vs Material) genera inconsistencia.
  - Añadir aria-current="page" en links activos del sidebar.
- Referencias
  - frontend/src/components/layout/Header.tsx : mover hover/focus a clases y añadir aria-label en botones icónicos.
  - frontend/src/components/layout/Sidebar.tsx : aria-hidden para íconos y aria-current cuando activo.
# Arquitectura y Enrutamiento
- Fortalezas
  - Enrutamiento centralizado con BrowserRouter y rutas protegidas.
- Oportunidades
  - Lazy‑loading con React.lazy y Suspense en páginas pesadas y modales.
  - Rutas anidadas por layout (admin/doctor/secretary/client) con Outlet para evitar repetición de ProtectedRoute .
  - Eliminar duplicación de /admin/doctors .
  - Usar Link en 404 para evitar recargas completas.
- Referencias
  - frontend/src/App.tsx : implementar lazy , Suspense , corregir duplicación y enlaces del 404.
  - frontend/src/components/layout/AdminLayout.tsx : exponer Outlet y agrupar rutas hijas.
# Estado y Datos (React Query)
- Fortalezas
  - Uso de @tanstack/react-query y AuthContext con useReducer .
- Oportunidades
  - Actualizar opciones a v5 ( gcTime en lugar de cacheTime , ajustar staleTime y refetchOnMount ).
  - Interceptores de API deben coordinar logout/refresh con el contexto, evitando limpiezas silenciosas.
  - Encapsular console.log y depuradores bajo import.meta.env.DEV .
- Referencias
  - frontend/src/main.tsx : opciones de QueryClient .
  - frontend/src/services/api.ts : baseURL desde VITE_API_BASE_URL y coordinación de auth.
# Rendimiento y División de Código
- Fortalezas
  - Base Vite y alias; estructura modular de páginas.
- Oportunidades
  - Manual chunks de vendors (react/router/query/ui/charts/forms) en vite.config.ts para TTI.
  - Lazy‑loading de rutas principales y modales.
  - Virtualización de listas (pacientes/doctores) con react-window o @tanstack/react-virtual .
  - Condicionar render de depuradores ( LocationDebugger ) a entorno DEV.
- Referencias
  - frontend/vite.config.ts : rollupOptions.output.manualChunks .
  - frontend/src/pages/patients/PatientList.tsx : virtualización y paginación visible.
# Componentes UI
- Fortalezas
  - Modal con Headless UI; Tabs con roles; Input con label e id .
  - Button y Card con class-variance-authority ( cva ) y variantes sólidas.
- Oportunidades
  - Button : prop isLoading , aria-busy , aria-disabled , y clases de foco coherentes ( focus-visible:ring-primary-500 , ring-offset-white ).
  - Select : completar ARIA (combobox/listbox/option, aria-activedescendant , teclado) o migrar a Listbox de Headless UI.
- Referencias
  - frontend/src/components/ui/Button.tsx : añadir isLoading y aria.
  - frontend/src/components/ui/Select.tsx : roles/ARIA y soporte de teclado.
# Accesibilidad
- Fortalezas
  - Componentes clave usan roles y Headless UI .
- Oportunidades
  - lang="es" en index.html , skip link, role="navigation" , aria-label en botones icónicos.
  - Consistencia en contraste y foco visible.
- Referencias
  - frontend/index.html : idioma, preconnect y fuentes.
  - frontend/src/components/layout/Layout.tsx : skip link y main con id .
  - frontend/src/components/layout/Sidebar.tsx : aria-current .
# Tokens y Diseño
- Fortalezas
  - theme.css con variables semánticas y utilitarios; buena base para design system.
- Oportunidades
  - Mapear variables CSS a Tailwind en tailwind.config.js para usar una única fuente de verdad.
  - Unificar paleta y escalas tipográficas/espaciado; documentar uso de tokens en variantes cva .
- Referencias
  - frontend/src/styles/theme.css : tipografía, espaciado, colores semánticos.
  - frontend/tailwind.config.js : extend.colors mapeando a CSS vars.
# Responsive
- Fortalezas
  - Sidebar móvil con overlay; contenedores con max-w-7xl .
- Oportunidades
  - Evitar h-screen rígido; usar min-h-screen y safe-area-inset en móviles (Safari iOS).
  - Asegurar targets táctiles mínimos y áreas activas en iconos del Header .
- Referencias
  - frontend/src/components/layout/Layout.tsx : min-h-screen y padding seguro.
# SEO
- Fortalezas
  - Estructura base lista para enriquecerse.
- Oportunidades
  - meta description , Open Graph/Twitter, canonical , y lang="es" .
  - Metadatos por página con react-helmet-async ; evaluar PWA y sitemap si aplica.
- Referencias
  - frontend/index.html : metadatos globales.
  - frontend/src/pages/* : helmet por página clave (Home, Dashboard, Doctors).
# Acciones Rápidas (Quick Wins)
- Cambiar lang="es" y añadir meta description /OG en index.html .
- Sustituir estilos inline en Header.tsx ; añadir aria-hidden a iconos decorativos.
- Añadir aria-current en links activos del sidebar y skip link en layout.
- Corregir cacheTime → gcTime y refetchOnMount en main.tsx (React Query v5).
- Lazy‑loading en App.tsx con React.lazy y Suspense y eliminar duplicación de /admin/doctors .
- Configurar manualChunks en vite.config.ts ; condicionar LocationDebugger y logs a DEV.
- Button : prop isLoading con aria-busy / aria-disabled .
- Select : completar ARIA o migrar a Listbox de Headless UI.
# Métricas de Éxito y Seguimiento
- Rendimiento: TTI , LCP , CLS antes/después; tamaño del bundle inicial; número de chunks.
- Accesibilidad: puntuación Lighthouse y axe en páginas clave; foco visible y navegación por teclado.
- Navegación: tasa de clics en sidebar/header, tiempo hasta acción; errores 404.
- Consistencia visual: cobertura de tokens en componentes ( Button , Card , Tabs , Select ).
- SEO: preview enriquecido, indexación correcta y CTR en páginas públicas.