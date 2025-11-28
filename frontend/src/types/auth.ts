// 🔐 Tipos para el Sistema de Autenticación

/**
 * Roles disponibles en el sistema
 */
export type UserRole = 'client' | 'doctor' | 'secretary' | 'admin' | 'superadmin';

/**
 * Interface para el usuario autenticado
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  dateJoined: string;
  lastLogin?: string;
  avatar?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalConditions?: string;
  patient_profile_id?: number; // ID del perfil de paciente (solo para usuarios con role 'client')
}

/**
 * Datos para el registro de usuario
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

/**
 * Datos para el login
 */
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Respuesta del servidor al hacer login
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Datos para actualizar el perfil
 */
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalConditions?: string;
}

/**
 * Datos para cambiar contraseña
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Errores de autenticación
 */
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}