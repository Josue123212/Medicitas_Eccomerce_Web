// 🏥 Perfil de Doctor - Vista Detallada

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../../services';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/Badge';
import { 
  UserIcon, 
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';

/**
 * 🎯 OBJETIVO: Perfil completo de doctor con toda su información
 * 
 * 💡 CONCEPTO: Página de detalle que muestra:
 * - Información personal y profesional
 * - Horarios de trabajo
 * - Estadísticas y experiencia
 * - Disponibilidad actual
 * - Opción para agendar cita
 */

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');

  // ==========================================
  // QUERIES
  // ==========================================
  const { 
    data: doctor, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorService.getDoctorDetail(parseInt(id!)),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para horarios (opcional)
  const { 
    data: schedule 
  } = useQuery({
    queryKey: ['doctor-schedule', id, selectedDate],
    queryFn: () => doctorService.getDoctorSchedule(parseInt(id!), selectedDate),
    enabled: !!id && !!selectedDate,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleScheduleAppointment = () => {
    // TODO: Navegar al formulario de cita
    console.log('Agendar cita con doctor:', doctor?.id);
  };

  // ==========================================
  // UTILIDADES
  // ==========================================
  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircleIcon className="h-4 w-4 mr-1" />
        Disponible
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <XCircleIcon className="h-4 w-4 mr-1" />
        No disponible
      </Badge>
    );
  };

  const formatWorkDays = (workDays: string[] | undefined | null) => {
    if (!workDays || !Array.isArray(workDays)) {
      return ['No especificado'];
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
    
    return workDays.map(day => dayNames[day] || day);
  };

  const getExperienceLevel = (years: number) => {
    if (years < 2) return { level: 'Junior', color: 'bg-blue-100 text-blue-800' };
    if (years < 5) return { level: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' };
    if (years < 10) return { level: 'Senior', color: 'bg-green-100 text-green-800' };
    return { level: 'Experto', color: 'bg-purple-100 text-purple-800' };
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading) {
    return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
    );
  }

  if (error || !doctor) {
    return (
      <AdminLayout>
        <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Error al cargar el perfil del doctor</p>
            <Button onClick={handleBackClick}>
              Volver
            </Button>
          </CardContent>
        </Card>
        </div>
      </AdminLayout>
    );
  }

  const experienceInfo = getExperienceLevel(doctor.years_experience);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Volver</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {doctor.full_name}
          </h1>
          <p className="text-gray-600">{doctor.specialization}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Información del doctor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información del Doctor</span>
                {getAvailabilityBadge(doctor.is_available)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar y datos básicos */}
              <div className="flex items-start space-x-4">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {doctor.full_name}
                  </h3>
                  <p className="text-gray-600 mb-2">{doctor.specialization}</p>
                  
                  {/* Contacto */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <span>{doctor.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biografía */}
              {doctor.bio && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Biografía</h4>
                  <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experiencia y credenciales */}
          <Card>
            <CardHeader>
              <CardTitle>Experiencia y Credenciales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Años de experiencia */}
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{doctor.years_experience} años de experiencia</p>
                    <Badge className={experienceInfo.color}>
                      {experienceInfo.level}
                    </Badge>
                  </div>
                </div>

                {/* Licencia médica */}
                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Licencia Médica</p>
                    <p className="text-sm text-gray-600">{doctor.medical_license}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horarios de trabajo */}
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Días de trabajo */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Días de atención</h4>
                <div className="flex flex-wrap gap-2">
                  {formatWorkDays(doctor.work_days).map((day) => (
                    <Badge key={day} variant="outline">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Horario */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Horario</h4>
                <div className="flex items-center space-x-2 text-gray-700">
                  <ClockIcon className="h-4 w-4" />
                  <span>{doctor.work_start_time} - {doctor.work_end_time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Acciones y información adicional */}
        <div className="space-y-6">
          {/* Tarifa y acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Consulta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tarifa */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-600">
                  <CurrencyDollarIcon className="h-6 w-6" />
                  <span>{doctor.consultation_fee}</span>
                </div>
                <p className="text-sm text-gray-600">por consulta</p>
              </div>

              {/* Botón de agendar */}
              <Button
                onClick={handleScheduleAppointment}
                disabled={!doctor.is_available}
                className="w-full"
                size="lg"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {doctor.is_available ? 'Agendar Cita' : 'No Disponible'}
              </Button>

              {!doctor.is_available && (
                <p className="text-sm text-gray-500 text-center">
                  El doctor no está disponible actualmente
                </p>
              )}
            </CardContent>
          </Card>

          {/* Verificar disponibilidad */}
          <Card>
            <CardHeader>
              <CardTitle>Verificar Disponibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {schedule && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Horarios disponibles
                  </h4>
                  {schedule.available_slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {schedule.available_slots.slice(0, 6).map((slot, index) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {slot.start_time}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay horarios disponibles para esta fecha
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disponibilidad</span>
                {getAvailabilityBadge(doctor.is_available)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Especialización</span>
                <Badge variant="outline">{doctor.specialization}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Experiencia</span>
                <Badge className={experienceInfo.color}>
                  {experienceInfo.level}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default DoctorProfile;

// 📋 EXPLICACIÓN:
// 
// 🎯 Funcionalidades implementadas:
// 1. Perfil completo del doctor con toda su información
// 2. Información personal y profesional detallada
// 3. Horarios de trabajo y disponibilidad
// 4. Verificación de horarios disponibles por fecha
// 5. Botón para agendar cita
// 6. Navegación de regreso
// 7. Estados de carga y error
// 
// 🔧 Características técnicas:
// - Integración con doctorService
// - React Query para múltiples queries
// - React Router para navegación
// - UI responsive y accesible
// - Badges informativos
// - Validación de disponibilidad
// 
// 🚀 Próximos pasos:
// 1. Implementar navegación al formulario de citas
// 2. Agregar más información (reseñas, calificaciones)
// 3. Integrar con sistema de citas
// 4. Agregar funcionalidad de favoritos