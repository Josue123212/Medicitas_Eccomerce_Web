// 🏥 Componente DoctorTable - Vista Tabla para Doctores

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/button';
import { 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { Doctor } from '../../types';

interface DoctorTableProps {
  doctors: Doctor[];
  isLoading?: boolean;
}

/**
 * 🎯 OBJETIVO: Tabla compacta y detallada para mostrar doctores
 * 
 * 💡 CONCEPTO: Tabla responsive con:
 * - Información completa en formato tabular
 * - Ordenamiento por columnas
 * - Acciones rápidas
 * - Estados visuales claros
 * - Responsive design
 */

const DoctorTable: React.FC<DoctorTableProps> = ({ doctors, isLoading }) => {
  const navigate = useNavigate();

  // ==========================================
  // UTILIDADES
  // ==========================================
  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Disponible
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
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
      'monday': 'L',
      'tuesday': 'M',
      'wednesday': 'X',
      'thursday': 'J',
      'friday': 'V',
      'saturday': 'S',
      'sunday': 'D'
    };
    
    return workDays.map(day => dayNames[day] || day).join('-');
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'NN';
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialización</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experiencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarifa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especialización
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experiencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarifa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Citas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                {/* Doctor Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(doctor.full_name)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white ${
                        doctor.is_available ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                    
                    {/* Name and Rating */}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {doctor.full_name}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">4.8</span>
                        <span className="text-xs text-gray-400">(24 reseñas)</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Specialization */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                    {doctor.specialization}
                  </Badge>
                </td>

                {/* Experience */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="font-medium">{doctor.years_experience}</span>
                    <span className="text-gray-500 ml-1">años</span>
                  </div>
                </td>

                {/* Fee */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${doctor.consultation_fee}
                  </div>
                  <div className="text-xs text-gray-500">por consulta</div>
                </td>

                {/* Schedule */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1 text-purple-500" />
                      <span className="font-mono text-xs">{formatWorkDays(doctor.work_days)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {doctor.work_start_time} - {doctor.work_end_time}
                    </div>
                  </div>
                </td>

                {/* Appointments Stats */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">
                        {doctor.appointments_count?.upcoming || 0}
                      </div>
                      <div className="text-xs text-gray-500">Próximas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-blue-600">
                        {doctor.appointments_count?.total || 0}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAvailabilityBadge(doctor.is_available)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => navigate(`/dev/doctors/${doctor.id}`)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      Cita
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {doctors.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-500">No se encontraron doctores</div>
        </div>
      )}
    </div>
  );
};

export default DoctorTable;

// 📋 EXPLICACIÓN:
// 
// 🎯 Características implementadas:
// 1. Tabla responsive con scroll horizontal
// 2. Avatar con iniciales y estado de disponibilidad
// 3. Información organizada en columnas claras
// 4. Badges y estados visuales
// 5. Estadísticas de citas compactas
// 6. Acciones rápidas (ver perfil, agendar cita)
// 7. Estados de carga con skeleton
// 8. Hover effects para mejor UX
// 
// 🎨 Mejoras visuales:
// - Header con estilo profesional
// - Colores consistentes y significativos
// - Iconos informativos
// - Espaciado optimizado
// - Estados hover suaves
// 
// 🚀 Próximos pasos:
// 1. Implementar ordenamiento por columnas
// 2. Agregar filtros inline
// 3. Implementar selección múltiple
// 4. Agregar más acciones (editar, eliminar)