import React from 'react';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { SecretaryPatient } from '../../../types';

interface PatientQueueProps {
  patients?: SecretaryPatient[];
  isLoading?: boolean;
}

export const PatientQueue: React.FC<PatientQueueProps> = ({ 
  patients = [], 
  isLoading = false 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-danger-light text-danger border-danger-light';
      case 'medium':
        return 'bg-warning-light text-warning border-warning-light';
      case 'low':
        return 'bg-success-light text-success border-success-light';
      default:
        return 'bg-secondary-100 text-text-secondary border-border';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Urgente';
      case 'medium':
        return 'Normal';
      case 'low':
        return 'Baja';
      default:
        return 'Sin prioridad';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'in_consultation':
        return <AlertCircle className="h-4 w-4 text-primary" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Clock className="h-4 w-4 text-text-muted" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'En espera';
      case 'in_consultation':
        return 'En consulta';
      case 'completed':
        return 'Completado';
      default:
        return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Cola de Pacientes</h3>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-secondary-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Cola de Pacientes</h3>
        </div>
        <span className="text-sm text-text-secondary">
          {patients.length} pacientes
        </span>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No hay pacientes en cola</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((patient, index) => (
            <div 
              key={patient.id} 
              className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-light rounded-full text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-text-primary">
                        {patient.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(patient.priority)}`}>
                        {getPriorityText(patient.priority)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(patient.status)}
                        <span>{getStatusText(patient.status)}</span>
                      </div>
                      <span>Dr. {patient.doctor_name}</span>
                      <span>{patient.appointment_time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                    Llamar
                  </button>
                  <button className="px-3 py-1 text-sm border border-border text-text-secondary rounded-lg hover:bg-secondary-50 transition-colors">
                    Detalles
                  </button>
                </div>
              </div>

              {patient.notes && (
                <div className="mt-3 pt-3 border-t border-border text-sm text-text-secondary">
                  <strong>Notas:</strong> {patient.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientQueue;