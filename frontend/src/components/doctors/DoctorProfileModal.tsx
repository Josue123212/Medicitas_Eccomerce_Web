// 🏥 Modal de Perfil de Doctor - Vista Detallada

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, User, Stethoscope, Clock, DollarSign, Calendar, Phone, Mail, MapPin, Star, CheckCircle, XCircle } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import type { Doctor } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/button';
import LoadingSpinner from '../ui/LoadingSpinner';

// 🎯 OBJETIVO: Modal para mostrar el perfil completo del doctor
// 💡 CONCEPTO: Vista detallada en modal con toda la información profesional y personal

// ==========================================
// INTERFACES
// ==========================================

interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  onEdit?: (doctor: Doctor) => void;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  onEdit
}) => {
  // ==========================================
  // QUERIES
  // ==========================================
  const { 
    data: doctor, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorService.getDoctorDetail(doctorId),
    enabled: isOpen && !!doctorId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleEditClick = () => {
    if (doctor && onEdit) {
      onEdit(doctor);
    }
  };

  // ==========================================
  // UTILIDADES
  // ==========================================
  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Disponible
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        No disponible
      </Badge>
    );
  };

  const formatWorkDays = (workDays: string[] | undefined | null) => {
    if (!workDays || !Array.isArray(workDays)) {
      return 'No especificado';
    }
    
    const dayNames: Record<string, string> = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    
    return workDays.map(day => dayNames[day] || day).join(', ');
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Perfil del Doctor
              </h2>
              <p className="text-sm text-gray-600">
                Información detallada del profesional
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <XCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Error al cargar el perfil</p>
                <p className="text-sm text-gray-600">
                  No se pudo obtener la información del doctor
                </p>
              </div>
            </div>
          ) : doctor ? (
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {doctor.full_name}
                      </h3>
                      <p className="text-lg text-blue-600 font-medium">
                        {doctor.specialization}
                      </p>
                      <div className="mt-2">
                        {getAvailabilityBadge(doctor.is_available)}
                      </div>
                    </div>
                  </div>
                  
                  {onEdit && (
                    <Button
                      onClick={handleEditClick}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Stethoscope className="h-4 w-4" />
                      <span>Editar</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Grid de Información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Profesional */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                    Información Profesional
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Licencia Médica</label>
                      <p className="text-gray-900 font-mono">{doctor.medical_license}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Años de Experiencia</label>
                      <p className="text-gray-900">{doctor.years_experience} años</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tarifa de Consulta</label>
                      <p className="text-gray-900 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        ${doctor.consultation_fee}
                      </p>
                    </div>
                    
                    {doctor.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Biografía</label>
                        <p className="text-gray-900 text-sm leading-relaxed">{doctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-green-600" />
                    Información de Contacto
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{doctor.user?.email || 'No especificado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Teléfono</label>
                        <p className="text-gray-900">{doctor.user?.phone || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horario de Trabajo */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    Horario de Trabajo
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Días de Trabajo</label>
                      <p className="text-gray-900">{formatWorkDays(doctor.work_days)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Horario</label>
                      <p className="text-gray-900">
                        {doctor.work_start_time && doctor.work_end_time 
                          ? `${doctor.work_start_time} - ${doctor.work_end_time}`
                          : 'No especificado'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estado de la Cuenta */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-600" />
                    Estado de la Cuenta
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: doctor.status_color || '#10b981' }}
                        />
                        <span className="text-gray-900 font-medium">
                          {doctor.status_display || doctor.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Registro</label>
                      <p className="text-gray-900">
                        {doctor.created_at 
                          ? new Date(doctor.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'No disponible'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileModal;

// 📋 EXPLICACIÓN:
// 
// 🎯 Funcionalidades implementadas:
// 1. Modal responsive con información completa del doctor
// 2. Carga de datos con React Query
// 3. Estados de carga y error
// 4. Información organizada en secciones
// 5. Badges de disponibilidad
// 6. Botón de edición opcional
// 
// 🔧 Características técnicas:
// - Integración con doctorService
// - React Query para cache y estados
// - UI accesible con Lucide icons
// - Responsive design
// - Manejo de errores
// 
// 🚀 Próximos pasos:
// 1. Integrar con DoctorCard
// 2. Crear DoctorEditModal
// 3. Agregar más estadísticas
// 4. Implementar acciones adicionales