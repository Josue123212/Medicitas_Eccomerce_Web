// 🧪 Script de prueba para simular la creación de secretaria desde el frontend
// Ejecutar en la consola del navegador después de hacer login como admin

console.log('🧪 Iniciando prueba de creación de secretaria...');

// Función para generar datos únicos
const generateUniqueData = () => {
  const timestamp = Date.now().toString(36);
  return {
    username: `test_secretary_${timestamp}`,
    email: `secretary_${timestamp}@test.com`,
    password: 'testpass123',
    first_name: 'Test',
    last_name: 'Secretary',
    phone_number: `555${timestamp.slice(-8)}`,
    employee_id: `EMP_${timestamp}`,
    department: 'Recepción',
    shift_start: '08:00',
    shift_end: '16:00',
    hire_date: '2024-01-15',
    can_manage_appointments: true,
    can_manage_patients: false,
    can_view_reports: false
  };
};

// Función para probar la API directamente
const testSecretaryAPI = async () => {
  try {
    console.log('🔑 Verificando token de autenticación...');
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('❌ No hay token de autenticación. Haz login primero.');
      return;
    }
    
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
    
    const secretaryData = generateUniqueData();
    console.log('📊 Datos a enviar:', secretaryData);
    
    console.log('🚀 Enviando request a la API...');
    const response = await fetch('http://localhost:8000/api/users/secretaries/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(secretaryData)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const responseData = await response.json();
    console.log('📄 Response Data:', responseData);
    
    if (response.ok) {
      console.log('✅ Secretaria creada exitosamente!');
      return responseData;
    } else {
      console.error('❌ Error al crear secretaria:', responseData);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    return null;
  }
};

// Función para probar el servicio React
const testReactService = async () => {
  try {
    console.log('⚛️ Probando servicio de React...');
    
    // Verificar si el servicio está disponible
    if (typeof window.secretaryService === 'undefined') {
      console.log('⚠️ secretaryService no está disponible en window. Intentando importar...');
      
      // Simular la llamada del servicio
      const secretaryData = generateUniqueData();
      
      // Usar fetch directamente como lo haría el servicio
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/users/secretaries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(secretaryData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Servicio React simulado exitoso:', result);
      } else {
        console.error('❌ Error en servicio React simulado:', result);
      }
      
      return result;
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de servicio React:', error);
    return null;
  }
};

// Función principal de prueba
const runTests = async () => {
  console.log('🏁 Ejecutando todas las pruebas...');
  
  // Prueba 1: API directa
  console.log('\n1️⃣ Prueba de API directa:');
  await testSecretaryAPI();
  
  // Prueba 2: Servicio React
  console.log('\n2️⃣ Prueba de servicio React:');
  await testReactService();
  
  console.log('\n✅ Pruebas completadas. Revisa los logs anteriores.');
};

// Ejecutar pruebas automáticamente
runTests();

// Exportar funciones para uso manual
window.testSecretaryAPI = testSecretaryAPI;
window.testReactService = testReactService;
window.generateUniqueData = generateUniqueData;

console.log('💡 Funciones disponibles:');
console.log('  - testSecretaryAPI(): Prueba la API directamente');
console.log('  - testReactService(): Prueba el servicio React');
console.log('  - generateUniqueData(): Genera datos únicos para pruebas');