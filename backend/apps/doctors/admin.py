from django.contrib import admin
from django.contrib.auth import get_user_model
from django import forms
import json
from .models import Doctor

User = get_user_model()


class DoctorForm(forms.ModelForm):
    """
    Formulario simple para Doctor que solo maneja campos del modelo Doctor.
    Los campos del usuario se manejan por separado.
    """
    
    class Meta:
        model = Doctor
        fields = [
            'medical_license', 'specialization', 'years_experience', 
            'consultation_fee', 'bio', 'is_available',
            'work_start_time', 'work_end_time', 'work_days'
        ]
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4}),
            'work_start_time': forms.TimeInput(attrs={'type': 'time'}),
            'work_end_time': forms.TimeInput(attrs={'type': 'time'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Para work_days, convertir de JSON a lista si es necesario
        if self.instance and self.instance.pk and self.instance.work_days:
            try:
                if isinstance(self.instance.work_days, str):
                    work_days_list = json.loads(self.instance.work_days)
                else:
                    work_days_list = self.instance.work_days
                self.fields['work_days'].initial = work_days_list
            except (json.JSONDecodeError, TypeError):
                self.fields['work_days'].initial = []


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Doctor.
    Admin simple que solo maneja campos del modelo Doctor.
    """
    
    # Campos que se muestran en la lista
    list_display = (
        'get_full_name', 'email', 'specialization', 'medical_license', 'is_available', 'get_date_joined'
    )
    
    # Campos por los que se puede filtrar
    list_filter = (
        'specialization', 'is_available', 'created_at'
    )
    
    # Campos por los que se puede buscar
    search_fields = (
        'user__first_name', 'user__last_name', 'user__email', 'medical_license', 'specialization'
    )
    
    # Ordenamiento por defecto
    ordering = ('-created_at',)
    
    # Campos que se pueden editar (solo del modelo Doctor)
    fields = (
        'user', 'medical_license', 'specialization', 'years_experience', 
        'consultation_fee', 'bio', 'is_available', 'work_start_time', 
        'work_end_time', 'work_days'
    )
    
    # Campos de solo lectura
    readonly_fields = []
    
    def get_full_name(self, obj):
        """Retorna el nombre completo del doctor."""
        return obj.full_name
    get_full_name.short_description = 'Nombre Completo'
    get_full_name.admin_order_field = 'user__last_name'
    
    def email(self, obj):
        """Retorna el email del doctor."""
        return obj.user.email
    email.short_description = 'Email'
    email.admin_order_field = 'user__email'
    
    def get_date_joined(self, obj):
        return obj.user.date_joined
    get_date_joined.short_description = 'Fecha de Registro'
    
    def get_queryset(self, request):
        """Optimiza las consultas incluyendo el usuario relacionado."""
        return super().get_queryset(request).select_related('user')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Personaliza el campo de usuario para mostrar solo usuarios con rol doctor."""
        if db_field.name == "user":
            kwargs["queryset"] = User.objects.filter(role='doctor')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
