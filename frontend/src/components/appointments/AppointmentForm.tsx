import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import type { 
  Appointment, 
  CreateAppointmentData, 
  UpdateAppointmentData 
} from '../../types/appointment';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';

// 🎯 OBJETIVO: Formulario reutilizable para crear y editar citas
// 💡 CONCEPTO: Form con validación, selección de doctor y horarios disponibles

// 📋 Schema de validación con Zod
const appointmentSchema = z.object({
  patient: z.number().optional(),
  doctor: z.number().min(1, 'Selecciona un doctor'),
  date: z.string().min(1, 'Selecciona una fecha'),
  time: z.string().min(1, 'Selecciona una hora'),
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
  notes: z.string().optional()
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: CreateAppointmentData | UpdateAppointmentData) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  mode: 'create' | 'edit';
  preselectedPatient?: number;
  preselectedDoctor?: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSubmit,
  onCancel,
  loading = false,
  error,
  mode,
  preselectedPatient,
  preselectedDoctor
}) => {
  // 🔧 Estados locales
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(
    preselectedDoctor || appointment?.doctor || null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    appointment?.date || ''
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [weekendAlert, setWeekendAlert] = useState<string>('');

  // 📝 Configuración del formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient: preselectedPatient || appointment?.patient || 0,
      doctor: preselectedDoctor || appointment?.doctor || 0,
      date: appointment?.date || '',
      time: appointment?.time || '',
      reason: appointment?.reason || '',
      notes: appointment?.notes || ''
    }
  });

  // 👀 Observar cambios en doctor y fecha
  const watchedDoctor = watch('doctor');
  const watchedDate = watch('date');

  // 👨‍⚕️ Query para obtener doctores disponibles
  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors', 'public'],
    queryFn: () => doctorService.getPublicDoctors(),
    staleTime: 10 * 60 * 1000 // 10 minutos
  });

  // 🕐 Efecto para cargar horarios disponibles
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (selectedDoctor && selectedDate) {
        try {
          const slots = await appointmentService.getAvailableSlots(
            selectedDoctor, 
            selectedDate
          );
          setAvailableSlots(slots.data.available_slots.map(slot => slot.time));
        } catch (error) {
          console.error('Error loading available slots:', error);
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots([]);
      }
    };

    loadAvailableSlots();
  }, [selectedDoctor, selectedDate]);

  // 🔄 Efecto para sincronizar estados
  useEffect(() => {
    if (watchedDoctor !== selectedDoctor) {
      setSelectedDoctor(watchedDoctor);
    }
  }, [watchedDoctor]);

  useEffect(() => {
    if (watchedDate !== selectedDate) {
      setSelectedDate(watchedDate);
    }
  }, [watchedDate]);

  // 📅 Obtener fecha mínima (hoy)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 🚫 Validar si la fecha es fin de semana
  const isWeekend = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // 🔍 Efecto para validar fines de semana
  useEffect(() => {
    if (watchedDate) {
      if (isWeekend(watchedDate)) {
        setWeekendAlert('⚠️ Las citas solo pueden programarse de lunes a viernes. Por favor, selecciona un día de la semana.');
      } else {
        setWeekendAlert('');
      }
    } else {
      setWeekendAlert('');
    }
  }, [watchedDate]);

  // 📝 Manejar envío del formulario
  const onFormSubmit = (data: AppointmentFormData) => {
    console.log('🔍 DEBUG - Datos del formulario:', data);
    console.log('🔍 DEBUG - preselectedPatient:', preselectedPatient);
    console.log('🔍 DEBUG - data.patient:', data.patient);
    
    // Validar que tenemos un paciente válido
    if (!preselectedPatient) {
      console.error('❌ No hay preselectedPatient disponible');
      // Mostrar error al usuario
      const errorMessage = 'No se pudo identificar tu perfil de paciente. Por favor, contacta al administrador.';
      console.error(errorMessage);
      return;
    }
    
    const formattedData = {
      ...data,
      patient: preselectedPatient,
      time: data.time.length === 5 ? `${data.time}:00` : data.time
    };
    
    console.log('🔍 DEBUG - Datos formateados a enviar:', formattedData);
    
    onSubmit(formattedData);
  };

  // 🎨 Render del componente
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {mode === 'create' ? 'Nueva Cita Médica' : 'Editar Cita'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 📋 Información de horarios */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--info-light)', border: '1px solid var(--info)' }}>
          <div className="flex items-start space-x-2">
            <div className="text-sm" style={{ color: 'var(--info)' }}>
              <strong>📅 Horarios de Atención:</strong> Las citas están disponibles de lunes a viernes. 
              Los fines de semana no están disponibles para programar citas médicas.
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* ⚠️ Error general */}
          {error && (
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)' }}>
              <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

          {/* 👨‍⚕️ Selección de Doctor */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              <UserIcon className="h-4 w-4" />
              <span>Doctor</span>
            </label>
            <select
              {...register('doctor', { valueAsNumber: true })}
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ border: '1px solid var(--border)', '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              disabled={loading || doctorsLoading}
            >
              <option value={0}>Selecciona un doctor</option>
              {doctorsData?.results.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name} - {doctor.specialization}
                </option>
              ))}
            </select>
            {errors.doctor && (
              <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.doctor.message}</p>
            )}
          </div>

          {/* 📅 Selección de Fecha */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              <CalendarIcon className="h-4 w-4" />
              <span>Fecha</span>
            </label>
            <Input
              type="date"
              {...register('date')}
              min={getMinDate()}
              disabled={loading}
              className="w-full"
            />
            {errors.date && (
              <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.date.message}</p>
            )}
            {weekendAlert && (
              <div className="flex items-start space-x-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning)' }}>
                <div className="text-sm" style={{ color: 'var(--warning)' }}>
                  {weekendAlert}
                </div>
              </div>
            )}
          </div>

          {/* 🕐 Selección de Hora */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              <ClockIcon className="h-4 w-4" />
              <span>Hora</span>
            </label>
            {availableSlots.length > 0 ? (
              <select
                {...register('time')}
                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ border: '1px solid var(--border)', '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                disabled={loading}
              >
                <option value="">Selecciona una hora</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {new Date(`2000-01-01T${slot}`).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <Input
                  type="time"
                  {...register('time')}
                  className="w-full"
                  disabled={loading}
                  placeholder="HH:MM"
                />
                {selectedDoctor && selectedDate && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    No hay horarios predefinidos disponibles. Puedes ingresar una hora manualmente.
                  </p>
                )}
                {!selectedDoctor || !selectedDate ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Selecciona un doctor y fecha para ver horarios disponibles
                  </p>
                ) : null}
              </div>
            )}
            {errors.time && (
              <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.time.message}</p>
            )}
          </div>

          {/* 📝 Motivo de la consulta */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              <DocumentTextIcon className="h-4 w-4" />
              <span>Motivo de la consulta</span>
            </label>
            <textarea
              {...register('reason')}
              rows={3}
              placeholder="Describe el motivo de la consulta..."
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:border-transparent resize-none"
              style={{ border: '1px solid var(--border)', '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              disabled={loading}
            />
            {errors.reason && (
              <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.reason.message}</p>
            )}
          </div>

          {/* 📋 Notas adicionales */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Notas adicionales (opcional)
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Información adicional relevante..."
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:border-transparent resize-none"
              style={{ border: '1px solid var(--border)', '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              disabled={loading}
            />
          </div>

          {/* 🔧 Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !!weekendAlert}
              className="w-full"
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>
                {mode === 'create' ? 'Crear Cita' : 'Guardar Cambios'}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentForm;

// 📋 EXPLICACIÓN:
// 1. **Validación Robusta**: Usa Zod para validación de tipos y reglas
// 2. **React Hook Form**: Manejo eficiente de formularios con menos re-renders
// 3. **Horarios Dinámicos**: Carga horarios disponibles según doctor y fecha
// 4. **Modo Dual**: Funciona para crear y editar citas
// 5. **UX Optimizada**: Estados de carga, errores y validación en tiempo real
// 6. **Accesible**: Labels apropiados y navegación por teclado
// 7. **Responsive**: Se adapta a diferentes tamaños de pantalla

// 🚀 PRÓXIMOS PASOS:
// - Agregar selección de paciente para admins
// - Implementar autocompletado para búsqueda
// - Añadir validación de conflictos de horarios
// - Integrar notificaciones de confirmación