import React from 'react';
import { Server, Users, Activity, Database } from 'lucide-react';
import { StatsCard } from '../StatsCard';
import type { SuperAdminDashboardData } from '../../../types';

interface SystemStatsProps {
  data?: SuperAdminDashboardData;
  isLoading?: boolean;
}

export const SystemStats: React.FC<SystemStatsProps> = ({ 
  data, 
  isLoading = false 
}) => {
  const stats = [
    {
      title: 'Usuarios Totales',
      value: data?.totalUsers || 0,
      icon: Users,
      description: 'Usuarios registrados en el sistema'
    },
    {
      title: 'Uptime del Sistema',
      value: `${data?.systemUptime || 0}%`,
      icon: Server,
      description: 'Disponibilidad del sistema'
    },
    {
      title: 'Actividad Diaria',
      value: data?.dailyActivity || 0,
      icon: Activity,
      description: 'Acciones realizadas hoy'
    },
    {
      title: 'Uso de Base de Datos',
      value: `${data?.databaseUsage || 0}%`,
      icon: Database,
      description: 'Espacio utilizado en BD'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={<stat.icon className="w-6 h-6" />}
          description={stat.description}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};