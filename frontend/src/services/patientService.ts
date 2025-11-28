// 🏥 Servicio para operaciones de Pacientes (Admin)

import { apiHelpers } from './api';

// 🎯 OBJETIVO: Servicio para manejar todas las operaciones CRUD de pacientes desde el panel de administración
// 💡 CONCEPTO: Conecta con los endpoints del backend Django para gestión completa de pacientes

// ==========================================
// INTERFACES Y TIPOS
// ==========================================

// Interfaz para el listado de pacientes (PatientListSerializer)
export interface PatientListItem {
  id: number;
  full_name: string;
  email: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  phone_number: string;
  status: 'active' | 'inactive' | 'disabled';
  status_display: string;
  status_color: string;
  is_active: boolean;
  created_at: string;
}

// Interfaz completa para paciente individual (PatientSerializer)
export interface Patient {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  phone_number: string;
  address: string;
  status: 'active' | 'inactive' | 'disabled';
  status_display: string;
  status_color: string;
  is_active: boolean;
  is_disabled: boolean;
  can_access_system: boolean;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  created_at: string;
  updated_at: string;
  total_appointments?: number;
  last_appointment?: string;
}

export interface PatientFilters {
  search?: string;
  blood_type?: string;
  min_age?: number;
  max_age?: number;
  medical_condition?: string;
  allergy?: string;
  gender?: 'M' | 'F' | 'O';
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CreatePatientData {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
  };
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  phone_number: string;
  address: string;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface UpdatePatientData {
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  phone_number?: string;
  address?: string;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface PatientsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PatientListItem[];
  // Metadatos opcionales de paginación (proporcionados por CustomPageNumberPagination)
  total_pages?: number;
  current_page?: number;
  page_size?: number;
}

export interface PatientMedicalHistory {
  patient_info: {
    full_name: string;
    age: number;
    blood_type: string;
    allergies: string;
    medical_conditions: string;
    medications: string;
    medical_summary: string;
  };
  appointments_history: Array<{
    id: number;
    date: string;
    time: string;
    status: string;
    reason: string;
    notes: string;
    doctor_info: {
      user: {
        first_name: string;
        last_name: string;
      };
      specialization: string;
    };
  }>;
  statistics: {
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    last_appointment: string | null;
  };
}

export interface PatientStatistics {
  patient_info: {
    full_name: string;
    age: number;
    registration_date: string;
  };
  appointments_summary: {
    total: number;
    by_status: Array<{
      status: string;
      count: number;
    }>;
    monthly_trend: Array<{
      month: string;
      count: number;
    }>;
  };
  doctors_visited: Array<{
    doctor__user__first_name: string;
    doctor__user__last_name: string;
    doctor__specialization: string;
    visit_count: number;
  }>;
  health_summary: {
    blood_type: string;
    has_allergies: boolean;
    has_medical_conditions: boolean;
    has_medications: boolean;
  };
}

// ==========================================
// SERVICIO DE PACIENTES
// ==========================================

/**
 * Servicio para manejar todas las operaciones relacionadas con pacientes
 */
export const patientService = {
  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener lista de pacientes con filtros opcionales
   * GET /api/patients/
   */
  getPatients: async (filters?: PatientFilters): Promise<PatientsListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Solo agregar parámetros que tengan valores válidos (no vacíos, null o undefined)
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/patients/?${queryString}` : '/patients/';
    
    return apiHelpers.get<PatientsListResponse>(url);
  },

  /**
   * Obtener un paciente específico por ID
   * GET /api/patients/{id}/
   */
  getPatient: async (patientId: number): Promise<Patient> => {
    return apiHelpers.get<Patient>(`/patients/${patientId}/`);
  },

  /**
   * Crear nuevo paciente
   * POST /api/patients/
   */
  createPatient: async (patientData: CreatePatientData): Promise<Patient> => {
    return apiHelpers.post<Patient>('/patients/', patientData);
  },

  /**
   * Actualizar información de paciente (completa)
   * PUT /api/patients/{id}/
   */
  updatePatient: async (patientId: number, patientData: UpdatePatientData): Promise<Patient> => {
    return apiHelpers.put<Patient>(`/patients/${patientId}/`, patientData);
  },

  /**
   * Actualizar información de paciente (parcial)
   * PATCH /api/patients/{id}/
   */
  updatePatientPartial: async (patientId: number, updateData: Partial<UpdatePatientData>): Promise<Patient> => {
    return apiHelpers.patch<Patient>(`/patients/${patientId}/`, updateData);
  },

  /**
   * Eliminar paciente (soft delete)
   * DELETE /api/patients/{id}/
   */
  deletePatient: async (patientId: number): Promise<void> => {
    return apiHelpers.delete(`/patients/${patientId}/`);
  },

  /**
   * Actualizar estado del paciente (active, inactive, disabled)
   * PATCH /api/patients/{id}/update-status/
   */
  updatePatientStatus: async (patientId: number, status: 'active' | 'inactive' | 'disabled'): Promise<PatientListItem> => {
    return apiHelpers.patch<PatientListItem>(`/patients/${patientId}/update-status/`, { status });
  },

  // ==========================================
  // OPERACIONES ESPECIALIZADAS
  // ==========================================

  /**
   * Obtener historial médico completo del paciente
   * GET /api/patients/{id}/medical-history/
   */
  getPatientMedicalHistory: async (patientId: number): Promise<PatientMedicalHistory> => {
    return apiHelpers.get<PatientMedicalHistory>(`/patients/${patientId}/medical-history/`);
  },

  /**
   * Obtener citas del paciente con filtros opcionales
   * GET /api/patients/{id}/appointments/
   */
  getPatientAppointments: async (
    patientId: number,
    filters?: {
      status?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<{
    message: string;
    data: Array<{
      id: number;
      date: string;
      time: string;
      status: string;
      reason: string;
      notes: string;
      doctor_info: {
        user: {
          first_name: string;
          last_name: string;
        };
        specialization: string;
      };
    }>;
    count: number;
  }> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const queryString = params.toString();
    const url = queryString 
      ? `/patients/${patientId}/appointments/?${queryString}`
      : `/patients/${patientId}/appointments/`;
    
    return apiHelpers.get(url);
  },

  /**
   * Obtener estadísticas del paciente
   * GET /api/patients/{id}/statistics/
   */
  getPatientStatistics: async (patientId: number): Promise<PatientStatistics> => {
    return apiHelpers.get<PatientStatistics>(`/patients/${patientId}/statistics/`);
  },

  // ==========================================
  // UTILIDADES Y HELPERS
  // ==========================================

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  calculateAge: (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Formatear nombre completo del paciente
   */
  getFullName: (patient: Patient): string => {
    if (!patient?.user) {
      return 'Nombre no disponible';
    }
    const firstName = patient.user.first_name || '';
    const lastName = patient.user.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Nombre no disponible';
  },

  /**
   * Obtener badge de género
   */
  getGenderBadge: (gender: 'M' | 'F' | 'O'): { label: string; color: string } => {
    const genderMap = {
      'M': { label: 'Masculino', color: 'bg-blue-100 text-blue-800' },
      'F': { label: 'Femenino', color: 'bg-pink-100 text-pink-800' },
      'O': { label: 'Otro', color: 'bg-gray-100 text-gray-800' }
    };
    
    return genderMap[gender] || { label: 'No especificado', color: 'bg-gray-100 text-gray-800' };
  },

  /**
   * Formatear fecha para mostrar
   */
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Formatear teléfono
   */
  formatPhone: (phone: string): string => {
    // Formato básico para números de teléfono
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone;
  }
};

export default patientService;