import React from 'react';
import { StatsCard } from './StatsCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface UpcomingAppointmentsProps {
  appointments?: Appointment[];
  isLoading?: boolean;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments = [],
  isLoading = false
}) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: 'var(--success-light)', color: 'var(--success)' };
      case 'pending':
        return { backgroundColor: 'var(--warning-light)', color: 'var(--warning)' };
      case 'cancelled':
        return { backgroundColor: 'var(--error-light)', color: 'var(--error)' };
      default:
        return { backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' };
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
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-xl lg:rounded-2xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl lg:rounded-2xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-light text-text-primary mb-2">
            Próximas Citas
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            {appointments.length} citas programadas
          </p>
        </div>
        
        <button className="text-primary hover:text-primary-hover text-sm font-medium transition-colors duration-200">
          Ver todas
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No tienes citas programadas
          </h3>
          <p className="text-text-secondary mb-4">
            Agenda tu primera cita médica
          </p>
          <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors duration-200">
            Agendar Cita
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-text-primary">
                      {appointment.doctor}
                    </h3>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={getStatusStyles(appointment.status)}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-1">
                    {appointment.specialty}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-text-muted">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-primary hover:text-primary-hover p-2 rounded-lg hover:bg-primary-light transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  
                  <button className="text-text-muted hover:text-danger p-2 rounded-lg hover:bg-danger-light transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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

export default UpcomingAppointments;