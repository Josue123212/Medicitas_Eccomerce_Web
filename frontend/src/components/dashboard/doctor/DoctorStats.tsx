import React from 'react';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';

interface DoctorStatsProps {
  data?: any;
  isLoading?: boolean;
}

const DoctorStats: React.FC<DoctorStatsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Usar datos reales del backend si están disponibles
  const appointments = data?.appointments || {};
  const patients = data?.patients || {};
  
  // Calcular porcentaje de completadas
  const totalAppointments = appointments.total || 0;
  const completedAppointments = appointments.completed || 0;
  const completionRate = totalAppointments > 0 
    ? Math.round((completedAppointments / totalAppointments) * 100)
    : 0;

  const stats = [
    {
      title: 'Citas Hoy',
      value: appointments.today?.toString() || '0',
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary-light'
    },
    {
      title: 'Pacientes Totales',
      value: patients.total_unique?.toString() || '0',
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Citas Pendientes',
      value: appointments.pending?.toString() || '0',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Completadas',
      value: `${completionRate}%`,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DoctorStats;