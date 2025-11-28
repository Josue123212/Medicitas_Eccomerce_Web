import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from './ActionButton';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'new-appointment',
      title: 'Nueva Cita',
      description: 'Agendar una nueva cita médica',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => {
        console.log('🚀 Botón Nueva Cita clickeado');
        console.log('📍 Navegando a: /client/appointments');
        console.log('📦 Estado:', { openModal: true });
        navigate('/client/appointments', { state: { openModal: true } });
      },
      variant: 'primary' as const
    },
    {
      id: 'my-appointments',
      title: 'Mis Citas',
      description: 'Ver y gestionar mis citas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigate('/client/appointments'),
      variant: 'secondary' as const
    },
    {
      id: 'find-doctor',
      title: 'Buscar Doctor',
      description: 'Encontrar especialistas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      onClick: () => navigate('/doctors'),
      variant: 'secondary' as const
    },
    {
      id: 'medical-history',
      title: 'Historial Médico',
      description: 'Ver mi historial completo',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => navigate('/client/medical-history'),
      variant: 'secondary' as const
    }
  ];

  return (
    <div className="bg-background rounded-xl lg:rounded-2xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-light text-text-primary mb-2">
          Acciones Rápidas
        </h2>
        <p className="text-sm sm:text-base text-text-secondary">
          Gestiona tus citas y servicios médicos
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={action.onClick}
            variant={action.variant}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;