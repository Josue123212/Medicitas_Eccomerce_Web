import React from 'react';
import { 
  Settings, 
  Database, 
  Shield, 
  Download, 
  Upload, 
  RefreshCw,
  AlertTriangle,
  Monitor
} from 'lucide-react';
import { ActionButton } from '../ActionButton';

export const SystemControls: React.FC = () => {
  const systemActions = [
    {
      title: 'Backup Base de Datos',
      description: 'Crear respaldo completo',
      icon: Database,
      onClick: () => console.log('Backup BD')
    },
    {
      title: 'Configuración Sistema',
      description: 'Ajustes generales',
      icon: Settings,
      onClick: () => console.log('Configuración')
    },
    {
      title: 'Logs de Seguridad',
      description: 'Ver registros de acceso',
      icon: Shield,
      onClick: () => console.log('Logs seguridad')
    },
    {
      title: 'Exportar Datos',
      description: 'Descargar información',
      icon: Download,
      onClick: () => console.log('Exportar')
    },
    {
      title: 'Importar Datos',
      description: 'Cargar información',
      icon: Upload,
      onClick: () => console.log('Importar')
    },
    {
      title: 'Reiniciar Servicios',
      description: 'Restart del sistema',
      icon: RefreshCw,
      onClick: () => console.log('Reiniciar')
    }
  ];

  const monitoringActions = [
    {
      title: 'Monitor del Sistema',
      description: 'Ver estado en tiempo real',
      icon: Monitor,
      onClick: () => console.log('Monitor')
    },
    {
      title: 'Alertas Críticas',
      description: 'Revisar problemas',
      icon: AlertTriangle,
      onClick: () => console.log('Alertas')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Controles del Sistema */}
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Controles del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemActions.map((action, index) => (
            <ActionButton
              key={index}
              title={action.title}
              description={action.description}
              icon={<action.icon className="w-6 h-6" />}
              variant="secondary"
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>

      {/* Monitoreo */}
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Monitoreo y Alertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitoringActions.map((action, index) => (
            <ActionButton
              key={index}
              title={action.title}
              description={action.description}
              icon={<action.icon className="w-6 h-6" />}
              variant="secondary"
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-border rounded-lg">
            <div className="w-3 h-3 bg-success rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-text-primary">API</div>
            <div className="text-xs text-text-secondary">Operativo</div>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <div className="w-3 h-3 bg-success rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-text-primary">Base de Datos</div>
            <div className="text-xs text-text-secondary">Operativo</div>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <div className="w-3 h-3 bg-warning rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-text-primary">Cache</div>
            <div className="text-xs text-text-secondary">Advertencia</div>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <div className="w-3 h-3 bg-success rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-text-primary">Storage</div>
            <div className="text-xs text-text-secondary">Operativo</div>
          </div>
        </div>
      </div>
    </div>
  );
};