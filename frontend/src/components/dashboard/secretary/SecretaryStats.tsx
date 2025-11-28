import React from 'react';
import { Calendar, Users, Clock, CheckCircle, Phone } from 'lucide-react';
import { StatsCard } from '../StatsCard';
import type { SecretaryDashboardData } from '../../../types';

interface SecretaryStatsProps {
  stats?: SecretaryDashboardData;
  isLoading?: boolean;
}

const SecretaryStats: React.FC<SecretaryStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background rounded-xl p-6 shadow-sm border border-border animate-pulse">
            <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-secondary-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-secondary-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Citas Hoy',
      value: stats?.appointments_today || 0,
      icon: Calendar,
      trend: stats?.appointments_today_change || 0,
      description: 'Citas programadas para hoy'
    },
    {
      title: 'Pacientes Atendidos',
      value: stats?.patients_managed_today || 0,
      icon: Users,
      trend: stats?.patients_change || 0,
      description: 'Pacientes gestionados hoy'
    },
    {
      title: 'Llamadas Realizadas',
      value: stats?.calls_made_today || 0,
      icon: Phone,
      trend: stats?.calls_change || 0,
      description: 'Llamadas de confirmación'
    },
    {
      title: 'Tareas Completadas',
      value: stats?.tasks_completed_today || 0,
      icon: CheckCircle,
      trend: stats?.tasks_change || 0,
      description: 'Tareas administrativas'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={<stat.icon className="w-6 h-6" />}
          trend={stat.trend}
          description={stat.description}
        />
      ))}
    </div>
  );
};

export default SecretaryStats;