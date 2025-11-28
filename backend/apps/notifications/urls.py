from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Listar notificaciones
    path('', views.NotificationListView.as_view(), name='list'),
    
    # Actualizar notificación específica
    path('<int:pk>/', views.NotificationUpdateView.as_view(), name='update'),
    
    # Marcar notificación específica como leída
    path('<int:pk>/mark_read/', views.mark_notification_as_read, name='mark_read'),
    
    # Eliminar notificación específica
    path('<int:pk>/delete/', views.delete_notification, name='delete'),
    
    # Conteo de notificaciones no leídas
    path('count/', views.notification_count, name='count'),
    
    # Estadísticas de notificaciones
    path('stats/', views.notification_stats, name='stats'),
    
    # Marcar todas como leídas
    path('mark-all-read/', views.mark_all_as_read, name='mark_all_read'),
    
    # Marcar múltiples como leídas
    path('bulk-mark-read/', views.bulk_mark_as_read, name='bulk_mark_read'),
    
    # Crear notificación (para testing)
    path('create/', views.create_notification, name='create'),
]