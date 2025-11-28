# 🔐 Demo: Sistema de Recuperación de Contraseña

## 🎯 Objetivo
Demostrar el funcionamiento completo del sistema de recuperación de contraseña implementado.

## 🏗️ Arquitectura Implementada

### Backend (Django + DRF)
- ✅ **Endpoints API**: 3 endpoints para el flujo completo
- ✅ **Modelos**: `PasswordResetToken` con expiración y seguridad
- ✅ **Serializers**: Validaciones con Zod-like en Django
- ✅ **Templates**: Emails HTML profesionales + texto plano
- ✅ **Configuración**: Sistema de emails configurado

### Frontend (React + TypeScript)
- ✅ **ForgotPasswordPage**: Formulario con React Hook Form + Zod
- ✅ **ResetPasswordPage**: Verificación de token y cambio seguro
- ✅ **Rutas**: Integradas en el router principal
- ✅ **UI/UX**: Diseño profesional con Tailwind CSS

## 🚀 Cómo Probar el Sistema

### 1. Servidores Activos
```bash
# Backend (Puerto 8000)
cd backend
python manage.py runserver

# Frontend (Puerto 5173)
cd frontend
npm run dev
```

### 2. Flujo de Prueba

#### Paso 1: Solicitar Recuperación
1. Ir a: `http://localhost:5173/login`
2. Hacer clic en "¿Olvidaste tu contraseña? Recupérala aquí"
3. Ingresar email: `test@example.com`
4. Hacer clic en "Enviar enlace de recuperación"

#### Paso 2: Verificar Email (Consola)
- El email se muestra en la consola del backend
- Copiar el token del enlace generado

#### Paso 3: Restablecer Contraseña
1. Ir a: `http://localhost:5173/reset-password?token=TOKEN_COPIADO`
2. Ingresar nueva contraseña (mínimo 8 caracteres, mayúscula, minúscula, número)
3. Confirmar contraseña
4. Hacer clic en "Restablecer contraseña"

#### Paso 4: Verificar Cambio
1. Ir a: `http://localhost:5173/login`
2. Intentar login con la nueva contraseña

## 📧 Endpoints API

### 1. Solicitar Recuperación
```http
POST /api/users/auth/password-reset/request/
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Respuesta:**
```json
{
  "message": "Si el email existe, recibirás un enlace de recuperación.",
  "email_sent": true
}
```

### 2. Verificar Token
```http
POST /api/users/auth/password-reset/verify/
Content-Type: application/json

{
  "token": "52011e8eacac4d7872c9e9c8ce3f8b7d75a531cbae557b936e82bd947d009a62"
}
```

**Respuesta:**
```json
{
  "valid": true,
  "message": "Token válido",
  "user_email": "test@example.com"
}
```

### 3. Confirmar Nueva Contraseña
```http
POST /api/users/auth/password-reset/confirm/
Content-Type: application/json

{
  "token": "52011e8eacac4d7872c9e9c8ce3f8b7d75a531cbae557b936e82bd947d009a62",
  "password": "NuevaPassword123"
}
```

**Respuesta:**
```json
{
  "message": "Contraseña restablecida correctamente",
  "success": true
}
```

## 🛡️ Características de Seguridad

### Backend
- **Tokens únicos**: SHA-256 con 64 caracteres
- **Expiración**: 24 horas automática
- **Un solo uso**: Token se marca como usado
- **Rate limiting**: Prevención de spam
- **Validaciones**: Email, contraseña segura
- **Logs de seguridad**: IP y User Agent

### Frontend
- **Validaciones en tiempo real**: Zod + React Hook Form
- **Indicador de fortaleza**: Contraseña visual
- **Estados de carga**: UX mejorada
- **Manejo de errores**: Mensajes claros
- **Redirecciones automáticas**: Flujo guiado

## 📱 Características UX

### ForgotPasswordPage
- ✅ Formulario simple y claro
- ✅ Validación de email en tiempo real
- ✅ Estado de confirmación visual
- ✅ Enlaces de navegación
- ✅ Indicadores de carga

### ResetPasswordPage
- ✅ Verificación automática de token
- ✅ Indicador de fortaleza de contraseña
- ✅ Confirmación de contraseña
- ✅ Manejo de tokens inválidos/expirados
- ✅ Redirección automática al éxito

## 🎨 Tecnologías Utilizadas

### Backend
- **Django 5.1**: Framework principal
- **Django REST Framework**: API REST
- **Django Email**: Sistema de emails
- **Secrets**: Generación segura de tokens

### Frontend
- **React 19**: Framework de UI
- **TypeScript**: Tipado estático
- **React Hook Form**: Manejo de formularios
- **Zod**: Validaciones de esquemas
- **Tailwind CSS**: Estilos utilitarios
- **Heroicons**: Iconografía
- **React Hot Toast**: Notificaciones

## 🔧 Configuración de Producción

### Variables de Entorno
```env
# Backend
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
FRONTEND_URL=https://tu-dominio.com

# Frontend
VITE_API_URL=https://api.tu-dominio.com
```

### Consideraciones de Seguridad
- Usar HTTPS en producción
- Configurar CORS correctamente
- Implementar rate limiting
- Monitorear intentos de recuperación
- Logs de seguridad

## ✅ Estado del Proyecto

- [x] **Endpoints API**: Implementados y probados
- [x] **Sistema de Emails**: Configurado con templates
- [x] **Páginas Frontend**: Implementadas con validaciones
- [x] **Integración**: Frontend-Backend conectado
- [x] **Pruebas**: Flujo completo verificado
- [x] **Documentación**: Completa y actualizada

## 🚀 Próximos Pasos

1. **Testing Automatizado**: Unit tests y E2E tests
2. **Rate Limiting**: Implementar en producción
3. **Monitoreo**: Logs y métricas de seguridad
4. **Optimizaciones**: Performance y UX
5. **Internacionalización**: Múltiples idiomas

---

**¡Sistema de recuperación de contraseña completamente funcional!** 🎉