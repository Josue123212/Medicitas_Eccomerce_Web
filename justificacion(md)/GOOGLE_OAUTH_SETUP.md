# 🔐 Configuración de Google OAuth - Sistema de Citas Médicas

## 📋 Resumen de la Implementación

✅ **Backend configurado** - Endpoint `/api/users/auth/google/` funcional
✅ **Frontend configurado** - Componente `GoogleAuthButton` integrado
✅ **Variables de entorno** - Configuradas en ambos proyectos
⚠️ **Pendiente** - Configurar credenciales reales de Google Cloud Console

## 🚀 Configuración de Google Cloud Console

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** y **Google Identity API**

### 2. Configurar OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Clic en **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Configura la pantalla de consentimiento OAuth:
   - **Application type**: Web application
   - **Name**: Sistema Citas Médicas
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5173
     http://localhost:3000
     ```

### 3. Obtener Credenciales

Después de crear el cliente OAuth, obtendrás:
- **Client ID**: `your-client-id.apps.googleusercontent.com`
- **Client Secret**: `your-client-secret`

## 🔧 Configuración de Variables de Entorno

### Backend (.env)
```env
# Google OAuth Configuration
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret-here
```

### Frontend (.env)
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## 🧪 Cómo Probar la Integración

### 1. Verificar Servidores
```bash
# Backend (Terminal 1)
cd backend
python manage.py runserver
# Debe estar en http://127.0.0.1:8000/

# Frontend (Terminal 2)
cd frontend
npm run dev
# Debe estar en http://localhost:5173/
```

### 2. Probar Registro con Google
1. Ve a http://localhost:5173/register
2. Busca el botón "Continuar con Google"
3. Clic en el botón (aparecerá popup de Google)
4. Selecciona tu cuenta de Google
5. Autoriza la aplicación

### 3. Verificar Flujo Completo
- ✅ Popup de Google se abre
- ✅ Usuario autoriza la aplicación
- ✅ Token se envía al backend
- ✅ Usuario se registra/autentica
- ✅ Redirección al dashboard
- ✅ Toast de éxito

## 🔍 Debugging y Solución de Problemas

### Errores Comunes

#### 1. "Error 400: redirect_uri_mismatch"
**Solución**: Verificar que las URIs en Google Cloud Console coincidan exactamente:
```
http://localhost:5173
```

#### 2. "Invalid client ID"
**Solución**: Verificar que el Client ID en `.env` sea correcto y coincida con Google Cloud Console.

#### 3. "CORS Error"
**Solución**: Verificar configuración CORS en Django settings:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Logs Útiles

#### Backend
```bash
# Ver logs del servidor Django
python manage.py runserver --verbosity=2
```

#### Frontend
```bash
# Ver logs en consola del navegador
# F12 > Console
```

## 📁 Archivos Modificados

### Backend
- `apps/users/oauth_views.py` - Vista para manejar autenticación Google
- `apps/users/urls.py` - URL del endpoint OAuth
- `config/settings/base.py` - Configuración OAuth
- `requirements/base.txt` - Dependencia google-auth
- `.env` - Variables de entorno

### Frontend
- `src/components/auth/GoogleAuthButton.tsx` - Componente del botón
- `src/services/authService.ts` - Servicio para llamar API
- `src/pages/RegisterPage.tsx` - Integración del botón
- `src/pages/LoginPage.tsx` - Integración del botón
- `.env` - Variables de entorno

## 🎯 Próximos Pasos

1. **Configurar credenciales reales** en Google Cloud Console
2. **Probar en producción** con dominio real
3. **Implementar logout** con Google
4. **Agregar manejo de errores** más específicos
5. **Implementar refresh tokens** para sesiones largas

## 🔒 Consideraciones de Seguridad

- ✅ Tokens JWT seguros con expiración
- ✅ Validación de tokens Google en backend
- ✅ Variables de entorno para credenciales
- ✅ CORS configurado correctamente
- ⚠️ **Importante**: Nunca commitear credenciales reales al repositorio

## 📞 Soporte

Si encuentras problemas:
1. Verifica que ambos servidores estén corriendo
2. Revisa los logs en consola del navegador
3. Verifica las variables de entorno
4. Confirma la configuración en Google Cloud Console

---

**Estado**: ✅ Implementación completa - Listo para configurar credenciales reales
**Última actualización**: Septiembre 2025