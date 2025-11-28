import logging
from datetime import datetime
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.contrib.sessions.models import Session

User = get_user_model()
logger = logging.getLogger('audit')


class AuditLogger:
    """
    Clase para centralizar el logging de auditoría del sistema.
    """
    
    @staticmethod
    def log_action(action, user, model_name=None, object_id=None, details=None):
        """
        Método centralizado para registrar acciones de auditoría.
        """
        timestamp = datetime.now().isoformat()
        user_info = f"{user.username} ({user.email})" if user and user.is_authenticated else "Usuario anónimo"
        
        log_message = f"[{timestamp}] {action} - Usuario: {user_info}"
        
        if model_name:
            log_message += f" - Modelo: {model_name}"
        if object_id:
            log_message += f" - ID: {object_id}"
        if details:
            log_message += f" - Detalles: {details}"
            
        logger.info(log_message)


# Hooks para autenticación
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """
    Hook para registrar inicios de sesión exitosos.
    """
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', 'Desconocido')
    
    AuditLogger.log_action(
        action="LOGIN_SUCCESS",
        user=user,
        details=f"IP: {ip_address}, User-Agent: {user_agent[:100]}"
    )


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """
    Hook para registrar cierres de sesión.
    """
    if user:
        ip_address = get_client_ip(request)
        AuditLogger.log_action(
            action="LOGOUT",
            user=user,
            details=f"IP: {ip_address}"
        )


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """
    Hook para registrar intentos de inicio de sesión fallidos.
    """
    ip_address = get_client_ip(request)
    username = credentials.get('username', 'Desconocido')
    
    AuditLogger.log_action(
        action="LOGIN_FAILED",
        user=None,
        details=f"Username: {username}, IP: {ip_address}"
    )


# Hooks para modelos críticos
@receiver(post_save, sender=User)
def log_user_changes(sender, instance, created, **kwargs):
    """
    Hook para registrar cambios en usuarios.
    """
    action = "USER_CREATED" if created else "USER_UPDATED"
    
    details = f"Role: {instance.role}, Email: {instance.email}"
    if not created:
        # Para actualizaciones, podríamos agregar más detalles sobre qué cambió
        details += ", Active: " + str(instance.is_active)
    
    AuditLogger.log_action(
        action=action,
        user=instance,
        model_name="User",
        object_id=instance.id,
        details=details
    )


@receiver(post_delete, sender=User)
def log_user_deletion(sender, instance, **kwargs):
    """
    Hook para registrar eliminación de usuarios.
    """
    AuditLogger.log_action(
        action="USER_DELETED",
        user=None,  # El usuario ya no existe
        model_name="User",
        object_id=instance.id,
        details=f"Username: {instance.username}, Email: {instance.email}"
    )


# Hook para registrar acciones administrativas
def log_admin_action(user, action, model_name, object_id, details=None):
    """
    Función helper para registrar acciones administrativas.
    Debe ser llamada manualmente desde las vistas.
    """
    AuditLogger.log_action(
        action=f"ADMIN_{action}",
        user=user,
        model_name=model_name,
        object_id=object_id,
        details=details
    )


# Hook para registrar acciones de API
def log_api_action(user, action, endpoint, method, status_code, details=None):
    """
    Función helper para registrar acciones de API.
    Debe ser llamada desde middleware o vistas.
    """
    AuditLogger.log_action(
        action=f"API_{action}",
        user=user,
        details=f"Endpoint: {endpoint}, Method: {method}, Status: {status_code}, {details or ''}"
    )


# Función helper para obtener IP del cliente
def get_client_ip(request):
    """
    Obtiene la dirección IP real del cliente.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


# Middleware personalizado para logging de requests (opcional)
class AuditMiddleware:
    """
    Middleware para registrar todas las requests importantes.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Endpoints que queremos monitorear
        self.monitored_endpoints = [
            '/api/appointments/',
            '/api/patients/',
            '/api/doctors/',
            '/api/users/'
        ]
    
    def __call__(self, request):
        # Procesar request
        response = self.get_response(request)
        
        # Registrar si es un endpoint monitoreado
        if any(request.path.startswith(endpoint) for endpoint in self.monitored_endpoints):
            if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
                log_api_action(
                    user=request.user if request.user.is_authenticated else None,
                    action=request.method,
                    endpoint=request.path,
                    method=request.method,
                    status_code=response.status_code
                )
        
        return response