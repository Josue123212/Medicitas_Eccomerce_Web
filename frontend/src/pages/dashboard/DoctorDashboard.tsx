import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../../components/layout';
import WelcomeCard from '../../components/dashboard/WelcomeCard';
import DoctorStats from '../../components/dashboard/doctor/DoctorStats';
import TodaySchedule from '../../components/dashboard/doctor/TodaySchedule';
import PatientSummary from '../../components/dashboard/doctor/PatientSummary';
import DoctorQuickActions from '../../components/dashboard/doctor/DoctorQuickActions';
import { dashboardService } from '../../services/dashboardService';
import type { DoctorDashboardStats } from '../../services/dashboardService';

const DoctorDashboard: React.FC = () => {
  // 🚨 DEBUG: Componente montado
  React.useEffect(() => {
    console.log('🚨 DEBUG: ===== DOCTOR DASHBOARD MOUNTED =====');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Timestamp:', new Date().toISOString());
    
    return () => {
      console.log('🚨 DEBUG: ===== DOCTOR DASHBOARD UNMOUNTED =====');
      console.log('🔍 Timestamp:', new Date().toISOString());
    };
  }, []);

  const { user } = useAuth();

  // 🔄 Obtener datos del dashboard desde la API
  const { 
    data: dashboardData, 
    isLoading, 
    error 
  } = useQuery<DoctorDashboardStats>({
    queryKey: ['doctor-dashboard'],
    queryFn: () => dashboardService.getDoctorDashboard(),
    refetchInterval: 60000, // Refrescar cada minuto
    staleTime: 30000 // Considerar datos frescos por 30 segundos
  });

  // 🔄 Estados de carga y error
  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
              <div className="xl:col-span-2 h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error al cargar el dashboard</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleQuickAction = (action: string) => {
    console.log(`Acción rápida: ${action}`);
    // Aquí implementarías la navegación o acción correspondiente
    switch (action) {
      case 'new-appointment':
        // navigate('/appointments/new');
        break;
      case 'patient-search':
        // navigate('/patients/search');
        break;
      case 'emergency':
        // navigate('/emergency');
        break;
      case 'prescriptions':
        // navigate('/prescriptions');
        break;
      default:
        console.log('Acción no reconocida');
    }
  };

  // 🔄 Mapear datos del backend a la estructura esperada por los componentes
  const mappedDashboardData = dashboardData ? {
    role: 'doctor' as const,
    metrics: {
      appointments_today: {
        value: dashboardData.appointments?.today || 0,
        change: 0,
        period: 'vs ayer'
      },
      total_patients: {
        value: dashboardData.patients?.total_unique || 0,
        change: 0,
        period: 'vs mes anterior'
      },
      appointments_this_week: {
        value: dashboardData.appointments?.this_week || 0,
        change: 0,
        period: 'vs semana anterior'
      },
      average_rating: {
        value: 4.8, // Valor por defecto hasta que se implemente
        change: 0,
        period: 'vs mes anterior'
      }
    },
    availability_status: {
      is_available: dashboardData.doctor_info?.is_available || false,
      shift_end: dashboardData.schedule?.work_end_time || '18:00'
    },
    today_schedule: dashboardData.upcoming_appointments || [],
    recent_patients: [], // Se llenará cuando esté disponible en el backend
    performance_charts: {
      monthly_appointments: [],
      patient_satisfaction: []
    }
  } : undefined;

  return (
    <Layout>
      <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Welcome Section */}
        <WelcomeCard 
          user={user} 
          customMessage={`¡Buenos días, ${dashboardData?.doctor_info?.name || `Dr. ${user?.last_name}` || 'Doctor'}!`}
          dashboardData={dashboardData}
        />

        {/* Stats Section */}
        <DoctorStats stats={mappedDashboardData} isLoading={false} />

        {/* Quick Actions */}
        <DoctorQuickActions onAction={handleQuickAction} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Today's Schedule */}
          <div className="xl:col-span-2">
            <TodaySchedule 
              appointments={dashboardData?.upcoming_appointments || []} 
              isLoading={false}
            />
          </div>

          {/* Sidebar Content - Recent Patients */}
          <div className="space-y-6">
            <PatientSummary 
              patients={[]} 
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;