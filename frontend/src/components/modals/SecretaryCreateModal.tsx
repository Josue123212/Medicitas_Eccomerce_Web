import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Mail, Phone, Building2, Clock, Shield } from 'lucide-react';
import { secretaryService } from '../../services/secretaryService';
import ModalDebugger from '../debug/ModalDebugger';

interface SecretaryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SecretaryCreateForm {
  // Datos del usuario
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  
  // Datos específicos de secretaria
  phone_number: string;
  employee_id: string;
  department: string;
  shift_start: string;
  shift_end: string;
  hire_date: string;
  
  // Permisos
  can_manage_appointments: boolean;
  can_manage_patients: boolean;
  can_view_reports: boolean;
}

const SecretaryCreateModal: React.FC<SecretaryCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SecretaryCreateForm>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    employee_id: '',
    department: 'general',
    shift_start: '08:00',
    shift_end: '16:00',
    hire_date: new Date().toISOString().split('T')[0],
    can_manage_appointments: true,
    can_manage_patients: true,
    can_view_reports: false
  });

  // Mutación para crear secretaria
  const createMutation = useMutation({
    mutationFn: (data: SecretaryCreateForm) => secretaryService.createSecretary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretaries'] });
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        employee_id: '',
        department: 'general',
        shift_start: '08:00',
        shift_end: '16:00',
        hire_date: new Date().toISOString().split('T')[0],
        can_manage_appointments: true,
        can_manage_patients: true,
        can_view_reports: false
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creating secretary:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Mostrar alerta con el error
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert(`Error: ${error.message || 'Error desconocido al crear secretaria'}`);
      }
    }
  });

  const handleInputChange = (field: keyof SecretaryCreateForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Submit button clicked');
    console.log('📊 Form data being submitted:', formData);
    console.log('🔄 Mutation state before submit:', {
      isPending: createMutation.isPending,
      isError: createMutation.isError,
      isSuccess: createMutation.isSuccess
    });
    
    // Validar campos requeridos
    const requiredFields = ['username', 'email', 'password', 'first_name', 'last_name'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof SecretaryCreateForm]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      alert(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      return;
    }
    
    console.log('✅ All required fields present, submitting...');
    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Secretaria</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Debug Info */}
          <ModalDebugger 
            formData={formData} 
            mutation={createMutation} 
            onSubmit={handleSubmit}
          />
          
          {/* Información Personal */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Mail className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Información de Contacto</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-medium text-gray-900">Información Laboral</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Empleado
                </label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="cardiologia">Cardiología</option>
                  <option value="neurologia">Neurología</option>
                  <option value="pediatria">Pediatría</option>
                  <option value="ginecologia">Ginecología</option>
                  <option value="traumatologia">Traumatología</option>
                  <option value="dermatologia">Dermatología</option>
                  <option value="oftalmologia">Oftalmología</option>
                  <option value="psiquiatria">Psiquiatría</option>
                  <option value="urgencias">Urgencias</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={formData.shift_start}
                  onChange={(e) => handleInputChange('shift_start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={formData.shift_end}
                  onChange={(e) => handleInputChange('shift_end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Contratación
                </label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-medium text-gray-900">Permisos</h3>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.can_manage_appointments}
                  onChange={(e) => handleInputChange('can_manage_appointments', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Gestionar Citas</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.can_manage_patients}
                  onChange={(e) => handleInputChange('can_manage_patients', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Gestionar Pacientes</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.can_view_reports}
                  onChange={(e) => handleInputChange('can_view_reports', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Ver Reportes</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creando...' : 'Crear Secretaria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecretaryCreateModal;