# 🔗 Conexión Frontend React - Backend Django

## 📋 Objetivo de la Primera Conexión

Este documento detalla el proceso de conexión inicial entre el frontend React y el backend Django DRF para identificar y resolver errores de integración.

## 🎯 Qué Esperamos Obtener

### ✅ Resultados Esperados (Éxito)
- Conexión exitosa entre React y Django
- Autenticación funcional (login/register)
- Tokens JWT funcionando correctamente
- Redirecciones automáticas funcionando
- Dashboard cargando datos del usuario

### ⚠️ Errores Comunes Esperados

#### 1. **Errores de CORS**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/auth/login/' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solución**: Configurar CORS en Django settings

#### 2. **Errores de URL/Endpoints**
```
404 Not Found - /api/auth/login/
```
**Solución**: Verificar URLs en Django y React

#### 3. **Errores de Formato de Datos**
```
400 Bad Request - Invalid JSON format
```
**Solución**: Verificar estructura de datos enviados

#### 4. **Errores de Autenticación**
```
401 Unauthorized - Invalid credentials
```
**Solución**: Verificar configuración JWT en Django

## 🔧 Proceso de Conexión

### Paso 1: Verificar Backend Django

#### 1.1 Comprobar que Django esté ejecutándose
```bash
cd backend
python manage.py runserver
```
**URL esperada**: `http://localhost:8000`

#### 1.2 Verificar endpoints de autenticación
- `GET http://localhost:8000/api/auth/` - Lista de endpoints
- `POST http://localhost:8000/api/auth/login/` - Login
- `POST http://localhost:8000/api/auth/register/` - Registro
- `POST http://localhost:8000/api/auth/logout/` - Logout
- `GET http://localhost:8000/api/auth/profile/` - Perfil usuario

### Paso 2: Actualizar URLs en React

#### 2.1 Verificar configuración en `authService.ts`
```typescript
// Verificar que la URL base sea correcta
const API_URL = 'http://localhost:8000/api/auth';
```

#### 2.2 Endpoints que deben coincidir
- Login: `/api/auth/login/`
- Register: `/api/auth/register/`
- Logout: `/api/auth/logout/`
- Profile: `/api/auth/profile/`
- Refresh: `/api/auth/refresh/`

### Paso 3: Probar Conexión Básica

#### 3.1 Test de conectividad
1. Abrir DevTools en el navegador
2. Ir a Network tab
3. Intentar hacer login desde React
4. Observar las peticiones HTTP

#### 3.2 Verificar Headers
```javascript
// Headers esperados en las peticiones
Content-Type: application/json
Authorization: Bearer <token> // Para peticiones autenticadas
```

### Paso 4: Debugging Paso a Paso

#### 4.1 Verificar Datos Enviados
```javascript
// En authService.ts, agregar logs temporales
console.log('Datos enviados:', { email, password });
console.log('URL completa:', `${API_URL}/login/`);
```

#### 4.2 Verificar Respuestas del Servidor
```javascript
// Verificar estructura de respuesta
console.log('Respuesta del servidor:', response.data);
```

## 🧪 Plan de Pruebas

### Prueba 1: Registro de Usuario
1. Ir a `/register`
2. Llenar formulario con datos válidos
3. Enviar formulario
4. **Resultado esperado**: Redirección a dashboard
5. **Errores posibles**: CORS, 404, validación

### Prueba 2: Login de Usuario
1. Ir a `/login`
2. Usar credenciales del usuario registrado
3. Enviar formulario
4. **Resultado esperado**: Redirección a dashboard
5. **Errores posibles**: 401, token inválido

### Prueba 3: Persistencia de Sesión
1. Hacer login exitoso
2. Recargar la página
3. **Resultado esperado**: Mantener sesión activa
4. **Errores posibles**: Token no persistido

### Prueba 4: Logout
1. Desde dashboard, hacer logout
2. **Resultado esperado**: Redirección a home
3. **Errores posibles**: Token no eliminado

## 📊 Checklist de Verificación

### Backend Django
- [ ] Servidor ejecutándose en puerto 8000
- [ ] CORS configurado para localhost:5173
- [ ] URLs de autenticación funcionando
- [ ] JWT configurado correctamente
- [ ] Base de datos migrada

### Frontend React
- [ ] Servidor ejecutándose en puerto 5173
- [ ] URLs de API actualizadas
- [ ] AuthContext funcionando
- [ ] Formularios con validación
- [ ] Rutas protegidas configuradas

### Integración
- [ ] Peticiones HTTP llegando al backend
- [ ] Respuestas JSON válidas
- [ ] Tokens JWT funcionando
- [ ] Redirecciones automáticas
- [ ] Manejo de errores

## 🚀 Próximos Pasos Después de la Conexión

1. **Optimizar manejo de errores**
2. **Implementar refresh automático de tokens**
3. **Agregar loading states**
4. **Implementar notificaciones de éxito/error**
5. **Conectar módulos adicionales (citas, doctores, etc.)**

## 📝 Notas Importantes

- **Mantener DevTools abierto** durante las pruebas
- **Revisar tanto Console como Network tabs**
- **Documentar cada error encontrado**
- **Probar en modo incógnito** para evitar cache
- **Verificar que ambos servidores estén ejecutándose**

---

**Fecha de creación**: 03/09/2025
**Estado**: ✅ Servidores ejecutándose - Iniciando pruebas de conexión
**Próxima actualización**: Después de las primeras pruebas

## 📊 Estado Actual de la Conexión

### ✅ Verificaciones Completadas
- [x] Backend Django ejecutándose en http://127.0.0.1:8000/
- [x] Frontend React ejecutándose en http://localhost:5173/
- [x] URLs de API correctamente configuradas en api.ts
- [x] Endpoints de autenticación corregidos en authService.ts
- [x] Formulario de registro funcionando con validaciones
- [x] Formulario de login funcionando con validaciones
- [x] React Hook Form + Zod integrados correctamente
- [x] Esquemas de validación configurados y funcionando
- [x] Imports y componentes corregidos

### 🔧 Correcciones Realizadas
1. **URLs de API**: Corregidas de `/auth/` a `/users/auth/` para coincidir con Django
2. **Campos de formulario**: Cambiados de `firstName/lastName` a `first_name/last_name`
3. **Hook de validación**: Corregida la llamada para pasar el schema como objeto
4. **Imports**: Corregidos los paths de importación de validaciones
5. **LoginPage**: Agregado CardTitle import y corregido schema con rememberMe
6. **Validaciones**: Esquemas de login y registro completamente funcionales

### 🧪 Pruebas Pendientes
- [ ] Prueba 1: Flujo completo de autenticación (Registro → Login → Dashboard → Logout)
- [ ] Prueba 2: Verificación de endpoints y respuestas de API
- [ ] Prueba 3: Persistencia de sesión y tokens
- [ ] Prueba 4: Manejo de errores en casos de fallo

### 🔍 Próximo Paso
Probar el flujo completo de autenticación para verificar la integración end-to-end