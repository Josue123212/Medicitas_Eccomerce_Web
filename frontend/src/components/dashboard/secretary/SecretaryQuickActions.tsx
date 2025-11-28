import React from 'react';
import { 
  Calendar, 
  UserPlus, 
  FileText, 
  Phone, 
  Clock, 
  Users 
} from 'lucide-react';
import { ActionButton } from '../ActionButton';

export const SecretaryQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Nueva Cita',
      description: 'Programar cita para paciente',
      icon: Calendar,
      onClick: () => console.log('Nueva cita')
    },
    {
      title: 'Registrar Paciente',
      description: 'Agregar nuevo paciente',
      icon: UserPlus,
      onClick: () => console.log('Registrar paciente')
    },
    {
      title: 'Gestionar Horarios',
      description: 'Ver y modificar horarios',
      icon: Clock,
      onClick: () => console.log('Gestionar horarios')
    },
    {
      title: 'Lista de Pacientes',
      description: 'Ver todos los pacientes',
      icon: Users,
      onClick: () => console.log('Lista pacientes')
    },
    {
      title: 'Reportes',
      description: 'Generar reportes diarios',
      icon: FileText,
      onClick: () => console.log('Reportes')
    },
    {
      title: 'Contactar Paciente',
      description: 'Llamar o enviar mensaje',
      icon: Phone,
      onClick: () => console.log('Contactar paciente')
    }
  ];

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Acciones Rápidas</h3>
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

export default SecretaryQuickActions;