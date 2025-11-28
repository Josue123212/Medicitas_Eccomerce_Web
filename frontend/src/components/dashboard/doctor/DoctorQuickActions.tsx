import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, Settings, Clock, UserPlus, CalendarCheck } from 'lucide-react';
import { ActionButton } from '../ActionButton';

interface DoctorQuickActionsProps {
  onAction?: (action: string) => void;
}

const DoctorQuickActions: React.FC<DoctorQuickActionsProps> = ({ onAction }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'manage-appointments',
      title: 'Gestionar Citas',
      description: 'Administrar todas las citas',
      icon: CalendarCheck,
      color: 'blue',
      onClick: () => {
        console.log('🔍 DEBUG: Clic en botón GESTIONAR CITAS');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Navigating to: /doctor/appointments');
        navigate('/doctor/appointments');
        console.log('🔍 Navigate called for appointments');
        onAction?.('manage-appointments');
      }
    },
    {
      id: 'view-schedule',
      title: 'Ver Agenda',
      description: 'Revisar citas programadas',
      icon: Calendar,
      color: 'cyan',
      onClick: () => {
        console.log('🔍 DEBUG: Clic en botón VER AGENDA');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Navigating to: /doctor/schedule');
        navigate('/doctor/schedule');
        console.log('🔍 Navigate called for schedule');
        onAction?.('view-schedule');
      }
    },
    {
      id: 'manage-patients',
      title: 'Mis Pacientes',
      description: 'Gestionar pacientes',
      icon: Users,
      color: 'green',
      onClick: () => {
        console.log('🔍 DEBUG: Clic en botón MIS PACIENTES');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Navigating to: /doctor/patients');
        navigate('/doctor/patients');
        console.log('🔍 Navigate called for patients');
        onAction?.('manage-patients');
      }
    },
    {
      id: 'medical-records',
      title: 'Historiales',
      description: 'Revisar expedientes',
      icon: FileText,
      color: 'purple',
      onClick: () => {
        console.log('🔍 DEBUG: Clic en botón HISTORIALES');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Navigating to: /doctor/patients');
        navigate('/doctor/patients');
        console.log('🔍 Navigate called for medical records');
        onAction?.('medical-records');
      }
    },
    {
      id: 'availability',
      title: 'Disponibilidad',
      description: 'Configurar horarios',
      icon: Clock,
      color: 'orange',
      onClick: () => {
        console.log('🔍 DEBUG: Clic en botón DISPONIBILIDAD');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Navigating to: /doctor/schedule');
        navigate('/doctor/schedule');
        console.log('🔍 Navigate called for availability');
        onAction?.('availability');
      }
    },
    {
      id: 'new-patient',
      title: 'Nuevo Paciente',
      description: 'Registrar paciente',
      icon: UserPlus,
      color: 'indigo',
      onClick: () => {
        console.log('🔍 DEBUG: Clic en botón NUEVO PACIENTE');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Navigating to: /doctor/patients');
        // Por ahora navega a la lista de pacientes
        navigate('/doctor/patients');
        console.log('🔍 Navigate called for new patient');
        onAction?.('new-patient');
      }
    },
    {
      id: 'consultations',
      title: 'Consultas',
      description: 'Historial médico',
      icon: FileText,
      color: 'emerald',
      onClick: () => {
        console.log('🚨 DEBUG: ===== CLIC EN CONSULTAS =====');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Current pathname:', window.location.pathname);
        console.log('🔍 Target route: /doctor/consultations');
        console.log('🔍 Navigate function:', typeof navigate);
        console.log('🔍 Timestamp:', new Date().toISOString());
        
        // Verificar si ya estamos en la ruta
        if (window.location.pathname === '/doctor/consultations') {
          console.log('⚠️ Ya estamos en /doctor/consultations');
        }
        
        navigate('/doctor/consultations');
        console.log('✅ Navigate called for consultations');
        
        // Verificar después de un momento
        setTimeout(() => {
          console.log('🔍 After navigate - Current location:', window.location.href);
        }, 100);
        
        onAction?.('consultations');
      }
    },
    {
      id: 'profile-settings',
      title: 'Mi Perfil',
      description: 'Configurar perfil',
      icon: Settings,
      color: 'gray',
      onClick: () => {
        console.log('🚨 DEBUG: ===== CLIC EN MI PERFIL =====');
        console.log('🔍 Current location:', window.location.href);
        console.log('🔍 Current pathname:', window.location.pathname);
        console.log('🔍 Target route: /doctor/profile');
        console.log('🔍 Navigate function:', typeof navigate);
        console.log('🔍 Timestamp:', new Date().toISOString());
        
        // Verificar si ya estamos en la ruta
        if (window.location.pathname === '/doctor/profile') {
          console.log('⚠️ Ya estamos en /doctor/profile');
        }
        
        navigate('/doctor/profile');
        console.log('✅ Navigate called for profile');
        
        // Verificar después de un momento
        setTimeout(() => {
          console.log('🔍 After navigate - Current location:', window.location.href);
        }, 100);
        
        onAction?.('profile-settings');
      }
    }
  ];

  return (
    <div className="bg-background rounded-xl p-6 shadow-sm border-border">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Acciones Rápidas
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            title={action.title}
            description={action.description}
            icon={<action.icon className="w-6 h-6" />}
            onClick={action.onClick}
            variant="secondary"
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorQuickActions;