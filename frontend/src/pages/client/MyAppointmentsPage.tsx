// 📅 Página de Mis Citas para Cliente

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../contexts/AuthContext';
import type { AppointmentFilters, Appointment, CreateAppointmentData } from '../../types/appointment';

// 🎨 Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Layout from '../../components/layout/Layout';
import { Modal, useModal } from '../../components/ui/Modal';
import { AppointmentForm } from '../../components/appointments';
import FloatingPharmacyCartCTA from '../../components/pharmacy/FloatingPharmacyCartCTA';

// 🎯 Iconos
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  BarChart3
} from 'lucide-react';

/**
 * 📅 PÁGINA MIS CITAS - CLIENTE
 * 
 * Permite al cliente ver y gestionar sus citas médicas:
 * - Ver historial de citas
 * - Filtrar por estado y fecha
 * - Cancelar citas futuras
 * - Ver detalles de cada cita
 */
const MyAppointmentsPage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // 🎭 Hook para manejar el modal de crear cita
  const createAppointmentModal = useModal();
  
  // 🐛 Debug: Log del estado del modal en cada render
  console.log('🔍 MyAppointmentsPage render - Modal state:', {
    isOpen: createAppointmentModal.isOpen,
    locationState: location.state,
    pathname: location.pathname
  });

  // 🚀 Efecto para abrir el modal automáticamente si se navega desde el botón Nueva Cita
  useEffect(() => {
    console.log('🔄 useEffect ejecutado:', {
      openModal: location.state?.openModal,
      currentState: location.state,
      modalIsOpen: createAppointmentModal.isOpen
    });
    
    if (location.state?.openModal) {
      console.log('✅ Condición cumplida - abriendo modal desde Dashboard');
      createAppointmentModal.openModal();
      // Limpiar el estado usando React Router para evitar que se abra nuevamente
      console.log('🧹 Limpiando location.state con navigate...');
      navigate(location.pathname, { replace: true, state: {} });
      console.log('✨ Estado limpiado con React Router');
    }
  }, [location.state?.openModal, createAppointmentModal, navigate, location.pathname]);

  // 📊 Consulta de citas del usuario
  const { 
    data: appointments, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['my-appointments', filters],
    queryFn: () => appointmentService.getMyAppointments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // 🔄 Mutación para cancelar cita
  const cancelAppointmentMutation = useMutation({
    mutationFn: appointmentService.cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success('Cita cancelada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error al cancelar cita:', error);
      
      // Usar mensaje enriquecido del servicio si está disponible
      if (error?.userMessage) {
        toast.error(error.userMessage);
        return;
      }
      
      // Manejo específico de errores de autenticación
      if (error?.response?.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // Manejo específico de errores de permisos
      if (error?.response?.status === 403) {
        toast.error('No tienes permisos para cancelar esta cita. Contacta al administrador si crees que esto es un error.');
        return;
      }
      
      // Manejo específico de errores de estado de cita
      if (error?.response?.status === 400) {
        const detail = error?.response?.data?.detail;
        if (detail?.includes('cancelada') || detail?.includes('completada')) {
          toast.error('Esta cita ya no puede ser cancelada porque ya fue procesada.');
          return;
        }
      }
      
      // Mensaje genérico para otros errores
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.detail || 
                          'Error al cancelar la cita. Verifica tu conexión e inténtalo de nuevo.';
      toast.error(errorMessage);
    }
  });

  // ✨ Mutación para crear nueva cita
  const createAppointmentMutation = useMutation({
    mutationFn: (data: CreateAppointmentData) => {
      return appointmentService.createAppointment(data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      createAppointmentModal.closeModal();
      toast.success('¡Cita creada exitosamente!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.detail || 
                          'Error al crear la cita. Inténtalo de nuevo.';
      toast.error(errorMessage);
    }
  });

  // 🎯 Handlers
  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleCancelAppointment = (appointmentId: number) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // 📝 Manejar creación de nueva cita
  const handleCreateAppointment = (data: CreateAppointmentData) => {
    createAppointmentMutation.mutate(data);
  };

  // 🎨 Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const statusColors = {
      'scheduled': 'blue',
      'confirmed': 'green',
      'completed': 'gray',
      'cancelled': 'red',
      'no_show': 'red'
    };
    return statusColors[status as keyof typeof statusColors] || 'gray';
  };

  // 🎨 Función para obtener el badge del estado
  const getStatusBadge = (appointment: Appointment) => {
    const color = getStatusColor(appointment.status);
    const colorClasses = {
      'green': 'text-[var(--success)]',
      'blue': 'text-[var(--primary)]',
      'yellow': 'text-[var(--warning)]',
      'red': 'text-[var(--error)]',
      'gray': 'text-[var(--text-muted)]'
    };

    const bgClasses = {
      'green': 'bg-[var(--success-light)]',
      'blue': 'bg-[var(--primary-light)]',
      'yellow': 'bg-[var(--warning-light)]',
      'red': 'bg-[var(--error-light)]',
      'gray': 'bg-[var(--surface)]'
    };

    return (
      <Badge className={`${bgClasses[color as keyof typeof bgClasses]} ${colorClasses[color as keyof typeof colorClasses]}`}>
        {appointment.status_display}
      </Badge>
    );
  };

  // 🔄 Estados de carga
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
          <span className="ml-2">Cargando citas...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-[var(--error)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Error al cargar citas</h2>
            <p className="text-[var(--text-secondary)]">No se pudieron cargar las citas médicas.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 🔍 Filtrar citas por término de búsqueda
  const filteredAppointments = appointments?.results?.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.doctor_name?.toLowerCase().includes(searchLower) ||
      appointment.specialty?.toLowerCase().includes(searchLower) ||
      appointment.reason?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // 📊 Calcular estadísticas de citas por estado
  const getAppointmentStats = () => {
    const allAppointments = appointments?.results || [];
    
    const stats = {
      scheduled: allAppointments.filter(apt => apt.status === 'scheduled').length,
      confirmed: allAppointments.filter(apt => apt.status === 'confirmed').length,
      completed: allAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: allAppointments.filter(apt => apt.status === 'cancelled').length,
      total: allAppointments.length
    };
    
    return stats;
  };

  const appointmentStats = getAppointmentStats();

  return (
    <Layout>
      <div className="space-y-6">
      {/* 📋 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Mis Citas</h1>
          <p className="text-[var(--text-secondary)]">Gestiona tus citas médicas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[var(--text-secondary)]">
            Total: {filteredAppointments.length} citas
          </div>
          

          <Button
            onClick={createAppointmentModal.openModal}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            style={{
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              e.currentTarget.style.borderColor = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
          >
            <Plus className="h-4 w-4" />
            Crear Nueva Cita
          </Button>
        </div>
      </div>

      {/* 📊 Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Programadas */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Programadas</p>
                <p className="text-2xl font-bold text-[var(--primary)]">{appointmentStats.scheduled}</p>
              </div>
              <div className="p-3 bg-[var(--primary-light)] rounded-full">
                <CalendarClock className="h-6 w-6 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmadas */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Confirmadas</p>
                <p className="text-2xl font-bold text-[var(--success)]">{appointmentStats.confirmed}</p>
              </div>
              <div className="p-3 bg-[var(--success-light)] rounded-full">
                <CalendarCheck className="h-6 w-6 text-[var(--success)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completadas */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Completadas</p>
                <p className="text-2xl font-bold text-[var(--text-muted)]">{appointmentStats.completed}</p>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded-full">
                <CheckCircle className="h-6 w-6 text-[var(--text-muted)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canceladas */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Canceladas</p>
                <p className="text-2xl font-bold text-[var(--error)]">{appointmentStats.cancelled}</p>
              </div>
              <div className="p-3 bg-[var(--error-light)] rounded-full">
                <CalendarX className="h-6 w-6 text-[var(--error)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Buscar por doctor, especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Estado */}
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">Todos los estados</option>
              <option value="scheduled">Programada</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>

            {/* Fecha específica */}
            <Input
              type="date"
              value={filters.date || ''}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              placeholder="Fecha de la cita"
            />
          </div>

          {/* Limpiar filtros */}
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📅 Lista de Citas */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No hay citas</h3>
            <p className="text-[var(--text-secondary)]">
              {appointments?.length === 0 
                ? 'Aún no tienes citas programadas.' 
                : 'No se encontraron citas con los filtros aplicados.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Dr. {appointment.doctor_name}
                      </h3>
                      {getStatusBadge(appointment)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(parseISO(appointment.date), 'EEEE, d MMMM yyyy', { locale: es })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{appointment.specialty}</span>
                      </div>

                      {appointment.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                    </div>

                    {appointment.reason && (
                      <div className="mt-3">
                        <p className="text-sm text-[var(--text-primary)]">
                          <strong>Motivo:</strong> {appointment.reason}
                        </p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-[var(--text-secondary)]">
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 ml-4">
                    {appointment.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={cancelAppointmentMutation.isPending}
                        className="flex items-center gap-2 text-[var(--error)] hover:text-[var(--error)]"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar
                      </Button>
                    )}

                    {appointment.status === 'confirmed' && (
                      <div className="flex items-center gap-2 text-[var(--success)] text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Confirmada
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 🎭 Modal para crear nueva cita */}
      <Modal
          isOpen={createAppointmentModal.isOpen}
          onClose={() => {
            console.log('🚪 MyAppointmentsPage: Modal onClose ejecutado');
            createAppointmentModal.closeModal();
          }}
          title="Crear Nueva Cita"
          showCloseButton={true}
          closeOnOverlayClick={true}
          closeOnEscape={true}
        >
          {console.log('🔍 DEBUG - MyAppointmentsPage: user?.patient_profile_id:', user?.patient_profile_id)}
          <AppointmentForm
            onSubmit={handleCreateAppointment}
            onCancel={() => {
              console.log('❌ MyAppointmentsPage: AppointmentForm onCancel ejecutado');
              createAppointmentModal.closeModal();
            }}
            isLoading={createAppointmentMutation.isPending}
            preselectedPatient={user?.patient_profile_id}
          />
        </Modal>
      </div>
      <FloatingPharmacyCartCTA />
    </Layout>
  );
};

export default MyAppointmentsPage;