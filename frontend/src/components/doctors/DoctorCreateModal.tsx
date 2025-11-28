import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Stethoscope, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { doctorService } from '../../services/doctorService';

// 🎯 OBJETIVO: Modal para crear nuevos doctores desde el panel de administración
// 💡 CONCEPTO: Formulario completo con validación que crea tanto el usuario como el perfil de doctor

// ==========================================
// VALIDACIÓN CON ZOD
// ==========================================

const createDoctorSchema = z.object({
  // Información del usuario
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  
  email: z.string()
    .email('Ingrese un email válido')
    .min(1, 'El email es requerido'),
  
  first_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  last_name: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  
  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[+]?[\d\s\-()]+$/, 'Formato de teléfono inválido'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número'),
  
  // Información profesional
  medical_license: z.string()
    .min(5, 'La licencia médica debe tener al menos 5 caracteres')
    .regex(/^[A-Z0-9\-]+$/, 'Solo mayúsculas, números y guiones'),
  
  specialization: z.string()
    .min(3, 'La especialización debe tener al menos 3 caracteres')
    .max(100, 'La especialización no puede exceder 100 caracteres'),
  
  years_experience: z.number()
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .max(50, 'Los años de experiencia no pueden exceder 50'),
  
  consultation_fee: z.number()
    .min(0, 'La tarifa no puede ser negativa')
    .max(1000, 'La tarifa no puede exceder 1000'),
  
  bio: z.string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional(),
  
  // Horario de trabajo (opcional)
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
  work_days: z.array(z.string()).optional(),
  is_available: z.boolean().default(true),
});

type CreateDoctorFormData = z.infer<typeof createDoctorSchema>;

// ==========================================
// INTERFACES
// ==========================================

interface DoctorCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const DoctorCreateModal: React.FC<DoctorCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      is_available: true,
      work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      work_start_time: '09:00',
      work_end_time: '17:00',
    }
  });

  // Especialidades médicas comunes
  const specializations = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Pediatría',
    'Ginecología',
    'Neurología',
    'Traumatología',
    'Psiquiatría',
    'Oftalmología',
    'Otorrinolaringología',
    'Urología',
    'Endocrinología',
    'Gastroenterología',
    'Neumología',
    'Oncología'
  ];

  // Días de la semana
  const weekDays = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const selectedWorkDays = watch('work_days') || [];

  // Manejar selección de días de trabajo
  const handleWorkDayToggle = (day: string) => {
    const currentDays = selectedWorkDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setValue('work_days', newDays);
  };

  // Manejar envío del formulario
  const onSubmit = async (data: CreateDoctorFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await doctorService.createDoctor(data);
      setSubmitSuccess(true);
      
      // Esperar un momento para mostrar el éxito y luego cerrar
      setTimeout(() => {
        reset();
        setSubmitSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      setSubmitError(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        'Error al crear el doctor. Intente nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSubmitError(null);
      setSubmitSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Doctor</h2>
              <p className="text-sm text-gray-500">Complete la información del doctor</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Mensajes de estado */}
        {submitError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {submitSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">¡Doctor creado exitosamente!</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Información Personal */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre de usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario *
                </label>
                <input
                  type="text"
                  {...register('username')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="ej: dr_juan_perez"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="doctor@hospital.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  {...register('first_name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.first_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Juan"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  {...register('last_name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.last_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Pérez"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+34-600-123-456"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña temporal *
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Contraseña segura"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Información Profesional</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Licencia médica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Licencia médica *
                </label>
                <input
                  type="text"
                  {...register('medical_license')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.medical_license ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="LIC-MED-001"
                />
                {errors.medical_license && (
                  <p className="mt-1 text-sm text-red-600">{errors.medical_license.message}</p>
                )}
              </div>

              {/* Especialización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialización *
                </label>
                <select
                  {...register('specialization')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.specialization ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar especialización</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                )}
              </div>

              {/* Años de experiencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Años de experiencia *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  {...register('years_experience', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.years_experience ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="5"
                />
                {errors.years_experience && (
                  <p className="mt-1 text-sm text-red-600">{errors.years_experience.message}</p>
                )}
              </div>

              {/* Tarifa de consulta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa de consulta (€) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  {...register('consultation_fee', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.consultation_fee ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="75.00"
                />
                {errors.consultation_fee && (
                  <p className="mt-1 text-sm text-red-600">{errors.consultation_fee.message}</p>
                )}
              </div>
            </div>

            {/* Biografía */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografía profesional
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bio ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Descripción de la experiencia y especialidades del doctor..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {/* Horario de Trabajo */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Horario de Trabajo</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Hora de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  {...register('work_start_time')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Hora de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de fin
                </label>
                <input
                  type="time"
                  {...register('work_end_time')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Días de trabajo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de trabajo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {weekDays.map(day => (
                  <label
                    key={day.value}
                    className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkDays.includes(day.value)}
                      onChange={() => handleWorkDayToggle(day.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <span>Crear Doctor</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorCreateModal;