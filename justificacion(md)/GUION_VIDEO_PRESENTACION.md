# Guion del Video de Entrega – Medicitas App

Duración objetivo: 6–8 minutos. Estilo: demostración guiada y concisa, enfocada en evidencias técnicas y cumplimiento de rúbrica.

Índice del video
- 0:00 Introducción y objetivos
- 0:20 Panorama del proyecto y arquitectura
- 1:10 Seguridad y autenticación (TokenManager, AuthInterceptor, JwtAuthenticator)
- 2:20 Demostración: catálogo, detalle, carrito, búsqueda, perfil
- 4:10 Internacionalización y accesibilidad
- 5:00 Pruebas instrumentadas y build
- 6:10 Cierre y checklist de rúbrica

1) Introducción (15–20 s)
- Presentación rápida: nombre y contexto del proyecto Medicitas.
- Objetivo del video: mostrar funcionalidad, arquitectura y cumplimiento de rúbrica (auth segura, estados UI, i18n, accesibilidad, pruebas y build).

2) Panorama del proyecto y arquitectura (40–50 s)
- Estructura del repo: carpeta Android “Medicitas-app”, backend Django en “backend”, documentación y planes en la raíz.
- Componentes de la app Android: Jetpack Compose (UI), ViewModel/Repository (capa de datos), Retrofit + OkHttp (red), Dagger/Hilt (DI).
- Mostrar brevemente los archivos relevantes:
  - DI de red: Medicitas-app/app/src/main/java/.../di/NetworkModule.kt
  - Servicio API: data/remote/ApiService.kt
  - Interceptor y autenticador: data/remote/auth/AuthInterceptor.kt y JwtAuthenticator.kt
  - Gestor de tokens: data/local/TokenManager.kt

3) Seguridad y autenticación (70 s)
- TokenManager: guarda tokens de acceso y refresh.
  - Debug usa SharedPreferences; Release usa EncryptedSharedPreferences.
  - Ubicación: Medicitas-app/app/src/main/java/.../data/local/TokenManager.kt
- AuthInterceptor: añade Authorization Bearer si existe accessToken.
  - Ubicación: .../data/remote/auth/AuthInterceptor.kt
- JwtAuthenticator: ante 401 refresca el accessToken usando refreshToken y reintenta la solicitud.
  - Usa ApiService @Named("noAuth") para evitar bucle de auth en el refresh.
  - Ubicación: .../data/remote/auth/JwtAuthenticator.kt
- DTOs de auth:
  - RefreshRequest/RefreshResponse: .../data/remote/dto/auth/Refresh.kt
  - LoginEnvelope: .../data/remote/dto/auth/LoginEnvelope.kt
- DI de red: OkHttp client con interceptor + authenticator; Retrofit con BASE_URL.
  - Ubicación: .../di/NetworkModule.kt
- Explicar flujo: login -> guardar tokens -> peticiones con Authorization -> si 401 -> JwtAuthenticator refresca -> TokenManager actualiza -> reintento exitoso; si falla, limpia tokens.

4) Demostración funcional (110–120 s)
- Catálogo:
  - Estados de carga, error y vacío (mostrar transiciones y mensajes internacionales donde aplique).
  - Paginación de productos end-to-end (scroll infinito o acción de cargar más).
  - Imágenes con Coil (placeholders, crossfade) y contentDescription con strings.
- Detalle de producto:
  - Visualización de información y botón “Agregar al carrito”.
- Carrito:
  - Navegación hacia atrás con ícono AutoMirrored ArrowBack.
- Búsqueda y Perfil:
  - Mostrar barra superior con back auto-mirrored y acciones.
- Internacionalización de precios:
  - Mostrar precios usando el string resource “price_simple” (S/. %1$.2f) en CatalogScreen.

5) Internacionalización y accesibilidad (60–70 s)
- Strings en español e inglés:
  - values/strings.xml y values-en/strings.xml
  - Ejemplos: banner_content_description, delivery_standard_tomorrow, add_to_cart, price_simple.
- Accesibilidad:
  - contentDescription en AsyncImage de ProductCard y en banners.
  - Íconos actualizados a AutoMirrored (ArrowBack, Sort) para RTL.
  - Nota: revisar targets táctiles ≥ 48dp en botones y FAB (mencionar si ya está verificado o pendiente de pase final).

6) Pruebas y build (60–70 s)
- Instrumented tests creados y compilados:
  - TokenManagerInstrumentedTest.kt: verifica guardar/actualizar/limpiar tokens.
  - JwtAuthenticatorInstrumentedTest.kt: verifica refresh en 401 y limpieza al fallar.
- Ejecutar (opcional durante el video):
  - ./gradlew connectedAndroidTest -x lint
- Build verificada:
  - ./gradlew assembleDebug -x lint (exitoso; se resolvieron deprecaciones de íconos y se mantiene aviso de Kapt).
- Mencionar proguard-rules.pro para release (si aplica en rúbrica, explicar brevemente que ya está preparado el archivo).

7) Cierre y checklist de rúbrica (40–50 s)
- Resumen: arquitectura clara, auth robusta con refresh, UI con estados, i18n y accesibilidad, pruebas y build correctos.
- Checklist rápido (mostrar en pantalla):
  - [ ] Login y tokens persistentes (TokenManager)
  - [ ] Authorization header y refresh automáticos (AuthInterceptor + JwtAuthenticator)
  - [ ] Estados de carga/error/vacío en Catálogo y Detalle
  - [ ] Paginación funcionando
  - [ ] Imágenes con contentDescription y placeholders
  - [ ] Strings internacionalizados (ES/EN) y uso de price_simple
  - [ ] Íconos AutoMirrored (ArrowBack, Sort), sin deprecaciones
  - [ ] Instrumented tests compilando y/o ejecutados
  - [ ] Build assembleDebug exitosa
- Próximos pasos (si el jurado pregunta): mejora de targets táctiles, pluralización avanzada, CI/CD y pruebas de UI con Compose.

Anexo: guion hablado sugerido
- “Hola, soy [tu nombre]. En este video presento Medicitas, una app de farmacia con backend Django. Veremos arquitectura, autenticación segura con refresh, estados de UI, i18n/accesibilidad, pruebas y build.”
- “A nivel de arquitectura, usamos Compose, ViewModels y Repository. En red, Retrofit y OkHttp con Dagger/Hilt. El TokenManager guarda access/refresh; el AuthInterceptor añade el bearer; y JwtAuthenticator refresca tokens ante 401.”
- “En catálogo, tenemos estados de carga, error y vacío; imágenes con Coil y contentDescription; y paginación completa. En detalle y carrito, navegamos con íconos AutoMirrored para compatibilidad RTL.”
- “La internacionalización se aplica en strings ES/EN, incluyendo el formato de precio. Accesibilidad: contentDescription en imágenes y banners.”
- “Mostramos pruebas instrumentadas para TokenManager y JwtAuthenticator, y confirmamos el build. Con esto cumplimos la rúbrica principal.”
- “Gracias por ver. Quedo atento a preguntas y mejoras futuras como targets táctiles y CI.”