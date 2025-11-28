// 🔗 Tipos Compartidos y Interfaces Comunes

// ==========================================
// TIPOS BASE Y UTILIDADES
// ==========================================

/**
 * Respuesta paginada estándar de la API
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Error estándar de la API
 */
export interface ApiError {
  message: string;
  field?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Filtros base para listados
 */
export interface BaseFilters {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  date_from?: string;
  date_to?: string;
}

/**
 * Metadatos de paginación
 */
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  page_size: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

// ==========================================
// TIPOS PARA FORMULARIOS
// ==========================================

/**
 * Estado base para formularios
 */
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touched: Record<keyof T, boolean>;
}

/**
 * Opciones para campos de selección
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Configuración de campo de formulario
 */
export interface FormFieldConfig {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'datetime-local' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: unknown) => string | null;
  };
  help?: string;
  className?: string;
}

// ==========================================
// TIPOS PARA TABLAS
// ==========================================

/**
 * Configuración de columna de tabla
 */
export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  className?: string;
}

/**
 * Configuración de tabla
 */
export interface TableConfig<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationMeta;
  selection?: {
    enabled: boolean;
    selectedKeys: (string | number)[];
    onSelectionChange: (keys: (string | number)[]) => void;
  };
  sorting?: {
    field: keyof T | string;
    direction: 'asc' | 'desc';
    onSortChange: (field: keyof T | string, direction: 'asc' | 'desc') => void;
  };
  actions?: Array<{
    key: string;
    label: string;
    icon?: string;
    onClick: (record: T) => void;
    disabled?: (record: T) => boolean;
    visible?: (record: T) => boolean;
  }>;
}

// ==========================================
// TIPOS PARA NOTIFICACIONES
// ==========================================

/**
 * Tipos de notificación
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notificación del sistema
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // en milisegundos, 0 = no auto-close
  actions?: Array<{
    label: string;
    onClick: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  timestamp: string;
  read: boolean;
}

// ==========================================
// TIPOS PARA ARCHIVOS Y UPLOADS
// ==========================================

/**
 * Información de archivo
 */
export interface FileInfo {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
  uploaded_at?: string;
  uploaded_by?: string;
}

/**
 * Configuración de upload
 */
export interface UploadConfig {
  accept?: string;
  maxSize?: number; // en bytes
  maxFiles?: number;
  multiple?: boolean;
  directory?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (file: FileInfo) => void;
  onError?: (error: string) => void;
}

/**
 * Estado de upload
 */
export interface UploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  uploaded: FileInfo[];
  errors: string[];
}

// ==========================================
// TIPOS PARA FECHAS Y TIEMPO
// ==========================================

/**
 * Rango de fechas
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Horario de trabajo
 */
export interface WorkSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  is_working: boolean;
  break_start?: string;
  break_end?: string;
}

/**
 * Slot de tiempo disponible
 */
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  reason?: string; // si no está disponible
}

// ==========================================
// TIPOS PARA CONFIGURACIÓN
// ==========================================

/**
 * Configuración de tema
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primary_color: string;
  secondary_color: string;
  font_size: 'small' | 'medium' | 'large';
  compact_mode: boolean;
}

/**
 * Configuración de usuario
 */
export interface UserPreferences {
  theme: ThemeConfig;
  language: 'es' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    appointment_reminders: boolean;
    system_updates: boolean;
  };
  dashboard: {
    default_view: string;
    widgets: string[];
    refresh_interval: number;
  };
}

// ==========================================
// TIPOS PARA ESTADOS DE CARGA
// ==========================================

/**
 * Estado de carga genérico
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

/**
 * Estado de operación asíncrona
 */
export interface AsyncState<T> extends LoadingState {
  data: T | null;
  initialized: boolean;
}

/**
 * Estado de lista con paginación
 */
export interface ListState<T> extends LoadingState {
  items: T[];
  pagination: PaginationMeta;
  filters: BaseFilters;
  selected: (string | number)[];
}

// ==========================================
// TIPOS PARA VALIDACIÓN
// ==========================================

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

/**
 * Regla de validación
 */
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: unknown) => string | null;
  message?: string;
}

// ==========================================
// TIPOS PARA PERMISOS
// ==========================================

/**
 * Permiso del sistema
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
}

/**
 * Contexto de permisos
 */
export interface PermissionContext {
  user_permissions: Permission[];
  role_permissions: Permission[];
  resource_permissions: Record<string, Permission[]>;
  can: (resource: string, action: string) => boolean;
  canAny: (permissions: Array<{ resource: string; action: string }>) => boolean;
  canAll: (permissions: Array<{ resource: string; action: string }>) => boolean;
}

// ==========================================
// TIPOS PARA BÚSQUEDA
// ==========================================

/**
 * Resultado de búsqueda
 */
export interface SearchResult<T> {
  item: T;
  score: number;
  highlights: Record<string, string>;
}

/**
 * Configuración de búsqueda
 */
export interface SearchConfig {
  fields: string[];
  fuzzy?: boolean;
  threshold?: number;
  limit?: number;
  highlight?: boolean;
}

/**
 * Estado de búsqueda
 */
export interface SearchState<T> extends LoadingState {
  query: string;
  results: SearchResult<T>[];
  total: number;
  suggestions: string[];
}

// ==========================================
// TIPOS PARA MÉTRICAS Y ESTADÍSTICAS
// ==========================================

/**
 * Punto de datos para gráficos
 */
export interface DataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

/**
 * Serie de datos
 */
export interface DataSeries {
  name: string;
  data: DataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

/**
 * Métrica con comparación
 */
export interface MetricWithComparison {
  current: number;
  previous: number;
  change: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percentage';
}

// ==========================================
// UTILIDADES DE TIPOS
// ==========================================

/**
 * Hacer todos los campos opcionales excepto los especificados
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Hacer todos los campos requeridos excepto los especificados
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

/**
 * Extraer el tipo de un array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Crear un tipo con campos anidados opcionales
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Tipo para IDs (puede ser string o number)
 */
export type ID = string | number;

/**
 * Tipo para timestamps
 */
export type Timestamp = string;

/**
 * Tipo para URLs
 */
export type URL = string;

/**
 * Tipo para colores hexadecimales
 */
export type HexColor = `#${string}`;

// Exportar todo por defecto
// Los tipos se exportan individualmente arriba