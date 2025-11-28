import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DoctorDashboard from './DoctorDashboard';
import SecretaryDashboard from './SecretaryDashboard';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import ClientDashboard from './ClientDashboard';
import { Layout } from '../../components/layout/Layout';


/**
 * 🎯 DASHBOARD PRINCIPAL CON ENRUTAMIENTO POR ROL
 * 
 * Este componente actúa como un router inteligente que:
 * - Detecta el rol del usuario autenticado
 * - Renderiza el dashboard específico para ese rol
 * - Maneja estados de carga y error
 * - Proporciona fallback para roles no reconocidos
 */
export const DashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  // 🔄 Estado de carga
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ❌ Usuario no autenticado
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Acceso Denegado
            </h2>
            <p className="text-text-secondary">
              Debes iniciar sesión para acceder al dashboard.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // 🎯 Enrutamiento por rol
  switch (user.role) {
    case 'doctor':
      return <DoctorDashboard />;
    case 'secretary':
      return <SecretaryDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'superadmin':
      return <SuperAdminDashboard />;
    case 'client':
      return <ClientDashboard />;
    default:
      return (
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Dashboard no disponible
              </h2>
              <p className="text-text-secondary">
                No se encontró un dashboard para tu rol.
              </p>
            </div>
          </div>
        </Layout>
      );
  }
};

// 📋 DOCUMENTACIÓN DEL COMPONENTE:
/**
 * ## DashboardPage - Router Principal de Dashboards
 * 
 * ### 🎯 Propósito
 * Componente principal que actúa como punto de entrada único para todos los dashboards
 * del sistema, enrutando automáticamente según el rol del usuario autenticado.
 * 
 * ### 🔧 Funcionalidades
 * - **Detección automática de rol**: Lee el rol del usuario desde el contexto de autenticación
 * - **Enrutamiento inteligente**: Renderiza el dashboard específico para cada rol
 * - **Manejo de estados**: Gestiona carga, error y casos edge
 * - **Fallback seguro**: Proporciona mensajes informativos para casos no contemplados
 * 
 * ### 📊 Dashboards Soportados
 * - **Doctor**: `DoctorDashboard` - Panel médico con agenda y pacientes
 * - **Secretaria**: `SecretaryDashboard` - Gestión de citas y cola de pacientes
 * - **Admin**: `AdminDashboard` - Administración general del sistema
 * - **SuperAdmin**: `SuperAdminDashboard` - Control total del sistema
 * - **Cliente**: Pendiente de implementación
 * 
 * ### 🔒 Seguridad
 * - Verifica autenticación antes de mostrar contenido
 * - Valida roles antes del enrutamiento
 * - Proporciona mensajes de error informativos
 * 
 * ### 🎨 UX/UI
 * - Estados de carga con spinner
 * - Mensajes de error claros y accionables
 * - Diseño consistente con el sistema de colores
 * - Responsive y accesible
 * 
 * ### 🔄 Flujo de Uso
 * 1. Usuario accede a `/dashboard`
 * 2. Hook `useAuth` obtiene datos del usuario
 * 3. Componente valida autenticación y rol
 * 4. Renderiza dashboard específico o mensaje de error
 * 5. Dashboard específico maneja su propia lógica y datos
 */