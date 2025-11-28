# Plan de Entrega Hoy: Video y Cumplimiento de Rúbrica

Este documento planifica, paso a paso, lo que falta para alcanzar la calificación "Excelente (3 pts)" en todos los criterios y cómo mostrarlo claramente en el video de entrega.

## Objetivo

- Completar las tareas mínimas necesarias para llegar a "Excelente" en los 6 criterios: Planificación y Organización, Arquitectura MVVM, Base de Datos/APIs, Servicios Externos, Diseño y Seguridad, Funcionalidad General.
- Grabar un video único que demuestre cada criterio con evidencias claras (UI y logs). 

## Estado Actual (resumen)

- Login funcionando con redirección y desbloqueo de funciones.
- Endpoint protegido "me" corregido: `/api/users/me/`.
- Header Authorization y flujo de refresh 401 → refresh → retry probados.
- Navegación con rutas definidas; catálogo y detalle básicos; Coil integrado.

## Brecha a cerrar (pendiente clave)

- Estados de carga/error/empty en Catálogo y Detalle.
- Placeholders y manejo de fallos de imagen con Coil.
- Paginación del catálogo (page/page_size).
- Pruebas unitarias: TokenManager, AuthRepository, JwtAuthenticator.
- Prueba instrumentada básica: login → checkout y persistencia tras reinicio.
- EncryptedSharedPreferences para tokens en release + documentación.
- Accesibilidad básica y textos a strings.xml (i18n ES/EN inicial).
- Documentación avanzada (README arquitectura/entorno, diagramas, ADR breve).

## Cronograma de Hoy (aprox.)

1. 0h00–0h45: UI/UX
   - Implementar estados de carga (spinner), error con botón "Reintentar" y estado "Vacío" en Catálogo y Detalle.
   - Añadir Coil con `placeholder` y `error` + `crossfade`.

2. 0h45–1h20: Datos/APIs
   - Paginación del catálogo (page/page_size) con scroll o botones Siguiente/Anterior.
   - Manejo de errores HTTP (timeouts, 4xx/5xx) → mensajes claros.

3. 1h20–2h00: Pruebas
   - Unit tests: TokenManager (guardar/recuperar/borrar), AuthRepository (login ok/error), JwtAuthenticator (401 → refresh → retry; fallo refresh → limpieza).
   - Instrumentado: flujo login → catálogo → checkout; persistencia tras reinicio.

4. 2h00–2h30: Seguridad y Navegación
   - EncryptedSharedPreferences en build release; confirmar SharedPreferences simples en debug.
   - Logout limpiando back stack y tokens.

5. 2h30–3h00: Documentación y Accesibilidad
   - Mover textos a `strings.xml` y preparar `values-en/strings.xml` inicial.
   - Accesibilidad: `contentDescription` imágenes, targets ≥48dp, contraste.
   - README arquitectura y entorno; ADR corto de decisiones (auth y storage).

6. 3h00–3h30: Grabación del Video
   - Ejecutar guion de demo y capturar evidencias (UI y Logcat).

## Entregables por Criterio (qué mostrar en el video)

### 1) Planificación y Organización

- Mostrar el README de arquitectura (en `Medicitas-app/README.md` o raíz) con:
  - Árbol de rutas de navegación y dependencias (Retrofit, OkHttp, Hilt, Coil).
  - Guía de entorno (BASE_URL emulador `10.0.2.2`, físico `IP local`, HTTPS producción).
  - Pasos de prueba: botones "Probar sesión (me)" y "Forzar 401 y reintentar".
- Explicar ramas Git (main, develop, feature/*) y convenciones de commits.
- Mostrar diagramas simples (MVVM y secuencia refresh) y un ADR corto.

### 2) Arquitectura MVVM

- Catálogo y Detalle con ViewModel propio y `UIState` (Loading/Success/Error/Empty) usando StateFlow/LiveData.
- Repositorios para datos; ApiService y TokenManager inyectados por Hilt.
- Eventos de navegación desde ViewModel cuando corresponda.

### 3) Base de Datos/APIs

- Endpoints confirmados:
  - Login: `/api/users/auth/login/` (JSON con envelope { message, data }).
  - Me: `/api/users/me/`.
  - Productos: lista con paginación `page` y `page_size`.
- Mostrar en video: carga de primera página, avance a siguiente, manejo de error y vacío.

### 4) Servicios Externos

- Coil con `placeholder`, `error`, `crossfade` y cache.
- OkHttp + HttpLoggingInterceptor (solo debug) y JwtAuthenticator.
- Mostrar Logcat donde se ve el `Authorization: Bearer` y el refresh automático.

### 5) Diseño y Seguridad

- Tema Material 3 y controles con targets ≥48dp.
- EncryptedSharedPreferences en release (y justificar uso simple en debug).
- Logout elimina tokens y limpia back stack.

### 6) Funcionalidad General

- Demo completa: login → catálogo → carrito → checkout protegido.
- Persistencia de sesión tras reiniciar la app.
- i18n básico: textos movidos a `strings.xml` y una carpeta `values-en` con traducciones iniciales.
- Accesibilidad: `contentDescription` y revisión de contraste.

## Checklist de Implementación (rápido)

- [ ] Catalog/Detail: `UIState` Loading/Success/Error/Empty.
- [ ] Botón "Reintentar" cuando Error.
- [ ] Coil: `placeholder`, `error`, `crossfade` aplicado en imágenes.
- [ ] Paginación catálogo (page/page_size) con controles o scroll.
- [ ] Unit tests: TokenManager, AuthRepository, JwtAuthenticator.
- [ ] Instrumented test: login → checkout; persistencia post-reinicio.
- [ ] EncryptedSharedPreferences en release; logout limpia sesión y back stack.
- [ ] Textos a `strings.xml`; `values-en/strings.xml` inicial.
- [ ] Accesibilidad básica (48dp, contentDescription, contraste).
- [ ] README + diagramas + ADR.

## Guion del Video (secuencia sugerida)

1. Presentación breve: objetivos y criterios.
2. Planificación: enseñar README, ramas Git y ADR.
3. Arquitectura: explicar MVVM rápido con diagrama; mostrar ViewModel y `UIState` en catálogo.
4. APIs: login exitoso con Logcat; llamar `/api/users/me/` desde botón; mostrar paginación de productos.
5. Servicios externos: Logcat con `Authorization` y prueba de refresh forzado (401 → refresh → retry).
6. Diseño y seguridad: placeholders Coil visibles, tema Material, logout que limpia sesión; comentar EncryptedSharedPreferences en release.
7. Funcionalidad general: flujo login → catálogo → carrito → checkout; reinicio de app y persistencia.
8. Cierre: checklist marcado y conclusiones.

## Evidencias a Capturar

- Capturas/fragmentos de Logcat: login 200, `Authorization` presente, 401→refresh→retry.
- Pantallas: Loading, Error con Reintentar, Empty, imágenes con placeholder/error.
- Video del flujo completo y de la paginación.
- README y diagramas visibles en editor.

## Notas de Entorno

- Emulador Android: usar `http://10.0.2.2:8000/` como host.
- Dispositivo físico: usar IP local del servidor (misma red) y abrir firewall.
- Producción: usar HTTPS siempre; habilitar logs mínimos.

## Riesgos y Mitigación

- Fallos de build: ejecutar `./gradlew clean assembleDebug`.
- Errores de red: verificar backend en `0.0.0.0:8000` corriendo y ruta `/api/users/me/`.
- Imagen no carga: probar con placeholder y revisar `imageUrl` real en respuesta.
- Refresh falla: revisar `refresh_token` vigente y endpoint refresh; si falla, limpiar tokens y pedir login.

---

Este plan está optimizado para completar hoy los puntos clave de la rúbrica y grabar un video convincente con evidencias técnicas y visuales.