# 🔐 Plan de Recuperación de Contraseña

## 📋 Resumen Ejecutivo

Este documento detalla la implementación completa del sistema de recuperación de contraseña para el Sistema de Citas Médicas, incluyendo flujo de trabajo, aspectos técnicos, seguridad y experiencia de usuario.

---

## 🎯 Objetivos

### Principales
- ✅ Permitir a usuarios recuperar acceso a sus cuentas de forma segura
- ✅ Implementar flujo de verificación por email
- ✅ Garantizar seguridad mediante tokens temporales
- ✅ Proporcionar UX intuitiva y accesible

### Secundarios
- 🔒 Prevenir ataques de fuerza bruta
- 📧 Integrar con sistema de notificaciones por email
- 📱 Diseño responsive para todos los dispositivos
- ♿ Cumplir estándares de accesibilidad

---

## 🔄 Flujo de Trabajo

### 1. Solicitud de Recuperación
```
Usuario → Página Login → "¿Olvidaste tu contraseña?" → Formulario Email
```

### 2. Validación y Envío
```
Email → Validación Backend → Generación Token → Envío Email → Confirmación
```

### 3. Verificación y Reset
```
Email Recibido → Click Link → Validación Token → Formulario Nueva Contraseña → Confirmación
```

### 4. Finalización
```
Contraseña Actualizada → Notificación → Redirección Login → Acceso Normal
```

---

## 🏗️ Arquitectura Técnica

### Backend (Django)

#### Modelos
```python
# apps/users/models.py
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
```

#### Endpoints API
```python
# apps/users/urls.py
POST /api/auth/password-reset/request/     # Solicitar reset
POST /api/auth/password-reset/verify/      # Verificar token
POST /api/auth/password-reset/confirm/     # Confirmar nueva contraseña
GET  /api/auth/password-reset/validate/    # Validar token (opcional)
```

#### Servicios
```python
# apps/users/services.py
class PasswordResetService:
    def request_reset(email: str) -> bool
    def verify_token(token: str) -> bool
    def reset_password(token: str, new_password: str) -> bool
    def cleanup_expired_tokens() -> int
```

### Frontend (React)

#### Páginas
```typescript
// src/pages/auth/
ForgotPasswordPage.tsx     # Solicitar reset
ResetPasswordPage.tsx      # Formulario nueva contraseña
ResetSuccessPage.tsx       # Confirmación exitosa
```

#### Componentes
```typescript
// src/components/auth/
ForgotPasswordForm.tsx     # Formulario email
ResetPasswordForm.tsx      # Formulario nueva contraseña
PasswordStrengthMeter.tsx  # Indicador fortaleza
```

#### Servicios
```typescript
// src/services/authService.ts
export const authService = {
  requestPasswordReset: (email: string) => Promise<void>,
  verifyResetToken: (token: string) => Promise<boolean>,
  resetPassword: (token: string, password: string) => Promise<void>
}
```

---

## 🔒 Seguridad

### Tokens
- **Generación**: UUID4 + timestamp + hash
- **Expiración**: 1 hora (configurable)
- **Uso único**: Token se invalida después del uso
- **Limpieza**: Tarea automática cada 24h

### Validaciones
- **Rate Limiting**: Máximo 3 intentos por IP/hora
- **Email Verification**: Solo usuarios registrados
- **Password Strength**: Mínimo 8 caracteres, mayúsculas, números
- **CSRF Protection**: Tokens CSRF en formularios

### Logs de Seguridad
```python
# Eventos a registrar
- Solicitud de reset (email, IP, timestamp)
- Token generado (user_id, token_hash, expires)
- Token usado (user_id, IP, success/failure)
- Intentos fallidos (IP, email, timestamp)
```

---

## 📧 Sistema de Emails

### Template de Email
```html
<!-- templates/emails/password_reset.html -->
<div style="font-family: Inter, sans-serif; max-width: 600px;">
  <h2 style="color: #00CED1;">Recuperación de Contraseña</h2>
  <p>Hola {{ user.first_name }},</p>
  <p>Recibimos una solicitud para restablecer tu contraseña.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ reset_url }}" 
       style="background: #00CED1; color: white; padding: 12px 24px; 
              text-decoration: none; border-radius: 6px;">
      Restablecer Contraseña
    </a>
  </div>
  
  <p><small>Este enlace expira en 1 hora.</small></p>
  <p><small>Si no solicitaste esto, ignora este email.</small></p>
</div>
```

### Configuración SMTP
```python
# config/settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # O servicio preferido
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'Sistema de Citas <noreply@medicitas.com>'
```

---

## 🎨 Diseño UX/UI

### Página "Olvidé mi Contraseña"
```typescript
// Elementos clave
- Input email con validación en tiempo real
- Botón "Enviar enlace de recuperación"
- Link "Volver al login"
- Mensaje de estado (loading, success, error)
- Diseño consistente con login/register
```

### Página "Nueva Contraseña"
```typescript
// Elementos clave
- Input nueva contraseña con toggle visibilidad
- Input confirmar contraseña
- Medidor de fortaleza de contraseña
- Botón "Actualizar contraseña"
- Validación en tiempo real
```

### Estados y Mensajes
```typescript
// Estados del flujo
IDLE: "Ingresa tu email para recuperar tu contraseña"
LOADING: "Enviando enlace de recuperación..."
SUCCESS: "¡Enlace enviado! Revisa tu email"
ERROR: "Email no encontrado o error del servidor"
EXPIRED: "El enlace ha expirado. Solicita uno nuevo"
INVALID: "Enlace inválido o ya usado"
```

---

## 🚀 Plan de Implementación

### Fase 1: Backend (2-3 días)
- [ ] Crear modelo `PasswordResetToken`
- [ ] Implementar endpoints API
- [ ] Configurar sistema de emails
- [ ] Crear templates de email
- [ ] Implementar validaciones de seguridad
- [ ] Escribir tests unitarios

### Fase 2: Frontend (2-3 días)
- [ ] Crear páginas de recuperación
- [ ] Implementar formularios con validación
- [ ] Integrar con API backend
- [ ] Diseñar componentes UI
- [ ] Implementar manejo de estados
- [ ] Agregar tests de componentes

### Fase 3: Integración (1 día)
- [ ] Pruebas end-to-end
- [ ] Verificar flujo completo
- [ ] Optimizar UX
- [ ] Documentar API

### Fase 4: Despliegue (1 día)
- [ ] Configurar variables de entorno
- [ ] Configurar servicio SMTP
- [ ] Desplegar en staging
- [ ] Pruebas en producción
- [ ] Monitoreo y logs

---

## 🧪 Testing

### Backend Tests
```python
# tests/test_password_reset.py
class PasswordResetTests(TestCase):
    def test_request_reset_valid_email()
    def test_request_reset_invalid_email()
    def test_token_expiration()
    def test_token_single_use()
    def test_rate_limiting()
    def test_password_validation()
```

### Frontend Tests
```typescript
// tests/auth/ForgotPassword.test.tsx
describe('ForgotPasswordPage', () => {
  test('renders form correctly')
  test('validates email format')
  test('shows success message')
  test('handles API errors')
  test('redirects after success')
})
```

---

## 📊 Métricas y Monitoreo

### KPIs
- **Tasa de éxito**: % de resets completados exitosamente
- **Tiempo de respuesta**: Tiempo promedio del flujo completo
- **Abandono**: % de usuarios que no completan el proceso
- **Errores**: Frecuencia de errores por tipo

### Alertas
- Picos inusuales de solicitudes de reset
- Fallos en envío de emails
- Tokens expirados sin usar (alta tasa)
- Errores de validación frecuentes

---

## 🔧 Configuración

### Variables de Entorno
```bash
# .env
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
PASSWORD_RESET_TIMEOUT=3600  # 1 hora en segundos
PASSWORD_RESET_RATE_LIMIT=3  # Máximo por hora
FRONTEND_URL=http://localhost:5173
```

### Configuración Django
```python
# config/settings.py
PASSWORD_RESET_SETTINGS = {
    'TOKEN_EXPIRY_HOURS': 1,
    'MAX_ATTEMPTS_PER_HOUR': 3,
    'CLEANUP_INTERVAL_HOURS': 24,
    'EMAIL_TEMPLATE': 'emails/password_reset.html',
    'SUCCESS_REDIRECT': '/login?reset=success'
}
```

---

## 📚 Recursos y Referencias

### Documentación
- [Django Password Reset](https://docs.djangoproject.com/en/4.2/topics/auth/default/#django.contrib.auth.views.PasswordResetView)
- [React Hook Form](https://react-hook-form.com/)
- [OWASP Password Reset](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

### Librerías Recomendadas
```json
// Frontend
{
  "react-hook-form": "^7.45.0",
  "zod": "^3.21.0",
  "react-hot-toast": "^2.4.0"
}
```

```python
# Backend
django-ratelimit==4.0.0
django-cors-headers==4.0.0
celery==5.3.0  # Para tareas asíncronas
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Modelo PasswordResetToken creado
- [ ] Endpoints API implementados
- [ ] Sistema de emails configurado
- [ ] Validaciones de seguridad
- [ ] Rate limiting implementado
- [ ] Tests escritos y pasando
- [ ] Documentación API actualizada

### Frontend
- [ ] Páginas de recuperación creadas
- [ ] Formularios con validación
- [ ] Integración con API
- [ ] Manejo de estados y errores
- [ ] Diseño responsive
- [ ] Tests de componentes
- [ ] Accesibilidad verificada

### Integración
- [ ] Flujo end-to-end funcionando
- [ ] Variables de entorno configuradas
- [ ] Emails enviándose correctamente
- [ ] Logs y monitoreo activos
- [ ] Documentación completa

---

**📅 Fecha de creación**: $(date)
**👨‍💻 Responsable**: Equipo de Desarrollo
**🔄 Última actualización**: Pendiente de implementación

---

> 💡 **Nota**: Este documento debe actualizarse durante la implementación con detalles específicos y lecciones aprendidas.