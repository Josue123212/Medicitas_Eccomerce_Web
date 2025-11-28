import json
import time
import logging
from datetime import datetime, timedelta
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import AuditLog

User = get_user_model()

audit_logger = logging.getLogger('audit')
action_logger = logging.getLogger('actions')


def get_rate_limit_settings():
    return getattr(settings, 'RATE_LIMIT_SETTINGS', {})


def get_audit_settings():
    return getattr(settings, 'AUDIT_SETTINGS', {})


def get_security_headers():
    return getattr(settings, 'SECURITY_HEADERS', {})


def get_middleware_logging_settings():
    return getattr(settings, 'MIDDLEWARE_LOGGING', {})


class RoleBasedLoggingMiddleware(MiddlewareMixin):
    LOGGED_ACTIONS = {
        'doctor': [
            '/api/appointments/',
            '/api/patients/',
            '/api/doctors/me/',
        ],
        'secretary': [
            '/api/appointments/',
            '/api/patients/',
            '/api/secretaries/',
        ],
        'admin': [
            '/api/admin/',
            '/api/users/',
            '/api/reports/',
        ],
        'superadmin': [
            '/api/admin/',
            '/api/users/',
            '/api/system/',
        ]
    }

    def process_request(self, request):
        request.start_time = time.time()
        request.audit_data = {
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'method': request.method,
            'path': request.path,
        }
        return None

    def process_response(self, request, response):
        audit_settings = get_audit_settings()

        if not audit_settings.get('ENABLED', True):
            return response

        if not hasattr(request, 'user') or not request.user.is_authenticated:
            if audit_settings.get('LOG_ANONYMOUS_USERS', True):
                self.create_audit_log(request, response)
            return response

        user_role = getattr(request.user, 'role', None)

        if request.method == 'GET' and not audit_settings.get('LOG_GET_REQUESTS', False):
            return response

        if self.should_log_action(request.path, user_role, audit_settings):
            self.create_audit_log(request, response)

        if user_role in ['admin', 'superadmin'] and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            self.create_admin_audit_log(request, response)

        return response

    def should_log_action(self, path, user_role, audit_settings):
        critical_resources = audit_settings.get('CRITICAL_RESOURCES', [])
        if any(resource in path for resource in critical_resources):
            return True

        if not user_role or user_role not in self.LOGGED_ACTIONS:
            return False

        logged_paths = self.LOGGED_ACTIONS[user_role]
        return any(path.startswith(logged_path) for logged_path in logged_paths)

    def create_audit_log(self, request, response):
        try:
            audit_settings = get_audit_settings()

            request_data = None
            if request.method in ['POST', 'PUT', 'PATCH'] and audit_settings.get('LOG_SENSITIVE_DATA', False):
                try:
                    if hasattr(request, 'body') and request.body:
                        request_data = json.loads(request.body.decode('utf-8'))
                        if isinstance(request_data, dict):
                            sensitive_fields = audit_settings.get('SENSITIVE_FIELDS', [])
                            for field in sensitive_fields:
                                request_data.pop(field, None)
                except (json.JSONDecodeError, UnicodeDecodeError):
                    request_data = {'error': 'Could not parse request data'}

            AuditLog.objects.create(
                user=request.user,
                action=self.get_action_name(request),
                resource=self.get_resource_name(request.path),
                resource_id=self.get_resource_id(request.path),
                method=request.method,
                path=request.path,
                ip_address=request.audit_data['ip_address'],
                user_agent=request.audit_data['user_agent'],
                request_data=request_data,
                response_status=response.status_code,
            )

            action_logger.info(
                f"User {request.user.username} ({request.user.role}) "
                f"performed {request.method} on {request.path} "
                f"from {request.audit_data['ip_address']} "
                f"- Status: {response.status_code}"
            )

        except Exception as e:
            audit_logger.error(f"Error creating audit log: {str(e)}")

    def create_admin_audit_log(self, request, response):
        try:
            audit_logger.warning(
                f"ADMIN ACTION: {request.user.username} ({request.user.role}) "
                f"performed {request.method} on {request.path} "
                f"from {request.audit_data['ip_address']} "
                f"- Status: {response.status_code} "
                f"- Time: {datetime.now().isoformat()}"
            )
        except Exception as e:
            audit_logger.error(f"Error creating admin audit log: {str(e)}")

    def get_action_name(self, request):
        method_actions = {
            'GET': 'view',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'partial_update',
            'DELETE': 'delete',
        }
        return method_actions.get(request.method, 'unknown')

    def get_resource_name(self, path):
        path_parts = path.strip('/').split('/')
        if len(path_parts) >= 2 and path_parts[0] == 'api':
            return path_parts[1]
        return 'unknown'

    def get_resource_id(self, path):
        path_parts = path.strip('/').split('/')
        for part in path_parts:
            if part.isdigit():
                return part
        return None

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class RoleBasedRateLimitMiddleware(MiddlewareMixin):
    EXEMPT_PATHS = [
        '/api/auth/login/',
        '/api/auth/refresh/',
        '/api/health/',
        '/admin/',
    ]

    def process_request(self, request):
        rate_limit_settings = get_rate_limit_settings()
        if not rate_limit_settings.get('ENABLED', True):
            return None

        exempt_paths = rate_limit_settings.get('EXEMPT_PATHS', self.EXEMPT_PATHS)
        if any(request.path.startswith(exempt) for exempt in exempt_paths):
            return None

        user_role = self.get_user_role(request)

        rate_limits = rate_limit_settings.get('RATE_LIMITS', {})
        rate_limit = rate_limits.get(user_role, rate_limits.get('anonymous', 20))

        cache_key = self.get_cache_key(request, user_role)

        if self.is_rate_limited(cache_key, rate_limit):
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'message': f'Too many requests. Limit: {rate_limit} per minute for role: {user_role}',
                'retry_after': 60
            }, status=429)

        return None

    def get_user_role(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            return getattr(request.user, 'role', 'client')
        return 'anonymous'

    def get_cache_key(self, request, user_role):
        if hasattr(request, 'user') and request.user.is_authenticated:
            identifier = f"user_{request.user.id}"
        else:
            identifier = f"ip_{self.get_client_ip(request)}"
        return f"rate_limit_{identifier}_{user_role}"

    def is_rate_limited(self, cache_key, rate_limit):
        current_time = int(time.time())
        window_start = current_time - 60
        requests = cache.get(cache_key, [])
        requests = [req_time for req_time in requests if req_time > window_start]
        if len(requests) >= rate_limit:
            return True
        requests.append(current_time)
        cache.set(cache_key, requests, 60)
        return False

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityHeadersMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        security_headers = getattr(settings, 'SECURITY_HEADERS', {})
        for header_name, header_value in security_headers.items():
            if header_value:
                response[header_name] = header_value
        return response

