import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { secretaryService } from '../../services/secretaryService';
import type { SecretaryListItem } from '../../types/secretary';

interface SecretaryEditModalProps {
  secretary: SecretaryListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SecretaryEditForm {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department: string;
  shift_start: string;
  shift_end: string;
  can_manage_appointments: boolean;
  can_manage_patients: boolean;
  can_view_reports: boolean;
  is_active: boolean;
}

const SecretaryEditModal: React.FC<SecretaryEditModalProps> = ({
  secretary,
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SecretaryEditForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    shift_start: '',
    shift_end: '',
    can_manage_appointments: false,
    can_manage_patients: false,
    can_view_reports: false,
    is_active: true
  });

  // 🔄 Cargar datos de la secretaria cuando se abre el modal
  useEffect(() => {
    if (secretary && isOpen) {
      setFormData({
        first_name: secretary.user.first_name || '',
        last_name: secretary.user.last_name || '',
        email: secretary.user.email || '',
        phone_number: secretary.user.phone || '',
        department: secretary.department || '',
        shift_start: secretary.shift_start || '',
        shift_end: secretary.shift_end || '',
        can_manage_appointments: secretary.can_manage_appointments || false,
        can_manage_patients: secretary.can_manage_patients || false,
        can_view_reports: secretary.can_view_reports || false,
        is_active: secretary.user.is_active || false
      });
    }
  }, [secretary, isOpen]);

  // 🔄 Mutación para actualizar secretaria
  const updateMutation = useMutation({
    mutationFn: (data: SecretaryEditForm) => {
      if (!secretary) throw new Error('No secretary selected');
      console.log('🚀 ENVIANDO DATOS AL BACKEND:', {
        secretaryId: secretary.id,
        data: data,
        originalSecretary: secretary
      });
      return secretaryService.updateSecretary(secretary.id, data);
    },
    onMutate: async (newData) => {
       console.log('🔄 INICIANDO MUTACIÓN OPTIMISTA:', newData);
       
       // Cancelar queries en curso para evitar conflictos
       await queryClient.cancelQueries({ queryKey: ['secretaries'] });
       
       // Obtener datos actuales del caché
       const previousSecretaries = queryClient.getQueryData(['secretaries']);
       
       // Actualización optimista: actualizar el caché inmediatamente
       queryClient.setQueryData(['secretaries'], (old: any) => {
        if (!old || !old.results) return old;
        
        return {
          ...old,
          results: old.results.map((sec: any) => 
            sec.id === secretary?.id 
              ? { 
                  ...sec, 
                  user: {
                    ...sec.user,
                    first_name: newData.first_name,
                    last_name: newData.last_name,
                    email: newData.email,
                    phone: newData.phone
                  },
                  department: newData.department
                }
              : sec
          )
        };
      });
      
      // Retornar contexto para rollback en caso de error
      return { previousSecretaries };
    },
    onSuccess: async (result) => {
       console.log('✅ MUTACIÓN EXITOSA - RESULTADO DEL BACKEND:', result);
       
       // Invalidación agresiva del caché
       await queryClient.invalidateQueries({ 
         queryKey: ['secretaries'],
         exact: false 
       });
      
      // Forzar refetch de todas las queries relacionadas
      await queryClient.refetchQueries({ 
        queryKey: ['secretaries'],
        exact: false 
      });
      
      // Limpiar caché específico si existe
      queryClient.removeQueries({ 
        queryKey: ['secretaries'],
        exact: false 
      });
      
      // Refetch inmediato
      await queryClient.refetchQueries({ 
        queryKey: ['secretaries'] 
      });
      
      onSuccess?.();
      onClose();
    },
    onError: (error, newData, context) => {
       console.error('❌ ERROR EN MUTACIÓN:', {
         error: error,
         datosEnviados: newData,
         context: context
       });
       
       // Rollback en caso de error
       if (context?.previousSecretaries) {
         queryClient.setQueryData(['secretaries'], context.previousSecretaries);
       }
       console.error('Error updating secretary:', error);
     },
    onSettled: () => {
      // Asegurar que las queries se invaliden sin importar el resultado
      queryClient.invalidateQueries({ queryKey: ['secretaries'] });
    }
  });

  // 🎨 Manejar cambios en el formulario
  const handleInputChange = (field: keyof SecretaryEditForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🎨 Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 SUBMIT DEL FORMULARIO - DATOS A ENVIAR:', formData);
    console.log('🔍 ESTADO DE LA MUTACIÓN:', {
      isLoading: updateMutation.isPending,
      isError: updateMutation.isError,
      error: updateMutation.error
    });
    updateMutation.mutate(formData);
  };

  if (!secretary) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Editar Secretaria"
      size="2xl"
      className="max-h-[90vh] overflow-y-auto"
    >

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 👤 Información Personal */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <Input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💼 Información Laboral */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Recepción">Recepción</option>
                    <option value="Administración">Administración</option>
                    <option value="Archivo">Archivo</option>
                    <option value="Enfermería">Enfermería</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Inicio
                  </label>
                  <Input
                    type="time"
                    value={formData.shift_start}
                    onChange={(e) => handleInputChange('shift_start', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Fin
                  </label>
                  <Input
                    type="time"
                    value={formData.shift_end}
                    onChange={(e) => handleInputChange('shift_end', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🔐 Permisos */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Permisos del Sistema</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="can_manage_appointments"
                    checked={formData.can_manage_appointments}
                    onChange={(e) => handleInputChange('can_manage_appointments', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="can_manage_appointments" className="text-sm font-medium text-gray-700">
                    Gestión de Citas
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="can_manage_patients"
                    checked={formData.can_manage_patients}
                    onChange={(e) => handleInputChange('can_manage_patients', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="can_manage_patients" className="text-sm font-medium text-gray-700">
                    Gestión de Pacientes
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="can_view_reports"
                    checked={formData.can_view_reports}
                    onChange={(e) => handleInputChange('can_view_reports', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="can_view_reports" className="text-sm font-medium text-gray-700">
                    Ver Reportes
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Usuario Activo
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🔧 Acciones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
    </Modal>
  );
};

export default SecretaryEditModal;