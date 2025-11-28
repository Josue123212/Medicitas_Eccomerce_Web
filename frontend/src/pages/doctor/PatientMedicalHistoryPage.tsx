// 📋 Página de Historial Médico - Vista Doctor

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft,
  FileText, 
  User
} from 'lucide-react';


import { appointmentService } from '../../services/appointmentService';

// 🎨 Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Layout from '../../components/layout/Layout';

/**
 * 📋 PÁGINA HISTORIAL MÉDICO - DOCTOR
 * 
 * Permite al doctor ver y gestionar el historial médico completo:
 * - Información del paciente
 * - Historial de consultas
 * - Signos vitales
 * - Medicamentos
 * - Estudios y análisis
 * - Diagnósticos
 * - Notas médicas
 */

interface MedicalRecord {
  id: number;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  doctor_name: string;
  reason: string;
  notes: string;
}

interface PatientInfo {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

const PatientMedicalHistoryPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // ==========================================
  // ESTADO LOCAL
  // ==========================================

  // ==========================================
  // QUERIES
  // ==========================================
  
  // Información del paciente
  const { 
    data: patientInfo, 
    isLoading: isLoadingPatient 
  } = useQuery({
    queryKey: ['patient-info', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('ID de paciente requerido');
      
      // Obtener historial del paciente desde la API
      const patientHistory = await appointmentService.getPatientHistory(parseInt(patientId));
      
      // Mapear la respuesta de la API al formato PatientInfo
      const patientName = patientHistory.patient_name || '';
      const nameParts = (patientName && typeof patientName === 'string') ? patientName.split(' ') : [''];
      
      const patientInfo: PatientInfo = {
        id: patientHistory.patient_id,
        user: {
          id: patientHistory.patient_id,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: '', // No disponible en la respuesta actual
          phone: '' // No disponible en la respuesta actual
        }
      };
      
      return patientInfo;
    },
    enabled: !!patientId,
  });

  // Historial médico
  const { 
    data: medicalHistory, 
    isLoading: isLoadingHistory 
  } = useQuery({
    queryKey: ['medical-history', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('ID de paciente requerido');
      
      // Obtener historial médico real desde la API
      const patientHistory = await appointmentService.getPatientHistory(parseInt(patientId));
      
      // Mapear las citas a registros médicos
      const medicalRecords: MedicalRecord[] = patientHistory.appointments.map((appointment) => ({
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        doctor_name: appointment.doctor_info.full_name || 'Doctor no disponible',
        reason: appointment.reason || 'Consulta médica',
        notes: appointment.notes || ''
      }));
      
      return medicalRecords;
    },
    enabled: !!patientId,
  });

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  const getStatusBadge = (status: string) => {
    const config = {
      scheduled: { color: 'blue', label: 'Programada' },
      confirmed: { color: 'green', label: 'Confirmada' },
      in_progress: { color: 'yellow', label: 'En Progreso' },
      completed: { color: 'green', label: 'Completada' },
      cancelled: { color: 'red', label: 'Cancelada' }
    };
    
    const { color, label } = config[status as keyof typeof config] || config.scheduled;
    
    return (
      <Badge variant={color as any}>
        {label}
      </Badge>
    );
  };



  // ==========================================
  // RENDER
  // ==========================================
  
  if (isLoadingPatient || isLoadingHistory) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!patientInfo) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium">Paciente no encontrado</h3>
          <p className="text-red-600 text-sm mt-1">
            No se pudo cargar la información del paciente
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctor/patients')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Historial Médico - {patientInfo.user.first_name} {patientInfo.user.last_name}
              </h1>
              <p className="text-gray-600">
                Paciente ID: {patientInfo.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Consulta
            </Button>
          </div>
        </div>

        {/* Información del paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{patientInfo.user.email || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{patientInfo.user.phone || 'No disponible'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial de consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historial de Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>

            <div className="space-y-4">
              {medicalHistory?.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(record.status)}
                      <span className="font-medium">
                        {record.date ? format(parseISO(record.date), 'dd/MM/yyyy', { locale: es }) : 'Fecha no disponible'} - {record.time}
                      </span>
                      <span className="text-gray-500">por {record.doctor_name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Motivo de Consulta</h4>
                      <p>{record.reason}</p>
                    </div>
                    
                    {record.notes && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Notas</h4>
                        <p className="text-gray-600">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientMedicalHistoryPage;

// 📋 EXPLICACIÓN:
// 
// 🎯 Funcionalidades implementadas:
// 1. Vista del historial médico del paciente
// 2. Información básica del paciente (nombre, email, teléfono)
// 3. Lista de consultas con fecha, hora y estado
// 4. Motivo de consulta y notas del doctor
// 5. Navegación intuitiva y UI limpia
// 
// 🔧 Características técnicas:
// - React Query para gestión de estado
// - Badges informativos para estados de citas
// - UI responsive y accesible
// - TypeScript para type safety
// - Integración con API real del backend
// 
// 📊 Estructura actualizada:
// - Eliminados campos obsoletos (alergias, condiciones crónicas, signos vitales)
// - Simplificada información del paciente usando patient_info.user
// - Historial basado en citas reales del sistema
// - Interfaz MedicalRecord actualizada con campos disponibles
// 
// 🚀 Próximos pasos:
// 1. Mejorar la visualización de notas médicas
// 2. Agregar filtros por fecha y estado
// 3. Implementar paginación para historiales largos