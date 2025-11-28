import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../../components/layout';
import WelcomeCard from '../../components/dashboard/WelcomeCard';
import { SystemStats } from '../../components/dashboard/superadmin/SystemStats';
import { SystemControls } from '../../components/dashboard/superadmin/SystemControls';
import { UserManagement } from '../../components/dashboard/superadmin/UserManagement';
import { dashboardService } from '../../services/dashboardService';
import type { SuperAdminDashboardData } from '../../types';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Query para datos del dashboard usando la API real
  const { data: dashboardData, isLoading: isDashboardLoading, error } = useQuery({
    queryKey: ['superadmin-dashboard'],
    queryFn: dashboardService.getSuperAdminDashboard,
    refetchInterval: 30000, // Actualizar cada 30 segundos
    staleTime: 10000 // Considerar datos frescos por 10 segundos
  });

  // Mapear datos para compatibilidad con componentes existentes
  const mappedDashboardData = dashboardData ? {
    totalUsers: dashboardData.system_overview.total_users,
    systemUptime: dashboardData.system_overview.system_uptime,
    dailyActivity: dashboardData.system_overview.daily_activity,
    databaseUsage: dashboardData.system_overview.database_usage
  } : undefined;

  const systemUsers = dashboardData?.recent_users || [];

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              Error al cargar el dashboard
            </div>
            <div className="text-gray-600">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Bienvenida */}
        <WelcomeCard 
          userName={user?.first_name || 'Super Administrador'} 
          role="Super Administrador"
          message="Control total del sistema y usuarios"
        />

        {/* Estadísticas del Sistema */}
        <SystemStats 
          data={mappedDashboardData} 
          isLoading={isDashboardLoading} 
        />

        {/* Controles del Sistema */}
        <SystemControls />

        {/* Gestión de Usuarios */}
        <UserManagement 
          users={systemUsers}
          isLoading={isDashboardLoading}
        />

        {/* Métricas Adicionales del Sistema */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuarios por Rol */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Usuarios por Rol
              </h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.users_by_role).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {role}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas de Citas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estado de Citas
              </h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.appointment_stats).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {status}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas de Crecimiento */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Métricas de Crecimiento
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.growth_metrics.users_this_month}
                  </div>
                  <div className="text-sm text-gray-600">Usuarios este mes</div>
                  <div className={`text-xs font-medium ${
                    dashboardData.growth_metrics.user_growth_percentage >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {dashboardData.growth_metrics.user_growth_percentage >= 0 ? '+' : ''}
                    {dashboardData.growth_metrics.user_growth_percentage}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.growth_metrics.appointments_this_month}
                  </div>
                  <div className="text-sm text-gray-600">Citas este mes</div>
                  <div className={`text-xs font-medium ${
                    dashboardData.growth_metrics.appointment_growth_percentage >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {dashboardData.growth_metrics.appointment_growth_percentage >= 0 ? '+' : ''}
                    {dashboardData.growth_metrics.appointment_growth_percentage}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.growth_metrics.users_last_month}
                  </div>
                  <div className="text-sm text-gray-600">Usuarios mes anterior</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData.growth_metrics.appointments_last_month}
                  </div>
                  <div className="text-sm text-gray-600">Citas mes anterior</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;