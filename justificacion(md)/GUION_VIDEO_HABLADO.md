# Guion hablado del video – Medicitas App (6–8 minutos)

En esta oportunidad presentaré el avance de mi proyecto Medicitas, una aplicación móvil de farmacia con backend en Django, y me centraré en cuatro aspectos clave de la rúbrica: arquitectura, autenticación segura con refresh, experiencia de usuario con estados e internacionalización/accesibilidad, y pruebas con build verificada.

0:00–0:20 Introducción
- Hola, soy [tu nombre]. Hoy les mostraré el avance de Medicitas. Veremos cómo está organizada la app, cómo se maneja la autenticación con tokens y refresh, la experiencia de usuario en catálogo y detalle, la internacionalización y accesibilidad, y finalmente las pruebas instrumentadas y la verificación del build.
(Mostrar README del repo o slide de título: e:\\PROYECTO-DJANGO-REACT\\proyect\\README.md)

0:20–1:10 Arquitectura general del proyecto
- La solución se compone de un frontend móvil en Android y un backend en Django.
- En Android uso Jetpack Compose para la UI, ViewModels y Repository para la capa de datos, Retrofit y OkHttp para la comunicación de red, y Dagger/Hilt para la inyección de dependencias.
- A nivel de módulos clave:
  - TokenManager gestiona el almacenamiento de tokens; en debug usa SharedPreferences y en release EncryptedSharedPreferences.
  - AuthInterceptor añade el header Authorization con el bearer token en cada petición.
  - JwtAuthenticator refresca el access token automáticamente cuando el servidor responde 401, usando el refresh token.
  - ApiService define los endpoints, incluyendo login, refresh y productos.
  - NetworkModule configura los clientes de OkHttp (con y sin auth), Retrofit y provee ApiService, AuthInterceptor y JwtAuthenticator vía DI.
(Mostrar explorador/IDE con estructura del proyecto: e:\\PROYECTO-DJANGO-REACT\\proyect\\)
(Mostrar Android Studio: NetworkModule.kt – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\di\\NetworkModule.kt)
(Mostrar Android Studio: ApiService.kt – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\data\\remote\\ApiService.kt)
(Mostrar Android Studio: TokenManager.kt – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\data\\local\\TokenManager.kt)

1:10–2:20 Autenticación segura y flujo de tokens
- El flujo de autenticación funciona así: tras el login, guardo access y refresh tokens en TokenManager.
- En cada petición, AuthInterceptor agrega el bearer token si existe. Si la API responde 401, entra JwtAuthenticator: pide un refresh al endpoint correspondiente mediante un ApiService sin interceptor (para evitar bucles), actualiza el access token y reintenta la solicitud original.
- Si el refresh falla o los tokens no están disponibles, JwtAuthenticator limpia el almacenamiento y la sesión se invalida, evitando estados inconsistentes.
- Los DTOs usados incluyen RefreshRequest/RefreshResponse y LoginEnvelope para encapsular las respuestas del backend.
(Mostrar Android Studio: AuthInterceptor.kt – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\data\\remote\\auth\\AuthInterceptor.kt)
(Mostrar Android Studio: JwtAuthenticator.kt – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\data\\remote\\auth\\JwtAuthenticator.kt)
(Mostrar Android Studio: Refresh.kt y LoginEnvelope.kt – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\data\\remote\\dto\\auth\\Refresh.kt y LoginEnvelope.kt)
(Mostrar Android Studio: NetworkModule.kt con @Named("noAuth") para ApiService de refresh)

2:20–4:10 Demostración funcional
- Abrimos la app y vamos al catálogo: aquí se muestran estados de carga, error y vacío de forma clara para el usuario; esto mejora la UX y es parte de la rúbrica.
- El catálogo implementa paginación end-to-end. Al desplazarnos, se cargan más productos de forma eficiente.
- Para las imágenes uso Coil, con placeholders y crossfade, y además contentDescription para accesibilidad.
- Los precios se muestran con un string resource internacionalizado, por ejemplo “price_simple”, lo que evita textos hardcodeados y facilita la traducción.
- Entramos al detalle de un producto: vemos información clave y el botón “Agregar al carrito”. Mostramos la navegación hacia atrás usando íconos AutoMirrored ArrowBack para soportar RTL y evitar deprecaciones.
- Visitamos el carrito y la búsqueda: destaca la consistencia visual, la navegación y los íconos actualizados. En perfil se mantiene la misma línea de diseño.
(Mostrar emulador: CatalogScreen – scroll con paginación y estados de carga/error/vacío)
(Mostrar código opcional: CatalogScreen.kt – contentDescription y stringResource de precio – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\ui\\screens\\catalog\\CatalogScreen.kt)
(Mostrar emulador: ProductDetailScreen – botón “Agregar al carrito” y back con ArrowBack AutoMirrored – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\ui\\screens\\product\\ProductDetailScreen.kt)
(Mostrar emulador: CartScreen – navegación atrás – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\ui\\screens\\cart\\CartScreen.kt)
(Mostrar emulador: SearchScreen y ProfileScreen – barra superior e íconos AutoMirrored – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\ui\\screens\\search\\SearchScreen.kt y ...\\profile\\ProfileScreen.kt)

4:10–5:00 Internacionalización y accesibilidad
- Strings disponibles en español e inglés: tengo archivos values/strings.xml y values-en/strings.xml. Entre ellos, banner_content_description, add_to_cart, delivery_standard_tomorrow y price_simple para formato de precio.
- Accesibilidad: añadí contentDescription en imágenes del catálogo y banners. Reemplacé íconos obsoletos por variantes AutoMirrored (ArrowBack y Sort) para compatibilidad con layouts RTL.
- Nota de mejora pendiente: haré un pase final para verificar que todos los botones y FAB cumplan el tamaño táctil mínimo de 48dp. La mayor parte ya está bien por los componentes de Material, pero lo dejaré explicitado como verificación final.
(Mostrar Android Studio: strings.xml y values-en/strings.xml – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\res\\values\\strings.xml y ...\\values-en\\strings.xml)
(Mostrar uso en código: CatalogScreen.kt – contentDescription y price_simple – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\main\\java\\com\\example\\farmacia_medicitas\\ui\\screens\\catalog\\CatalogScreen.kt)
(Mostrar íconos AutoMirrored en archivos: CartScreen.kt, ProductDetailScreen.kt, ProfileScreen.kt, SearchScreen.kt, CatalogScreen.kt)

5:00–6:10 Pruebas instrumentadas y build verificada
- Implementé pruebas instrumentadas:
  - TokenManagerInstrumentedTest: verifica que los tokens se guardan, se actualizan y se limpian correctamente.
  - JwtAuthenticatorInstrumentedTest: simula un 401, valida que se refresca el token y que se actualiza el header Authorization; también verifica que se limpian los tokens si el refresh falla.
- La compilación del proyecto con assembleDebug está verificada. Resolví deprecaciones de íconos usando AutoMirrored. Aparecen advertencias de Kapt por la versión de lenguaje, pero no bloquean la build.
- Opcionalmente, se pueden ejecutar los tests en dispositivos conectados con “./gradlew connectedAndroidTest -x lint”.
(Mostrar Android Studio: carpeta androidTest y abrir TokenManagerInstrumentedTest.kt y JwtAuthenticatorInstrumentedTest.kt – e:\\PROYECTO-DJANGO-REACT\\proyect\\Medicitas-app\\app\\src\\androidTest\\java\\com\\example\\farmacia_medicitas\\...)
(Mostrar terminal en Medicitas-app: ejecutar ./gradlew assembleDebug -x lint y mostrar “BUILD SUCCESSFUL”)
(Opcional: ejecutar ./gradlew connectedAndroidTest -x lint)

6:10–6:40 Cierre y checklist de la rúbrica
- En resumen: arquitectura clara con DI, autenticación robusta con refresh automático, UI con estados bien definidos, i18n y accesibilidad aplicadas, pruebas instrumentadas y build exitoso.
- Checklist rápido:
  - Login y persistencia de tokens (TokenManager).
  - Header Authorization y refresh automático (AuthInterceptor + JwtAuthenticator).
  - Estados de carga/error/vacío en catálogo y detalle.
  - Paginación funcionando.
  - Imágenes con contentDescription y placeholders.
  - Strings internacionalizados (ES/EN), incluyendo formato de precios.
  - Íconos AutoMirrored sin deprecaciones.
  - Pruebas instrumentadas compilando y ejecutables.
  - Build assembleDebug verificada.
- Próximos pasos si hubiera tiempo: confirmar tamaños táctiles ≥48dp, pluralización avanzada, pipeline de CI/CD y pruebas de UI con Compose.
(Mostrar slide o documento con checklist: e:\\PROYECTO-DJANGO-REACT\\proyect\\GUION_VIDEO_PRESENTACION.md)

Guion hablado (versión continua)
“En esta oportunidad presentaré el avance de mi proyecto Medicitas, una aplicación móvil de farmacia con backend en Django. Veremos arquitectura, autenticación segura con refresh, experiencia de usuario en catálogo y detalle, internacionalización y accesibilidad, y pruebas con build verificada.
(Mostrar README del repo)
A nivel de arquitectura, la app está construida con Jetpack Compose para la UI, ViewModels y Repository para la lógica, Retrofit y OkHttp para red, y Dagger/Hilt para la inyección de dependencias. El TokenManager guarda y protege access y refresh tokens; el AuthInterceptor agrega el bearer token; y el JwtAuthenticator refresca automáticamente el token si el servidor responde 401.
(Mostrar Android Studio: NetworkModule.kt, ApiService.kt y TokenManager.kt)
En la práctica, tras el login, guardamos los tokens. Cada petición sale con Authorization; si ocurre un 401, el autenticador llama al endpoint de refresh, actualiza el access token y reintenta la solicitud. Si el refresh falla, limpiamos los tokens para evitar inconsistencias.
(Mostrar Android Studio: AuthInterceptor.kt y JwtAuthenticator.kt; DTOs en Refresh.kt y LoginEnvelope.kt)
Ahora la demo: en el catálogo mostramos estados de carga, error y vacío; tenemos paginación; y usamos Coil con placeholders y crossfade. Además, todas las imágenes tienen contentDescription y los precios se presentan como strings internacionalizados. En la pantalla de detalle, podemos agregar al carrito y regresar con íconos AutoMirrored que soportan RTL. Búsqueda y perfil mantienen coherencia visual.
(Mostrar emulador: CatalogScreen, ProductDetailScreen, CartScreen, SearchScreen y ProfileScreen)
Sobre i18n y accesibilidad: contamos con strings en español e inglés, y añadimos contentDescription en imágenes y banners. Actualizamos íconos obsoletos a versiones AutoMirrored. Me queda un pase final para verificar que todos los targets táctiles cumplan con 48dp.
(Mostrar strings.xml y values-en/strings.xml; uso en CatalogScreen.kt; íconos AutoMirrored)
Finalmente, sobre calidad: implementé pruebas instrumentadas para TokenManager y JwtAuthenticator. La build assembleDebug está verificada, y las advertencias no bloquean el proyecto. Con esto cumplo los puntos principales de la rúbrica.
(Mostrar androidTest y terminal con assembleDebug)
Gracias por ver el avance. Quedo atento a preguntas y sugerencias.”