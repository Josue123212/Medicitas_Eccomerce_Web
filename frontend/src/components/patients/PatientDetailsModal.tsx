// 🏥 Modal de Detalles de Paciente - Vista Detallada

import React, { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Clock,
  Users
} from 'lucide-react';
import { patientService, type Patient } from '../../services/patientService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import LoadingSpinner from '../ui/LoadingSpinner';

// 🎯 OBJETIVO: Modal para mostrar el perfil completo del paciente
// 💡 CONCEPTO: Vista detallada en modal con toda la información personal y médica

// ==========================================
// INTERFACES
// ==========================================

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number | null;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  patientId
}) => {
  // ==========================================
  // QUERIES
  // ==========================================
  const { 
    data: patient, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: isOpen && !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // ==========================================
  // MEMOIZED VALUES
  // ==========================================
  const patientAge = useMemo(() => {
    if (!patient?.date_of_birth) return 'No especificado';
    const today = new Date();
    const birthDate = parseISO(patient.date_of_birth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }, [patient?.date_of_birth]);

  const genderLabel = useMemo(() => {
    if (!patient?.gender) return 'No especificado';
    return patient.gender === 'M' ? 'Masculino' : 'Femenino';
  }, [patient?.gender]);

  const formattedBirthDate = useMemo(() => {
    if (!patient?.date_of_birth) return 'No especificado';
    return format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es });
  }, [patient?.date_of_birth]);

  const formattedCreatedAt = useMemo(() => {
    if (!patient?.created_at) return 'No especificado';
    return format(parseISO(patient.created_at), 'dd/MM/yyyy', { locale: es });
  }, [patient?.created_at]);

  const formattedLastAppointment = useMemo(() => {
    if (!patient?.last_appointment) return 'Sin citas previas';
    return format(parseISO(patient.last_appointment), 'dd/MM/yyyy', { locale: es });
  }, [patient?.last_appointment]);

  // ==========================================
  // CALLBACKS
  // ==========================================
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ==========================================
  // HELPERS
  // ==========================================
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success" className="flex items-center gap-1">
        <Activity className="h-3 w-3" />
        Activo
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <X className="h-3 w-3" />
        Inactivo
      </Badge>
    );
  };

  const getBloodTypeBadge = (bloodType: string) => {
    if (!bloodType) return <span className="text-gray-500">No especificado</span>;
    
    const colorMap: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-200 text-green-900',
    };

    return (
      <Badge className={`${colorMap[bloodType] || 'bg-gray-100 text-gray-800'}`}>
        <Heart className="h-3 w-3 mr-1" />
        {bloodType}
      </Badge>
    );
  };

  // ==========================================
  // RENDER CONDICIONAL
  // ==========================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles del Paciente
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Cargando información del paciente...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-800 font-medium">Error al cargar los datos</p>
              <p className="text-red-600 text-sm mt-1">
                No se pudo obtener la información del paciente
              </p>
            </div>
          )}

          {patient && (
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {patient.user?.first_name} {patient.user?.last_name}
                      </h3>
                      {getStatusBadge(patient.user?.is_active || false)}
                    </div>
                    <p className="text-gray-600 mb-4">
                      Paciente registrado desde {formattedCreatedAt}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Edad:</span>
                        <span className="font-medium">{patientAge} años</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Género:</span>
                        <span className="font-medium">{genderLabel}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información Personal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Datos Personales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Información Personal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-900">{patient.user?.email || 'No especificado'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-600">Teléfono</label>
                            <p className="text-gray-900">{patient.phone_number || 'No especificado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                            <p className="text-gray-900">{formattedBirthDate}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-600">Dirección</label>
                            <p className="text-gray-900">{patient.address || 'No especificada'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información Médica */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-600" />
                        Información Médica
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <label className="text-sm font-medium text-gray-600">Tipo de Sangre:</label>
                        {getBloodTypeBadge(patient.blood_type || '')}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Alergias
                          </label>
                          <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                            {patient.allergies || 'Sin alergias conocidas'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            Condiciones Médicas
                          </label>
                          <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                            {patient.medical_conditions || 'Sin condiciones médicas registradas'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            Medicamentos
                          </label>
                          <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                            {patient.medications || 'Sin medicamentos registrados'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contacto de Emergencia */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Contacto de Emergencia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nombre</label>
                          <p className="text-gray-900">{patient.emergency_contact_name || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Teléfono</label>
                          <p className="text-gray-900">{patient.emergency_contact_phone || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Relación</label>
                          <p className="text-gray-900">{patient.emergency_contact_relationship || 'No especificada'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar con Estadísticas */}
                <div className="space-y-6">
                  {/* Estadísticas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        Estadísticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {patient.total_appointments || 0}
                        </div>
                        <div className="text-sm text-blue-800">Citas Totales</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Última Cita:</span>
                          <span className="text-sm font-medium">{formattedLastAppointment}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Registrado:</span>
                          <span className="text-sm font-medium">{formattedCreatedAt}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acciones Rápidas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        Acciones Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Historial Médico
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver Citas
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Clock className="h-4 w-4 mr-2" />
                        Agendar Nueva Cita
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;

// 📋 EXPLICACIÓN:
// 
// 🎯 Funcionalidades implementadas:
// 1. Modal responsive con información completa del paciente
// 2. Carga de datos con React Query
// 3. Estados de carga y error
// 4. Información organizada en secciones (personal, médica, emergencia)
// 5. Badges informativos para estado y tipo de sangre
// 6. Botón de edición opcional
// 7. Estadísticas y acciones rápidas
// 
// 🔧 Características técnicas:
// - Integración con patientService
// - React Query para cache y estados
// - UI accesible con Lucide icons
// - Responsive design con grid layout
// - Manejo de errores
// - Memoización para optimización
// 
// 🚀 Próximos pasos:
// 1. Integrar con PatientList
// 2. Conectar acciones rápidas
// 3. Agregar más estadísticas
// 4. Implementar funcionalidad de edición