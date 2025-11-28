// 🏥 Modal de Edición de Doctor

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Stethoscope, Clock, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import type { Doctor } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import LoadingSpinner from '../ui/LoadingSpinner';

// 🎯 OBJETIVO: Modal para editar información de doctores existentes
// 💡 CONCEPTO: Formulario de edición con validación que actualiza la información del doctor

// ==========================================
// VALIDACIÓN CON ZOD
// ==========================================

const editDoctorSchema = z.object({
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
  
  // Horario de trabajo
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
  work_days: z.array(z.string()).optional(),
  is_available: z.boolean().default(true),
});

type EditDoctorFormData = z.infer<typeof editDoctorSchema>;

// ==========================================
// INTERFACES
// ==========================================

interface DoctorEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctor: Doctor;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const DoctorEditModal: React.FC<DoctorEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  doctor
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
  } = useForm<EditDoctorFormData>({
    resolver: zodResolver(editDoctorSchema),
    defaultValues: {
      medical_license: doctor.medical_license || '',
      specialization: doctor.specialization || '',
      years_experience: doctor.years_experience || 0,
      consultation_fee: doctor.consultation_fee || 0,
      bio: doctor.bio || '',
      work_start_time: doctor.work_start_time || '',
      work_end_time: doctor.work_end_time || '',
      work_days: doctor.work_days || [],
      is_available: doctor.is_available ?? true,
    }
  });

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    if (isOpen && doctor) {
      // Resetear el formulario con los datos del doctor
      reset({
        medical_license: doctor.medical_license || '',
        specialization: doctor.specialization || '',
        years_experience: doctor.years_experience || 0,
        consultation_fee: doctor.consultation_fee || 0,
        bio: doctor.bio || '',
        work_start_time: doctor.work_start_time || '',
        work_end_time: doctor.work_end_time || '',
        work_days: doctor.work_days || [],
        is_available: doctor.is_available ?? true,
      });
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [isOpen, doctor, reset]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const onSubmit = async (data: EditDoctorFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('🔄 Actualizando doctor:', doctor.id, data);
      
      await doctorService.updateDoctor(doctor.id, data);
      
      setSubmitSuccess(true);
      
      // Mostrar éxito por un momento antes de cerrar
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitSuccess(false);
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Error al actualizar doctor:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          setSubmitError(errorData);
        } else if (errorData.detail) {
          setSubmitError(errorData.detail);
        } else if (errorData.message) {
          setSubmitError(errorData.message);
        } else {
          // Mostrar errores de validación específicos
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('\n');
          setSubmitError(errorMessages || 'Error de validación');
        }
      } else {
        setSubmitError('Error al actualizar el doctor. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  };

  // ==========================================
  // DÍAS DE LA SEMANA
  // ==========================================
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

  const handleWorkDayToggle = (day: string) => {
    const currentDays = selectedWorkDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setValue('work_days', newDays);
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Doctor
              </h2>
              <p className="text-sm text-gray-600">
                {doctor.full_name} - {doctor.specialization}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información Profesional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
              Información Profesional
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Licencia Médica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Licencia Médica *
                </label>
                <Input
                  {...register('medical_license')}
                  placeholder="Ej: MED-12345"
                  className={errors.medical_license ? 'border-red-500' : ''}
                />
                {errors.medical_license && (
                  <p className="text-red-500 text-xs mt-1">{errors.medical_license.message}</p>
                )}
              </div>

              {/* Especialización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialización *
                </label>
                <Input
                  {...register('specialization')}
                  placeholder="Ej: Cardiología"
                  className={errors.specialization ? 'border-red-500' : ''}
                />
                {errors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>
                )}
              </div>

              {/* Años de Experiencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Años de Experiencia *
                </label>
                <Input
                  type="number"
                  {...register('years_experience', { valueAsNumber: true })}
                  placeholder="0"
                  min="0"
                  max="50"
                  className={errors.years_experience ? 'border-red-500' : ''}
                />
                {errors.years_experience && (
                  <p className="text-red-500 text-xs mt-1">{errors.years_experience.message}</p>
                )}
              </div>

              {/* Tarifa de Consulta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa de Consulta ($) *
                </label>
                <Input
                  type="number"
                  {...register('consultation_fee', { valueAsNumber: true })}
                  placeholder="0"
                  min="0"
                  max="1000"
                  step="0.01"
                  className={errors.consultation_fee ? 'border-red-500' : ''}
                />
                {errors.consultation_fee && (
                  <p className="text-red-500 text-xs mt-1">{errors.consultation_fee.message}</p>
                )}
              </div>
            </div>

            {/* Biografía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografía
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="Breve descripción profesional..."
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.bio ? 'border-red-500' : ''
                }`}
              />
              {errors.bio && (
                <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {/* Horario de Trabajo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Horario de Trabajo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hora de Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Inicio
                </label>
                <Input
                  type="time"
                  {...register('work_start_time')}
                  className={errors.work_start_time ? 'border-red-500' : ''}
                />
                {errors.work_start_time && (
                  <p className="text-red-500 text-xs mt-1">{errors.work_start_time.message}</p>
                )}
              </div>

              {/* Hora de Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Fin
                </label>
                <Input
                  type="time"
                  {...register('work_end_time')}
                  className={errors.work_end_time ? 'border-red-500' : ''}
                />
                {errors.work_end_time && (
                  <p className="text-red-500 text-xs mt-1">{errors.work_end_time.message}</p>
                )}
              </div>
            </div>

            {/* Días de Trabajo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de Trabajo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {weekDays.map((day) => (
                  <label
                    key={day.value}
                    className={`flex items-center justify-center p-2 border rounded-md cursor-pointer transition-colors ${
                      selectedWorkDays.includes(day.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkDays.includes(day.value)}
                      onChange={() => handleWorkDayToggle(day.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Disponibilidad */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('is_available')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Doctor disponible para nuevas citas
                </span>
              </label>
            </div>
          </div>

          {/* Mensajes de Estado */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error al actualizar</h3>
                  <div className="text-sm text-red-700 mt-1 whitespace-pre-line">
                    {submitError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    ¡Doctor actualizado exitosamente!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Los cambios se han guardado correctamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorEditModal;

// 📋 EXPLICACIÓN:
// 
// 🎯 Funcionalidades implementadas:
// 1. Formulario de edición con validación Zod
// 2. Carga de datos existentes del doctor
// 3. Validación en tiempo real
// 4. Manejo de errores del servidor
// 5. Estados de carga y éxito
// 6. Selección de días de trabajo
// 7. Campos de horario y disponibilidad
// 
// 🔧 Características técnicas:
// - React Hook Form con Zod resolver
// - Integración con doctorService
// - UI responsive y accesible
// - Manejo de estados de formulario
// - Validación client-side y server-side
// 
// 🚀 Próximos pasos:
// 1. Integrar con DoctorCard
// 2. Probar funcionalidad completa
// 3. Agregar más validaciones
// 4. Mejorar UX del formulario