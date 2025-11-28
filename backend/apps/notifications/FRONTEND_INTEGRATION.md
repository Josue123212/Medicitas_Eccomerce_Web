# Integración Frontend - Sistema de Notificaciones 🚀

## Guía Completa para React

Esta guía te ayudará a integrar el sistema de notificaciones en tu aplicación React de manera eficiente y escalable.

## 🏗️ Configuración Inicial

### 1. Instalar Dependencias
```bash
npm install @tanstack/react-query axios lucide-react
# O si usas yarn
yarn add @tanstack/react-query axios lucide-react
```

### 2. Configurar React Query
```javascript
// src/main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tu aplicación */}
    </QueryClientProvider>
  );
}
```

## 📡 Servicio API

### Cliente HTTP Base
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Servicio de Notificaciones
```javascript
// src/services/notificationAPI.js
import apiClient from './api';

export const notificationAPI = {
  // Obtener todas las notificaciones
  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/api/notifications/', { params });
    return response.data;
  },

  // Obtener conteo de no leídas
  getUnreadCount: async () => {
    const response = await apiClient.get('/api/notifications/count/');
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await apiClient.get('/api/notifications/stats/');
    return response.data;
  },

  // Marcar como leída
  markAsRead: async (notificationId) => {
    const response = await apiClient.post(`/api/notifications/${notificationId}/mark_read/`);
    return response.data;
  },

  // Marcar todas como leídas
  markAllAsRead: async () => {
    const response = await apiClient.post('/api/notifications/mark-all-read/');
    return response.data;
  },

  // Marcar múltiples como leídas
  bulkMarkAsRead: async (notificationIds) => {
    const response = await apiClient.post('/api/notifications/bulk-mark-read/', {
      notification_ids: notificationIds
    });
    return response.data;
  },

  // Eliminar notificación
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/api/notifications/${notificationId}/delete/`);
    return response.data;
  },

  // Crear notificación (testing)
  createNotification: async (data) => {
    const response = await apiClient.post('/api/notifications/create/', data);
    return response.data;
  },
};
```

## 🎣 Custom Hooks

### Hook Principal de Notificaciones
```javascript
// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/notificationAPI';
import { toast } from 'react-hot-toast'; // O tu librería de toast preferida

// Hook para obtener notificaciones
export const useNotifications = (filters = {}) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationAPI.getNotifications(filters),
    refetchInterval: 30000, // Refetch cada 30 segundos
    refetchIntervalInBackground: false,
  });
};

// Hook para conteo de no leídas
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationAPI.getUnreadCount,
    refetchInterval: 15000, // Refetch cada 15 segundos
  });
};

// Hook para estadísticas
export const useNotificationStats = () => {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: notificationAPI.getStats,
    refetchInterval: 60000, // Refetch cada minuto
  });
};

// Hook para marcar como leída
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notificación marcada como leída');
    },
    onError: (error) => {
      toast.error('Error al marcar notificación como leída');
      console.error('Error:', error);
    },
  });
};

// Hook para marcar todas como leídas
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationAPI.markAllAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['notifications']);
      toast.success(`${data.updated_count} notificaciones marcadas como leídas`);
    },
    onError: (error) => {
      toast.error('Error al marcar notificaciones como leídas');
      console.error('Error:', error);
    },
  });
};

// Hook para eliminar notificación
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notificación eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar notificación');
      console.error('Error:', error);
    },
  });
};
```

## 🎨 Componentes UI

### Campana de Notificaciones
```javascript
// src/components/NotificationBell.jsx
import React from 'react';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../hooks/useNotifications';

const NotificationBell = ({ onClick, className = '' }) => {
  const { data: countData, isLoading } = useUnreadCount();
  const unreadCount = countData?.unread_count || 0;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} no leídas)` : ''}`}
    >
      <Bell className="w-6 h-6 text-gray-600" />
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {isLoading && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
    </button>
  );
};

export default NotificationBell;
```

### Lista de Notificaciones
```javascript
// src/components/NotificationList.jsx
import React, { useState } from 'react';
import { Calendar, Settings, Clock, FileText, Trash2, Check } from 'lucide-react';
import { useNotifications, useMarkAsRead, useDeleteNotification } from '../hooks/useNotifications';

const iconMap = {
  calendar: Calendar,
  settings: Settings,
  clock: Clock,
  'file-text': FileText,
  bell: Bell,
};

const NotificationItem = ({ notification }) => {
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();
  const IconComponent = iconMap[notification.icon] || Bell;

  const handleMarkAsRead = () => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      deleteNotification.mutate(notification.id);
    }
  };

  return (
    <div className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
      !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          notification.is_read ? 'bg-gray-100' : 'bg-blue-100'
        }`}>
          <IconComponent className={`w-5 h-5 ${
            notification.is_read ? 'text-gray-600' : 'text-blue-600'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                notification.is_read ? 'text-gray-900' : 'text-gray-900 font-semibold'
              }`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{notification.formatted_date}</span>
                <span>{notification.time_ago}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  {notification.type_display}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {!notification.is_read && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Marcar como leída"
                  disabled={markAsRead.isLoading}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Eliminar notificación"
                disabled={deleteNotification.isLoading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationList = ({ filters = {} }) => {
  const [currentFilters, setCurrentFilters] = useState(filters);
  const { data, isLoading, error } = useNotifications(currentFilters);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando notificaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error al cargar las notificaciones</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const notifications = data?.results || [];

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No tienes notificaciones</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
        />
      ))}
      
      {data?.next && (
        <div className="p-4 text-center">
          <button className="text-blue-600 hover:text-blue-800">
            Cargar más notificaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
```

### Panel de Notificaciones
```javascript
// src/components/NotificationPanel.jsx
import React, { useState } from 'react';
import { X, CheckCheck, Filter } from 'lucide-react';
import NotificationList from './NotificationList';
import { useMarkAllAsRead, useNotificationStats } from '../hooks/useNotifications';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const markAllAsRead = useMarkAllAsRead();
  const { data: stats } = useNotificationStats();

  const filters = {
    all: {},
    unread: { is_read: false },
    appointment: { type: 'appointment' },
    system: { type: 'system' },
    reminder: { type: 'reminder' },
  };

  const filterLabels = {
    all: 'Todas',
    unread: 'No leídas',
    appointment: 'Citas',
    system: 'Sistema',
    reminder: 'Recordatorios',
  };

  const handleMarkAllAsRead = () => {
    if (stats?.unread > 0) {
      markAllAsRead.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="mt-2 text-sm text-gray-600">
                {stats.unread > 0 ? (
                  <span>{stats.unread} no leídas de {stats.total} total</span>
                ) : (
                  <span>Todas las notificaciones están leídas</span>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={!stats?.unread || markAllAsRead.isLoading}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Marcar todas como leídas</span>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2 overflow-x-auto">
              {Object.entries(filterLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                    activeFilter === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {key === 'unread' && stats?.unread > 0 && (
                    <span className="ml-1 px-1 bg-red-500 text-white text-xs rounded-full">
                      {stats.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <NotificationList filters={filters[activeFilter]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
```

## 🎯 Uso en la Aplicación

### Componente Principal
```javascript
// src/components/Header.jsx
import React, { useState } from 'react';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Sistema Médico</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell 
              onClick={() => setShowNotifications(true)}
            />
          </div>
        </div>
      </div>
      
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header;
```

### Context para Estado Global (Opcional)
```javascript
// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notificationFilters, setNotificationFilters] = useState({});

  const openNotificationPanel = () => setIsNotificationPanelOpen(true);
  const closeNotificationPanel = () => setIsNotificationPanelOpen(false);

  const value = {
    isNotificationPanelOpen,
    openNotificationPanel,
    closeNotificationPanel,
    notificationFilters,
    setNotificationFilters,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
```

## 🔄 Polling y Tiempo Real

### Configuración de Polling Inteligente
```javascript
// src/hooks/useNotificationPolling.js
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useNotificationPolling = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let interval;
    
    const startPolling = () => {
      interval = setInterval(() => {
        // Solo hacer polling si la ventana está activa
        if (!document.hidden) {
          queryClient.invalidateQueries(['notifications', 'unread-count']);
        }
      }, 30000); // 30 segundos
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    // Iniciar polling
    startPolling();

    // Pausar/reanudar según visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
        // Refetch inmediato al volver a la página
        queryClient.invalidateQueries(['notifications']);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
};
```

### Uso en App Principal
```javascript
// src/App.jsx
import { useNotificationPolling } from './hooks/useNotificationPolling';

function App() {
  useNotificationPolling(); // Activar polling automático

  return (
    <div className="App">
      {/* Tu aplicación */}
    </div>
  );
}
```

## 🎨 Estilos con Tailwind CSS

### Configuración de Colores
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        notification: {
          unread: '#EBF8FF',
          border: '#3182CE',
          icon: '#2B6CB0',
        }
      },
      animation: {
        'notification-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}
```

## 🧪 Testing

### Test de Hooks
```javascript
// src/hooks/__tests__/useNotifications.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from '../useNotifications';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useNotifications', () => {
  it('should fetch notifications', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

## 📱 Responsive Design

### Adaptación Móvil
```javascript
// src/components/MobileNotificationPanel.jsx
import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const ResponsiveNotificationPanel = ({ isOpen, onClose }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 transform transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="bg-white h-full">
          {/* Panel móvil de pantalla completa */}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed right-4 top-16 w-80 bg-white shadow-lg rounded-lg ${
      isOpen ? 'block' : 'hidden'
    }`}>
      {/* Panel desktop */}
    </div>
  );
};
```

---

**¡Listo para implementar! 🚀**

Esta guía te proporciona todo lo necesario para integrar el sistema de notificaciones en tu aplicación React de manera profesional y escalable.