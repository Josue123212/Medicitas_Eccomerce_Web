// 🏥 Lista de Pacientes - Gestión Administrativa

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Badge
} from '../../components/ui';
import { 
  User, 
  Search,
  Filter,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Plus,
  Clock,
  Trash2,
  UserX,
  UserCheck
} from 'lucide-react';
import { patientService, type Patient, type PatientListItem, type PatientFilters } from '../../services/patientService';
import DisablePatientModal from '../../components/patients/DisablePatientModal';
import PatientDetailsModal from '../../components/patients/PatientDetailsModal';


/**
 * 🎯 OBJETIVO: Lista completa de pacientes con gestión administrativa
 * 
 * 💡 CONCEPTO: Página de gestión que permite:
 * - Ver todos los pacientes del sistema
 * - Filtrar por estado, género, etc.
 * - Buscar por nombre o email
 * - Ver información médica básica
 * - Acceder al historial completo
 */

interface LocalPatientFilters {
  search: string;
  gender: string;
}

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LocalPatientFilters>({
    search: '',
    gender: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  // 🚫 Estado para modal de deshabilitar
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [patientToDisable, setPatientToDisable] = useState<PatientListItem | null>(null);
  
  // 👁️ Estado para modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // 🔄 Query para obtener pacientes
  const { data: patientsData, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      const apiFilters: PatientFilters = {
        search: filters.search,
        gender: filters.gender
      };
      return patientService.getPatients(apiFilters);
    }
  });

  // Extraer datos de la respuesta paginada
  const patients = patientsData?.results || [];
  const totalPatients = patientsData?.count || 0;

  // ==========================================
  // FUNCIONES HELPER
  // ==========================================

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleViewPatient = (patientId: number) => {
    setSelectedPatientId(patientId);
    setShowDetailsModal(true);
  };



  const handleDisablePatient = (patient: PatientListItem) => {
    setPatientToDisable(patient);
    setShowDisableModal(true);
  };

  const handleCloseDisableModal = () => {
    setShowDisableModal(false);
    setPatientToDisable(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPatientId(null);
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
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar pacientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Hubo un problema al cargar la lista de pacientes.
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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
            <p className="text-gray-600">
              Administra y visualiza todos los pacientes del sistema
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
          </div>
        </div>

        {/* 🔍 Barra de búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Búsqueda Rápida
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  <p className="text-sm text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalPatients}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hombres</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {patients.filter(p => p.gender === 'M').length}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mujeres</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {patients.filter(p => p.gender === 'F').length}
                  </p>
                </div>
                <User className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nuevos Este Mes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {patients.filter(p => {
                      const createdDate = parseISO(p.created_at);
                      const now = new Date();
                      return createdDate.getMonth() === now.getMonth() && 
                             createdDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Plus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 📋 Lista de pacientes */}
        <div className="space-y-4">
          {patients.length > 0 ? (
            patients.map((patient) => {
              const genderBadge = patientService.getGenderBadge(patient.gender);
              
              return (
                <div key={patient.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Información principal */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.full_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${genderBadge.color}`}>
                            {genderBadge.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {patient.is_active ? 'Activo' : 'Deshabilitado'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {patient.age} años
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Información de contacto */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              Contacto
                            </h4>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 flex items-center">
                                <Mail className="h-3 w-3 mr-2" />
                                {patient.email}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="h-3 w-3 mr-2" />
                                {patientService.formatPhone(patient.phone_number)}
                              </p>
                            </div>
                          </div>

                          {/* Información adicional */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Registro
                            </h4>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Registrado:</span> {patientService.formatDate(patient.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleViewPatient(patient.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDisablePatient(patient)}
                          className={`p-2 rounded-lg transition-colors ${
                            patient.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={patient.is_active ? 'Deshabilitar paciente' : 'Habilitar paciente'}
                        >
                          {patient.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron pacientes que coincidan con los filtros aplicados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🚫 Modal de deshabilitar/habilitar */}
      <DisablePatientModal
        isOpen={showDisableModal}
        onClose={handleCloseDisableModal}
        patient={patientToDisable}
        onSuccess={() => {
          refetch();
          handleCloseDisableModal();
        }}
      />

      {/* 👁️ Modal de detalles del paciente */}
      {selectedPatientId && (
        <PatientDetailsModal
          isOpen={showDetailsModal}
          onClose={handleCloseDetailsModal}
          patientId={selectedPatientId}
        />
      )}
    </AdminLayout>
  );
};

export default PatientList;