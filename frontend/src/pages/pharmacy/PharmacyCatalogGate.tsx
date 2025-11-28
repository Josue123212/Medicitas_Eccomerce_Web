import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PharmacyCatalogPage from './PharmacyCatalogPage';

/**
 * 🚪 PharmacyCatalogGate
 * Decide qué catálogo mostrar según el estado de autenticación.
 * - Invitado: muestra GuestCatalogPage
 * - Autenticado: muestra PharmacyCatalogPage (funciones desbloqueadas)
 */
const PharmacyCatalogGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return <PharmacyCatalogPage />;
};

export default PharmacyCatalogGate;