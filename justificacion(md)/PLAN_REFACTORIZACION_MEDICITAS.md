# Plan de Refactorización – Medicitas App (Android)

> Alineado a los temas de `refactorkt.md` (Kotlin/POO, Layouts/Compose, Activities/Intents, Menús, Room, Retrofit, Corrutinas, Permisos/Localización, Notificaciones, WebView, Widgets). Sin Firebase.

## 1. Decisiones confirmadas
- Mantener Hilt para DI.
- Incluir Localización solo para “envíos delivery” (permisos y lectura de ubicación básica). 
- No usar Firebase; la app consumirá la misma API que la web.

## 2. Alcance y restricciones (temario permitido)
- Kotlin esencial y POO.
- Layouts y Jetpack Compose básico (Material 3, Navigation Compose).
- Activities e Intents.
- Menús.
- Room (SQLite) para persistencia local.
- Retrofit/OkHttp para servicios Web (API REST) y manejo de tokens.
- Corrutinas.
- Permisos y Localización (servicios básicos de ubicación). 
- Notificaciones locales (no push).
- WebView.
- Widgets (Glance AppWidget).
 - Animaciones (Jetpack Compose).

## 3. Objetivos de la refactorización
- Mejorar mantenibilidad, legibilidad y modularidad.
- Estandarizar manejo de estados y errores.
- Persistir datos clave (carrito, cache productos) con Room.
- Mejorar UX con componentes reutilizables, accesibilidad e i18n.
 - Incorporar animaciones obligatorias para mejorar feedback y percepción de rendimiento.
- Integrar localización para delivery de forma segura.
- Añadir notificaciones locales y WebView informativa.
- Potenciar el Widget para acceso rápido.

## 4. Plan por módulos/temas

### 4.1 Kotlin/POO y Fundamentos
- Crear `data/mappers/` para mapeos DTO→Domain (extraer de `RemoteProductRepository`).
- Introducir un `Result` propio (sealed class) en repositorios, para estandarizar éxito/error.
- Centralizar constantes (paginación, rutas, timeouts) en `core/Constants.kt`.
- Revisar null-safety en modelos (`Product`, `CartItem`) y defaults.
- Mantener `runBlocking` solo dentro de `JwtAuthenticator` (patrón permitido).

### 4.2 UI Compose y Layouts
- Componentizar UI reusable en `ui/components/` (TopBar, BottomBar, ProductCard, Banner/Carousel, Botones de paginación).
- Convertir pantallas a composables “stateless” con callbacks; el estado solo en ViewModels.
- Añadir `@Preview` por cada componente/pantalla clave.
- Accesibilidad: contentDescription, contraste, tamaños; consolidar `strings.xml` (values y values-en).

### 4.3 Navegación, Activities e Intents
- Revisar navegación: `popUpTo`, `launchSingleTop`, `restoreState` para evitar bucles.
- Agregar Intent de compartir producto (ACTION_SEND) en `ProductDetail`.
- (Opcional) Deep link simple para abrir detalle de producto.

### 4.4 Menús (Material 3)
- Estandarizar acciones en `TopAppBar` con Overflow si aplica.
- Mantener `NavigationBar` inferior y labels desde `strings.xml`.
- Pantalla mínima de “Ajustes” (tema, idioma) sin librerías extra.

### 4.5 Room (Persistencia)
- Crear `ProductEntity`, `CartItemEntity`, `ProductDao`, `CartDao`, `AppDatabase`.
- Repositorio híbrido: remoto (Retrofit) + cache local (Room) para productos.
- Persistir carrito en Room desde `CartViewModel` (sobrevive cierre de app).
- Usar `Flow`/`suspend` en DAOs; recolectar en ViewModels.

### 4.6 Retrofit/OkHttp (Servicios Web)
- Confirmar `baseUrl` (`BuildConfig.BASE_URL + "api/"`).
- Definir timeouts básicos en `OkHttpClient` (connect/read/write).
- Estandarizar manejo de errores en repositorios (devolver `Result`).
- Mantener `AuthInterceptor` y `JwtAuthenticator` (refresh 401, limpiar tokens si falla).
- Asegurar construcción de URL absoluta para imágenes (`ensureAbsoluteUrl`).

### 4.7 Corrutinas e Hilos
- Usar `Dispatchers.IO` en operaciones de Room y red.
- Mantener `viewModelScope.launch` y structured concurrency.
- Evitar `runBlocking` fuera del `Authenticator`.

### 4.8 Permisos y Localización (Delivery)
- Solicitar permisos `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` en tiempo de ejecución.
- `LocationService` básico: obtener última ubicación y transformar a dirección aproximada (si es necesario, vía API propia).
- UI de “selección de dirección de entrega” con fallback sin ubicación (input manual).
- Declarar permisos en `AndroidManifest` y manejar denegación.

### 4.9 Notificaciones locales
- Crear `NotificationChannel` (Android O+) y helper.
- Notificación “Compra confirmada” desde `CheckoutScreen` con `PendingIntent` a `MainActivity` y navegación a `Checkout`/`Cart`.

### 4.10 WebView
- Pantalla `WebViewScreen` para “Términos y condiciones” o “Ayuda”.
- Controles básicos: cargar URL, recargar, back dentro del WebView.

### 4.11 Widget (Glance)
- Mejorar `MedicitasWidget`: mostrar contador del carrito (si el carrito está en Room, leer total básico).
- Acción de clic: abrir `MainActivity` y navegar a `Cart` o `Catalog`.
- Verificar `appwidget-provider` (`res/xml/medicitas_widget_info.xml`).

### 4.12 Animaciones (Jetpack Compose)
- Uso OBLIGATORIO de animaciones en componentes clave, sin librerías externas, siguiendo "Jetpack Animation" del temario:
  - AnimatedVisibility para mostrar/ocultar estados: loaders, mensajes de error y secciones vacías.
  - animateContentSize en contenedores que expanden/contraen (p. ej., detalle de producto o tarjeta con más información).
  - animateColorAsState y animateFloatAsState para feedback de acciones (añadir al carrito, estados habilitado/deshabilitado, cambios de precio/stock).
  - Crossfade para transiciones suaves entre estados de pantalla (loading → contenido, catálogo vacío → listado).
  - Animación de ítems en listas con animateItemPlacement en LazyGrid/LazyColumn (entrada/salida y reordenamientos sencillos).
  - Transición en el FAB/botón de carrito (pequeño "bounce"/escala al agregar productos).
- No usar librerías externas (sin Lottie, sin accompanist-navigation-animation); limitarse a APIs de Compose mencionadas en el temario.
- En Widget (Glance), mantener estático: las animaciones no aplican en AppWidgets.

## 5. Entregables y criterios de aceptación
- POO/Kotlin: mappers dedicados y `Result` aplicado en repositorios; constantes centralizadas.
- UI Compose: pantallas sin estado local excesivo; componentes reutilizables; `@Preview` funcionando.
- Navegación/Intents: back stack estable; compartir producto operativo.
- Menús: acciones consistentes; labels y iconos desde recursos.
- Room: carrito persistente; cache de productos; DAOs y DB probados.
- Retrofit: errores mapeados a `Result`; refresh JWT funcional sin loops.
- Corrutinas: `Dispatchers.IO` aplicado; sin bloqueos en UI.
- Localización: permisos y lectura de ubicación correcta; fallback sin ubicación.
- Notificaciones: canal creado; notificación disparada en confirmación.
- WebView: pantalla funcional con controles mínimos.
- Widget: muestra datos y abre la app correctamente.
 - Animaciones: al menos 6 animaciones aplicadas como se describe (AnimatedVisibility, animateContentSize, animateColor/Float, Crossfade, animateItemPlacement, escala en botón), verificables en ejecución.

## 6. Orden recomendado de implementación
1) Fundamentos Kotlin/POO (mappers, Result, constantes, limpieza).
2) UI Compose y componentización; navegación estable e intents; animaciones básicas obligatorias.
3) Room (cache y carrito persistente).
4) Networking (Retrofit/OkHttp, manejo de errores y refresh).
5) Corrutinas (afinado de dispatchers y lanzamientos).
6) Localización (permisos y servicio básico para delivery).
7) Notificaciones locales.
8) WebView.
9) Mejora del Widget.

## 7. Cambios en build/Gradle y estabilidad
- Alinear versiones de Compose, Navigation y Lifecycle en `libs.versions.toml`.
- Solucionar el error de build en Windows (“Couldn't delete R.jar”): ejecutar `gradlew clean` antes de `assembleDebug`.
- Mantener `buildConfigField(BASE_URL)` y `manifestPlaceholders` (cleartext en debug, no en release).
- Revisar proguard (si se usa minify) para mantener modelos DTO/Room.

## 8. Pruebas y verificación
- Unitarias: mappers, `ensureAbsoluteUrl`, repositorios con `Result`.
- Instrumentadas: DAOs Room, persistencia de carrito.
- Manuales: flujo de login→checkout, paginación catalogo, compartir producto, permisos de ubicación, notificación local, WebView, Widget.
- Integración: consumo de API (login, me, products, product/{id}).

## 9. Riesgos y mitigaciones
- Cambios en repositorios afectan pantallas → Mitigar con `Result` y pruebas unitarias.
- Localización dependiente de permisos → Ofrecer flujo alterno sin ubicación.
- Cache desactualizada → Estrategia simple: invalidar/rellenar cache tras éxito de red.
- Widget con datos dinámicos → Mantenerlo básico; actualizar manualmente o al abrir app.

## 10. Checklist de tareas
- [ ] Crear `data/mappers` y mover mapeos DTO→Domain.
- [ ] Implementar `core/Result.kt` y aplicar en repositorios.
- [ ] Centralizar constantes en `core/Constants.kt`.
- [ ] Componentizar UI en `ui/components` y añadir `@Preview`.
- [ ] Revisar navegación y agregar compartir producto.
- [ ] Definir entidades/DAOs/DB para Room y repositorio híbrido.
- [ ] Persistir carrito en Room desde `CartViewModel`.
- [ ] Alinear timeouts y manejo de errores con Retrofit/OkHttp.
- [ ] Afinar corrutinas con `Dispatchers.IO`.
- [ ] Implementar `LocationService`, permisos y UI de entrega.
- [ ] Crear `NotificationChannel` y enviar notificación local en checkout.
- [ ] Añadir `WebViewScreen` para T&C/Ayuda.
- [ ] Mejorar `MedicitasWidget` (contador y navegación).
- [ ] Ejecutar `gradlew clean` y validar build (debug/release).
 - [ ] Implementar animaciones obligatorias en Compose:
   - [ ] AnimatedVisibility para loaders, errores y estados vacíos.
   - [ ] animateContentSize en tarjetas/contenedores expandibles.
   - [ ] animateColorAsState y animateFloatAsState para feedback en botones/valores.
   - [ ] Crossfade para transiciones de estado en pantallas.
   - [ ] animateItemPlacement en listas (LazyGrid/LazyColumn).
   - [ ] Animación de escala en botón/FAB de carrito al agregar.

---
Este plan se ajusta al temario de `refactorkt.md`, mantiene Hilt, integra localización para delivery sin complejidad extra y evita Firebase. Permite implementar mejoras de calidad y UX sin salir del alcance acordado.
