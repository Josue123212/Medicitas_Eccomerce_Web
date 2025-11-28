import React from 'react';
import { 
  UserPlus, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3, 
  Shield 
} from 'lucide-react';
import { ActionButton } from '../ActionButton';

export const AdminQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Crear y administrar usuarios',
      icon: UserPlus,
      onClick: () => console.log('Gestionar usuarios')
    },
    {
      title: 'Ver Todas las Citas',
      description: 'Administrar citas del sistema',
      icon: Calendar,
      onClick: () => console.log('Ver citas')
    },
    {
      title: 'Generar Reportes',
      description: 'Crear reportes del sistema',
      icon: FileText,
      onClick: () => console.log('Generar reportes')
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      onClick: () => console.log('Configuración')
    },
    {
      title: 'Analíticas',
      description: 'Ver métricas detalladas',
      icon: BarChart3,
      onClick: () => console.log('Analíticas')
    },
    {
      title: 'Permisos',
      description: 'Gestionar roles y permisos',
      icon: Shield,
      onClick: () => console.log('Permisos')
    }
  ];

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Acciones Administrativas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
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
  );
};