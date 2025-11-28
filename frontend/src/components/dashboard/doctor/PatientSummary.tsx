import React from 'react';
import { Users, TrendingUp, UserPlus, Activity } from 'lucide-react';

interface PatientSummaryProps {
  data?: any;
  isLoading?: boolean;
}

const PatientSummary: React.FC<PatientSummaryProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-secondary">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Usar datos reales del backend
  const patients = data?.patients || {};
  const appointments = data?.appointments || {};

  const patientStats = [
    {
      label: 'Pacientes Totales',
      value: patients.total_unique || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary-light'
    },
    {
      label: 'Nuevos este Mes',
      value: patients.new_this_month || 0,
      icon: UserPlus,
      color: 'text-success',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Citas este Mes',
      value: appointments.this_month || 0,
      icon: Activity,
      color: 'text-info',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-secondary">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Resumen de Pacientes
        </h3>
        <TrendingUp className="h-5 w-5 text-success" />
      </div>

      <div className="space-y-4">
        {patientStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 border border-secondary rounded-lg hover:bg-primary-light transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-secondary">{stat.label}</span>
              </div>
              <span className="text-lg font-bold text-primary">{stat.value}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-secondary">
        <button className="w-full text-center text-primary hover:text-primary-hover text-sm font-medium">
          Ver todos los pacientes
        </button>
      </div>
    </div>
  );
};

export default PatientSummary;