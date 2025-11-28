import React from 'react';
import { Users, Calendar, TrendingUp, Shield } from 'lucide-react';
import { StatsCard } from '../StatsCard';
import type { AdminDashboardData } from '../../../types';

interface AdminStatsProps {
  data?: AdminDashboardData;
  isLoading?: boolean;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ 
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
      title: 'Citas del Mes',
      value: data?.monthlyAppointments || 0,
      icon: Calendar,
      description: 'Citas programadas este mes'
    },
    {
      title: 'Ingresos Mensuales',
      value: `$${data?.monthlyRevenue || 0}`,
      icon: TrendingUp,
      description: 'Ingresos generados este mes'
    },
    {
      title: 'Doctores Activos',
      value: data?.activeDoctors || 0,
      icon: Shield,
      description: 'Doctores disponibles actualmente'
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