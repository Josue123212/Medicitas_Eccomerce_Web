// 👩‍💼 Servicio para operaciones de Secretarias

import { apiHelpers } from './api';
import type {
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
  SecretaryActivityReport,
  SecretaryListItem,
  SecretariesResponse,
  SecretaryFilters
} from '../types/secretary';

/**
 * Servicio para manejar todas las operaciones relacionadas con secretarias
 */
export const secretaryService = {
  // ==========================================
  // PERFIL DE SECRETARIA
  // ==========================================

  /**
   * Obtener perfil de la secretaria autenticada
   * GET /api/users/secretaries/me/
   */
  getMyProfile: async (): Promise<SecretaryProfile> => {
    return apiHelpers.get<SecretaryProfile>('/users/secretaries/me/');
  },

  /**
   * Actualizar perfil de la secretaria autenticada
   * PUT /api/users/secretaries/me/
   */
  updateMyProfile: async (profileData: SecretaryProfileData): Promise<SecretaryProfile> => {
    return apiHelpers.put<SecretaryProfile>('/users/secretaries/me/', profileData);
  },

  /**
   * Obtener estadísticas del dashboard de secretaria
   * GET /api/users/secretaries/dashboard/
   */
  getDashboardStats: async (): Promise<SecretaryStats> => {
    return apiHelpers.get<SecretaryStats>('/users/secretaries/dashboard/');
  },

  // ==========================================
  // GESTIÓN DE SECRETARIAS (ADMIN)
  // ==========================================

  /**
   * Obtener lista de todas las secretarias (solo para administradores)
   * GET /api/users/secretaries/
   */
  getSecretaries: async (filters?: SecretaryFilters): Promise<SecretariesResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/users/secretaries/?${queryString}` : '/users/secretaries/';
    
    return apiHelpers.get<SecretariesResponse>(url);
  },

  /**
   * Obtener una secretaria específica por ID (solo para administradores)
   * GET /api/users/secretaries/{id}/
   */
  getSecretaryById: async (secretaryId: number): Promise<SecretaryListItem> => {
    return apiHelpers.get<SecretaryListItem>(`/users/secretaries/${secretaryId}/`);
  },

  /**
   * Actualizar una secretaria específica (solo para administradores)
   * PATCH /api/users/secretaries/{id}/
   */
  updateSecretary: async (secretaryId: number, data: Partial<SecretaryListItem>): Promise<SecretaryListItem> => {
    return apiHelpers.patch<SecretaryListItem>(`/users/secretaries/${secretaryId}/`, data);
  },

  /**
   * Crear nueva secretaria (solo para administradores)
   * POST /api/users/secretaries/
   */
  createSecretary: async (data: any): Promise<SecretaryListItem> => {
    return apiHelpers.post<SecretaryListItem>('/users/secretaries/', data);
  },

  // ==========================================
  // GESTIÓN DE CITAS
  // ==========================================

  /**
   * Obtener todas las citas (con filtros)
   * GET /api/users/secretaries/appointments/
   */
  getAppointments: async (filters?: AppointmentFilters & { page?: number }): Promise<SecretaryAppointmentsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/users/secretaries/appointments/?${queryString}` : '/users/secretaries/appointments/';
    
    return apiHelpers.get<SecretaryAppointmentsResponse>(url);
  },

  // NOTA: Los siguientes endpoints no están implementados en el backend actual
  // TODO: Implementar en el backend si son necesarios

  /**
   * Obtener una cita específica
   * GET /api/appointments/{id}/ (usar endpoint general de citas)
   */
  getAppointment: async (appointmentId: number): Promise<SecretaryAppointment> => {
    return apiHelpers.get<SecretaryAppointment>(`/appointments/${appointmentId}/`);
  },

  /**
   * Crear nueva cita para un paciente
   * POST /api/users/secretaries/appointments/
   */
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<SecretaryAppointment> => {
    return apiHelpers.post<SecretaryAppointment>('/users/secretaries/appointments/', appointmentData);
  },

  // NOTA: Los siguientes endpoints de gestión de citas no están implementados
  // TODO: Implementar en el backend si son necesarios

  /**
   * Actualizar una cita existente
   * PATCH /api/appointments/{id}/ (usar endpoint general de citas)
   */
  updateAppointment: async (
    appointmentId: number,
    updateData: UpdateSecretaryAppointmentData
  ): Promise<SecretaryAppointment> => {
    return apiHelpers.patch<SecretaryAppointment>(
      `/appointments/${appointmentId}/`,
      updateData
    );
  },

  /**
   * Cancelar una cita
   * POST /api/appointments/{id}/cancel/ (usar endpoint general de citas)
   */
  cancelAppointment: async (
    appointmentId: number,
    reason?: string
  ): Promise<SecretaryAppointment> => {
    return apiHelpers.post<SecretaryAppointment>(
      `/appointments/${appointmentId}/cancel/`,
      { reason }
    );
  },

  /**
   * Confirmar una cita
   * POST /api/appointments/{id}/confirm/ (usar endpoint general de citas)
   */
  confirmAppointment: async (appointmentId: number): Promise<SecretaryAppointment> => {
    return apiHelpers.post<SecretaryAppointment>(
      `/appointments/${appointmentId}/confirm/`
    );
  },

  /**
   * Reprogramar una cita
   * POST /api/appointments/{id}/reschedule/ (usar endpoint general de citas)
   */
  rescheduleAppointment: async (
    appointmentId: number,
    newDateTime: {
      appointment_date: string;
      appointment_time: string;
    }
  ): Promise<SecretaryAppointment> => {
    return apiHelpers.post<SecretaryAppointment>(
      `/appointments/${appointmentId}/reschedule/`,
      newDateTime
    );
  },

  // ==========================================
  // GESTIÓN DE PACIENTES
  // ==========================================
  
  // NOTA: Los siguientes endpoints de pacientes no están implementados en el backend actual
  // TODO: Implementar en el backend si son necesarios
  // Se pueden usar los endpoints generales de pacientes: /api/patients/

  /*
  getPatients: async (filters?: PatientFilters & { page?: number }): Promise<SecretaryPatientsResponse> => {
    // Usar /api/patients/ en su lugar
  },

  getPatient: async (patientId: number): Promise<SecretaryPatient> => {
    // Usar /api/patients/{id}/ en su lugar
  },

  createPatient: async (patientData: PatientData): Promise<SecretaryPatient> => {
    // Usar /api/patients/ en su lugar
  },

  updatePatient: async (patientId: number, updateData: Partial<PatientData>): Promise<SecretaryPatient> => {
    // Usar /api/patients/{id}/ en su lugar
  },

  getPatientAppointments: async (patientId: number, filters?: { date_from?: string; date_to?: string }): Promise<SecretaryAppointment[]> => {
    // Usar /api/patients/{id}/appointments/ en su lugar
  },
  */

  // ==========================================
  // GESTIÓN DE DOCTORES Y HORARIOS
  // ==========================================
  
  // NOTA: Los siguientes endpoints de doctores no están implementados en el backend actual
  // TODO: Implementar en el backend si son necesarios
  // Se pueden usar los endpoints generales de doctores: /api/doctors/

  /*
  getAvailableDoctors: async (filters?: { specialization?: string; is_available?: boolean; date?: string; }): Promise<AvailableDoctor[]> => {
    // Usar /api/doctors/ en su lugar
  },

  getDoctorAvailableSlots: async (doctorId: number, date: string): Promise<DoctorAvailableSlots> => {
    // Implementar en el backend si es necesario
  },

  checkDoctorAvailability: async (doctorId: number, date: string, time: string): Promise<{ is_available: boolean; reason?: string }> => {
    // Implementar en el backend si es necesario
  },
  */

  // ==========================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================
  
  // NOTA: Los siguientes endpoints de reportes no están implementados en el backend actual
  // TODO: Implementar en el backend si son necesarios
  // Se puede usar el endpoint de dashboard: /api/users/secretaries/dashboard/

  /*
  getActivityReport: async (params: { date_from: string; date_to: string; }): Promise<SecretaryActivityReport> => {
    // Usar /api/users/secretaries/dashboard/ o implementar endpoint específico
  },

  getAppointmentsReport: async (params: { date_from: string; date_to: string; group_by?: 'date' | 'doctor' | 'status'; include_cancelled?: boolean; }): Promise<any> => {
    // Implementar en el backend si es necesario
  },

  getPatientsReport: async (params: { date_from: string; date_to: string; include_inactive?: boolean; }): Promise<any> => {
    // Implementar en el backend si es necesario
  },
  */

  // ==========================================
  // BÚSQUEDAS Y UTILIDADES
  // ==========================================

  // NOTA: Las siguientes funciones dependen de endpoints no implementados
  // TODO: Descomentar cuando se implementen los endpoints correspondientes

  /*
  searchPatients: async (query: string): Promise<SecretaryPatient[]> => {
    const response = await secretaryService.getPatients({ search: query });
    return response.results;
  },
  */

  /**
   * Buscar citas por criterios múltiples
   */
  searchAppointments: async (query: string): Promise<SecretaryAppointment[]> => {
    const response = await secretaryService.getAppointments({ search: query });
    return response.results;
  },

  /**
   * Obtener próximas citas del día
   */
  getTodayAppointments: async (): Promise<SecretaryAppointment[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await secretaryService.getAppointments({
      date_from: today,
      date_to: today
    });
    return response.results;
  },

  /**
   * Obtener citas pendientes de confirmación
   */
  getPendingAppointments: async (): Promise<SecretaryAppointment[]> => {
    const response = await secretaryService.getAppointments({
      status: 'scheduled'
    });
    return response.results;
  },

  // NOTA: Las siguientes funciones dependen de endpoints no implementados
  // TODO: Descomentar cuando se implementen los endpoints correspondientes

  /*
  validateAppointmentSlot: async (
    doctorId: number,
    date: string,
    time: string
  ): Promise<{
    is_valid: boolean;
    conflicts?: SecretaryAppointment[];
    reason?: string;
  }> => {
    try {
      // Verificar disponibilidad del doctor
      const availability = await secretaryService.checkDoctorAvailability(
        doctorId, 
        date, 
        time
      );

      if (!availability.is_available) {
        return {
          is_valid: false,
          reason: availability.reason || 'Doctor no disponible'
        };
      }

      // Verificar conflictos de citas existentes
      const existingAppointments = await secretaryService.getAppointments({
        doctor_id: doctorId,
        date_from: date,
        date_to: date
      });

      const conflicts = existingAppointments.results.filter(
        apt => apt.appointment_time === time && 
               apt.status !== 'cancelled'
      );

      return {
        is_valid: conflicts.length === 0,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        reason: conflicts.length > 0 ? 'Horario ya ocupado' : undefined
      };
    } catch {
      return {
        is_valid: false,
        reason: 'Error al validar horario'
      };
    }
  },

  getDailySummary: async (date?: string): Promise<{
    date: string;
    total_appointments: number;
    confirmed_appointments: number;
    pending_appointments: number;
    cancelled_appointments: number;
    new_patients: number;
    busy_doctors: number;
    available_doctors: number;
  }> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Obtener estadísticas del dashboard
    const stats = await secretaryService.getDashboardStats();
    
    // Obtener citas del día
    const appointments = await secretaryService.getAppointments({
      date_from: targetDate,
      date_to: targetDate
    });

    // Obtener doctores disponibles
    const doctors = await secretaryService.getAvailableDoctors({
      date: targetDate
    });

    return {
      date: targetDate,
      total_appointments: appointments.results.length,
      confirmed_appointments: appointments.results.filter(apt => apt.status === 'confirmed').length,
      pending_appointments: appointments.results.filter(apt => apt.status === 'scheduled').length,
      cancelled_appointments: appointments.results.filter(apt => apt.status === 'cancelled').length,
      new_patients: stats.new_patients_today,
      busy_doctors: doctors.filter(doc => !doc.is_available).length,
      available_doctors: doctors.filter(doc => doc.is_available).length
    };
  }
  */
};

// Exportar por defecto
export default secretaryService;