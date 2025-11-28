import React from 'react';
import { Calendar, Clock, User, Phone, Edit, Trash2 } from 'lucide-react';
import { SecretaryAppointment } from '../../../types';

interface AppointmentManagementProps {
  appointments?: SecretaryAppointment[];
  isLoading?: boolean;
}

export const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ 
  appointments = [], 
  isLoading = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success-light text-success border-success-light';
      case 'pending':
        return 'bg-warning-light text-warning border-warning-light';
      case 'cancelled':
        return 'bg-danger-light text-danger border-danger-light';
      default:
        return 'bg-secondary-100 text-text-secondary border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Gestión de Citas</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-secondary-200 rounded-lg"></div>
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
          <Calendar className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Gestión de Citas</h3>
        </div>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
          Nueva Cita
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No hay citas programadas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-text-muted" />
                      <span className="font-medium text-text-primary">
                        {appointment.patient_name}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time} - {appointment.doctor_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{appointment.patient_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{appointment.date}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-2 text-sm text-text-secondary">
                      <strong>Notas:</strong> {appointment.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-danger hover:bg-danger-light rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};