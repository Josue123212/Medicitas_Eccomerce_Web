// 📦 Exportaciones Centralizadas de Tipos TypeScript

// ==========================================
// TIPOS DE AUTENTICACIÓN
// ==========================================
export type {
  UserRole,
  User,
  RegisterData,
  LoginData,
  AuthResponse,
  UpdateProfileData,
  ChangePasswordData,
  AuthState,
  AuthError
} from './auth';

// ==========================================
// TIPOS DE DOCTORES
// ==========================================
export type {
  DoctorProfile,
  DoctorProfileData,
  DoctorBasicInfo,
  DoctorDetail,
  DoctorSchedule,
  DoctorStats,
  DoctorAppointment,
  UpdateAppointmentData,
  DoctorAvailability,
  DoctorsListResponse,
  DoctorFilters
} from './doctor';

// Alias para compatibilidad con componentes existentes
export type { DoctorBasicInfo as Doctor } from './doctor';

// ==========================================
// TIPOS DE SECRETARIAS
// ==========================================
export type {
  SecretaryProfile,
  SecretaryProfileData,
  SecretaryStats,
  SecretaryAppointment,
  CreateAppointmentData,
  UpdateSecretaryAppointmentData,
  SecretaryPatient,
  PatientData,
  AvailableDoctor,
  DoctorAvailableSlots,
  AppointmentFilters,
  PatientFilters,
  SecretaryAppointmentsResponse,
  SecretaryPatientsResponse,
  SecretaryPermissions,
  SecretaryActivityReport
} from './secretary';

// ==========================================
// TIPOS DE CITAS MÉDICAS
// ==========================================
export type {
  AppointmentStatus,
  AppointmentPatient,
  AppointmentDoctor,
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  RescheduleAppointmentData,
  AppointmentsListResponse,
  AppointmentFilters,
  AvailableSlot,
  AvailableSlotsResponse,
  PatientAppointmentHistory,
  DoctorSchedule,
  AppointmentStats,
  AppointmentStatusConfig,
  AppointmentCardProps,
  AppointmentListProps,
  AppointmentFormProps,
  AppointmentActionResponse
} from './appointment';

// ==========================================
// TIPOS DE DASHBOARDS
// TIPOS DE DASHBOARDS
export type {
  DashboardWidget,
  DashboardConfig,
  DashboardFilters,
  BaseDashboardMetric,
  ClientDashboardData,
  DoctorDashboardData,
  SecretaryDashboardData,
  AdminDashboardData,
  AdminSystemOverview,
  AdminUser,
  SuperAdminDashboardData,
  DashboardData,
  DashboardDataByRole,
  DashboardWidgetProps,
  DashboardLayoutProps,
  ChartConfig
} from './dashboard';

// Exportación específica de SystemUser
export type { SystemUser } from './dashboard';

// ==========================================
// TIPOS COMPARTIDOS
// ==========================================
export type {
  PaginatedResponse,
  ApiResponse,
  ApiError,
  BaseFilters,
  PaginationMeta,
  FormState,
  SelectOption,
  FormFieldConfig,
  TableColumn,
  TableConfig,
  NotificationType,
  Notification,
  FileInfo,
  UploadConfig,
  UploadState,
  DateRange,
  WorkSchedule,
  TimeSlot,
  ThemeConfig,
  UserPreferences,
  LoadingState,
  AsyncState,
  ListState,
  ValidationResult,
  ValidationRule,
  Permission,
  PermissionContext,
  SearchResult,
  SearchConfig,
  SearchState,
  DataPoint,
  DataSeries,
  MetricWithComparison,
  PartialExcept,
  RequiredExcept,
  ArrayElement,
  DeepPartial,
  ID,
  Timestamp,
  URL,
  HexColor
} from './shared';

// ==========================================
// RE-EXPORTACIONES POR CATEGORÍA
// ==========================================

// Tipos de autenticación y usuarios
export * as AuthTypes from './auth';

// Tipos de doctores
export * as DoctorTypes from './doctor';

// Tipos de secretarias
export * as SecretaryTypes from './secretary';

// Tipos de dashboards
export * as DashboardTypes from './dashboard';

// Tipos compartidos
export * as SharedTypes from './shared';

// ==========================================
// TIPOS COMPUESTOS Y UNIONES
// ==========================================
// Los tipos genéricos se han movido a archivos específicos
// para evitar problemas de importación circular

// ==========================================
// CONSTANTES DE TIPOS
// ==========================================

/**
 * Roles disponibles como array constante
 */
export const USER_ROLES = ['client', 'doctor', 'secretary', 'admin', 'superadmin'] as const;

/**
 * Tipos de notificación como array constante
 */
export const NOTIFICATION_TYPES = ['success', 'error', 'warning', 'info'] as const;

/**
 * Estados de cita como array constante
 */
export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;

/**
 * Días de la semana como array constante
 */
export const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

/**
 * Tipos de gráfico como array constante
 */
export const CHART_TYPES = ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter'] as const;

/**
 * Temas disponibles como array constante
 */
export const THEME_MODES = ['light', 'dark', 'auto'] as const;

// ==========================================
// FUNCIONES DE VALIDACIÓN Y TYPE GUARDS
// ==========================================
// Las funciones de validación se han movido a archivos específicos
// para evitar problemas de importación circular de tipos

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================

/**
 * Exportación por defecto con utilidades principales
 */
export default {
  // Tipos de autenticación
  USER_ROLES,
  NOTIFICATION_TYPES,
  APPOINTMENT_STATUSES,
  WEEK_DAYS,
  CHART_TYPES,
  THEME_MODES
};

// Forzar recompilación - SystemUser debe estar disponible

// ==========================================
// EXPORTACIÓN DE TIPOS DEL SISTEMA
// ==========================================
// SystemUser ahora se exporta desde dashboard.ts