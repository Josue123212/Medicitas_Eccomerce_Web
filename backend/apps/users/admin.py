from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.db import models
from django.forms import Textarea
from django.urls import path, reverse
from django.shortcuts import redirect
from django.http import HttpResponseRedirect

from .models import User, SecretaryProfile
from .forms import DynamicUserCreationForm, DynamicUserChangeForm
from .admin_views import CustomUserAdmin


class CustomUserAdmin(BaseUserAdmin):
    """
    Configuración del admin para el modelo User personalizado con sistema de selección de tipo.
    Redirige a un selector de tipo de usuario antes de mostrar el formulario específico.
    """
    
    # Formularios personalizados (para edición)
    form = DynamicUserChangeForm
    
    # Campos mostrados en la lista de usuarios
    list_display = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'role', 
        'is_active', 
        'is_staff',
        'date_joined'
    )
    
    # Filtros laterales
    list_filter = (
        'role', 
        'is_staff', 
        'is_superuser', 
        'is_active', 
        'date_joined',
        'last_login'
    )
    
    # Campos de búsqueda
    search_fields = ('username', 'first_name', 'last_name', 'email')
    
    # Ordenamiento por defecto
    ordering = ('username',)
    
    # Configuración de campos para el formulario de edición
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        (_('Información Personal'), {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'address')
        }),
        (_('Rol y Permisos'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Fechas Importantes'), {
            'fields': ('last_login', 'date_joined'),
        }),
    )
    
    # Campos de solo lectura
    readonly_fields = ('date_joined', 'last_login')
    
    # Configuración de campos de selección múltiple
    filter_horizontal = ('groups', 'user_permissions')
    
    def get_urls(self):
        """Agregar URLs personalizadas para el selector de tipo de usuario"""
        urls = super().get_urls()
        custom_urls = [
            path('select-type/', self.admin_site.admin_view(self.user_type_selection_view), name='users_user_select_type'),
            path('create/<str:user_type>/', self.admin_site.admin_view(self.create_user_by_type_view), name='users_user_create_by_type'),
        ]
        return custom_urls + urls
    
    def user_type_selection_view(self, request):
        """Vista para seleccionar el tipo de usuario"""
        from .admin_views import UserTypeSelectionView
        view = UserTypeSelectionView.as_view()
        return view(request)
    
    def create_user_by_type_view(self, request, user_type):
        """Vista para crear usuario por tipo específico"""
        from .admin_views import create_user_by_type
        return create_user_by_type(request, user_type)
    
    def add_view(self, request, form_url='', extra_context=None):
        """Redirigir a la vista de selección de tipo de usuario"""
        return HttpResponseRedirect(reverse('admin:users_user_select_type'))
    
    def changelist_view(self, request, extra_context=None):
        """Personalizar la vista de lista para incluir botón de selección de tipo"""
        extra_context = extra_context or {}
        extra_context['show_add_link'] = True
        extra_context['add_url'] = reverse('admin:users_user_select_type')
        return super().changelist_view(request, extra_context)
    
    def get_queryset(self, request):
        """Optimizar consultas con select_related para roles relacionados"""
        return super().get_queryset(request).select_related('secretary_profile', 'patient_profile', 'doctor')
    
    def get_readonly_fields(self, request, obj=None):
        """
        Hacer que ciertos campos sean de solo lectura según el contexto
        """
        readonly = list(self.readonly_fields)
        
        # Si es un superusuario editando, permitir cambiar is_superuser
        if not request.user.is_superuser:
            readonly.append('is_superuser')
            
        return readonly

# Registrar el modelo User con la configuración personalizada
admin.site.register(User, CustomUserAdmin)
