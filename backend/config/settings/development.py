"""Development settings for config project."""

from .base import *
from decouple import config

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-t#fkef&44+2d-y257r4n@v8)06!=@&ol7&rag@5+$rc#pd)#z=')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    # Incluir 10.0.2.2 para permitir accesos desde el emulador de Android a la máquina host
    default='localhost,127.0.0.1,10.0.2.2,0.0.0.0',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Development-specific settings
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# Static files configuration for development
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (development)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Email backend for development (console) - COMENTADO para usar Gmail SMTP
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.EmailOrUsernameModelBackend',
    'django.contrib.auth.backends.ModelBackend',  # Fallback
]

# CSRF Configuration for development
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# CSRF Cookie settings for development
CSRF_COOKIE_HTTPONLY = False  # Permitir acceso desde JavaScript
CSRF_COOKIE_SAMESITE = 'Lax'  # Permitir cookies cross-site
CSRF_COOKIE_SECURE = False    # HTTP para desarrollo
CSRF_USE_SESSIONS = False     # No usar sesiones para CSRF

# Logging configuration for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}