import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tokenUtils } from '../services/authService';

// Tipo para notificaciones del backend
interface BackendNotification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
}

// Tipo para el estado del hook
interface UseNotificationsReturn {
  // Estado
  notifications: BackendNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Acciones
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  
  // Utilidades
  hasUnread: boolean;
  isEmpty: boolean;
}

/**
 * Hook personalizado para gestionar notificaciones
 * 
 * 🎯 Objetivo: Centralizar la lógica de notificaciones
 * 💡 Concepto: Estado global + API calls + optimistic updates
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  // 🔧 Función para obtener notificaciones del backend
  const fetchNotifications = useCallback(async (): Promise<void> => {
    console.log('🔔 fetchNotifications called, isAuthenticated:', isAuthenticated);
    
    // Verificaciones más estrictas antes de hacer la llamada
    if (!isAuthenticated) {
      console.log('❌ Usuario no autenticado, saltando fetch de notificaciones');
      return;
    }
    
    const token = tokenUtils.getAccessToken();
    console.log('🔑 Token exists:', !!token);
    if (!token || token.trim() === '') {
      console.log('❌ Token vacío o inexistente, saltando fetch de notificaciones');
      setError('No hay token de autenticación válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Making API call to notifications...');
      const response = await fetch('http://localhost:8000/api/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      // Manejar específicamente errores de autenticación
      if (response.status === 401) {
        console.log('🔒 Error 401: Token inválido o expirado');
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        // Limpiar notificaciones existentes
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Error al cargar notificaciones`);
      }

      const data = await response.json();
      console.log('📡 API Response data:', data);
      const notificationsData: BackendNotification[] = data.results || data;
      console.log('📋 Processed notifications:', notificationsData.length, 'items');
      setNotifications(notificationsData);
      
      // Calcular notificaciones no leídas
      const unread = notificationsData.filter(n => !n.is_read).length;
      console.log('🔔 Unread count:', unread);
      setUnreadCount(unread);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error fetching notifications:', err);
      
      // En caso de error, limpiar notificaciones para evitar datos obsoletos
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 🔧 Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId: number): Promise<void> => {
    if (!isAuthenticated) return;
    
    const token = tokenUtils.getAccessToken();
    if (!token) return;

    try {
      // Optimistic update - actualizar UI inmediatamente
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const response = await fetch(
        `http://localhost:8000/api/notifications/${notificationId}/mark_read/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al marcar como leída');
      }

    } catch (err) {
      // Revertir optimistic update en caso de error
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: false }
            : notification
        )
      );
      setUnreadCount(prev => prev + 1);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error marking notification as read:', err);
    }
  }, [isAuthenticated]);

  // 🔧 Marcar todas como leídas
  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    const token = tokenUtils.getAccessToken();
    if (!token) return;

    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);

      const response = await fetch(
        'http://localhost:8000/api/notifications/mark-all-read/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas');
      }

    } catch (err) {
      // Recargar notificaciones en caso de error
      fetchNotifications();
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error marking all notifications as read:', err);
    }
  }, [isAuthenticated, fetchNotifications]);

  // 🔧 Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 🔧 Polling para actualizaciones en tiempo real (cada 30 segundos)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  return {
    // Estado
    notifications,
    unreadCount,
    loading,
    error,
    
    // Acciones
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    
    // Utilidades
    hasUnread: unreadCount > 0,
    isEmpty: notifications.length === 0,
  };
};

export default useNotifications;