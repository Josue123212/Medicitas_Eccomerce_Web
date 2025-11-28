// 📊 Tipos para Dashboards Específicos por Rol

import type { UserRole } from './auth';

// ==========================================
// TIPOS BASE PARA DASHBOARDS
// ==========================================

/**
 * Configuración base para widgets de dashboard
 */
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'stat' | 'list' | 'calendar' | 'table' | 'progress';
  enabled: boolean;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

/**
 * Configuración de dashboard por rol
 */
export interface DashboardConfig {
  role: UserRole;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex' | 'masonry';
  theme: 'light' | 'dark' | 'auto';
  refresh_interval: number; // en segundos
  auto_refresh: boolean;
}

/**
 * Filtros comunes para dashboards
 */
export interface DashboardFilters {
  date_from?: string;
  date_to?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  doctor_id?: number;
  patient_id?: number;
  status?: string;
  department?: string;
}

/**
 * Métricas base para todos los dashboards
 */
export interface BaseDashboardMetric {
  label: string;
  value: number | string;
  change?: number; // porcentaje de cambio
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency' | 'percentage' | 'time';
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

// ==========================================
// TIPOS ESPECÍFICOS POR ROL
// ==========================================

/**
 * Dashboard para Cliente
 */
export interface ClientDashboardData {
  role: 'client';
  metrics: {
    total_appointments: BaseDashboardMetric;
    upcoming_appointments: BaseDashboardMetric;
    completed_appointments: BaseDashboardMetric;
    cancelled_appointments: BaseDashboardMetric;
  };
  next_appointment?: {
    id: number;
    doctor_name: string;
    date: string;
    time: string;
    specialization: string;
    location: string;
  };
  recent_appointments: Array<{
    id: number;
    doctor_name: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    specialization: string;
  }>;
  favorite_doctors: Array<{
    id: number;
    name: string;
    specialization: string;
    rating: number;
    total_appointments: number;
    avatar?: string;
  }>;
  health_reminders: Array<{
    id: number;
    title: string;
    description: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Dashboard para Doctor
 */
export interface DoctorDashboardData {
  role: 'doctor';
  metrics: {
    appointments_today: BaseDashboardMetric;
    appointments_this_week: BaseDashboardMetric;
    total_patients: BaseDashboardMetric;
    average_rating: BaseDashboardMetric;
    revenue_this_month: BaseDashboardMetric;
  };
  availability_status: {
    is_available: boolean;
    next_break?: string;
    shift_end: string;
  };
  today_schedule: Array<{
    id: number;
    patient_name: string;
    time: string;
    duration: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    reason: string;
    patient_phone?: string;
  }>;
  recent_patients: Array<{
    id: number;
    name: string;
    last_appointment: string;
    total_appointments: number;
    last_diagnosis?: string;
    avatar?: string;
  }>;
  performance_charts: {
    monthly_appointments: Array<{
      month: string;
      appointments: number;
      revenue: number;
    }>;
    patient_satisfaction: Array<{
      period: string;
      rating: number;
      reviews_count: number;
    }>;
  };
}

/**
 * Dashboard para Secretaria
 */
export interface SecretaryDashboardData {
  role: 'secretary';
  metrics: {
    appointments_today: BaseDashboardMetric;
    pending_confirmations: BaseDashboardMetric;
    new_patients: BaseDashboardMetric;
    doctors_available: BaseDashboardMetric;
  };
  urgent_tasks: Array<{
    id: number;
    type: 'confirmation' | 'rescheduling' | 'cancellation' | 'follow_up';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_time?: string;
    patient_name?: string;
    doctor_name?: string;
  }>;
  upcoming_appointments: Array<{
    id: number;
    patient_name: string;
    doctor_name: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    patient_phone: string;
    notes?: string;
  }>;
  doctor_availability: Array<{
    id: number;
    name: string;
    specialization: string;
    status: 'available' | 'busy' | 'break' | 'offline';
    next_available?: string;
    current_patient?: string;
  }>;
  daily_summary: {
    total_scheduled: number;
    completed: number;
    cancelled: number;
    no_shows: number;
    rescheduled: number;
  };
}

/**
 * Dashboard para Administrador
 */
export interface AdminDashboardData {
  role: 'admin';
  metrics: {
    total_users: BaseDashboardMetric;
    total_doctors: BaseDashboardMetric;
    total_appointments: BaseDashboardMetric;
    revenue_this_month: BaseDashboardMetric;
    system_health: BaseDashboardMetric;
  };
  system_overview: {
    active_users: number;
    server_uptime: string;
    response_time: number;
    error_rate: number;
    last_backup: string;
  };
  top_performers: {
    doctors: Array<{
      id: number;
      name: string;
      specialization: string;
      appointments_count: number;
      revenue: number;
      rating: number;
    }>;
    secretaries: Array<{
      id: number;
      name: string;
      department: string;
      appointments_managed: number;
      efficiency_score: number;
    }>;
  };
  recent_activities: Array<{
    id: number;
    user: string;
    action: string;
    resource: string;
    timestamp: string;
    details?: string;
  }>;
  financial_summary: {
    daily_revenue: Array<{
      date: string;
      revenue: number;
      appointments: number;
    }>;
    monthly_trends: Array<{
      month: string;
      revenue: number;
      growth_rate: number;
    }>;
  };
}

/**
 * Dashboard para Super Administrador
 */
export interface SuperAdminDashboardData {
  role: 'superadmin';
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

// ==========================================
// TIPOS PARA COMPONENTES DE DASHBOARD
// ==========================================

/**
 * Props para componentes de widget
 */
export interface DashboardWidgetProps {
  widget: DashboardWidget;
  data?: Record<string, unknown>;
  loading?: boolean;
  error?: string;
  onUpdate?: (widgetId: string, data: Record<string, unknown>) => void;
  onRemove?: (widgetId: string) => void;
  onResize?: (widgetId: string, size: { w: number; h: number }) => void;
}

/**
 * Props para el layout de dashboard
 */
export interface DashboardLayoutProps {
  config: DashboardConfig;
  data: ClientDashboardData | DoctorDashboardData | SecretaryDashboardData | AdminDashboardData | SuperAdminDashboardData;
  loading?: boolean;
  error?: string;
  onConfigChange?: (config: DashboardConfig) => void;
  onRefresh?: () => void;
}

/**
 * Configuración de gráficos para dashboards
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    scales?: {
      x?: {
        display?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
      y?: {
        display?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
    };
  };
}

/**
 * Tipo unión para todos los datos de dashboard
 */
export type DashboardData = 
  | ClientDashboardData 
  | DoctorDashboardData 
  | SecretaryDashboardData 
  | AdminDashboardData 
  | SuperAdminDashboardData;

/**
 * Utilidad para obtener el tipo de dashboard según el rol
 */
export type DashboardDataByRole<T extends UserRole> = 
  T extends 'client' ? ClientDashboardData :
  T extends 'doctor' ? DoctorDashboardData :
  T extends 'secretary' ? SecretaryDashboardData :
  T extends 'admin' ? AdminDashboardData :
  T extends 'superadmin' ? SuperAdminDashboardData :
  never;

// ==========================================
// TIPOS ADICIONALES PARA ADMIN
// ==========================================

/**
 * Información del sistema para administradores
 */
export interface AdminSystemOverview {
  server_status: 'online' | 'offline' | 'maintenance';
  database_status: 'healthy' | 'warning' | 'error';
  api_response_time: number;
  active_sessions: number;
  storage_used: number;
  storage_total: number;
  last_backup: string;
  pending_updates: number;
}

// ==========================================
// TIPOS PARA SUPER ADMIN
// ==========================================

/**
 * Usuario del sistema para administradores
 */
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'doctor' | 'secretary' | 'admin' | 'client';
  status: 'active' | 'inactive' | 'suspended';
  last_login: string;
  created_at: string;
  department?: string;
}

/**
 * Interfaz para usuarios del sistema (SuperAdmin)
 */
export interface SystemUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'doctor' | 'secretary' | 'client' | 'superadmin';
  is_active: boolean;
  last_login: string;
}

// Exportar por defecto el tipo DashboardData
export { DashboardData as default };