// 📅 Tipos para el Sistema de Citas Médicas

/**
 * Estados posibles de una cita médica
 */
export type AppointmentStatus = 
  | 'scheduled'   // Programada
  | 'confirmed'   // Confirmada
  | 'completed'   // Completada
  | 'cancelled'   // Cancelada
  | 'no_show';    // No se presentó

/**
 * Información básica del paciente para citas
 * Coincide con PatientListSerializer del backend
 */
export interface AppointmentPatient {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  age?: number;
  status_display?: string;
  status_color?: string;
  is_active: boolean;
}

/**
 * Información básica del doctor para citas
 * Coincide con DoctorListSerializer del backend
 */
export interface AppointmentDoctor {
  id: number;
  full_name: string;
  email: string;
  specialization: string;
  years_experience: number;
  consultation_fee: number;
  status_display?: string;
  status_color?: string;
  is_active: boolean;
}

/**
 * Interface principal para una cita médica
 */
export interface Appointment {
  id: number;
  patient: {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
  };
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  status: AppointmentStatus;
  status_display?: string;
  status_color?: string;
  reason: string;
  notes?: string;
  is_today?: boolean;
  is_past?: boolean;
  can_be_cancelled?: boolean;
  can_be_rescheduled?: boolean;
  created_at: string;
  updated_at?: string;
  // Campos legacy para compatibilidad
  date?: string;
  time?: string;
  patient_name?: string;
  patient_info?: AppointmentPatient;
  doctor_info?: AppointmentDoctor;
}

/**
 * Datos para crear una nueva cita
 */
export interface CreateAppointmentData {
  patient: number;
  doctor: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  notes?: string;
}

/**
 * Datos para actualizar una cita existente
 */
export interface UpdateAppointmentData {
  patient?: number;
  doctor?: number;
  date?: string;
  time?: string;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
}

/**
 * Datos para reprogramar una cita
 */
export interface RescheduleAppointmentData {
  new_date: string; // YYYY-MM-DD
  new_time: string; // HH:MM
  reason?: string;
}

/**
 * Respuesta de la API para listado de citas
 */
export interface AppointmentsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

/**
 * Filtros para búsqueda de citas
 */
export interface AppointmentFilters {
  status?: AppointmentStatus;
  date?: string;
  date_from?: string;
  date_to?: string;
  time_from?: string;
  time_to?: string;
  doctor?: number;
  doctor_name?: string;
  doctor_last_name?: string;
  specialization?: string;
  patient?: number;
  patient_name?: string;
  patient_last_name?: string;
  search?: string;
  // Flags de conveniencia (compatibilidad)
  today?: boolean;
  this_week?: boolean;
  this_month?: boolean;
  upcoming?: boolean;
  past?: boolean;
  // Paginación y orden
  page?: number;
  page_size?: number;
  ordering?: string;
}

/**
 * Horarios disponibles para agendar citas
 */
export interface AvailableSlot {
  date: string;
  time: string;
  is_available: boolean;
  doctor_id: number;
}

/**
 * Respuesta de horarios disponibles
 */
export interface AvailableSlotsResponse {
  message: string;
  data: {
    doctor: {
      id: number;
      name: string;
      specialization: string;
    };
    date: string;
    available_slots: Array<{
      time: string;
      datetime: string;
      available: boolean;
    }>;
    total_slots: number;
  };
}

/**
 * Historial de citas de un paciente
 */
export interface PatientAppointmentHistory {
  patient_id: number;
  patient_name: string;
  appointments: Appointment[];
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  upcoming_appointments: number;
}

/**
 * Agenda de un doctor
 */
export interface DoctorSchedule {
  doctor_id: number;
  doctor_name: string;
  date: string;
  appointments: Appointment[];
  total_slots: number;
  booked_slots: number;
  available_slots: number;
}

/**
 * Estadísticas de citas
 */
export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  today: number;
  this_week: number;
  this_month: number;
}

/**
 * Configuración de colores para estados de citas
 */
export interface AppointmentStatusConfig {
  scheduled: {
    color: string;
    bgColor: string;
    label: string;
  };
  confirmed: {
    color: string;
    bgColor: string;
    label: string;
  };
  completed: {
    color: string;
    bgColor: string;
    label: string;
  };
  cancelled: {
    color: string;
    bgColor: string;
    label: string;
  };
  no_show: {
    color: string;
    bgColor: string;
    label: string;
  };
}

/**
 * Props para componentes de citas
 */
export interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
  onReschedule?: (id: number, data: RescheduleAppointmentData) => void;
  onComplete?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * Props para lista de citas
 */
export interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  error?: string;
  filters?: AppointmentFilters;
  onFilterChange?: (filters: AppointmentFilters) => void;
  onAppointmentAction?: (action: string, appointmentId: number, data?: Record<string, unknown>) => void;
  showFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}

/**
 * Props para formulario de citas
 */
export interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: CreateAppointmentData | UpdateAppointmentData) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  mode: 'create' | 'edit';
}

/**
 * Cita médica extendida para historial médico
 * Incluye información adicional del backend
 */
export interface MedicalHistoryAppointment extends Appointment {
  doctor_name?: string;
  specialty?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
}

/**
 * Historial médico extendido con información adicional
 */
export interface ExtendedPatientAppointmentHistory extends Omit<PatientAppointmentHistory, 'appointments'> {
  appointments: MedicalHistoryAppointment[];
  summary?: {
    total_visits: number;
    preventive_care: number;
    follow_ups: number;
  };
}

/**
 * Respuesta de acciones sobre citas
 */
export interface AppointmentActionResponse {
  success: boolean;
  message: string;
  appointment?: Appointment;
  error?: string;
}