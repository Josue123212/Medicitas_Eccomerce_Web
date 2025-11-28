// 👩‍💼 Lista de Secretarias - Gestión Administrativa

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { secretaryService } from '../../services/secretaryService';
import type { SecretaryListItem, SecretaryFilters } from '../../types/secretary';
import SecretaryDetailModal from '../../components/modals/SecretaryDetailModal';
import SecretaryEditModal from '../../components/modals/SecretaryEditModal';
import SecretaryCreateModal from '../../components/modals/SecretaryCreateModal';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/Badge';
import { 
  UserIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Filter, Plus, Eye, Edit } from 'lucide-react';

/**
 * 🎯 OBJETIVO: Lista completa de secretarias con gestión administrativa
 * 
 * 💡 CONCEPTO: Página de gestión que permite:
 * - Ver todas las secretarias del sistema
 * - Filtrar por departamento, turno, permisos
 * - Buscar por nombre o email
 * - Ver información laboral
 * - Gestionar permisos y accesos
 */

// Interfaces importadas desde types/secretary.ts

const SecretaryList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SecretaryFilters>({
    search: '',
    department: '',
    shift: '',
    permissions: '',
    status: '',
    page: 1,
    page_size: 10
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Estados para modales
  const [selectedSecretary, setSelectedSecretary] = useState<SecretaryListItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🔄 Query para obtener secretarias
  const { data: secretariesData, isLoading, error } = useQuery({
    queryKey: ['secretaries', filters],
    queryFn: () => secretaryService.getSecretaries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const secretaries = secretariesData?.results || [];

  // 🎨 Función para obtener badge de estado
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        Activa
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        Inactiva
      </Badge>
    );
  };

  // 🎨 Función para obtener badge de departamento
  const getDepartmentBadge = (department: string) => {
    const departmentColors: Record<string, string> = {
      'Recepción': 'bg-blue-100 text-blue-800',
      'Administración': 'bg-purple-100 text-purple-800',
      'Archivo': 'bg-gray-100 text-gray-800',
      'Enfermería': 'bg-pink-100 text-pink-800'
    };
    
    return (
      <Badge className={departmentColors[department] || 'bg-gray-100 text-gray-800'}>
        {department || 'Sin departamento'}
      </Badge>
    );
  };

  // 🎨 Función para obtener turno formateado
  const getShiftDisplay = (start: string | null, end: string | null) => {
    if (!start || !end) return 'No especificado';
    return `${start} - ${end}`;
  };

  // 🎨 Función para manejar búsqueda
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // 🎨 Función para manejar cambios de filtros
  const handleFilterChange = (key: keyof SecretaryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // 🎨 Función para limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      search: '',
      department: '',
      shift: '',
      permissions: '',
      status: '',
      page: 1,
      page_size: 10
    });
  };

  // 🎨 Función para ver detalles de la secretaria
  // Funciones para manejar modales
  const handleViewSecretary = (secretary: SecretaryListItem) => {
    setSelectedSecretary(secretary);
    setShowDetailModal(true);
  };

  const handleEditSecretary = (secretary: SecretaryListItem) => {
    setSelectedSecretary(secretary);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setSelectedSecretary(null);
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowCreateModal(false);
  };

  const handleEditFromDetail = (secretary: SecretaryListItem) => {
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  // 🔄 Estados de carga y error
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar secretarias</h3>
          <p className="mt-1 text-sm text-gray-500">
            Hubo un problema al cargar la lista de secretarias.
          </p>
        </div>
      </AdminLayout>
    );
  }

  // 🎨 Render principal
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 📋 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Secretarias</h1>
            <p className="text-gray-600">
              Administra el personal de secretaría y sus permisos
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
            <Button 
               onClick={() => setShowCreateModal(true)}
               className="flex items-center space-x-2"
             >
               <Plus className="h-4 w-4" />
               <span>Nueva Secretaria</span>
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
                placeholder="Buscar por nombre, email o ID de empleado..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 🎛️ Panel de filtros */}
        {showAdvancedFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="Recepción">Recepción</option>
                    <option value="Administración">Administración</option>
                    <option value="Archivo">Archivo</option>
                    <option value="Enfermería">Enfermería</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turno
                  </label>
                  <select
                    value={filters.shift}
                    onChange={(e) => handleFilterChange('shift', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="morning">Mañana (08:00-16:00)</option>
                    <option value="afternoon">Tarde (14:00-22:00)</option>
                    <option value="night">Noche (22:00-06:00)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permisos
                  </label>
                  <select
                    value={filters.permissions}
                    onChange={(e) => handleFilterChange('permissions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="appointments">Gestión de Citas</option>
                    <option value="patients">Gestión de Pacientes</option>
                    <option value="reports">Ver Reportes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="active">Activas</option>
                    <option value="inactive">Inactivas</option>
                  </select>
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex items-center space-x-2"
                >
                  <span>Limpiar Filtros</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 📊 Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Secretarias</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {secretariesData?.count || 0}
                  </p>
                </div>
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {secretaries?.filter(s => s.user.is_active).length || 0}
                  </p>
                </div>
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Con Permisos Citas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {secretaries?.filter(s => s.can_manage_appointments).length || 0}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departamentos</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(secretaries?.map(s => s.department)).size || 0}
                  </p>
                </div>
                <BriefcaseIcon className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 📋 Lista de secretarias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {secretaries?.map((secretary) => (
            <Card key={secretary.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {secretary.user.first_name} {secretary.user.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {secretary.employee_id}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(secretary.user.is_active)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Información de contacto */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span className="truncate">{secretary.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{secretary.user.phone || 'No especificado'}</span>
                  </div>
                </div>

                {/* Información laboral */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Departamento:</span>
                    {getDepartmentBadge(secretary.department)}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>Turno: {getShiftDisplay(secretary.shift_start, secretary.shift_end)}</span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <span>Contratada: </span>
                    <span className="font-medium">
                      {secretary.hire_date 
                        ? format(parseISO(secretary.hire_date), 'dd/MM/yyyy', { locale: es })
                        : 'No especificada'
                      }
                    </span>
                  </div>
                </div>

                {/* Permisos */}
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-2">Permisos:</p>
                  <div className="flex flex-wrap gap-1">
                    {secretary.can_manage_appointments && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Citas
                      </Badge>
                    )}
                    {secretary.can_manage_patients && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Pacientes
                      </Badge>
                    )}
                    {secretary.can_view_reports && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        Reportes
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Citas gestionadas:</span>
                      <p className="font-medium">{secretary.total_appointments_managed || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pacientes registrados:</span>
                      <p className="font-medium">{secretary.total_patients_registered || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="border-t pt-3">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSecretary(secretary)}
                      className="flex-1 flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSecretary(secretary)}
                      className="flex-1 flex items-center justify-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 📭 Estado vacío */}
        {secretaries?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay secretarias</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron secretarias que coincidan con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 📄 Paginación */}
        {secretariesData && secretariesData.count > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((filters.page - 1) * filters.page_size) + 1} a{' '}
              {Math.min(filters.page * filters.page_size, secretariesData.count)} de{' '}
              {secretariesData.count} secretarias
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!secretariesData.previous}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-700">
                Página {filters.page} de {Math.ceil(secretariesData.count / filters.page_size)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!secretariesData.next}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <SecretaryDetailModal
        secretary={selectedSecretary}
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        onEdit={handleEditFromDetail}
      />

      <SecretaryEditModal
        secretary={selectedSecretary}
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSuccess={handleCloseModals}
      />

      <SecretaryCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSuccess={handleCloseModals}
      />
    </AdminLayout>
  );
};

export default SecretaryList;