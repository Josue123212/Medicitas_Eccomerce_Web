import React from 'react';
import { Clock, User, Calendar } from 'lucide-react';

interface TodayScheduleProps {
  data?: any;
  isLoading?: boolean;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-secondary">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Usar datos reales del backend
  const appointments = data?.upcoming_appointments || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-success bg-green-50';
      case 'scheduled':
        return 'text-primary bg-primary-light';
      case 'pending':
        return 'text-warning bg-yellow-50';
      default:
        return 'text-secondary bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'scheduled':
        return 'Programada';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-secondary">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Próximas Citas
        </h3>
        <span className="text-sm text-secondary">{appointments.length} citas</span>
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((appointment: any) => (
            <div key={appointment.id} className="flex items-center space-x-3 p-3 border border-secondary rounded-lg hover:bg-primary-light transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary truncate">
                    {appointment.patient_name}
                  </p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-secondary">{appointment.time}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-secondary">{appointment.date}</span>
                  {appointment.reason && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-secondary">{appointment.reason}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-secondary">No hay citas programadas próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;