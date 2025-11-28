# 🏥 Comando Generate Test Data

## 📋 Descripción
Comando de Django para generar datos de prueba para el sistema de gestión médica. Crea usuarios, doctores, pacientes y citas de manera automática para facilitar el desarrollo y testing.

## 🚀 Uso Básico

### Generar datos con valores por defecto
```bash
python manage.py generate_test_data --clear
```
**Resultado:** 10 usuarios, 5 doctores, 15 pacientes, 30 citas

### Generar datos personalizados
```bash
python manage.py generate_test_data --users 5 --doctors 3 --patients 10 --appointments 20
```

### Solo limpiar datos existentes
```bash
python manage.py generate_test_data --clear --users 0 --doctors 0 --patients 0 --appointments 0
```

## 🔧 Parámetros Disponibles

| Parámetro | Descripción | Valor por defecto |
|-----------|-------------|-------------------|
| `--users` | Número de usuarios generales a crear | 10 |
| `--doctors` | Número de doctores a crear | 5 |
| `--patients` | Número de pacientes a crear | 15 |
| `--appointments` | Número de citas a crear | 30 |
| `--clear` | Elimina todos los datos existentes antes de generar nuevos | False |

## 🎯 Características

### ✅ Datos Realistas
- **Usuarios:** Nombres, emails y teléfonos aleatorios
- **Doctores:** Especialidades médicas reales, años de experiencia, tarifas
- **Pacientes:** Información médica completa (alergias, condiciones, medicamentos)
- **Citas:** Fechas futuras, horarios de consulta realistas (9:00-17:00)

### ✅ Integridad de Datos
- Utiliza **transacciones atómicas** para garantizar consistencia
- Maneja automáticamente los **signals** que crean perfiles
- Genera **licencias médicas únicas** para cada doctor
- Valida disponibilidad de doctores para las citas

### ✅ Seguridad
- Contraseñas seguras para todos los usuarios
- Validación de datos antes de la inserción
- Manejo de errores robusto

## 🔄 Integración con Signals

El comando está diseñado para trabajar con los signals automáticos del sistema:

- **Doctor Signal:** Crea automáticamente perfil de doctor cuando se crea usuario con rol 'doctor'
- **Patient Signal:** Crea automáticamente perfil de paciente cuando se crea usuario con rol 'client'
- **Secretary Signal:** Crea automáticamente perfil de secretaria cuando se crea usuario con rol 'secretary'

## 📊 Ejemplo de Salida

```
🏥 Iniciando generación de datos de prueba...
🗑️  Eliminando datos existentes...
   Datos anteriores eliminados
👥 Creando 10 usuarios...
👨‍⚕️ Creando 5 doctores...
🏥 Creando 15 pacientes...
📅 Creando 30 citas...
✅ Datos de prueba generados exitosamente!
   👥 Usuarios: 10
   👨‍⚕️ Doctores: 5
   🏥 Pacientes: 15
   📅 Citas: 30
```

## 🛠️ Casos de Uso

### Desarrollo
```bash
# Datos mínimos para desarrollo
python manage.py generate_test_data --users 2 --doctors 2 --patients 5 --appointments 10
```

### Testing
```bash
# Datos completos para testing
python manage.py generate_test_data --clear
```

### Demo
```bash
# Datos específicos para demo
python manage.py generate_test_data --clear --users 5 --doctors 8 --patients 20 --appointments 50
```

## ⚠️ Notas Importantes

1. **Usar con precaución en producción:** Este comando está diseñado para desarrollo y testing
2. **Backup recomendado:** Siempre haz backup antes de usar `--clear` en datos importantes
3. **Performance:** La creación de muchas citas puede tomar tiempo debido a las validaciones
4. **Dependencias:** Requiere que las migraciones estén aplicadas correctamente

## 🐛 Solución de Problemas

### Error: "UNIQUE constraint failed"
- **Causa:** Datos duplicados en la base de datos
- **Solución:** Usar `--clear` para limpiar datos existentes

### Error: "No doctors or patients available"
- **Causa:** No hay doctores o pacientes para crear citas
- **Solución:** Asegurar que `--doctors` y `--patients` sean > 0 cuando `--appointments` > 0

### Error: "CommandError"
- **Causa:** Error en la lógica del comando
- **Solución:** Revisar logs detallados y verificar integridad de la base de datos