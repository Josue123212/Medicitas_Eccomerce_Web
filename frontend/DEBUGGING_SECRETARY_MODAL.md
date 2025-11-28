# 🔍 Guía de Debugging: Botón "Crear Secretaria"

## 🎯 Objetivo
Debuguear el botón "Crear Secretaria" del modal form para identificar y resolver cualquier problema.

## 📋 Pasos de Debugging

### 1. Verificar el Estado del Frontend

1. **Abrir el navegador** en `http://localhost:5173/`
2. **Hacer login como admin** (usuario: admin, contraseña: admin123)
3. **Abrir las herramientas de desarrollador** (F12)
4. **Ir a la sección de Secretarias** y hacer clic en "Nueva Secretaria"

### 2. Verificar el Modal

Cuando el modal se abra, deberías ver:
- ✅ Un panel amarillo de debugging en la parte superior
- ✅ Todos los campos del formulario
- ✅ El botón "Crear Secretaria" al final

### 3. Verificar la Consola del Navegador

En la consola deberías ver:
```
🚀 Iniciando debugging del modal de crear secretaria...
📋 Modal encontrado: ✅ Sí
📝 Formulario encontrado: ✅ Sí
🔘 Botón submit encontrado: ✅ Sí
```

### 4. Llenar el Formulario

Llena todos los campos requeridos:
- **Nombre**: Test
- **Apellido**: Secretary
- **Usuario**: test_secretary_debug
- **Email**: test@debug.com
- **Contraseña**: testpass123
- **Teléfono**: 5551234567
- **ID Empleado**: EMP_DEBUG
- **Departamento**: Recepción

### 5. Verificar el Panel de Debug

El panel amarillo debería mostrar:
- **Mutation Status**: Ready
- **Form Valid**: ✅
- **Required Fields**: ✅ ✅ ✅ ✅ ✅

### 6. Hacer Clic en "Crear Secretaria"

Al hacer clic, en la consola deberías ver:
```
🚀 Submit button clicked
📊 Form data being submitted: { username: "test_secretary_debug", ... }
🔄 Mutation state before submit: { isPending: false, isError: false, isSuccess: false }
✅ All required fields present, submitting...
```

### 7. Verificar la Respuesta

Si todo va bien:
```
✅ Secretaria creada exitosamente
```

Si hay errores:
```
❌ Error creating secretary: [detalles del error]
```

## 🧪 Scripts de Prueba Disponibles

### Script 1: Debug Manual del Modal
```javascript
// Copiar y pegar en la consola cuando el modal esté abierto
// Archivo: debug_secretary_modal.js
```

### Script 2: Prueba de API Directa
```javascript
// Copiar y pegar en la consola después del login
// Archivo: test_secretary_frontend.js
```

## 🔧 Problemas Comunes y Soluciones

### Problema 1: Token de Autenticación
**Síntoma**: Error 401 Unauthorized
**Solución**: 
```javascript
// Verificar token en consola
console.log('Token:', localStorage.getItem('accessToken'));
```

### Problema 2: Campos Faltantes
**Síntoma**: Alert "Campos requeridos faltantes"
**Solución**: Verificar que todos los campos requeridos estén llenos

### Problema 3: Error de Permisos
**Síntoma**: Error 403 Forbidden
**Solución**: Verificar que el usuario tenga rol 'admin'

### Problema 4: Error de Validación
**Síntoma**: Error 400 Bad Request
**Solución**: Revisar los datos enviados en la consola

### Problema 5: Error de Red
**Síntoma**: Network Error
**Solución**: Verificar que el backend esté corriendo en puerto 8000

## 📊 Datos de Prueba Válidos

```javascript
const testData = {
  username: 'test_secretary_' + Date.now(),
  email: 'test_' + Date.now() + '@example.com',
  password: 'testpass123',
  first_name: 'Test',
  last_name: 'Secretary',
  phone_number: '5551234567',
  employee_id: 'EMP_' + Date.now(),
  department: 'Recepción',
  shift_start: '08:00',
  shift_end: '16:00',
  hire_date: '2024-01-15',
  can_manage_appointments: true,
  can_manage_patients: false,
  can_view_reports: false
};
```

## 🚀 Próximos Pasos

1. **Si el debugging muestra errores**: Revisar los logs detallados
2. **Si todo funciona**: Remover el componente de debugging
3. **Si hay problemas de UX**: Mejorar la interfaz de usuario
4. **Si hay problemas de validación**: Ajustar las reglas de validación

## 💡 Tips Adicionales

- Usar datos únicos para evitar conflictos de duplicados
- Verificar que el backend esté corriendo
- Revisar la red en las herramientas de desarrollador
- Usar el panel de debugging para monitorear el estado en tiempo real