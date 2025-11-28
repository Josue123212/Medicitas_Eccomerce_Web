// 📊 Servicio para Dashboard y Estadísticas por Rol

import { apiHelpers } from './api';
import type { UserRole } from '../types/auth';

// ==========================================
// TIPOS PARA DASHBOARD
// ==========================================

/**
 * Estadísticas base para todos los dashboards
 */
interface BaseDashboardStats {
  user_role: UserRole;
  last_updated: string;
}

/**
 * Dashboard para Cliente
 */
export interface ClientDashboardStats extends BaseDashboardStats {
  user_role: 'client';
  total_appointments: number;
  upcoming_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  next_appointment?: {
    id: number;
    doctor_name: string;
    date: string;
    time: string;
    specialization: string;
  };
  recent_appointments: Array<{
    id: number;
    doctor_name: string;
    date: string;
    time: string;
    status: string;
    specialization: string;
  }>;
  favorite_doctors: Array<{
    id: number;
    name: string;
    specialization: string;
    total_appointments: number;
  }>;
}

/**
 * Dashboard para Doctor
 */
export interface DoctorDashboardStats extends BaseDashboardStats {
  user_role: 'doctor';
  total_appointments: number;
  appointments_today: number;
  appointments_this_week: number;
  appointments_this_month: number;
  total_patients: number;
  new_patients_this_month: number;
  average_rating: number;
  total_revenue: number;
  revenue_this_month: number;
  upcoming_appointments: number;
  pending_appointments: number;
  is_available: boolean;
  next_appointment?: {
    id: number;
    patient_name: string;
    time: string;
    reason: string;
  };
  today_schedule: Array<{
    id: number;
    patient_name: string;
    time: string;
    status: string;
    reason: string;
  }>;
  recent_patients: Array<{
    id: number;
    name: string;
    last_appointment: string;
    total_appointments: number;
  }>;
  monthly_revenue_chart: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }>;
}

/**
 * Dashboard para Secretaria - Actualizado para coincidir con el backend
 */
export interface SecretaryDashboardStats extends BaseDashboardStats {
  user_role: 'secretary';
  secretary_info: {
    id: number;
    name: string;
    employee_id: string;
    department: string;
    can_manage_appointments: boolean;
    can_manage_patients: boolean;
  };
  appointments_today: {
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  appointments_this_week: {
    total: number;
    pending_confirmation: number;
  };
  patients: {
    total: number;
    new_today: number;
    new_this_week: number;
  };
  doctors: {
    total: number;
    available: number;
    busy_today: number;
  };
  pending_appointments: Array<{
    id: number;
    patient_name: string;
    doctor_name: string;
    date: string;
    time: string;
    reason: string;
  }>;
}

/**
 * Dashboard para Administrador
 */
export interface AdminDashboardStats extends BaseDashboardStats {
  user_role: 'admin';
  total_users: number;
  total_doctors: number;
  total_patients: number;
  total_secretaries: number;
  total_appointments: number;
  appointments_today: number;
  appointments_this_week: number;
  appointments_this_month: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  revenue_this_year: number;
  active_users: number;
  new_registrations_today: number;
  new_registrations_this_week: number;
  system_health: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    response_time: number;
    error_rate: number;
  };
  top_doctors: Array<{
    id: number;
    name: string;
    specialization: string;
    total_appointments: number;
    revenue: number;
    rating: number;
  }>;
  recent_activities: Array<{
    id: number;
    user: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
  monthly_stats: Array<{
    month: string;
    appointments: number;
    revenue: number;
    new_users: number;
  }>;
  specialization_stats: Array<{
    specialization: string;
    doctors_count: number;
    appointments_count: number;
    revenue: number;
  }>;
  // Métricas de rendimiento
  completion_rate: number;
  cancellation_rate: number;
  no_show_rate: number;
}

/**
 * Dashboard para Super Administrador
 */
export interface SuperAdminDashboardStats extends BaseDashboardStats {
  user_role: 'superadmin';
  system_overview: {
    total_users: number;
    total_patients: number;
    total_doctors: number;
    total_appointments: number;
    system_uptime: number;
    daily_activity: number;
    database_usage: number;
    active_sessions: number;
  };
  users_by_role: {
    [role: string]: number;
  };
  appointment_stats: {
    [status: string]: number;
  };
  growth_metrics: {
    users_this_month: number;
    users_last_month: number;
    user_growth_percentage: number;
    appointments_this_month: number;
    appointments_last_month: number;
    appointment_growth_percentage: number;
  };
  recent_users: Array<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    last_login: string | null;
    date_joined: string;
  }>;
}

/**
 * Tipo unión para todos los dashboards
 */
export type DashboardStats = 
  | ClientDashboardStats 
  | DoctorDashboardStats 
  | SecretaryDashboardStats 
  | AdminDashboardStats 
  | SuperAdminDashboardStats;

// ==========================================
// SERVICIO DE DASHBOARD
// ==========================================

/**
 * Servicio para manejar todas las operaciones de dashboard por rol
 */
export const dashboardService = {
  /**
   * Obtener estadísticas de dashboard según el rol del usuario
   * GET /api/dashboard/{role}/
   */
  getDashboardStats: async (role: UserRole): Promise<DashboardStats> => {
    return apiHelpers.get<DashboardStats>(`/dashboard/${role}/`);
  },

  /**
   * Obtener estadísticas de dashboard del usuario autenticado
   * GET /api/dashboard/me/
   */
  getMyDashboard: async (): Promise<DashboardStats> => {
    return apiHelpers.get<DashboardStats>('/dashboard/me/');
  },

  // ==========================================
  // DASHBOARDS ESPECÍFICOS POR ROL
  // ==========================================

  /**
   * Dashboard para Cliente
   * GET /api/reports/dashboard/client/
   */
  getClientDashboard: async (): Promise<ClientDashboardStats> => {
    return apiHelpers.get<ClientDashboardStats>('/reports/dashboard/client/');
  },

  /**
   * Dashboard para Doctor
   * GET /api/reports/dashboard/doctor/
   */
  getDoctorDashboard: async (): Promise<DoctorDashboardStats> => {
    return apiHelpers.get<DoctorDashboardStats>('/reports/dashboard/doctor/');
  },

  /**
   * Dashboard para Secretaria
   * GET /api/reports/dashboard/secretary/
   */
  getSecretaryDashboard: async (): Promise<SecretaryDashboardStats> => {
    return apiHelpers.get<SecretaryDashboardStats>('/reports/dashboard/secretary/');
  },

  /**
   * Dashboard para Administrador
   * GET /api/reports/dashboard/admin/
   */
  getAdminDashboard: async (): Promise<AdminDashboardStats> => {
    return apiHelpers.get<AdminDashboardStats>('/reports/dashboard/admin/');
  },

  /**
   * Dashboard para Super Administrador
   * GET /api/reports/dashboard/superadmin/
   */
  getSuperAdminDashboard: async (): Promise<SuperAdminDashboardStats> => {
    return apiHelpers.get<SuperAdminDashboardStats>('/reports/dashboard/superadmin/');
  },

  // ==========================================
  // ESTADÍSTICAS ESPECÍFICAS
  // ==========================================

  /**
   * Obtener estadísticas de citas por período
   * GET /api/dashboard/stats/appointments/
   */
  getAppointmentStats: async (params: {
    date_from: string;
    date_to: string;
    group_by?: 'day' | 'week' | 'month';
    doctor_id?: number;
  }): Promise<Array<{
    period: string;
    total: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  }>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return apiHelpers.get(`/dashboard/stats/appointments/?${queryParams.toString()}`);
  },

  /**
   * Obtener estadísticas de ingresos
   * GET /api/dashboard/stats/revenue/
   */
  getRevenueStats: async (params: {
    date_from: string;
    date_to: string;
    group_by?: 'day' | 'week' | 'month';
    doctor_id?: number;
  }): Promise<Array<{
    period: string;
    revenue: number;
    appointments: number;
  }>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return apiHelpers.get(`/dashboard/stats/revenue/?${queryParams.toString()}`);
  },

  /**
   * Obtener estadísticas de usuarios
   * GET /api/dashboard/stats/users/
   */
  getUserStats: async (params: {
    date_from: string;
    date_to: string;
    group_by?: 'day' | 'week' | 'month';
    role?: UserRole;
  }): Promise<Array<{
    period: string;
    new_users: number;
    active_users: number;
    total_users: number;
  }>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return apiHelpers.get(`/dashboard/stats/users/?${queryParams.toString()}`);
  },

  /**
   * Obtener métricas del sistema (solo superadmin)
   * GET /api/dashboard/stats/system/
   */
  getSystemMetrics: async (): Promise<{
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    database_size: number;
    active_sessions: number;
    api_calls_today: number;
    uptime: string;
    response_time: number;
    error_rate: number;
  }> => {
    return apiHelpers.get('/dashboard/stats/system/');
  },

  // ==========================================
  // UTILIDADES Y HELPERS
  // ==========================================

  /**
   * Obtener resumen rápido para cualquier rol
   */
  getQuickSummary: async (role: UserRole): Promise<{
    primary_metric: { label: string; value: number; change: number };
    secondary_metrics: Array<{ label: string; value: number }>;
    alerts: Array<{ type: string; message: string; severity: string }>;
  }> => {
    return apiHelpers.get(`/dashboard/${role}/summary/`);
  },

  /**
   * Obtener notificaciones del dashboard
   */
  getDashboardNotifications: async (): Promise<Array<{
    id: number;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    action_url?: string;
  }>> => {
    return apiHelpers.get('/dashboard/notifications/');
  },

  /**
   * Marcar notificación como leída
   */
  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    return apiHelpers.patch(`/dashboard/notifications/${notificationId}/read/`);
  },

  /**
   * Obtener configuración del dashboard para un rol
   */
  getDashboardConfig: async (role: UserRole): Promise<{
    widgets: Array<{
      id: string;
      name: string;
      enabled: boolean;
      position: { x: number; y: number; w: number; h: number };
    }>;
    refresh_interval: number;
    theme: 'light' | 'dark';
  }> => {
    return apiHelpers.get(`/dashboard/${role}/config/`);
  },

  /**
   * Actualizar configuración del dashboard
   */
  updateDashboardConfig: async (
    role: UserRole,
    config: {
      widgets?: Array<{
        id: string;
        enabled: boolean;
        position: { x: number; y: number; w: number; h: number };
      }>;
      refresh_interval?: number;
      theme?: 'light' | 'dark';
    }
  ): Promise<void> => {
    return apiHelpers.patch(`/dashboard/${role}/config/`, config);
  },

  /**
   * Exportar datos del dashboard
   */
  exportDashboardData: async (
    role: UserRole,
    format: 'json' | 'csv' | 'pdf',
    date_from: string,
    date_to: string
  ): Promise<Blob> => {
    const params = new URLSearchParams({
      format,
      date_from,
      date_to
    });

    const response = await fetch(
      `/api/dashboard/${role}/export/?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );

    return response.blob();
  }
};

// Exportar por defecto
export default dashboardService;