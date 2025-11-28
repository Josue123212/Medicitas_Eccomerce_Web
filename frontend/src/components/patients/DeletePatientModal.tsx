// 🗑️ Modal de Confirmación para Eliminar Pacientes

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Modal, 
  Button
} from '../ui';
import { 
  AlertTriangle,
  Trash2,
  X
} from 'lucide-react';
import { patientService, type PatientListItem } from '../../services/patientService';

/**
 * 🎯 OBJETIVO: Modal de confirmación para eliminar pacientes
 * 
 * 💡 CONCEPTO: Confirmación segura con información del paciente
 * - Muestra datos del paciente a eliminar
 * - Requiere confirmación explícita
 * - Maneja errores de eliminación
 */

// ==========================================
// TIPOS
// ==========================================

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientListItem | null;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const queryClient = useQueryClient();

  // 🔄 Mutación para eliminar paciente
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      return await patientService.deletePatient(patientId);
    },
    onSuccess: () => {
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error al eliminar paciente:', error);
      // TODO: Mostrar notificación de error
    }
  });

  const handleConfirmDelete = () => {
    if (patient) {
      deletePatientMutation.mutate(patient.id);
    }
  };

  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Eliminar Paciente
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
            ¿Estás seguro de que deseas eliminar al siguiente paciente?
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
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. 
              Se eliminarán todos los datos del paciente, incluyendo su historial médico y citas.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deletePatientMutation.isPending}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deletePatientMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {deletePatientMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Eliminando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletePatientModal;