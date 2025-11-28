// 🚫 Modal de Confirmación para Deshabilitar/Habilitar Pacientes

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Modal, 
  Button
} from '../ui';
import { 
  AlertTriangle,
  UserX,
  UserCheck,
  X
} from 'lucide-react';
import { patientService, type PatientListItem } from '../../services/patientService';

/**
 * 🎯 OBJETIVO: Modal de confirmación para deshabilitar/habilitar pacientes
 * 
 * 💡 CONCEPTO: Confirmación segura con información del paciente
 * - Muestra datos del paciente a modificar
 * - Requiere confirmación explícita
 * - Maneja errores de actualización de estado
 */

// ==========================================
// TIPOS
// ==========================================

interface DisablePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientListItem | null;
  onSuccess?: () => void;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const DisablePatientModal: React.FC<DisablePatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess
}) => {
  const queryClient = useQueryClient();

  // 🔄 Mutación para actualizar estado del paciente
  const updateStatusMutation = useMutation({
    mutationFn: async ({ patientId, status }: { patientId: number; status: string }) => {
      return await patientService.updatePatientStatus(patientId, status);
    },
    onSuccess: () => {
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error al actualizar estado del paciente:', error);
      // TODO: Mostrar notificación de error
    }
  });

  const handleConfirmAction = () => {
    if (patient) {
      const newStatus = patient.is_active ? 'disabled' : 'active';
      updateStatusMutation.mutate({ 
        patientId: patient.id, 
        status: newStatus 
      });
    }
  };

  if (!patient) return null;

  const isDisabling = patient.is_active;
  const actionText = isDisabling ? 'Deshabilitar' : 'Habilitar';
  const actionColor = isDisabling ? 'red' : 'green';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isDisabling ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {isDisabling ? (
                <UserX className={`h-5 w-5 text-${actionColor}-600`} />
              ) : (
                <UserCheck className={`h-5 w-5 text-${actionColor}-600`} />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {actionText} Paciente
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            ¿Estás seguro de que deseas {actionText.toLowerCase()} al siguiente paciente?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">
                {patient.full_name || 'Nombre no disponible'}
              </p>
              <p className="text-sm text-gray-600">
                📧 {patient.email || 'Email no disponible'}
              </p>
              <p className="text-sm text-gray-600">
                📞 {patient.phone_number || 'Sin teléfono'}
              </p>
              <p className="text-sm text-gray-600">
                🆔 ID: {patient.id}
              </p>
              <p className="text-sm text-gray-600">
                📊 Estado actual: <span className={`font-medium ${
                  patient.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {patient.is_active ? 'Activo' : 'Deshabilitado'}
                </span>
              </p>
            </div>
          </div>

          <div className={`mt-4 p-3 border rounded-lg ${
            isDisabling 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <p className={`text-sm ${
              isDisabling ? 'text-red-800' : 'text-green-800'
            }`}>
              <strong>ℹ️ Información:</strong> {isDisabling 
                ? 'El paciente no podrá acceder al sistema, pero sus datos se conservarán.'
                : 'El paciente podrá volver a acceder al sistema normalmente.'
              }
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAction}
            disabled={updateStatusMutation.isPending}
            className={`flex-1 text-white ${
              isDisabling 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {updateStatusMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {isDisabling ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                <span>{actionText}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DisablePatientModal;