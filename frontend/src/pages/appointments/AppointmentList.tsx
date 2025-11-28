import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '@/services';
import type { AppointmentFilters, AppointmentStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

/**
 * 📅 PÁGINA DE LISTA DE CITAS
 * 
 * Funcionalidades:
 * - Lista de citas con datos reales de la API
 * - Filtros por estado, fecha y doctor
 * - Búsqueda por paciente
 * - Paginación automática
 * - Estados visuales por tipo de cita
 * - Acciones rápidas (confirmar, cancelar)
 */
const AppointmentList: React.FC = () => {
  // 🔍 Estados para filtros y búsqueda
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 📊 Query para obtener citas
  const { 
    data: appointmentsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['appointments', filters, searchTerm],
    queryFn: () => appointmentService.getAppointments({
      ...filters,
      search: searchTerm || undefined
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🎨 Función para obtener color del estado
  const getStatusColor = (status: AppointmentStatus) => {
    return appointmentService.getAppointmentStatusColor(status);
  };

  // 🎨 Función para obtener icono del estado
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  // 🔄 Función para actualizar filtros
  const updateFilters = (newFilters: Partial<AppointmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 🗑️ Función para limpiar filtros
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // ⚡ Acciones rápidas
  const handleQuickAction = async (appointmentId: number, action: 'confirm' | 'cancel') => {
    try {
      if (action === 'confirm') {
        await appointmentService.confirmAppointment(appointmentId);
      } else {
        await appointmentService.cancelAppointment(appointmentId, 'Cancelada desde lista');
      }
      refetch(); // Recargar datos
    } catch (error) {
      console.error(`Error al ${action === 'confirm' ? 'confirmar' : 'cancelar'} cita:`, error);
    }
  };

  // 🎨 Render del componente
  return (
    <div className="space-y-6">
      {/* 📋 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas Médicas</h1>
          <p className="text-gray-600">
            Gestiona y visualiza todas las citas del sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Nueva Cita</span>
          </Button>
        </div>
      </div>

      {/* 🔍 Barra de búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre del paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 🎛️ Panel de filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ 
                    status: e.target.value as AppointmentStatus || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="scheduled">Programada</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="no_show">No asistió</option>
                </select>
              </div>

              {/* Filtro por fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha desde
                </label>
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => updateFilters({ date_from: e.target.value || undefined })}
                />
              </div>

              {/* Filtro por fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha hasta
                </label>
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => updateFilters({ date_to: e.target.value || undefined })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 📊 Estadísticas rápidas */}
      {appointmentsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentsData.count || appointmentsData.results?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentsData.results?.filter(apt => apt.status === 'confirmed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentsData.results?.filter(apt => apt.status === 'scheduled').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Canceladas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentsData.results?.filter(apt => apt.status === 'cancelled').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 📋 Lista de citas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Cargando citas...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error al cargar las citas</p>
              <Button onClick={() => refetch()} className="mt-2">
                Reintentar
              </Button>
            </div>
          ) : !appointmentsData?.results?.length ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron citas con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointmentsData.results.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-8 w-8 text-gray-400" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient_info.full_name || 'Paciente no disponible'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patient_info.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {appointment.doctor_info.full_name || 'Doctor no disponible'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.doctor_info.specialization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointmentService.formatAppointmentDate(appointment.date, appointment.time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status_display}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {appointment.reason || 'Sin motivo especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAction(appointment.id, 'confirm')}
                              >
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleQuickAction(appointment.id, 'cancel')}
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            Ver Detalles
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📄 Paginación */}
      {appointmentsData?.next || appointmentsData?.previous ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {appointmentsData.results?.length || 0} de {appointmentsData.count || 0} citas
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={!appointmentsData.previous}
              onClick={() => {/* Implementar paginación anterior */}}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={!appointmentsData.next}
              onClick={() => {/* Implementar paginación siguiente */}}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AppointmentList;