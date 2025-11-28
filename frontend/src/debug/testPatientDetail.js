// 🔍 Script de Debug para Probar Detalle de Paciente
// Ejecutar en la consola del navegador

// Función para probar obtener un paciente específico
async function testGetPatient(patientId = 1) {
  console.log(`🔍 Probando obtener paciente con ID: ${patientId}`);
  
  try {
    // Verificar si hay token de acceso
    const accessToken = localStorage.getItem('accessToken');
    console.log('🔑 Token de acceso:', accessToken ? 'Presente' : 'No encontrado');
    
    if (!accessToken) {
      console.error('❌ No hay token de acceso en localStorage');
      return;
    }
    
    // Hacer la petición directamente
    const response = await fetch(`http://127.0.0.1:8000/api/patients/${patientId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log('📡 Respuesta del servidor:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos del paciente:', data);
      return data;
    } else {
      const errorData = await response.text();
      console.error('❌ Error del servidor:', errorData);
      return null;
    }
    
  } catch (error) {
    console.error('💥 Error en la petición:', error);
    return null;
  }
}

// Función para verificar el estado de autenticación
function checkAuthStatus() {
  console.log('🔍 Verificando estado de autenticación...');
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('🔑 Access Token:', accessToken ? 'Presente' : 'No encontrado');
  console.log('🔄 Refresh Token:', refreshToken ? 'Presente' : 'No encontrado');
  
  // Mostrar todo el localStorage
  console.log('💾 LocalStorage completo:', localStorage);
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessToken: accessToken,
    refreshToken: refreshToken
  };
}

// Exportar funciones para uso en consola
window.testGetPatient = testGetPatient;
window.checkAuthStatus = checkAuthStatus;

console.log('🚀 Scripts de debug cargados. Usa:');
console.log('   - checkAuthStatus() para verificar autenticación');
console.log('   - testGetPatient(1) para probar obtener paciente');