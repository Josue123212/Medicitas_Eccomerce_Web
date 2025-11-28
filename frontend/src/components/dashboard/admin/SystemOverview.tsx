import React from 'react';
import { Activity, Server, Database, AlertCircle } from 'lucide-react';
import type { AdminSystemOverview } from '../../../types';

interface SystemOverviewProps {
  data?: AdminSystemOverview;
  isLoading?: boolean;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({ 
  data, 
  isLoading = false 
}) => {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-success bg-success-light';
      case 'good':
        return 'text-primary bg-primary-light';
      case 'warning':
        return 'text-warning bg-warning-light';
      case 'critical':
        return 'text-danger bg-danger-light';
      default:
        return 'text-text-muted bg-secondary-100';
    }
  };

  const getHealthText = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Bueno';
      case 'warning':
        return 'Advertencia';
      case 'critical':
        return 'Crítico';
      default:
        return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Estado del Sistema</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-secondary-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const systemMetrics = [
    {
      title: 'Uptime del Servidor',
      value: data?.serverUptime || '99.9%',
      icon: Server,
      status: data?.serverStatus || 'excellent'
    },
    {
      title: 'Base de Datos',
      value: `${data?.databaseHealth || 95}%`,
      icon: Database,
      status: data?.databaseStatus || 'good'
    },
    {
      title: 'Tiempo de Respuesta',
      value: `${data?.responseTime || 120}ms`,
      icon: Activity,
      status: data?.responseStatus || 'good'
    },
    {
      title: 'Alertas Activas',
      value: data?.activeAlerts || 0,
      icon: AlertCircle,
      status: data?.alertStatus || 'excellent'
    }
  ];

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Estado del Sistema</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-5 w-5 text-text-muted" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(metric.status)}`}>
                  {getHealthText(metric.status)}
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-text-secondary">
                {metric.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional del sistema */}
      {data && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Último Backup:</span>
              <div className="font-medium text-text-primary">{data.lastBackup || 'No disponible'}</div>
            </div>
            <div>
              <span className="text-text-secondary">Usuarios Activos:</span>
              <div className="font-medium text-text-primary">{data.activeUsers || 0}</div>
            </div>
            <div>
              <span className="text-text-secondary">Versión del Sistema:</span>
              <div className="font-medium text-text-primary">{data.systemVersion || '1.0.0'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};