// 🏥 Componente DoctorCard - Vista Tarjeta Simplificada

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/Badge';
import { 
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import type { Doctor } from '../../types';
import { DoctorProfileModal } from './DoctorProfileModal';
import { DoctorEditModal } from './DoctorEditModal';

/**
 * 🎯 OBJETIVO: Tarjeta simplificada de doctor con información esencial y acciones
 * 
 * 💡 CONCEPTO: Muestra solo:
 * - Información básica (nombre, especialización)
 * - Tarifa de consulta
 * - Años de experiencia
 * - Horarios y días de atención
 * - Estado de disponibilidad (posición fija)
 * - Acciones: Ver perfil, Editar perfil, Deshabilitar cuenta
 */

interface DoctorCardProps {
  doctor: Doctor;
  onEdit?: (doctor: Doctor) => void;
  onDisable?: (doctor: Doctor) => void;
  onRefresh?: () => void; // Callback para refrescar la lista después de editar
}

const DoctorCard: React.FC<DoctorCardProps> = ({ 
  doctor, 
  onEdit, 
  onDisable,
  onRefresh 
}) => {
  const navigate = useNavigate();
  
  // Estados para los modales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ==========================================
  // UTILIDADES
  // ==========================================
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

  const getAvailabilityBadge = () => {
    // Badge basado en disponibilidad (is_available)
    const isAvailable = doctor.is_available;
    const variant = isAvailable ? 'success' : 'error';
    const badgeText = isAvailable ? 'Disponible' : 'No disponible';
    
    return (
      <Badge 
        variant={variant}
        className="font-medium"
      >
        {badgeText}
      </Badge>
    );
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleViewProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  // Handlers para los modales
  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // Refrescar la lista si hay callback
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDisableAccount = () => {
    console.log('🔴 DEBUG - Botón Deshabilitar clickeado');
    console.log('🔴 Doctor completo:', doctor);
    console.log('🔴 Doctor ID:', doctor.id);
    console.log('🔴 Doctor nombre:', doctor.full_name);
    console.log('🔴 Doctor status actual:', doctor.status);
    console.log('🔴 onDisable prop existe:', !!onDisable);
    
    if (onDisable) {
      console.log('🔴 Ejecutando onDisable prop...');
      onDisable(doctor);
    } else {
      console.log('🔴 No hay onDisable prop, usando fallback');
      console.log('🔴 Deshabilitar cuenta de:', doctor.full_name);
    }
  };

  return (
    <>
    <Card className={`hover:shadow-lg transition-all duration-200 relative ${doctor.status === 'disabled' ? 'opacity-75' : ''}`}>
      {/* Badge de disponibilidad en posición fija */}
      <div className="absolute top-4 right-4 z-10">
        {getAvailabilityBadge()}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          
          {/* Información básica */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {doctor.full_name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {doctor.specialization}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Tarifa */}
        <div className="flex items-center text-sm text-gray-700">
          <CurrencyDollarIcon className="h-4 w-4 mr-2 text-green-600" />
          <span className="font-medium">${doctor.consultation_fee}</span>
          <span className="text-gray-500 ml-1">por consulta</span>
        </div>

        {/* Experiencia */}
        <div className="flex items-center text-sm text-gray-700">
          <ClockIcon className="h-4 w-4 mr-2 text-blue-600" />
          <span>{doctor.years_experience} años de experiencia</span>
        </div>

        {/* Días de trabajo */}
        <div className="flex items-center text-sm text-gray-700">
          <CalendarIcon className="h-4 w-4 mr-2 text-purple-600" />
          <span>{formatWorkDays(doctor.work_days)}</span>
        </div>

        {/* Horario de trabajo */}
        <div className="text-sm text-gray-700 pl-6">
          <span className="font-medium">
            {doctor.work_start_time && doctor.work_end_time 
              ? `${doctor.work_start_time} - ${doctor.work_end_time}`
              : 'No especificado'
            }
          </span>
        </div>

        {/* Estado de cuenta */}
        <div className="flex items-center text-sm text-gray-700">
          <div className="h-4 w-4 mr-2 flex items-center justify-center">
            <div 
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: doctor.status_color || '#10b981' }}
            />
          </div>
          <span className="font-medium">
            Estado: {doctor.status_display || doctor.status}
          </span>
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t space-y-2">
          {/* Ver perfil - Acción principal */}
          <Button
            variant="default"
            size="sm"
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleViewProfile}
          >
            <EyeIcon className="h-4 w-4" />
            <span>Ver perfil</span>
          </Button>

          {/* Acciones secundarias */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center space-x-1 text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={handleEditProfile}
              disabled={doctor.status === 'disabled'}
            >
              <PencilIcon className="h-3 w-3" />
              <span>Editar</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center justify-center space-x-1 border-red-300 hover:bg-red-50 ${
                doctor.status === 'disabled' 
                  ? 'text-green-600 border-green-300 hover:bg-green-50' 
                  : 'text-red-600'
              }`}
              onClick={handleDisableAccount}
            >
              <UserMinusIcon className="h-3 w-3" />
              <span>
                {doctor.status === 'disabled' ? 'Habilitar' : 'Deshabilitar'}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Modal de Ver Perfil */}
    <DoctorProfileModal
      isOpen={isProfileModalOpen}
      onClose={handleProfileModalClose}
      doctorId={doctor.id}
    />
    
    {/* Modal de Editar */}
    <DoctorEditModal
      isOpen={isEditModalOpen}
      onClose={handleEditModalClose}
      onSuccess={handleEditSuccess}
      doctor={doctor}
    />
    </>
  );
};

export default DoctorCard;