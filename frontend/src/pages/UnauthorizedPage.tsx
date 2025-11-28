import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * 🚫 PÁGINA DE ACCESO NO AUTORIZADO
 * 
 * Página mostrada cuando un usuario intenta acceder a una ruta
 * para la cual no tiene los permisos necesarios.
 * 
 * Características:
 * - Diseño centrado y responsive
 * - Información clara sobre el error
 * - Opciones de navegación para el usuario
 * - Integración con el contexto de autenticación
 */

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    // Redirigir según el rol del usuario
    switch (user?.role) {
      case 'admin':
      case 'superadmin':
        navigate('/dashboard');
        break;
      case 'doctor':
        navigate('/doctor/dashboard');
        break;
      case 'client':
        navigate('/client/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <Card className="card-base">
          <CardHeader className="text-center pb-4">
            {/* Icono de Error */}
            <div className="mx-auto mb-4 p-3 rounded-full" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
              <ShieldExclamationIcon className="h-12 w-12 text-red-500" />
            </div>
            
            <CardTitle className="title-lg text-gray-800 mb-2">
              Acceso Denegado
            </CardTitle>
            
            <p className="text-gray-600 text-base">
              No tienes permisos para acceder a esta página
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Información del Usuario */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Usuario:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Rol actual:</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Mensaje de Ayuda */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Si crees que esto es un error, contacta al administrador del sistema.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3">
              {/* Botón Ir al Inicio */}
              <Button 
                variant="primary" 
                onClick={handleGoHome}
                className="w-full flex items-center justify-center gap-2"
              >
                <HomeIcon className="h-4 w-4" />
                Ir al Inicio
              </Button>

              {/* Botón Volver */}
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver
              </Button>

              {/* Botón Cerrar Sesión */}
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Sistema de Gestión de Citas Médicas
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;