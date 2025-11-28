// 👩‍💼 Tipos para el Sistema de Secretarias

import type { User } from './auth';

/**
 * Paciente desde la perspectiva de la secretaria
 */
export interface SecretaryPatient {
  id: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  insurance_provider?: string;
  insurance_number?: string;
  total_appointments: number;
  last_appointment?: string;
  created_at: string;
}

/**
 * Perfil de la secretaria
 */
export interface SecretaryProfile {
  id: number;
  user: User;
  employee_id: string;
  department: string;
  shift_start: string;
  shift_end: string;
  can_manage_appointments: boolean;
  can_manage_patients: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Secretaria para listado administrativo
 */
export interface SecretaryListItem {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    phone: string;
    is_active: boolean;
  };
  employee_id: string;
  department: string;
  shift_start: string;
  shift_end: string;
  can_manage_appointments: boolean;
  can_manage_patients: boolean;
  can_view_reports: boolean;
  hire_date: string;
  created_at: string;
  total_appointments_managed?: number;
  total_patients_registered?: number;
}

/**
 * Respuesta paginada de secretarias
 */
export interface SecretariesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SecretaryListItem[];
}

/**
 * Filtros para la lista de secretarias
 */
export interface SecretaryFilters {
  search?: string;
  department?: string;
  shift?: string;
  permissions?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

/**
 * Datos para crear/actualizar perfil de secretaria
 */
export interface SecretaryProfileData {
  employee_id?: string;
  department?: string;
  shift_start?: string;
  shift_end?: string;
  can_manage_appointments?: boolean;
  can_manage_patients?: boolean;
}

/**
 * Estadísticas del dashboard de secretaria
 */
export interface SecretaryStats {
  total_appointments_today: number;
  pending_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  total_patients: number;
  new_patients_today: number;
  doctors_available: number;
  total_doctors: number;
}

/**
 * Cita desde la perspectiva de la secretaria
 */
export interface SecretaryAppointment {
  id: number;
  patient: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    date_of_birth?: string;
    emergency_contact?: string;
  };
  doctor: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
    };
    specialization: string;
  };
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by_secretary?: boolean;
}

/**
 * Datos para crear una nueva cita (secretaria)
 */
export interface CreateAppointmentData {
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  notes?: string;
}

/**
 * Datos para actualizar una cita (secretaria)
 */
export interface UpdateSecretaryAppointmentData {
  appointment_date?: string;
  appointment_time?: string;
  status?: 'scheduled' | 'confirmed' | 'cancelled';
  reason?: string;
  notes?: string;
}

/**
 * Datos para crear/actualizar paciente (secretaria)
 */
export interface PatientData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  insurance_provider?: string;
  insurance_number?: string;
}

/**
 * Doctor disponible para citas (vista secretaria)
 */
export interface AvailableDoctor {
  id: number;
  user: {
    firstName: string;
    lastName: string;
  };
  specialization: string;
  is_available: boolean;
  work_start_time: string;
  work_end_time: string;
  work_days: string[];
  consultation_fee: number;
}

/**
 * Horarios disponibles para un doctor específico
 */
export interface DoctorAvailableSlots {
  doctor_id: number;
  date: string;
  available_slots: {
    start_time: string;
    end_time: string;
  }[];
}

/**
 * Filtros para búsqueda de citas (secretaria)
 */
export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  doctor_id?: number;
  patient_id?: number;
  status?: string;
  search?: string;
}

/**
 * Filtros para búsqueda de pacientes (secretaria)
 */
export interface PatientFilters {
  search?: string;
  has_appointments?: boolean;
  insurance_provider?: string;
  created_from?: string;
  created_to?: string;
}

/**
 * Respuesta de la API para listado de citas (secretaria)
 */
export interface SecretaryAppointmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SecretaryAppointment[];
}

/**
 * Respuesta de la API para listado de pacientes (secretaria)
 */
export interface SecretaryPatientsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SecretaryPatient[];
}

/**
 * Configuración de permisos de la secretaria
 */
export interface SecretaryPermissions {
  can_manage_appointments: boolean;
  can_manage_patients: boolean;
  can_view_medical_records: boolean;
  can_generate_reports: boolean;
  can_manage_schedules: boolean;
}

/**
 * Reporte de actividades de la secretaria
 */
export interface SecretaryActivityReport {
  date: string;
  appointments_created: number;
  appointments_modified: number;
  appointments_cancelled: number;
  patients_registered: number;
  patients_updated: number;
  total_activities: number;
}