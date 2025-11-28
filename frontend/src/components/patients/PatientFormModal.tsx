// 🏥 Modal de Formulario para Pacientes

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Modal, 
  Button, 
  Input,
  Badge
} from '../ui';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Heart,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';
import { patientService, type CreatePatientData } from '../../services/patientService';

/**
 * 🎯 OBJETIVO: Modal para crear/editar pacientes
 * 
 * 💡 CONCEPTO: Formulario completo con validaciones para:
 * - Datos personales del usuario
 * - Información médica del paciente
 * - Contacto de emergencia
 */

// ==========================================
// ESQUEMA DE VALIDACIÓN CON ZOD
// ==========================================

const patientSchema = z.object({
  // Datos del usuario
  first_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  last_name: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  
  email: z.string()
    .email('Debe ser un email válido')
    .min(1, 'El email es requerido'),
  
  username: z.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(30, 'El usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener mayúscula, minúscula y número'),
  
  // Datos del paciente
  date_of_birth: z.string()
    .min(1, 'La fecha de nacimiento es requerida'),
  
  gender: z.enum(['M', 'F', 'O'], {
    errorMap: () => ({ message: 'Selecciona un género válido' })
  }),
  
  phone_number: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[+]?[\d\s-()]+$/, 'Formato de teléfono inválido'),
  
  address: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  // Información médica (opcional)
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),
  
  // Contacto de emergencia (opcional)
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

// ==========================================
// PROPS DEL COMPONENTE
// ==========================================

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number; // Para edición
  title?: string;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientId,
  title = 'Nuevo Paciente'
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!patientId;

  // 🔧 Configuración del formulario con React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'M',
      blood_type: '',
      allergies: '',
      medical_conditions: '',
      medications: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: ''
    }
  });

  // 🔄 Mutación para crear paciente
  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const createData: CreatePatientData = {
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          username: data.username,
          password: data.password
        },
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        phone_number: data.phone_number,
        address: data.address,
        blood_type: data.blood_type || undefined,
        allergies: data.allergies || undefined,
        medical_conditions: data.medical_conditions || undefined,
        medications: data.medications || undefined,
        emergency_contact_name: data.emergency_contact_name || undefined,
        emergency_contact_phone: data.emergency_contact_phone || undefined,
        emergency_contact_relationship: data.emergency_contact_relationship || undefined,
      };
      
      return patientService.createPatient(createData);
    },
    onSuccess: () => {
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      reset();
      onClose();
    },
    onError: (error) => {
      console.error('Error al crear paciente:', error);
    }
  });

  // 📝 Manejar envío del formulario
  const onSubmit = (data: PatientFormData) => {
    createPatientMutation.mutate(data);
  };

  // 🎨 Render del formulario
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos Personales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Datos Personales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <Input
                  {...register('first_name')}
                  placeholder="Nombre del paciente"
                  error={errors.first_name?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <Input
                  {...register('last_name')}
                  placeholder="Apellido del paciente"
                  error={errors.last_name?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="email@ejemplo.com"
                  error={errors.email?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <Input
                  {...register('username')}
                  placeholder="nombre_usuario"
                  error={errors.username?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Contraseña segura"
                  error={errors.password?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <Input
                  {...register('date_of_birth')}
                  type="date"
                  error={errors.date_of_birth?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género *
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <Input
                  {...register('phone_number')}
                  placeholder="+1 234 567 8900"
                  error={errors.phone_number?.message}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <Input
                {...register('address')}
                placeholder="Dirección completa"
                error={errors.address?.message}
              />
            </div>
          </div>

          {/* Información Médica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-600" />
              Información Médica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Sangre
                </label>
                <select
                  {...register('blood_type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <textarea
                  {...register('allergies')}
                  rows={3}
                  placeholder="Describe las alergias conocidas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condiciones Médicas
                </label>
                <textarea
                  {...register('medical_conditions')}
                  rows={3}
                  placeholder="Condiciones médicas existentes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicamentos
                </label>
                <textarea
                  {...register('medications')}
                  rows={3}
                  placeholder="Medicamentos actuales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Contacto de Emergencia
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <Input
                  {...register('emergency_contact_name')}
                  placeholder="Nombre del contacto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  {...register('emergency_contact_phone')}
                  placeholder="+1 234 567 8900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relación
                </label>
                <Input
                  {...register('emergency_contact_relationship')}
                  placeholder="Ej: Madre, Esposo, etc."
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Guardando...' : 'Guardar Paciente'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PatientFormModal;