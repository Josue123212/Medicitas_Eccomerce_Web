// 🏥 Perfil de Paciente - Vista Detallada

import React, { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge
} from '../../components/ui';
import { 
  User, 
  Edit,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  Users
} from 'lucide-react';
import { patientService, type Patient } from '../../services/patientService';

/**
 * 🎯 OBJETIVO: Vista detallada del perfil de un paciente
 * 
 * 💡 CONCEPTO: Página que muestra:
 * - Información personal completa
 * - Datos médicos y de emergencia
 * - Estadísticas de citas
 * - Historial médico básico
 * - Acciones de edición
 */

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 🎯 Memoizar el patientId para evitar recálculos
  const patientId = useMemo(() => parseInt(id || '0'), [id]);

  // 🔄 Query para obtener datos del paciente
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: !!patientId
  });

  // ==========================================
  // FUNCIONES HELPER MEMOIZADAS
  // ==========================================

  const handleEdit = useCallback(() => {
    navigate(`/admin/patients/${patientId}/edit`);
  }, [navigate, patientId]);

  const handleBack = useCallback(() => {
    navigate('/admin/patients');
  }, [navigate]);

  const calculateAge = useCallback((birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }, []);

  const getGenderLabel = useCallback((gender: string): string => {
    switch (gender) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return 'No especificado';
    }
  }, []);

  // ==========================================
  // VALORES MEMOIZADOS
  // ==========================================

  // 🎯 Memoizar cálculos costosos para evitar re-renders
  const patientAge = useMemo(() => {
    if (!patient?.date_of_birth) return 0;
    return calculateAge(patient.date_of_birth);
  }, [patient?.date_of_birth, calculateAge]);

  const genderLabel = useMemo(() => {
    if (!patient?.gender) return 'No especificado';
    return getGenderLabel(patient.gender);
  }, [patient?.gender, getGenderLabel]);

  const formattedBirthDate = useMemo(() => {
    if (!patient?.date_of_birth) return '';
    return format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es });
  }, [patient?.date_of_birth]);

  const formattedLastAppointment = useMemo(() => {
    if (!patient?.last_appointment) return null;
    return format(parseISO(patient.last_appointment), 'dd/MM/yyyy', { locale: es });
  }, [patient?.last_appointment]);

  const formattedCreatedAt = useMemo(() => {
    if (!patient?.created_at) return '';
    return format(parseISO(patient.created_at), 'dd/MM/yyyy', { locale: es });
  }, [patient?.created_at]);

  // ==========================================
  // ESTADOS DE CARGA Y ERROR
  // ==========================================

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del paciente...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !patient) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar paciente
            </h3>
            <p className="text-gray-600 mb-4">
              No se pudo cargar la información del paciente.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.user.first_name} {patient.user.last_name}
              </h1>
              <p className="text-gray-600">
                Perfil del Paciente
              </p>
            </div>
          </div>
          
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Paciente
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos Básicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-gray-900 font-medium">
                      {patient.user?.first_name || ''} {patient.user?.last_name || ''}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{patient.user?.email || 'Email no disponible'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{patient.phone_number}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {formattedBirthDate}
                        <span className="text-gray-500 ml-2">
                          ({patientAge} años)
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Género</label>
                    <p className="text-gray-900">{genderLabel}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dirección</label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{patient.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Médica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Información Médica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Sangre</label>
                    <p className="text-gray-900 font-medium">
                      {patient.blood_type || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Activo
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Alergias</label>
                  <p className="text-gray-900 mt-1">
                    {patient.allergies || 'Sin alergias conocidas'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Condiciones Médicas</label>
                  <p className="text-gray-900 mt-1">
                    {patient.medical_conditions || 'Sin condiciones médicas registradas'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Medicamentos Actuales</label>
                  <p className="text-gray-900 mt-1">
                    {patient.medications || 'Sin medicamentos registrados'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contacto de Emergencia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Contacto de Emergencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-gray-900">
                      {patient.emergency_contact_name || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-gray-900">
                      {patient.emergency_contact_phone || 'No especificado'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Relación</label>
                    <p className="text-gray-900">
                      {patient.emergency_contact_relationship || 'No especificado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con estadísticas */}
          <div className="space-y-6">
            {/* Estadísticas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {patient.total_appointments || 0}
                  </div>
                  <div className="text-sm text-blue-600">Total de Citas</div>
                </div>
                
                {formattedLastAppointment && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-600">Última Cita</div>
                    <div className="text-sm text-green-600">
                      {formattedLastAppointment}
                    </div>
                  </div>
                )}
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Registrado</div>
                  <div className="text-sm text-gray-600">
                    {formattedCreatedAt}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/admin/patients/${patientId}/history`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Historial Médico
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/admin/patients/${patientId}/appointments`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Citas
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/admin/appointments/new?patient=${patientId}`)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PatientProfile;