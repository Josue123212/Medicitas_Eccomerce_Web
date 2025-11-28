import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UnauthorizedPage from '../../pages/UnauthorizedPage';

/**
 * 🛡️ COMPONENTE DE RUTA PROTEGIDA
 * 
 * Protege rutas que requieren autenticación.
 * Redirige al login si el usuario no está autenticado.
 * 
 * TODO: Integrar con el contexto de autenticación real cuando esté disponible
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}



/**
 * Componente de ruta protegida
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 🔄 Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Verificar roles si se especifican
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  // Si todo está bien, renderizar el contenido protegido
  return <>{children}</>;
};

/**
 * 🔓 COMPONENTE DE RUTA PÚBLICA
 * 
 * Para rutas que solo deben ser accesibles cuando NO estás autenticado
 * (como login, register). Redirige al dashboard si ya estás autenticado.
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 🔄 Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, mostrar el contenido público
  return <>{children}</>;
};

// 🔐 UTILIDADES DE AUTENTICACIÓN SIMULADA
// TODO: Reemplazar con autenticación real
const authUtils = {
  login: (email: string, _password: string): boolean => {
    // Simulación de login
    const mockUser = {
      id: '1',
      email,
      name: 'Usuario Demo',
      role: 'admin' as const
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  },

  logout: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
};

export { ProtectedRoute, PublicRoute, authUtils };
export default ProtectedRoute;