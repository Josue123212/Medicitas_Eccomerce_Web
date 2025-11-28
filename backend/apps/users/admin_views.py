"""
Vistas personalizadas para el admin de usuarios con selector de tipo.
"""

from django.contrib import admin
from django.contrib.admin.views.main import ChangeList
from django.shortcuts import render, redirect
from django.urls import path, reverse
from django.utils.html import format_html
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.http import HttpResponseRedirect

from .models import User
from .forms import DoctorCreationForm, PatientCreationForm, SecretaryCreationForm, AdminCreationForm


class UserTypeSelectionView(TemplateView):
    """
    Vista para seleccionar el tipo de usuario antes de crear.
    """
    template_name = 'admin/users/user_type_selection.html'
    
    @method_decorator(staff_member_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'title': 'Seleccionar Tipo de Usuario',
            'opts': User._meta,
            'has_view_permission': True,
            'has_add_permission': True,
            'user_types': [
                {
                    'value': 'doctor',
                    'label': 'Doctor',
                    'description': 'Profesional médico que puede atender pacientes',
                    'icon': '👨‍⚕️'
                },
                {
                    'value': 'client',
                    'label': 'Paciente',
                    'description': 'Usuario que puede agendar citas médicas',
                    'icon': '🧑‍🦱'
                },
                {
                    'value': 'secretary',
                    'label': 'Secretaria',
                    'description': 'Personal administrativo que gestiona citas',
                    'icon': '👩‍💼'
                },
                {
                    'value': 'admin',
                    'label': 'Administrador',
                    'description': 'Usuario con permisos administrativos',
                    'icon': '👨‍💻'
                }
            ]
        })
        return context


@staff_member_required
def create_user_by_type(request, user_type):
    """
    Vista para crear usuario según el tipo seleccionado.
    """
    # Mapeo de tipos de usuario a formularios
    form_mapping = {
        'doctor': DoctorCreationForm,
        'client': PatientCreationForm,
        'secretary': SecretaryCreationForm,
        'admin': AdminCreationForm  # Usar el formulario específico para admin
    }
    
    # Validar tipo de usuario
    if user_type not in form_mapping:
        messages.error(request, f'Tipo de usuario "{user_type}" no válido.')
        return redirect('admin:users_user_select_type')
    
    # Obtener el formulario correspondiente
    form_class = form_mapping[user_type]
    
    if request.method == 'POST':
        form = form_class(request.POST)
            
        if form.is_valid():
            user = form.save(commit=False)
            user.role = user_type
            user.save()
            
            # Crear perfil específico si es necesario
            if hasattr(form, 'save_profile'):
                form.save_profile(user)
            
            messages.success(
                request, 
                f'Usuario {user.username} creado exitosamente como {user.get_role_display()}.'
            )
            return redirect('admin:users_user_changelist')
    else:
        form = form_class()
    
    # Contexto para el template
    context = {
        'title': f'Crear {user_type.title()}',
        'form': form,
        'opts': User._meta,
        'user_type': user_type,
        'user_type_display': {
            'doctor': 'Doctor',
            'client': 'Paciente', 
            'secretary': 'Secretaria',
            'admin': 'Administrador'
        }.get(user_type, user_type.title()),
        'has_view_permission': True,
        'has_add_permission': True,
        'save_as': False,
        'save_on_top': False,
    }
    
    return render(request, f'admin/users/create_{user_type}.html', context)


class CustomUserAdmin(admin.ModelAdmin):
    """
    Admin personalizado que redirige a la selección de tipo.
    """
    
    def get_urls(self):
        """
        Agregar URLs personalizadas para la selección de tipo.
        """
        urls = super().get_urls()
        custom_urls = [
            path(
                'select-type/',
                self.admin_site.admin_view(UserTypeSelectionView.as_view()),
                name='users_user_select_type'
            ),
            path(
                'create/<str:user_type>/',
                self.admin_site.admin_view(create_user_by_type),
                name='users_user_create_by_type'
            ),
        ]
        return custom_urls + urls
    
    def add_view(self, request, form_url='', extra_context=None):
        """
        Redirigir la vista de agregar a la selección de tipo.
        """
        return HttpResponseRedirect(reverse('admin:users_user_select_type'))
    
    def changelist_view(self, request, extra_context=None):
        """
        Personalizar la vista de lista para mostrar botón de selección de tipo.
        """
        extra_context = extra_context or {}
        extra_context['show_type_selector'] = True
        return super().changelist_view(request, extra_context)