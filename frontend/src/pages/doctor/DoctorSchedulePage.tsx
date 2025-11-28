// 🏥 Página de Agenda Médica - Vista Doctor

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, isToday, isFuture, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar,
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  CalendarPlus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Users,
  Activity,
  TrendingUp,
  FileText,
  MessageSquare,
  Video,
  Stethoscope,
  Heart,
  AlertTriangle,
  Plus,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';

import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment } from '../../types/appointment';

// 🎨 Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Layout from '../../components/layout/Layout';

/**
 * 🏥 PÁGINA AGENDA MÉDICA - DOCTOR
 * 
 * Permite al doctor gestionar su agenda:
 * - Ver citas del día/semana con datos reales de la API
 * - Confirmar/cancelar/completar citas
 * - Ver detalles de pacientes
 * - Gestionar disponibilidad
 * - Navegación por fechas
 * - Estadísticas de la agenda
 * - Funcionalidades interactivas avanzadas
 */

// 🔄 FUNCIÓN PARA OBTENER FILTROS DE FECHA SEGÚN EL MODO DE VISTA
const getDateFilters = (selectedDate: Date, viewMode: 'day' | 'week') => {
  if (viewMode === 'day') {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return {
      date_from: dateStr,
      date_to: dateStr
    };
  } else {
    const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return {
      date_from: format(startDate, 'yyyy-MM-dd'),
      date_to: format(endDate, 'yyyy-MM-dd')
    };
  }
};

const DoctorSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // ==========================================
  // ESTADO LOCAL
  // ==========================================
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Eliminamos priorityFilter y typeFilter ya que estos campos no existen en la nueva estructura

  // ==========================================
  // QUERIES PARA DATOS REALES
  // ==========================================
  
  // Obtener citas del doctor autenticado
  const { 
    data: appointmentsResponse, 
    isLoading: isLoadingAppointments, 
    error: appointmentsError,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['doctor-appointments', selectedDate, viewMode, statusFilter],
    queryFn: async () => {
      const dateFilters = getDateFilters(selectedDate, viewMode);
      const filters = {
        ...dateFilters,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      
      return await doctorService.getMyAppointments(filters);
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
  });

  // Extraer las citas de la respuesta
  const appointments = appointmentsResponse?.data?.appointments || [];

  // ==========================================
  // MUTATIONS
  // ==========================================
  
  // Actualizar estado de cita
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: number; status: string }) => {
      return await appointmentService.updateAppointmentStatus(appointmentId, status);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-dashboard'] });
      refetchAppointments();
    },
    onError: (error) => {
      console.error('Error al actualizar cita:', error);
    }
  });

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const days = viewMode === 'week' ? 7 : 1;
    setSelectedDate(prev => 
      direction === 'next' 
        ? addDays(prev, days)
        : addDays(prev, -days)
    );
  };

  const handleAppointmentAction = (appointmentId: number, action: string) => {
    let newStatus = '';
    
    switch (action) {
      case 'confirm':
        newStatus = 'confirmed';
        break;
      case 'complete':
        newStatus = 'completed';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        break;
      default:
        return;
    }
    
    updateAppointmentMutation.mutate({ appointmentId, status: newStatus });
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] });
  };

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'yellow', icon: Clock3 },
      confirmed: { label: 'Confirmada', color: 'blue', icon: CheckCircle },
      completed: { label: 'Completada', color: 'green', icon: CheckCircle },
      cancelled: { label: 'Cancelada', color: 'red', icon: XCircle },
      no_show: { label: 'No asistió', color: 'gray', icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Eliminamos getPriorityBadge y getTypeBadge ya que estos campos no existen en la nueva estructura

  const getTimeSlots = () => {
    if (viewMode === 'day') {
      return appointments.filter(apt => 
        apt.date && isSameDay(parseISO(apt.date), selectedDate)
      );
    }
    return appointments;
  };

  const filteredAppointments = getTimeSlots().filter(appointment => {
    // Filtro por estado
    if (statusFilter !== 'all' && appointment.status !== statusFilter) return false;
    
    // Eliminamos filtros por prioridad y tipo ya que estos campos no existen en la nueva estructura
    
    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        appointment.patient_info?.full_name?.toLowerCase().includes(searchLower) ||
        appointment.reason?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Estadísticas de la agenda
  const agendaStats = useMemo(() => {
    const allAppointments = getTimeSlots();
    const total = allAppointments.length;
    const completed = allAppointments.filter(apt => apt.status === 'completed').length;
    const pending = allAppointments.filter(apt => apt.status === 'pending').length;
    const confirmed = allAppointments.filter(apt => apt.status === 'confirmed').length;
    const cancelled = allAppointments.filter(apt => apt.status === 'cancelled').length;
    
    return { total, completed, pending, confirmed, cancelled };
  }, [getTimeSlots()]);

  // ==========================================
  // RENDER
  // ==========================================
  
  if (isLoadingAppointments) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (appointmentsError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Error al cargar las citas</h3>
            <p className="text-gray-600">No se pudieron cargar las citas. Intenta nuevamente.</p>
          </div>
          <Button onClick={() => refetchAppointments()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Agenda Médica</h1>
            <p className="text-gray-600">
              Gestiona tus citas y disponibilidad médica
            </p>
          </div>
          
          {/* Controles de vista */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToToday}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Hoy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'day' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semana
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas de la agenda */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{agendaStats.total}</p>
                  <p className="text-xs text-gray-600">Total citas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{agendaStats.completed}</p>
                  <p className="text-xs text-gray-600">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{agendaStats.confirmed}</p>
                  <p className="text-xs text-gray-600">Confirmadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock3 className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{agendaStats.pending}</p>
                  <p className="text-xs text-gray-600">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{agendaStats.cancelled}</p>
                  <p className="text-xs text-gray-600">Canceladas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegación de fechas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateNavigation('prev')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {viewMode === 'week' ? 'Semana anterior' : 'Día anterior'}
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  {viewMode === 'week' 
                    ? `Semana del ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd MMM', { locale: es })} al ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: es })}`
                    : format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: es })
                  }
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''} 
                  {filteredAppointments.length !== agendaStats.total && ` de ${agendaStats.total} total`}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateNavigation('next')}
                className="flex items-center gap-2"
              >
                {viewMode === 'week' ? 'Semana siguiente' : 'Día siguiente'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por paciente, motivo o condición..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Filtros */}
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-gray-500" />
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="no_show">No asistió</option>
                </select>
                
                {/* Eliminamos selectores de prioridad y tipo ya que estos campos no existen en la nueva estructura */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de citas */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay citas que coincidan con los filtros
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Ajusta los filtros para ver más citas'}
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="mt-4"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-lg">
                          {appointment.time}
                        </span>
                        {getStatusBadge(appointment.status)}
                        {/* Eliminamos badges de prioridad y tipo ya que estos campos no existen en la nueva estructura */}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {appointment.patient_info?.full_name || 'Paciente no disponible'}
                          </span>
                        </div>
                        
                        {appointment.reason && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-gray-700">{appointment.reason}</span>
                          </div>
                        )}
                        
                        {appointment.patient_condition && (
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{appointment.patient_condition}</span>
                          </div>
                        )}
                        
                        {appointment.patient_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{appointment.patient_phone}</span>
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-gray-600 text-sm italic">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center gap-2 ml-4">
                      {appointment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                            disabled={updateAppointmentMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                            disabled={updateAppointmentMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                          disabled={updateAppointmentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completar
                        </Button>
                      )}
                      
                      {appointment.type === 'telemedicine' && appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        >
                          <Video className="h-4 w-4" />
                          Videollamada
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorSchedulePage;