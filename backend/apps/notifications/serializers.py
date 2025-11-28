from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 
            'type', 
            'type_display',
            'title', 
            'message', 
            'is_read', 
            'created_at',
            'formatted_date',
            'time_ago',
            'icon'
        ]
        read_only_fields = ['id', 'created_at', 'type_display', 'time_ago', 'formatted_date', 'icon']

    def get_time_ago(self, obj):
        """Calcula el tiempo transcurrido desde la creación"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"hace {diff.days} día{'s' if diff.days > 1 else ''}"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"hace {hours} hora{'s' if hours > 1 else ''}"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"hace {minutes} minuto{'s' if minutes > 1 else ''}"
        else:
            return "hace un momento"
    
    def get_formatted_date(self, obj):
        """Retorna la fecha formateada para mostrar"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    
    def get_icon(self, obj):
        """Retorna el icono apropiado según el tipo de notificación"""
        icon_map = {
            'appointment': 'calendar',
            'system': 'settings',
            'reminder': 'clock',
            'result': 'file-text'
        }
        return icon_map.get(obj.type, 'bell')


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar solo el estado de lectura"""
    
    class Meta:
        model = Notification
        fields = ['is_read']