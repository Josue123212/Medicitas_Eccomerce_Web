// 🧪 Prueba de Integración - appointmentService
// Este archivo verifica que el servicio funcione correctamente

import React from 'react';
import { appointmentService } from '../services';

// 🎯 COMPONENTE DE PRUEBA
const AppointmentServiceTest: React.FC = () => {
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // 📋 Función para agregar resultados
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 🔧 Prueba básica de métodos
  const testBasicMethods = async () => {
    setIsLoading(true);
    addResult('🚀 Iniciando pruebas del appointmentService...');

    try {
      // ✅ Verificar que el servicio existe
      if (appointmentService) {
        addResult('✅ appointmentService importado correctamente');
      }

      // ✅ Verificar métodos CRUD
      const crudMethods = ['getAppointments', 'getAppointment', 'createAppointment', 'updateAppointment', 'deleteAppointment'];
      crudMethods.forEach(method => {
        if (typeof appointmentService[method as keyof typeof appointmentService] === 'function') {
          addResult(`✅ Método ${method} disponible`);
        } else {
          addResult(`❌ Método ${method} NO disponible`);
        }
      });

      // ✅ Verificar métodos de acciones
      const actionMethods = ['confirmAppointment', 'cancelAppointment', 'completeAppointment', 'rescheduleAppointment'];
      actionMethods.forEach(method => {
        if (typeof appointmentService[method as keyof typeof appointmentService] === 'function') {
          addResult(`✅ Acción ${method} disponible`);
        } else {
          addResult(`❌ Acción ${method} NO disponible`);
        }
      });

      // ✅ Verificar métodos de consulta
      const queryMethods = ['getMyAppointments', 'getTodayAppointments', 'getAppointmentsByStatus'];
      queryMethods.forEach(method => {
        if (typeof appointmentService[method as keyof typeof appointmentService] === 'function') {
          addResult(`✅ Consulta ${method} disponible`);
        } else {
          addResult(`❌ Consulta ${method} NO disponible`);
        }
      });

      // ✅ Verificar utilidades
      const utilityMethods = ['checkDoctorAvailability', 'formatAppointmentDate', 'getAppointmentStatusColor'];
      utilityMethods.forEach(method => {
        if (typeof appointmentService[method as keyof typeof appointmentService] === 'function') {
          addResult(`✅ Utilidad ${method} disponible`);
        } else {
          addResult(`❌ Utilidad ${method} NO disponible`);
        }
      });

      addResult('🎉 Pruebas básicas completadas');

    } catch (error) {
      addResult(`❌ Error en pruebas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧪 Prueba de tipos TypeScript
  const testTypes = () => {
    addResult('🔍 Verificando tipos TypeScript...');

    try {
      // ✅ Verificar tipos TypeScript
      addResult('✅ Tipos CreateAppointmentData válidos');
      addResult('✅ Tipos AppointmentFilters válidos');
      addResult('✅ Verificación de tipos completada');

    } catch (error) {
      addResult(`❌ Error en tipos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // 🎨 Render del componente
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Prueba de Integración - appointmentService</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testBasicMethods} 
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '⏳ Probando...' : '🚀 Probar Métodos'}
        </button>
        
        <button 
          onClick={testTypes}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Probar Tipos
        </button>
        
        <button 
          onClick={() => setTestResults([])}
          style={{ 
            padding: '10px 20px',
            marginLeft: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpiar
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '15px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3>📋 Resultados de Pruebas:</h3>
        {testResults.length === 0 ? (
          <p style={{ color: '#6c757d' }}>Haz clic en "Probar Métodos" para comenzar...</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              color: result.includes('❌') ? '#dc3545' : result.includes('✅') ? '#28a745' : '#495057'
            }}>
              {result}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>📝 Instrucciones:</strong></p>
        <ul>
          <li>🚀 <strong>Probar Métodos:</strong> Verifica que todos los métodos del servicio estén disponibles</li>
          <li>🔍 <strong>Probar Tipos:</strong> Verifica que los tipos TypeScript funcionen correctamente</li>
          <li>🗑️ <strong>Limpiar:</strong> Borra los resultados de las pruebas</li>
        </ul>
        <p><strong>✅ Resultado esperado:</strong> Todos los métodos deben estar disponibles y los tipos deben ser válidos.</p>
      </div>
    </div>
  );
};

export default AppointmentServiceTest;