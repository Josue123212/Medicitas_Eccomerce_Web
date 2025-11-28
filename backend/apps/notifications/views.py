from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer, NotificationUpdateSerializer


class NotificationListView(generics.ListAPIView):
    """Lista las notificaciones del usuario autenticado"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Filtro por estado de lectura
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        # Filtro por tipo
        notification_type = self.request.query_params.get('type', None)
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        # Límite de resultados
        limit = self.request.query_params.get('limit', None)
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        
        return queryset


class NotificationUpdateView(generics.UpdateAPIView):
    """Actualiza una notificación específica (principalmente para marcar como leída)"""
    serializer_class = NotificationUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_count(request):
    """Obtiene el conteo de notificaciones no leídas"""
    unread_count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()
    
    return Response({
        'unread_count': unread_count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, pk):
    """Marca una notificación específica como leída"""
    try:
        notification = Notification.objects.get(
            pk=pk,
            user=request.user
        )
        notification.mark_as_read()
        
        return Response({
            'message': 'Notificación marcada como leída',
            'notification_id': pk
        })
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notificación no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    """Marca todas las notificaciones del usuario como leídas"""
    updated_count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({
        'message': f'{updated_count} notificaciones marcadas como leídas',
        'updated_count': updated_count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """Crea una nueva notificación (para testing)"""
    data = request.data.copy()
    data['user'] = request.user.id
    
    serializer = NotificationSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """Obtiene estadísticas detalladas de notificaciones"""
    user_notifications = Notification.objects.filter(user=request.user)
    
    stats = {
        'total': user_notifications.count(),
        'unread': user_notifications.filter(is_read=False).count(),
        'read': user_notifications.filter(is_read=True).count(),
        'by_type': {}
    }
    
    # Estadísticas por tipo
    for choice in Notification.TYPE_CHOICES:
        type_code = choice[0]
        type_name = choice[1]
        count = user_notifications.filter(type=type_code).count()
        unread_count = user_notifications.filter(type=type_code, is_read=False).count()
        
        stats['by_type'][type_code] = {
            'name': type_name,
            'total': count,
            'unread': unread_count
        }
    
    return Response(stats)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    """Elimina una notificación específica"""
    try:
        notification = Notification.objects.get(
            pk=pk,
            user=request.user
        )
        notification.delete()
        
        return Response({
            'message': 'Notificación eliminada correctamente',
            'notification_id': pk
        })
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notificación no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_mark_as_read(request):
    """Marca múltiples notificaciones como leídas"""
    notification_ids = request.data.get('notification_ids', [])
    
    if not notification_ids:
        return Response(
            {'error': 'Se requiere una lista de IDs de notificaciones'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated_count = Notification.objects.filter(
        pk__in=notification_ids,
        user=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({
        'message': f'{updated_count} notificaciones marcadas como leídas',
        'updated_count': updated_count
    })