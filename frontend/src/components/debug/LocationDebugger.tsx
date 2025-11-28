// 🔍 Componente de debugging para rastrear cambios de ubicación
import React from 'react';
import { useLocation } from 'react-router-dom';

const LocationDebugger: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.log('🚨 DEBUG: ===== LOCATION CHANGED =====');
    console.log('🔍 New pathname:', location.pathname);
    console.log('🔍 Search:', location.search);
    console.log('🔍 Hash:', location.hash);
    console.log('🔍 State:', location.state);
    console.log('🔍 Full location object:', location);
    console.log('🔍 Window location:', window.location.href);
    console.log('🔍 Timestamp:', new Date().toISOString());
    console.log('===============================');
  }, [location]);

  // Este componente no renderiza nada visible
  return null;
};

export default LocationDebugger;