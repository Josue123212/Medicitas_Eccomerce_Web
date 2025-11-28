// 🏥 Edición de Paciente - Formulario Completo

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui';
import { 
  Save,
  ArrowLeft,
  User,
  Heart,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { patientService, type Patient } from '../../services/patientService';

/**
 * 🎯 OBJETIVO: Formulario de edición de pacientes existentes
 * 
 * 💡 CONCEPTO: Página que permite:
 * - Editar información personal del paciente
 * - Actualizar datos médicos
 * - Modificar contacto de emergencia
 * - Validación completa con Zod
 * - Manejo de errores y estados de carga
 */

// ==========================================
// ESQUEMA DE VALIDACIÓN
// ==========================================

const patientEditSchema = z.object({
  // Información personal
  first_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  last_name: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  
  email: z.string()
    .email('Ingrese un email válido'),
  
  phone_number: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos'),
  
  date_of_birth: z.string()
    .min(1, 'La fecha de nacimiento es requerida'),
  
  gender: z.enum(['M', 'F', 'O'], {
    errorMap: () => ({ message: 'Seleccione un género válido' })
  }),
  
  address: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  // Información médica
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),
  
  // Contacto de emergencia
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
});

type PatientEditForm = z.infer<typeof patientEditSchema>;

const PatientEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const patientId = parseInt(id || '0');

  // 🔄 Query para obtener datos del paciente
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: !!patientId
  });

  // 📝 Configuración del formulario
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<PatientEditForm>({
    resolver: zodResolver(patientEditSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      date_of_birth: '',
      gender: 'M',
      address: '',
      blood_type: '',
      allergies: '',
      medical_conditions: '',
      medications: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
    }
  });

  // 🔄 Cargar datos del paciente en el formulario
  React.useEffect(() => {
    if (patient) {
      setValue('first_name', patient.user?.first_name || '');
      setValue('last_name', patient.user?.last_name || '');
      setValue('email', patient.user?.email || '');
      setValue('phone_number', patient.phone_number);
      setValue('date_of_birth', patient.date_of_birth);
      setValue('gender', patient.gender as 'M' | 'F' | 'O');
      setValue('address', patient.address);
      setValue('blood_type', patient.blood_type || '');
      setValue('allergies', patient.allergies || '');
      setValue('medical_conditions', patient.medical_conditions || '');
      setValue('medications', patient.medications || '');
      setValue('emergency_contact_name', patient.emergency_contact_name || '');
      setValue('emergency_contact_phone', patient.emergency_contact_phone || '');
      setValue('emergency_contact_relationship', patient.emergency_contact_relationship || '');
    }
  }, [patient, setValue]);

  // 🔄 Mutation para actualizar paciente
  const updatePatientMutation = useMutation({
    mutationFn: (data: PatientEditForm) => {
      const updateData = {
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        },
        phone_number: data.phone_number,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        blood_type: data.blood_type || null,
        allergies: data.allergies || null,
        medical_conditions: data.medical_conditions || null,
        medications: data.medications || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        emergency_contact_relationship: data.emergency_contact_relationship || null,
      };
      
      return patientService.updatePatient(patientId, updateData);
    },
    onSuccess: () => {
      toast.success('Paciente actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate(`/admin/patients/${patientId}`);
    },
    onError: (error: any) => {
      console.error('Error updating patient:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el paciente');
    }
  });

  // ==========================================
  // FUNCIONES HELPER
  // ==========================================

  const handleBack = () => {
    navigate(`/admin/patients/${patientId}`);
  };

  const onSubmit = (data: PatientEditForm) => {
    updatePatientMutation.mutate(data);
  };

  // ==========================================
  // ESTADOS DE CARGA Y ERROR
  // ==========================================

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del paciente...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !patient) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar paciente
            </h3>
            <p className="text-gray-600 mb-4">
              No se pudo cargar la información del paciente.
            </p>
            <Button onClick={() => navigate('/admin/patients')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar Paciente
              </h1>
              <p className="text-gray-600">
                {patient.user.first_name} {patient.user.last_name}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      {...register('first_name')}
                      placeholder="Ingrese el nombre"
                      className={errors.first_name ? 'border-red-500' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input
                      id="last_name"
                      {...register('last_name')}
                      placeholder="Ingrese el apellido"
                      className={errors.last_name ? 'border-red-500' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="correo@ejemplo.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Teléfono *</Label>
                    <Input
                      id="phone_number"
                      {...register('phone_number')}
                      placeholder="1234567890"
                      className={errors.phone_number ? 'border-red-500' : ''}
                    />
                    {errors.phone_number && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.phone_number.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Fecha de Nacimiento *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      {...register('date_of_birth')}
                      className={errors.date_of_birth ? 'border-red-500' : ''}
                    />
                    {errors.date_of_birth && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.date_of_birth.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Género *</Label>
                  <Select 
                    value={watch('gender')} 
                    onValueChange={(value) => setValue('gender', value as 'M' | 'F' | 'O')}
                  >
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccione el género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    placeholder="Ingrese la dirección completa"
                    className={errors.address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información Médica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Información Médica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="blood_type">Tipo de Sangre</Label>
                  <Select 
                    value={watch('blood_type') || ''} 
                    onValueChange={(value) => setValue('blood_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de sangre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No especificado</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    {...register('allergies')}
                    placeholder="Describa las alergias conocidas"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="medical_conditions">Condiciones Médicas</Label>
                  <Textarea
                    id="medical_conditions"
                    {...register('medical_conditions')}
                    placeholder="Describa las condiciones médicas actuales"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="medications">Medicamentos Actuales</Label>
                  <Textarea
                    id="medications"
                    {...register('medications')}
                    placeholder="Liste los medicamentos que toma actualmente"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contacto de Emergencia */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Contacto de Emergencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Nombre del Contacto</Label>
                    <Input
                      id="emergency_contact_name"
                      {...register('emergency_contact_name')}
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia</Label>
                    <Input
                      id="emergency_contact_phone"
                      {...register('emergency_contact_phone')}
                      placeholder="Número de teléfono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact_relationship">Relación</Label>
                    <Input
                      id="emergency_contact_relationship"
                      {...register('emergency_contact_relationship')}
                      placeholder="Ej: Esposo/a, Hijo/a, Padre/Madre"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PatientEdit;