// 🔍 Componente de Debug para Pacientes

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';

const PatientsDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Query para obtener pacientes
  const { data: patientsData, isLoading, error, refetch } = useQuery({
    queryKey: ['patients-debug'],
    queryFn: async () => {
      console.log('🔍 Ejecutando query de pacientes...');
      const token = localStorage.getItem('accessToken');
      console.log('🔍 Token presente:', !!token);
      console.log('🔍 Token (primeros 20 chars):', token?.substring(0, 20));
      
      try {
        const result = await patientService.getPatients();
        console.log('✅ Resultado de patientService.getPatients():', result);
        return result;
      } catch (err) {
        console.error('❌ Error en patientService.getPatients():', err);
        throw err;
      }
    },
    enabled: isAuthenticated,
  });

  const testManualFetch = async () => {
    setDebugInfo('Probando fetch manual...');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/patients/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      setDebugInfo(`Status: ${response.status}\nResponse: ${responseText}`);
    } catch (err: any) {
      setDebugInfo(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🔍 Debug de Pacientes</h2>
      
      {/* Estado de Autenticación */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">🔐 Estado de Autenticación</h3>
        <div className="space-y-2">
          <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
          <p><strong>Usuario:</strong> {user ? `${user.first_name} ${user.last_name} (${user.role})` : 'No hay usuario'}</p>
          <p><strong>Token en localStorage:</strong> {localStorage.getItem('accessToken') ? '✅ Presente' : '❌ Ausente'}</p>
        </div>
      </div>

      {/* Estado de la Query */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-yellow-900">📊 Estado de la Query</h3>
        <div className="space-y-2">
          <p><strong>Cargando:</strong> {isLoading ? '⏳ Sí' : '✅ No'}</p>
          <p><strong>Error:</strong> {error ? '❌ Sí' : '✅ No'}</p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 rounded">
              <p className="text-red-800 text-sm">
                <strong>Detalles del error:</strong> {error instanceof Error ? error.message : 'Error desconocido'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Datos de Pacientes */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-green-900">👥 Datos de Pacientes</h3>
        {patientsData ? (
          <div className="space-y-2">
            <p><strong>Total de pacientes:</strong> {patientsData.count}</p>
            <p><strong>Pacientes en esta página:</strong> {patientsData.results?.length || 0}</p>
            {patientsData.results && patientsData.results.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Primeros 3 pacientes:</h4>
                <ul className="space-y-1">
                  {patientsData.results.slice(0, 3).map((patient: any) => (
                    <li key={patient.id} className="text-sm">
                      • {patient.user?.first_name || ''} {patient.user?.last_name || ''} ({patient.user?.email || 'Email no disponible'})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No hay datos disponibles</p>
        )}
      </div>

      {/* Debug manual */}
      {debugInfo && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-purple-900">🧪 Test Manual</h3>
          <pre className="text-sm bg-white p-2 rounded border overflow-auto">
            {debugInfo}
          </pre>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={testManualFetch}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🧪 Test Manual Fetch
        </button>
        
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🔄 Refrescar Query
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refrescar Página
        </button>
      </div>
    </div>
  );
};

export default PatientsDebug;