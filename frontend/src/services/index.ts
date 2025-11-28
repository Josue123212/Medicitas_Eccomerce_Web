// 📦 Exportaciones Centralizadas de Servicios

// ==========================================
// SERVICIOS PRINCIPALES
// ==========================================

// Servicio de autenticación
export { authService } from './authService';

// Servicio de citas médicas
export { appointmentService } from './appointmentService';

// Servicio de doctores
export { doctorService } from './doctorService';

// Servicio de secretarias
export { secretaryService } from './secretaryService';

// Servicio de dashboards
export { dashboardService } from './dashboardService';

// ==========================================
// CONFIGURACIÓN DE API
// ==========================================

// Cliente HTTP base y helpers
export { default as api, apiHelpers } from './api';
export type { ApiResponse, PaginatedResponse, ApiError } from './api';

// 📋 EXPLICACIÓN:
// Este archivo centraliza todas las exportaciones de servicios
// para facilitar las importaciones en los componentes:
// 
// import { appointmentService, doctorService } from '@/services';
// 
// En lugar de:
// import { appointmentService } from '@/services/appointmentService';
// import { doctorService } from '@/services/doctorService';