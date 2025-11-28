# 📊 Documentación de Exportación CSV - Sistema de Citas Médicas

## 🎯 Descripción General

La **Fase 8.2** del desarrollo ha implementado un sistema completo de exportación de datos en formato CSV para el sistema de citas médicas. Este sistema permite a los administradores exportar información detallada de citas, pacientes, doctores y reportes completos del sistema.

## 🔐 Permisos y Autenticación

**IMPORTANTE**: Todos los endpoints de exportación requieren:
- ✅ Usuario autenticado
- ✅ Permisos de administrador (`IsAdminOrSuperAdmin`)
- ✅ Token JWT válido o sesión activa

## 📋 Endpoints Disponibles

### 1. 📅 Exportar Citas

**URL**: `/api/reports/export/appointments/`  
**Método**: `GET`  
**Descripción**: Exporta todas las citas del sistema con filtros opcionales

#### Filtros Disponibles:

| Parámetro | Formato | Descripción | Ejemplo |
|-----------|---------|-------------|----------|
| `start_date` | YYYY-MM-DD | Fecha de inicio | `2024-01-01` |
| `end_date` | YYYY-MM-DD | Fecha de fin | `2024-12-31` |
| `doctor_id` | Integer | ID del doctor específico | `1` |
| `patient_id` | Integer | ID del paciente específico | `1` |
| `status` | String | Estado de la cita | `completed`, `cancelled`, `scheduled`, `confirmed`, `no_show` |

#### Ejemplos de Uso:
```bash
# Todas las citas
GET /api/reports/export/appointments/

# Citas completadas
GET /api/reports/export/appointments/?status=completed

# Citas de un período específico
GET /api/reports/export/appointments/?start_date=2024-01-01&end_date=2024-03-31

# Citas de un doctor específico
GET /api/reports/export/appointments/?doctor_id=1&status=scheduled
```

#### Columnas del CSV:
- ID Cita
- Fecha
- Hora
- Estado
- Paciente
- Email Paciente
- Teléfono Paciente
- Doctor
- Email Doctor
- Especialización
- Motivo
- Notas
- Fecha Creación
- Última Actualización

---

### 2. 👥 Exportar Pacientes

**URL**: `/api/reports/export/patients/`  
**Método**: `GET`  
**Descripción**: Exporta todos los pacientes registrados en el sistema

#### Columnas del CSV:
- ID Paciente
- Nombre
- Apellido
- Email
- Teléfono
- Fecha Nacimiento
- Género
- Dirección
- Contacto Emergencia
- Teléfono Emergencia
- Historial Médico
- Alergias
- Fecha Registro

---

### 3. 👨‍⚕️ Exportar Doctores

**URL**: `/api/reports/export/doctors/`  
**Método**: `GET`  
**Descripción**: Exporta todos los doctores registrados en el sistema

#### Columnas del CSV:
- ID Doctor
- Nombre
- Apellido
- Email
- Teléfono
- Número Licencia
- Especialización
- Años Experiencia
- Tarifa Consulta
- Biografía
- Disponible
- Fecha Registro

---

### 4. 📊 Reporte Completo del Sistema

**URL**: `/api/reports/export/full-report/`  
**Método**: `GET`  
**Descripción**: Genera un reporte completo con estadísticas del sistema

#### Contenido del Reporte:
- **Estadísticas Generales**: Total de pacientes, doctores, citas por estado
- **Citas por Mes**: Últimos 6 meses con totales, completadas y canceladas
- **Top 5 Doctores**: Más solicitados con estadísticas de citas

---

## 🔧 Implementación Técnica

### Características Implementadas:

1. **✅ Exportación CSV Nativa**
   - Uso del módulo `csv` de Python
   - Headers HTTP apropiados (`Content-Type: text/csv`)
   - Nombres de archivo con timestamp

2. **✅ Filtros Avanzados**
   - Validación de parámetros de entrada
   - Mensajes de error descriptivos
   - Filtros combinables

3. **✅ Optimización de Consultas**
   - `select_related()` para evitar N+1 queries
   - Ordenamiento eficiente de resultados

4. **✅ Seguridad**
   - Permisos de administrador obligatorios
   - Validación de tipos de datos
   - Manejo seguro de errores

5. **✅ Formato Profesional**
   - Encabezados descriptivos en español
   - Formato de fechas consistente
   - Manejo de valores nulos (`N/A`)

### Estructura de Archivos:

```
backend/
├── apps/
│   └── reports/
│       ├── views.py          # Endpoints de exportación
│       └── urls.py           # Rutas configuradas
├── test_export_endpoints.py  # Script de pruebas
└── EXPORTACION_CSV_DOCS.md   # Esta documentación
```

---

## 🧪 Pruebas y Validación

### Script de Pruebas

Se ha creado `test_export_endpoints.py` que:
- ✅ Crea datos de muestra
- ✅ Prueba todos los endpoints
- ✅ Valida respuestas CSV
- ✅ Muestra ejemplos de uso

### Ejecutar Pruebas:
```bash
cd backend
python test_export_endpoints.py
```

---

## 📱 Uso desde Frontend

### Ejemplo con JavaScript/Fetch:

```javascript
// Exportar citas con filtros
const exportAppointments = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/reports/export/appointments/?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/csv'
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citas_export.csv';
    a.click();
  }
};

// Uso
exportAppointments({ status: 'completed', start_date: '2024-01-01' });
```

### Ejemplo con React:

```jsx
const ExportButton = ({ exportType, filters = {} }) => {
  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/reports/export/${exportType}/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${exportType}_export.csv`;
        link.click();
      }
    } catch (error) {
      console.error('Error exportando:', error);
    }
  };
  
  return (
    <button onClick={handleExport} className="btn btn-primary">
      📥 Exportar {exportType}
    </button>
  );
};
```

---

## 🚀 Próximos Pasos

### Mejoras Futuras Sugeridas:

1. **📊 Formatos Adicionales**
   - Exportación a Excel (XLSX)
   - Exportación a PDF
   - Exportación a JSON

2. **⚡ Optimizaciones**
   - Exportación asíncrona para grandes volúmenes
   - Compresión de archivos
   - Cache de reportes frecuentes

3. **📈 Analytics Avanzados**
   - Gráficos en reportes
   - Comparativas temporales
   - Métricas de rendimiento

4. **🔔 Notificaciones**
   - Email con archivo adjunto
   - Notificaciones push cuando esté listo
   - Historial de exportaciones

---

## 📞 Soporte

Para dudas o problemas con la exportación CSV:

1. **Verificar Permisos**: Asegurar que el usuario tenga rol de administrador
2. **Validar Filtros**: Revisar formato de fechas y parámetros
3. **Revisar Logs**: Consultar logs del servidor Django
4. **Probar Endpoints**: Usar la documentación automática en `/api/docs/`

---

*Documentación generada para la Fase 8.2 - Sistema de Exportación CSV*  
*Última actualización: Enero 2025*