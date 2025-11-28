// 📅 Servicio para operaciones de Citas Médicas

import { apiHelpers } from './api';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  RescheduleAppointmentData,
  AppointmentsListResponse,
  AppointmentFilters,
  AvailableSlotsResponse,
  PatientAppointmentHistory,
  ExtendedPatientAppointmentHistory,
  DoctorSchedule,
  AppointmentStats,
  AppointmentActionResponse,
  AppointmentStatus
} from '../types/appointment';

/**
 * Servicio para manejar todas las operaciones relacionadas con citas médicas
 */
export const appointmentService = {
  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener lista de citas con filtros opcionales
   * GET /api/appointments/
   */
  getAppointments: async (filters?: AppointmentFilters): Promise<AppointmentsListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return apiHelpers.get<AppointmentsListResponse>(`/appointments/?${params.toString()}`);
  },

  /**
   * Obtener una cita específica por ID
   * GET /api/appointments/{id}/
   */
  getAppointment: async (appointmentId: number): Promise<Appointment> => {
    return apiHelpers.get<Appointment>(`/appointments/${appointmentId}/`);
  },

  /**
   * Crear una nueva cita
   * POST /api/appointments/
   */
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    return apiHelpers.post<Appointment>('/appointments/', appointmentData);
  },

  /**
   * Actualizar una cita existente
   * PUT /api/appointments/{id}/
   */
  updateAppointment: async (appointmentId: number, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
    return apiHelpers.put<Appointment>(`/appointments/${appointmentId}/`, appointmentData);
  },

  /**
   * Actualización parcial de una cita
   * PATCH /api/appointments/{id}/
   */
  patchAppointment: async (appointmentId: number, appointmentData: Partial<UpdateAppointmentData>): Promise<Appointment> => {
    return apiHelpers.patch<Appointment>(`/appointments/${appointmentId}/`, appointmentData);
  },

  /**
   * Eliminar una cita
   * DELETE /api/appointments/{id}/
   */
  deleteAppointment: async (appointmentId: number): Promise<void> => {
    return apiHelpers.delete<void>(`/appointments/${appointmentId}/`);
  },

  // ==========================================
  // ACCIONES ESPECÍFICAS DE CITAS
  // ==========================================

  /**
   * Confirmar una cita programada
   * POST /api/appointments/{id}/confirm/
   */
  confirmAppointment: async (appointmentId: number): Promise<AppointmentActionResponse> => {
    return apiHelpers.post<AppointmentActionResponse>(`/appointments/${appointmentId}/confirm/`);
  },

  /**
   * Cancelar una cita
   * POST /api/appointments/{id}/cancel/
   */
  cancelAppointment: async (appointmentId: number, reason?: string): Promise<AppointmentActionResponse> => {
    try {
      const data = reason ? { reason } : {};
      return await apiHelpers.post<AppointmentActionResponse>(`/appointments/${appointmentId}/cancel/`, data);
    } catch (error: any) {
      // Enriquecer el error con información adicional para mejor debugging
      if (error?.response) {
        const { status, data } = error.response;
        console.error(`Error ${status} al cancelar cita ${appointmentId}:`, data);
        
        // Agregar contexto específico al error
        if (status === 403) {
          error.userMessage = 'No tienes permisos para cancelar esta cita';
        } else if (status === 404) {
          error.userMessage = 'La cita no fue encontrada';
        } else if (status === 400) {
          error.userMessage = data?.detail || 'La cita no puede ser cancelada en su estado actual';
        }
      }
      throw error;
    }
  },

  /**
   * Marcar una cita como completada
   * POST /api/appointments/{id}/complete/
   */
  completeAppointment: async (appointmentId: number, notes?: string): Promise<AppointmentActionResponse> => {
    const data = notes ? { notes } : {};
    return apiHelpers.post<AppointmentActionResponse>(`/appointments/${appointmentId}/complete/`, data);
  },

  /**
   * Reprogramar una cita
   * POST /api/appointments/{id}/reschedule/
   */
  rescheduleAppointment: async (appointmentId: number, rescheduleData: RescheduleAppointmentData): Promise<AppointmentActionResponse> => {
    return apiHelpers.post<AppointmentActionResponse>(`/appointments/${appointmentId}/reschedule/`, rescheduleData);
  },

  // ==========================================
  // CONSULTAS ESPECIALIZADAS
  // ==========================================

  /**
   * Obtener historial de citas de un paciente
   * GET /api/appointments/patient-history/?patient_id={id}
   */
  getPatientHistory: async (patientId: number, filters?: {
    date_from?: string;
    date_to?: string;
    status?: string;
    limit?: number;
  }): Promise<ExtendedPatientAppointmentHistory> => {
    const params = new URLSearchParams({ patient_id: patientId.toString() });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiHelpers.get<PatientAppointmentHistory>(`/appointments/patient-history/?${params.toString()}`);
    
    return response;
  },

  /**
   * Obtener agenda de un doctor
   * GET /api/appointments/doctor_schedule/?doctor_id={id}&date={date}
   */
  getDoctorSchedule: async (doctorId: number, date: string): Promise<DoctorSchedule> => {
    const params = new URLSearchParams({
      doctor_id: doctorId.toString(),
      date: date
    });

    return apiHelpers.get<DoctorSchedule>(`/appointments/doctor_schedule/?${params.toString()}`);
  },

  /**
   * Obtener horarios disponibles para agendar
   * GET /api/appointments/available-slots/?doctor_id={id}&date={date}
   */
  getAvailableSlots: async (doctorId: number, date: string): Promise<AvailableSlotsResponse> => {
    const params = new URLSearchParams({
      doctor_id: doctorId.toString(),
      date: date
    });

    return apiHelpers.get<AvailableSlotsResponse>(`/appointments/available-slots/?${params.toString()}`);
  },

  // ==========================================
  // ESTADÍSTICAS Y REPORTES
  // ==========================================

  /**
   * Obtener estadísticas generales de citas
   * GET /api/appointments/stats/
   */
  getAppointmentStats: async (filters?: {
    date_from?: string;
    date_to?: string;
    doctor_id?: number;
    patient_id?: number;
  }): Promise<AppointmentStats> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return apiHelpers.get<AppointmentStats>(`/appointments/stats/?${params.toString()}`);
  },

  // ==========================================
  // MÉTODOS DE CONVENIENCIA
  // ==========================================

  /**
   * Obtener citas de hoy
   */
  getTodayAppointments: async (): Promise<AppointmentsListResponse> => {
    const today = new Date().toISOString().split('T')[0];
    return appointmentService.getAppointments({ date: today });
  },

  /**
   * Obtener citas de esta semana
   */
  getThisWeekAppointments: async (): Promise<AppointmentsListResponse> => {
    return appointmentService.getAppointments({ this_week: true });
  },

  /**
   * Obtener citas de este mes
   */
  getThisMonthAppointments: async (): Promise<AppointmentsListResponse> => {
    return appointmentService.getAppointments({ this_month: true });
  },

  /**
   * Obtener próximas citas
   */
  getUpcomingAppointments: async (): Promise<AppointmentsListResponse> => {
    return appointmentService.getAppointments({ upcoming: true });
  },

  /**
   * Obtener citas pasadas
   */
  getPastAppointments: async (): Promise<AppointmentsListResponse> => {
    return appointmentService.getAppointments({ past: true });
  },

  /**
   * Obtener citas por estado
   */
  getAppointmentsByStatus: async (status: string): Promise<AppointmentsListResponse> => {
    return appointmentService.getAppointments({ status: status as AppointmentStatus });
  },

  /**
   * Buscar citas por texto
   */
  searchAppointments: async (searchTerm: string): Promise<AppointmentsListResponse> => {
    return appointmentService.getAppointments({ search: searchTerm });
  },

  // ==========================================
  // VALIDACIONES Y UTILIDADES
  // ==========================================

  /**
   * Validar si una fecha y hora están disponibles para un doctor
   */
  validateAvailability: async (doctorId: number, date: string, time: string): Promise<boolean> => {
    try {
      const slots = await appointmentService.getAvailableSlots(doctorId, date);
      return slots.data.available_slots.some(slot => slot.time === time);
    } catch (error) {
      console.error('Error validating availability:', error);
      return false;
    }
  },

  /**
   * Obtener próxima cita disponible para un doctor
   */
  getNextAvailableSlot: async (doctorId: number, fromDate?: string): Promise<{ date: string; time: string } | null> => {
    try {
      const startDate = fromDate || new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 días adelante
      
      // Buscar en los próximos 30 días
      for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const slots = await appointmentService.getAvailableSlots(doctorId, dateStr);
        
        if (slots.data.available_slots.length > 0) {
          return {
            date: dateStr,
            time: slots.data.available_slots[0].time
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting next available slot:', error);
      return null;
    }
  },

  /**
   * Verificar si una cita puede ser cancelada
   */
  canBeCancelled: (appointment: Appointment): boolean => {
    return appointment.can_be_cancelled;
  },

  /**
   * Verificar si una cita puede ser reprogramada
   */
  canBeRescheduled: (appointment: Appointment): boolean => {
    return appointment.can_be_rescheduled;
  },

  /**
   * Obtener color del estado de la cita
   */
  getStatusColor: (status: string): string => {
    const colors = {
      scheduled: '#f59e0b',   // amber
      confirmed: '#3b82f6',   // blue
      completed: '#10b981',   // green
      cancelled: '#ef4444',   // red
      no_show: '#6b7280'      // gray
    };
    return colors[status as keyof typeof colors] || '#6b7280';
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
   * Formatear hora para mostrar
   */
  formatTime: (timeString: string): string => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // ==========================================
  // CONSULTAS ESPECÍFICAS PARA CLIENTES
  // ==========================================

  /**
   * Obtener mis citas (para clientes autenticados)
   * GET /api/appointments/ (filtrado por usuario actual)
   */
  getMyAppointments: async (filters?: AppointmentFilters): Promise<AppointmentsListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return apiHelpers.get<AppointmentsListResponse>(`/appointments/?${params.toString()}`);
  },

  // ==========================================
  // UTILIDADES Y HELPERS
  // ==========================================

  /**
   * Formatear fecha para mostrar en la UI
   */
  formatAppointmentDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// 📋 EXPLICACIÓN:
// 1. Implementamos todos los endpoints CRUD básicos para citas
// 2. Agregamos acciones específicas como confirmar, cancelar, completar y reprogramar
// 3. Incluimos consultas especializadas para historial y agenda
// 4. Proporcionamos métodos de conveniencia para casos comunes
// 5. Agregamos validaciones y utilidades para mejorar la UX
// 6. Todo está tipado con TypeScript para mayor seguridad
// 7. Seguimos la misma estructura que otros servicios del proyecto