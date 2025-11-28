import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { dashboardService } from '../../services/dashboardService';
import type { AdminDashboardStats } from '../../services/dashboardService';
import { 
  TrendChart, 
  VolumeChart, 
  AdminBarChart, 
  AdminPieChart, 
  MultiMetricChart,
  QuickStat
} from '../../components/admin/charts/AdminCharts';
import {
  Users,
  UserCheck,
  Stethoscope,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart3,
  RefreshCw
} from 'lucide-react';

// 🎨 Colores heredados del sistema de diseño centralizado
const COLORS = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)', 
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--info)',
  blue: 'var(--primary)',
  green: 'var(--success)',
  purple: '#8b5cf6',
  orange: 'var(--warning)'
};

const AdminDashboard: React.FC = () => {
  const { user, logout, refreshUserProfile } = useAuth();
  const queryClient = useQueryClient();

  // 🔄 Obtener datos del dashboard desde la API
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useQuery<AdminDashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardService.getAdminDashboard(),
    refetchInterval: 30000, // Refrescar cada 30 segundos
    staleTime: 10000, // Considerar datos frescos por 10 segundos
    retry: (failureCount, error: any) => {
      // Si es un error de token, no reintentar automáticamente
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // 🔄 Función para manejar actualización manual
  const handleRefresh = async () => {
    try {
      // Limpiar caché de React Query
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      // Refrescar perfil de usuario (esto puede renovar el token)
      await refreshUserProfile();
      // Refetch de los datos
      await refetch();
    } catch (error) {
      console.error('Error al actualizar:', error);
      // Si hay error de autenticación, hacer logout
      logout();
    }
  };

  // 🔄 Verificar si es un error de autenticación
  const isAuthError = error && (error as any)?.response?.status === 401;

  // 🔄 Estados de carga y error
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <div>
                  <h3 className="text-red-800 font-medium">
                    {isAuthError ? 'Sesión expirada' : 'Error al cargar el dashboard'}
                  </h3>
                  <p className="text-red-600 text-sm mt-1">
                    {isAuthError 
                      ? 'Tu sesión ha expirado. Haz clic en "Actualizar" para renovar tu sesión o inicia sesión nuevamente.'
                      : (error instanceof Error ? error.message : 'Error desconocido')
                    }
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                {isAuthError && (
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cerrar Sesión
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 🔄 Mapear datos del backend a la estructura esperada por el frontend
  const mappedStats = dashboardData ? {
    total_users: dashboardData.total_users || 0,
    total_doctors: dashboardData.total_doctors || 0,
    total_patients: dashboardData.total_patients || 0,
    appointments_today: dashboardData.appointments_today || 0,
    appointments_this_month: dashboardData.appointments_this_month || 0,
    new_registrations_today: dashboardData.new_registrations_today || 0,
    completion_rate: dashboardData.completion_rate || 0
  } : {};

  // 📊 Preparar datos para gráficos
  const monthlyData = dashboardData?.monthly_stats || [];
  const specializationData = dashboardData?.specialization_stats || [];
  const revenueData = dashboardData?.revenue_stats || [];
  const systemHealthData = dashboardData?.system_health || {};

  // 📊 Renderizado del dashboard
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 🎯 Encabezado */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {user?.first_name || user?.username}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleString('es-ES')}
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Sistema Activo</span>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* 📈 Métricas principales con iconos modernos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickStat
            title="Total Usuarios"
            value={mappedStats.total_users}
            change={`+${mappedStats.new_registrations_today} este mes`}
            icon={<Users />}
            color="blue"
            trend={mappedStats.new_registrations_today > 0 ? 'up' : 'stable'}
          />
          
          <QuickStat
            title="Doctores Activos"
            value={mappedStats.total_doctors}
            change={`${mappedStats.total_patients} pacientes`}
            icon={<Stethoscope />}
            color="green"
            trend="up"
          />
          
          <QuickStat
            title="Citas Este Mes"
            value={mappedStats.appointments_this_month}
            change={`${mappedStats.appointments_today} hoy`}
            icon={<Calendar />}
            color="purple"
            trend={mappedStats.appointments_today > 0 ? 'up' : 'stable'}
          />
          
          <QuickStat
            title="Tasa de Completitud"
            value={`${mappedStats.completion_rate}%`}
            change="Citas completadas"
            icon={<CheckCircle />}
            color="orange"
            trend="up"
          />
        </div>

        {/* 📊 Métricas de rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickStat
            title="Tasa de Completitud"
            value={`${dashboardData?.completion_rate || 0}%`}
            change="Citas completadas"
            icon={<CheckCircle />}
            color="green"
            trend={dashboardData?.completion_rate > 80 ? 'up' : 'down'}
          />
          
          <QuickStat
            title="Tasa de Cancelación"
            value={`${dashboardData?.cancellation_rate || 0}%`}
            change="Citas canceladas"
            icon={<XCircle />}
            color="red"
            trend={dashboardData?.cancellation_rate < 10 ? 'up' : 'down'}
          />
          
          <QuickStat
            title="No-Show Rate"
            value={`${dashboardData?.no_show_rate || 0}%`}
            change="Pacientes ausentes"
            icon={<Clock />}
            color="orange"
            trend={dashboardData?.no_show_rate < 5 ? 'up' : 'down'}
          />
          
          <QuickStat
            title="Ingresos del Mes"
            value={`$${dashboardData?.total_revenue?.toLocaleString() || '0'}`}
            change="Ingresos totales"
            icon={<DollarSign />}
            color="blue"
            trend="up"
          />
        </div>

        {/* 📊 Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencia de citas mensuales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Tendencia de Citas Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart 
                data={monthlyData}
                dataKey="appointments"
                color={COLORS.blue}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Distribución por especialización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Citas por Especialización
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminPieChart 
                data={specializationData}
                dataKey="count"
                nameKey="specialization"
                height={300}
              />
            </CardContent>
          </Card>

          {/* Volumen de pacientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Volumen de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VolumeChart 
                title="Volumen de Pacientes"
                data={monthlyData}
                dataKeys={[
                  { key: 'patients', name: 'Pacientes', color: COLORS.purple }
                ]}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Métricas múltiples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Métricas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MultiMetricChart 
                data={monthlyData}
                metrics={[
                  { key: 'appointments', name: 'Citas', color: COLORS.blue },
                  { key: 'patients', name: 'Pacientes', color: COLORS.green },
                  { key: 'doctors', name: 'Doctores', color: COLORS.purple }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* 🏆 Top Doctores y Actividades Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Doctores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Top Doctores por Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(dashboardData?.top_doctors || []).slice(0, 5).map((doctor, index) => (
                  <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{doctor.total_appointments} citas</p>
                      <p className="text-sm text-green-600 font-medium">
                        {doctor.appointments_completed} completadas
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay datos de doctores disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actividades Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Actividades Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(dashboardData?.recent_activities || []).slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'appointment' ? 'bg-blue-500' :
                      activity.type === 'patient' ? 'bg-green-500' :
                      activity.type === 'doctor' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay actividades recientes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;