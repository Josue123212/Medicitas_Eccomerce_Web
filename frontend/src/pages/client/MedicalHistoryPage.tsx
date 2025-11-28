// 🏥 Página de Historial Médico del Cliente
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar,
  Clock, 
  User, 
  FileText, 
  Pill, 
  AlertTriangle, 
  TrendingUp, 
  Filter, 
  Download, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  CalendarPlus
} from 'lucide-react';

import { appointmentService } from '../../services/appointmentService';
import { dashboardService } from '../../services/dashboardService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment, ExtendedPatientAppointmentHistory, MedicalHistoryAppointment } from '../../types/appointment';

// 🎨 Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Layout from '../../components/layout/Layout';
import FloatingPharmacyCartCTA from '../../components/pharmacy/FloatingPharmacyCartCTA';

/**
 * 🏥 PÁGINA HISTORIAL MÉDICO - CLIENTE
 * 
 * Permite al cliente ver su historial médico completo:
 * - Estadísticas de salud
 * - Historial de citas
 * - Diagnósticos y tratamientos
 * - Medicamentos prescritos
 * - Exportar historial
 */
const MedicalHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');



  // 📊 Consulta del historial médico
  const { 
    data: medicalHistory, 
    isLoading: isLoadingHistory, 
    error: historyError 
  } = useQuery({
    queryKey: ['medical-history', user?.patient_profile_id, selectedYear, selectedSpecialty],
    queryFn: () => {
      if (!user?.patient_profile_id) throw new Error('Perfil de paciente no encontrado');
      return appointmentService.getPatientHistory(user.patient_profile_id, {
        date_from: selectedYear ? `${selectedYear}-01-01` : undefined,
        date_to: selectedYear ? `${selectedYear}-12-31` : undefined,
      });
    },
    enabled: !!user?.patient_profile_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 📈 Consulta de datos del dashboard
  const { 
    isLoading: isLoadingDashboard 
  } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: dashboardService.getClientDashboard,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // 🏥 Consulta de especialidades disponibles
  const { 
    data: specializations, 
    isLoading: isLoadingSpecializations 
  } = useQuery({
    queryKey: ['specializations'],
    queryFn: doctorService.getSpecializations,
    staleTime: 30 * 60 * 1000, // 30 minutos (las especialidades no cambian frecuentemente)
  });

  // 🎯 Handlers
  const handleExportHistory = () => {
    // TODO: Implementar exportación de historial
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedSpecialty('');
  };

  // 🔄 Estados de carga
  if (isLoadingHistory || isLoadingDashboard || isLoadingSpecializations) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
          <span className="ml-2">Cargando historial médico...</span>
        </div>
      </Layout>
    );
  }

  if (historyError) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--error)' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Error al cargar historial</h2>
            <p style={{ color: 'var(--text-secondary)' }}>No se pudo cargar el historial médico.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 🔍 Filtrar citas por término de búsqueda
  const filteredAppointments = medicalHistory?.data?.appointments?.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.doctor_name?.toLowerCase().includes(searchLower) ||
      appointment.specialty?.toLowerCase().includes(searchLower) ||
      appointment.diagnosis?.toLowerCase().includes(searchLower) ||
      appointment.treatment?.toLowerCase().includes(searchLower)
    );
  }) || [];



  return (
    <Layout>
      <div className="space-y-6">
      {/* 📋 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Historial Médico</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tu historial médico completo</p>
        </div>
        <Button onClick={handleExportHistory} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Historial
        </Button>
      </div>

      {/* 🔍 Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Buscar en historial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Año */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{ 
                border: '1px solid var(--border)', 
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                focusRingColor: 'var(--primary)'
              }}
            >
              <option value="">Todos los años</option>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                );
              })}
            </select>

            {/* Especialidad */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{ 
                border: '1px solid var(--border)', 
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                focusRingColor: 'var(--primary)'
              }}
            >
              <option value="">Todas las especialidades</option>
              {specializations?.data?.specializations?.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            {/* Limpiar filtros */}
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Historial de Citas */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No hay registros</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {(medicalHistory?.data?.appointments?.length || 0) === 0 
                ? 'Aún no tienes historial médico.' 
                : 'No se encontraron registros con los filtros aplicados.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
         <div className="space-y-4">
           {filteredAppointments.map((appointment) => {
             const appointmentDate = appointment.date ? parseISO(appointment.date) : new Date();
                const createdDate = appointment.created_at ? parseISO(appointment.created_at) : new Date();
                const updatedDate = appointment.updated_at ? parseISO(appointment.updated_at) : new Date();
             
             // Determinar el ícono del estado
             const getStatusIcon = (status: string) => {
               switch (status) {
                 case 'completed':
                   return <CheckCircle className="h-4 w-4 text-green-600" />;
                 case 'cancelled':
                   return <XCircle className="h-4 w-4 text-red-600" />;
                 case 'confirmed':
                   return <CheckCircle className="h-4 w-4 text-blue-600" />;
                 case 'scheduled':
                   return <Clock3 className="h-4 w-4 text-yellow-600" />;
                 case 'no_show':
                   return <AlertCircle className="h-4 w-4 text-orange-600" />;
                 default:
                   return <Clock3 className="h-4 w-4 text-gray-600" />;
               }
             };

             return (
               <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                 {/* Header con Doctor y Estado */}
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center space-x-3">
                     <User className="h-5 w-5 text-gray-400" />
                     <div>
                       <h3 className="font-semibold text-gray-900">
                         {appointment.doctor_info?.full_name || appointment.doctor_name || 'Dr. N/A'}
                       </h3>
                       <p className="text-sm text-gray-600">{appointment.doctor_info?.specialization || 'Especialización no disponible'}</p>
                     </div>
                   </div>
                   
                   {/* Badge de Estado Mejorado */}
                   <div className="flex items-center space-x-2">
                     {getStatusIcon(appointment.status)}
                     <span 
                       className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status_color}`}
                     >
                       {appointment.status_display}
                     </span>
                   </div>
                 </div>

                 {/* Información de Fechas y Horas */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   {/* Fecha y Hora de la Cita */}
                   <div className="flex items-center space-x-2">
                     <Calendar className="h-4 w-4 text-blue-500" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Fecha de Cita</p>
                       <p className="text-sm text-gray-600">
                         {appointmentDate.toLocaleDateString('es-ES', {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                         })}
                       </p>
                     </div>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Clock className="h-4 w-4 text-blue-500" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Hora</p>
                       <p className="text-sm text-gray-600">
                         {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('es-ES', {
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </p>
                     </div>
                   </div>

                   {/* Fecha de Creación */}
                   <div className="flex items-center space-x-2">
                     <CalendarPlus className="h-4 w-4 text-green-500" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Agendada</p>
                       <p className="text-sm text-gray-600">
                         {createdDate.toLocaleDateString('es-ES')} a las{' '}
                         {createdDate.toLocaleTimeString('es-ES', {
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </p>
                     </div>
                   </div>

                   {/* Fecha de Última Actualización */}
                   {appointment.created_at !== appointment.updated_at && (
                     <div className="flex items-center space-x-2">
                       <Clock3 className="h-4 w-4 text-orange-500" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">
                           {appointment.status === 'cancelled' ? 'Cancelada' : 
                            appointment.status === 'completed' ? 'Completada' : 
                            appointment.status === 'confirmed' ? 'Confirmada' : 'Actualizada'}
                         </p>
                         <p className="text-sm text-gray-600">
                           {updatedDate.toLocaleDateString('es-ES')} a las{' '}
                           {updatedDate.toLocaleTimeString('es-ES', {
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </p>
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Detalles Médicos */}
                 <div className="space-y-3">
                   {/* Diagnóstico */}
                   {appointment.diagnosis && (
                     <div className="flex items-start space-x-2">
                       <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Diagnóstico</p>
                         <p className="text-sm text-gray-600">{appointment.diagnosis}</p>
                       </div>
                     </div>
                   )}

                   {/* Tratamiento */}
                   {appointment.treatment && (
                     <div className="flex items-start space-x-2">
                       <TrendingUp className="h-4 w-4 text-gray-400 mt-0.5" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Tratamiento</p>
                         <p className="text-sm text-gray-600">{appointment.treatment}</p>
                       </div>
                     </div>
                   )}

                   {/* Medicamentos */}
                   {appointment.medications && appointment.medications.length > 0 && (
                     <div className="flex items-start space-x-2">
                       <Pill className="h-4 w-4 text-gray-400 mt-0.5" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Medicamentos</p>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {appointment.medications.map((medication, index) => (
                             <span 
                               key={index}
                               className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                             >
                               {medication}
                             </span>
                           ))}
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Notas */}
                   {appointment.notes && (
                     <div className="flex items-start space-x-2">
                       <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Notas</p>
                         <p className="text-sm text-gray-600">{appointment.notes}</p>
                       </div>
                     </div>
                   )}

                   {/* Motivo de la Cita */}
                   {appointment.reason && (
                     <div className="flex items-start space-x-2">
                       <AlertTriangle className="h-4 w-4 text-gray-400 mt-0.5" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Motivo de Consulta</p>
                         <p className="text-sm text-gray-600">{appointment.reason}</p>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             );
           })}
         </div>
       )}

      {/* 📊 Resumen del Año */}
      {medicalHistory?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen del Año {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{medicalHistory.summary.total_visits}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Visitas Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{medicalHistory.summary.preventive_care}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cuidado Preventivo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--info)' }}>{medicalHistory.summary.follow_ups}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Seguimientos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
      <FloatingPharmacyCartCTA />
    </Layout>
  );
};

export default MedicalHistoryPage;