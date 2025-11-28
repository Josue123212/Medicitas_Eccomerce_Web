// 🏥 Lista de Doctores - Gestión y Visualización

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services';
import type { DoctorFilters, Doctor } from '../../types';
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
  PlusIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import DoctorCreateModal from '../../components/doctors/DoctorCreateModal';
import DoctorCard from '../../components/doctors/DoctorCard';
import DoctorTable from '../../components/doctors/DoctorTable';

/**
 * 🎯 OBJETIVO: Lista completa de doctores con filtros y búsqueda
 * 
 * 💡 CONCEPTO: Página de gestión que permite:
 * - Ver todos los doctores del sistema
 * - Filtrar por especialización, disponibilidad, etc.
 * - Buscar por nombre o especialización
 * - Alternar entre vista tarjeta y tabla
 * - Ver detalles básicos de cada doctor
 * - Acceder al perfil completo
 */

type ViewMode = 'cards' | 'table';

const DoctorList: React.FC = () => {
  // ==========================================
  // HOOKS
  // ==========================================
  const navigate = useNavigate();

  // ==========================================
  // ESTADO LOCAL
  // ==========================================
  const [filters, setFilters] = useState<DoctorFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // ==========================================
  // QUERIES
  // ==========================================
  const { 
    data: doctorsResponse, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['doctors', filters, searchTerm],
    queryFn: () => doctorService.getPublicDoctors({
      ...filters,
      search: searchTerm || undefined
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // ==========================================
  // HANDLERS
  // ==========================================
  const updateFilters = (newFilters: Partial<DoctorFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };



  const handleDisableDoctor = async (doctor: Doctor) => {
    const isCurrentlyDisabled = doctor.status === 'disabled';
    const action = isCurrentlyDisabled ? 'habilitar' : 'deshabilitar';
    const newStatus = isCurrentlyDisabled ? 'active' : 'disabled';
    
    // 🔔 Confirmación mejorada con más contexto
    const confirmTitle = isCurrentlyDisabled 
      ? '🟢 ¿Habilitar Doctor?' 
      : '🔴 ¿Deshabilitar Doctor?';
    
    const confirmMessage = isCurrentlyDisabled 
      ? `¿Estás seguro de que quieres HABILITAR la cuenta del Dr. ${doctor.full_name}?\n\n✅ El doctor podrá:\n• Acceder al sistema\n• Gestionar sus citas\n• Atender pacientes\n\n¿Continuar?`
      : `¿Estás seguro de que quieres DESHABILITAR la cuenta del Dr. ${doctor.full_name}?\n\n❌ El doctor NO podrá:\n• Acceder al sistema\n• Gestionar citas\n• Atender pacientes\n\n¿Continuar?`;
    
    // Mostrar confirmación
    if (window.confirm(`${confirmTitle}\n\n${confirmMessage}`)) {
      try {
        const result = await doctorService.updateDoctorStatus(doctor.id, newStatus);
        
        // ✅ Recargar la lista
        refetch();
        
        // 🎉 Mensaje de éxito mejorado
        const successMessage = isCurrentlyDisabled 
          ? `✅ ¡Doctor habilitado exitosamente!\n\nEl Dr. ${doctor.full_name} ya puede acceder al sistema.`
          : `✅ ¡Doctor deshabilitado exitosamente!\n\nEl Dr. ${doctor.full_name} ya no puede acceder al sistema.`;
        
        alert(successMessage);
        
      } catch (error) {
        console.error(`Error al ${action} doctor:`, error);
        
        // ❌ Mensaje de error mejorado
        const errorMessage = `❌ Error al ${action} doctor\n\nNo se pudo ${action} la cuenta del Dr. ${doctor.full_name}.\nPor favor, inténtalo de nuevo.`;
        alert(errorMessage);
      }
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'cards' ? 'table' : 'cards');
  };

  // ==========================================
  // UTILIDADES
  // ==========================================
  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Disponible
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <XCircleIcon className="h-3 w-3 mr-1" />
        No disponible
      </Badge>
    );
  };

  const formatWorkDays = (workDays: string[] | undefined | null) => {
    if (!workDays || !Array.isArray(workDays)) {
      return 'No especificado';
    }
    
    const dayNames: Record<string, string> = {
      'monday': 'Lun',
      'tuesday': 'Mar',
      'wednesday': 'Mié',
      'thursday': 'Jue',
      'friday': 'Vie',
      'saturday': 'Sáb',
      'sunday': 'Dom'
    };
    
    return workDays.map(day => dayNames[day] || day).join(', ');
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error al cargar los doctores</p>
            <Button onClick={() => refetch()} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctores</h1>
          <p className="text-gray-600 mt-1">
            {doctorsResponse?.count || 0} doctores registrados
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Toggle de Vista */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-2 ${
                viewMode === 'cards' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
              <span>Tarjetas</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-2 ${
                viewMode === 'table' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableCellsIcon className="h-4 w-4" />
              <span>Tabla</span>
            </Button>
          </div>

          {/* Botón Crear Doctor */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Crear Doctor</span>
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre o especialización..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Botón de filtros */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtros</span>
            </Button>

            {/* Limpiar filtros */}
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-600"
              >
                Limpiar
              </Button>
            )}
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro por especialización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialización
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Cardiología"
                  value={filters.specialization || ''}
                  onChange={(e) => updateFilters({ specialization: e.target.value || undefined })}
                />
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ 
                    status: e.target.value || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="disabled">Inhabilitados</option>
                </select>
              </div>

              {/* Filtro por disponibilidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidad
                </label>
                <select
                  value={filters.is_available?.toString() || ''}
                  onChange={(e) => updateFilters({ 
                    is_available: e.target.value ? e.target.value === 'true' : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Disponibles</option>
                  <option value="false">No disponibles</option>
                </select>
              </div>

              {/* Filtro por experiencia mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiencia mínima (años)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Ej: 5"
                  value={filters.min_experience || ''}
                  onChange={(e) => updateFilters({ 
                    min_experience: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista de Doctores */}
      {viewMode === 'cards' ? (
        /* Vista Tarjetas */
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorsResponse?.results.map((doctor) => (
              <DoctorCard 
                 key={doctor.id} 
                 doctor={doctor}
                 onDisable={handleDisableDoctor}
                 onRefresh={refetch}
               />
            ))}
          </div>
        )
      ) : (
        /* Vista Tabla */
        <DoctorTable 
          doctors={doctorsResponse?.results || []} 
          isLoading={isLoading}
        />
      )}

      {/* Estado vacío */}
      {!isLoading && doctorsResponse?.results.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron doctores
            </h3>
            <p className="text-gray-600">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay doctores registrados en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Modal de Creación de Doctor */}
      <DoctorCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch(); // Recargar la lista después de crear
        }}
      />
    </AdminLayout>
  );
};

export default DoctorList;

// 📋 EXPLICACIÓN:
// 
// 🎯 Funcionalidades implementadas:
// 1. Lista completa de doctores con información básica
// 2. Búsqueda por nombre o especialización
// 3. Filtros por especialización, disponibilidad y experiencia
// 4. Diseño responsive con cards
// 5. Estados de carga y error
// 6. Badges de disponibilidad
// 7. Información detallada de cada doctor
// 
// 🔧 Características técnicas:
// - Integración con doctorService
// - React Query para cache y estados
// - Filtros reactivos
// - UI accesible con Heroicons
// - Responsive design
// 
// 🚀 Próximos pasos:
// 1. Implementar navegación al perfil del doctor
// 2. Agregar paginación
// 3. Crear DoctorProfile.tsx
// 4. Agregar más filtros avanzados