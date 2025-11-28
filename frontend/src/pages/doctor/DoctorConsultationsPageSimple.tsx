import React from 'react';

const DoctorConsultationsPageSimple: React.FC = () => {
  // 🚨 DEBUG: Componente montado
  React.useEffect(() => {
    console.log('🚨 DEBUG: ===== SIMPLE CONSULTATIONS PAGE MOUNTED =====');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Timestamp:', new Date().toISOString());
    
    return () => {
      console.log('🚨 DEBUG: ===== SIMPLE CONSULTATIONS PAGE UNMOUNTED =====');
      console.log('🔍 Timestamp:', new Date().toISOString());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Consultas Médicas - Versión Simple
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Esta es una versión simplificada de la página de consultas para debugging.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Si esta página se mantiene estable, el problema está en el Layout o sus componentes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultationsPageSimple;