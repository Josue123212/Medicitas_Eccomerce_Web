import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Bell, 
  Send, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Plus,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'appointment' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: {
    type: 'all' | 'role' | 'specific';
    targets?: string[];
    count: number;
  };
  status: 'draft' | 'sent' | 'scheduled';
  created_date: string;
  sent_date?: string;
  scheduled_date?: string;
  read_count: number;
  created_by: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - En producción esto vendría de la API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: 'Mantenimiento del Sistema',
        message: 'El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 6:00 AM.',
        type: 'system',
        priority: 'high',
        recipients: {
          type: 'all',
          count: 150
        },
        status: 'sent',
        created_date: '2024-01-15T10:30:00Z',
        sent_date: '2024-01-15T11:00:00Z',
        read_count: 120,
        created_by: 'Admin Sistema'
      },
      {
        id: 2,
        title: 'Recordatorio de Citas',
        message: 'Recordatorio automático para pacientes con citas programadas para mañana.',
        type: 'appointment',
        priority: 'medium',
        recipients: {
          type: 'specific',
          targets: ['patients'],
          count: 25
        },
        status: 'scheduled',
        created_date: '2024-01-14T15:45:00Z',
        scheduled_date: '2024-01-16T08:00:00Z',
        read_count: 0,
        created_by: 'Dr. Juan Pérez'
      },
      {
        id: 3,
        title: 'Nueva Política de Cancelaciones',
        message: 'Se ha actualizado la política de cancelaciones. Por favor, revisen los nuevos términos.',
        type: 'info',
        priority: 'medium',
        recipients: {
          type: 'role',
          targets: ['doctors', 'secretaries'],
          count: 45
        },
        status: 'sent',
        created_date: '2024-01-13T09:20:00Z',
        sent_date: '2024-01-13T10:00:00Z',
        read_count: 38,
        created_by: 'Administración'
      },
      {
        id: 4,
        title: 'Alerta de Seguridad',
        message: 'Se detectaron intentos de acceso no autorizado. Se recomienda cambiar contraseñas.',
        type: 'warning',
        priority: 'urgent',
        recipients: {
          type: 'all',
          count: 150
        },
        status: 'draft',
        created_date: '2024-01-15T16:30:00Z',
        read_count: 0,
        created_by: 'Seguridad IT'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'appointment':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Bell className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'system':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'info':
        return 'Información';
      case 'warning':
        return 'Advertencia';
      case 'success':
        return 'Éxito';
      case 'error':
        return 'Error';
      case 'appointment':
        return 'Cita';
      case 'system':
        return 'Sistema';
      default:
        return type;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Baja';
      case 'medium':
        return 'Media';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'sent':
        return 'Enviada';
      case 'scheduled':
        return 'Programada';
      default:
        return status;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.created_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
            <p className="text-gray-600 mt-2">Gestiona y envía notificaciones del sistema</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Nueva Notificación
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notificaciones</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.status === 'sent').length}
                </p>
              </div>
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Borradores</p>
                <p className="text-2xl font-bold text-gray-600">
                  {notifications.filter(n => n.status === 'draft').length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="info">Información</option>
                <option value="warning">Advertencia</option>
                <option value="success">Éxito</option>
                <option value="error">Error</option>
                <option value="appointment">Cita</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borradores</option>
                <option value="sent">Enviadas</option>
                <option value="scheduled">Programadas</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {getTypeText(notification.type)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {getPriorityText(notification.priority)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Por: {notification.created_by}</span>
                        <span>Destinatarios: {notification.recipients.count}</span>
                        {notification.status === 'sent' && (
                          <span>Leídas: {notification.read_count}/{notification.recipients.count}</span>
                        )}
                        <span>
                          {notification.status === 'sent' && notification.sent_date && 
                            `Enviada: ${new Date(notification.sent_date).toLocaleDateString('es-ES')}`
                          }
                          {notification.status === 'scheduled' && notification.scheduled_date && 
                            `Programada: ${new Date(notification.scheduled_date).toLocaleDateString('es-ES')}`
                          }
                          {notification.status === 'draft' && 
                            `Creada: ${new Date(notification.created_date).toLocaleDateString('es-ES')}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {getStatusIcon(notification.status)}
                      {getStatusText(notification.status)}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron notificaciones que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default NotificationCenter;