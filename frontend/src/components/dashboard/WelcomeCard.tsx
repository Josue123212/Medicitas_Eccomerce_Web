import React from 'react';
import type { User } from '../../types/auth';
import type { DoctorDashboardStats } from '../../services/dashboardService';

interface WelcomeCardProps {
  user: User | null;
  customMessage?: string;
  dashboardData?: DoctorDashboardStats;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ user, customMessage, dashboardData }) => {
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Buenos días';
    if (currentHour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>
            {customMessage || `${getGreeting()}, ${user?.firstName || 'Usuario'}`}
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            {getCurrentDate()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: 'var(--success)' }}
            ></div>
            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Cuenta Activa
            </span>
          </div>
          
          {/* User Avatar */}
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-medium text-lg"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            {user?.firstName?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-6 lg:mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
            {dashboardData?.upcoming_appointments?.length || 0}
          </div>
          <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Citas Próximas
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
            {dashboardData?.appointments?.completed || 0}
          </div>
          <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Citas Completadas
          </div>
        </div>
        
        <div className="text-center col-span-2 sm:col-span-1">
          <div className="text-xl sm:text-2xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
            {dashboardData?.patients?.total_unique || 0}
          </div>
          <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Pacientes Totales
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;