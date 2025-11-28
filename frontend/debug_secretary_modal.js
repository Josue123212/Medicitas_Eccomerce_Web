// 🔍 Script de debugging para el botón "Crear Secretaria" del modal
// Ejecutar en la consola del navegador cuando el modal esté abierto

console.log('🚀 Iniciando debugging del modal de crear secretaria...');

// 1. Verificar si el modal está presente en el DOM
const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
console.log('📋 Modal encontrado:', modal ? '✅ Sí' : '❌ No');

if (modal) {
  // 2. Verificar el formulario
  const form = modal.querySelector('form');
  console.log('📝 Formulario encontrado:', form ? '✅ Sí' : '❌ No');
  
  if (form) {
    // 3. Verificar el botón de submit
    const submitButton = form.querySelector('button[type="submit"]');
    console.log('🔘 Botón submit encontrado:', submitButton ? '✅ Sí' : '❌ No');
    
    if (submitButton) {
      console.log('🔘 Texto del botón:', submitButton.textContent);
      console.log('🔘 Botón deshabilitado:', submitButton.disabled);
      console.log('🔘 Clases del botón:', submitButton.className);
      
      // 4. Verificar los campos del formulario
      const inputs = form.querySelectorAll('input');
      console.log('📝 Campos encontrados:', inputs.length);
      
      const formData = {};
      inputs.forEach(input => {
        if (input.type === 'checkbox') {
          formData[input.name || 'unnamed'] = input.checked;
        } else {
          formData[input.name || 'unnamed'] = input.value;
        }
      });
      
      console.log('📊 Datos del formulario:', formData);
      
      // 5. Interceptar el evento submit
      const originalSubmit = form.onsubmit;
      form.addEventListener('submit', function(e) {
        console.log('🚀 Evento submit disparado');
        console.log('📊 Datos del evento:', e);
        
        // Verificar validación HTML5
        const isValid = form.checkValidity();
        console.log('✅ Formulario válido (HTML5):', isValid);
        
        if (!isValid) {
          console.log('❌ Errores de validación:');
          inputs.forEach(input => {
            if (!input.checkValidity()) {
              console.log(`  - ${input.name || input.type}: ${input.validationMessage}`);
            }
          });
        }
      });
      
      // 6. Verificar si hay listeners de React
      const reactFiber = submitButton._reactInternalFiber || 
                        submitButton._reactInternalInstance ||
                        Object.keys(submitButton).find(key => key.startsWith('__reactInternalInstance'));
      
      console.log('⚛️ React fiber encontrado:', reactFiber ? '✅ Sí' : '❌ No');
      
      // 7. Simular click en el botón (opcional - comentado por seguridad)
      /*
      console.log('🖱️ Simulando click en el botón...');
      submitButton.click();
      */
      
    }
  }
}

// 8. Verificar errores en la consola
console.log('🔍 Verificar errores en la consola del navegador...');

// 9. Verificar el estado de React Query (si está disponible)
if (window.__REACT_QUERY_DEVTOOLS__) {
  console.log('🔄 React Query DevTools disponible');
}

// 10. Verificar localStorage y sessionStorage
console.log('💾 Token en localStorage:', localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente');
console.log('💾 User en localStorage:', localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente');

console.log('✅ Debugging completado. Revisa los logs anteriores para identificar problemas.');