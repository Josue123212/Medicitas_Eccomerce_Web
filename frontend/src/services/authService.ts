// 🔐 Servicio de Autenticación

import api, { getCSRFTokenFromServer } from './api';
import type {
  User,
  LoginData,
  RegisterData,
  AuthResponse,
  UpdateProfileData,
  ChangePasswordData
} from '../types/auth';

// Tipo para errores de API
interface ApiError {
  response?: {
    data?: {
      error?: string;
      detail?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

/**
 * Servicio para manejar todas las operaciones de autenticación
 */
export const authService = {
  /**
   * Inicializar token CSRF
   */
  initializeCSRF: async (): Promise<void> => {
    try {
      const csrfToken = await getCSRFTokenFromServer();
      console.log('✅ Token CSRF inicializado correctamente:', csrfToken ? 'Token obtenido' : 'Sin token');
    } catch (error) {
      console.error('❌ Error al inicializar token CSRF:', error);
      throw error;
    }
  },
  /**
   * Iniciar sesión
   */
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    try {
      // Mapear el campo email a email_or_username que espera el backend
      const backendLoginData = {
        email_or_username: loginData.email,
        password: loginData.password
      };
      
      const response = await api.post('/users/auth/login/', backendLoginData);
      
      // Mapear la respuesta del backend al formato esperado por el frontend
      const backendData = response.data.data;
      
      return {
        user: {
          id: backendData.user.id.toString(),
          email: backendData.user.email,
          firstName: backendData.user.first_name || (backendData.user.email && typeof backendData.user.email === 'string' && backendData.user.email.includes('@') ? backendData.user.email.split('@')[0] : '') || 'Usuario',
          lastName: backendData.user.last_name || '',
          phone: backendData.user.phone || '',
          role: backendData.user.role || 'client',
          isActive: backendData.user.is_active || true,
          dateJoined: backendData.user.date_joined || new Date().toISOString(),
          lastLogin: backendData.user.last_login || undefined,
          avatar: backendData.user.avatar || undefined,
          patient_profile_id: backendData.user.patient_profile_id || undefined // ¡CAMPO AGREGADO!
        },
        accessToken: backendData.access,
        refreshToken: backendData.refresh,
        expiresIn: 3600 // 1 hora por defecto
      };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.login:', error);
      console.error('Error response:', apiError.response);
      console.error('Error data:', apiError.response?.data);
      
      // 🔍 Extraer mensaje de error desde diferentes formatos del backend
      let errorMessage = 'Error al iniciar sesión';
      
      if (apiError.response?.data) {
        const data = apiError.response.data;
        
        // 1. PRIORIDAD: Formato Django REST Framework: non_field_errors
        if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
          errorMessage = data.non_field_errors[0];
        }
        // 2. Parsear detail si contiene non_field_errors como string
        else if (data.detail && typeof data.detail === 'string' && data.detail.includes('non_field_errors')) {
          try {
            // Extraer el mensaje del string detail
            const match = data.detail.match(/string='([^']+)'/);
            if (match && match[1]) {
              errorMessage = match[1];
            } else {
              errorMessage = data.detail;
            }
          } catch (e) {
            errorMessage = data.detail;
          }
        }
        // 3. Formato personalizado: message
        else if (data.message) {
          errorMessage = data.message;
        }
        // 4. Formato de campo específico: detail
        else if (data.detail) {
          errorMessage = data.detail;
        }
        // 5. ÚLTIMO RECURSO: error (puede ser genérico)
        else if (data.error) {
          errorMessage = data.error;
        }
      }
      // Fallback al mensaje del error
      else if (apiError.message) {
        errorMessage = apiError.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('🚀 Datos de registro recibidos:', registerData);
      
      // Mapear los datos del frontend al formato que espera el backend
      const backendData = {
        username: registerData.email, // Usar email como username
        email: registerData.email,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        password: registerData.password,
        password_confirm: registerData.confirmPassword,
        phone: registerData.phone || '',
        date_of_birth: null,
        address: ''
      };
      
      console.log('📤 Datos enviados al backend:', backendData);
      
      const response = await api.post('/users/auth/register/', backendData);
      console.log('✅ Respuesta del backend:', response.data);
      
      // Mapear la respuesta del backend al formato del frontend
      const backendResponse = response.data;
      
      return {
        user: {
          id: backendResponse.user.id,
          email: backendResponse.user.email,
          firstName: backendResponse.user.first_name || 'Usuario',
          lastName: backendResponse.user.last_name,
          phone: backendResponse.user.phone || '',
          role: backendResponse.user.role || 'client',
          isActive: backendResponse.user.is_active || true,
          dateJoined: backendResponse.user.created_at || new Date().toISOString(),
          lastLogin: backendResponse.user.updated_at || undefined,
          avatar: backendResponse.user.avatar || undefined
        },
        accessToken: backendResponse.tokens.access,
        refreshToken: backendResponse.tokens.refresh,
        expiresIn: 3600 // 1 hora por defecto
      };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.register:', apiError);
      
      const errorMessage = apiError.response?.data?.error || 
                          apiError.response?.data?.detail || 
                          apiError.message || 
                          'Error al registrar usuario';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/users/auth/logout/');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.logout:', apiError);
      throw new Error('Error al cerrar sesión');
    }
  },

  /**
   * Renovar token de acceso
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/users/auth/refresh/', {
        refresh: refreshToken
      });
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.refreshToken:', apiError);
      throw new Error('Error al renovar token');
    }
  },

  /**
   * Obtener perfil del usuario actual
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/profile/');
      const backendData = response.data;
      

      
      // Mapear la respuesta del backend al formato esperado por el frontend
      const mappedUser = {
        id: backendData.id?.toString() || backendData.user?.id?.toString(),
        email: backendData.email || backendData.user?.email,
        firstName: backendData.first_name || backendData.user?.first_name || (backendData.email && typeof backendData.email === 'string' && backendData.email.includes('@') ? backendData.email.split('@')[0] : '') || 'Usuario',
        lastName: backendData.last_name || backendData.user?.last_name || '',
        phone: backendData.phone || backendData.user?.phone || '',
        role: backendData.role || backendData.user?.role || 'client',
        isActive: backendData.is_active !== undefined ? backendData.is_active : (backendData.user?.is_active || true),
        dateJoined: backendData.date_joined || backendData.user?.date_joined || new Date().toISOString(),
        lastLogin: backendData.last_login || backendData.user?.last_login || undefined,
        avatar: backendData.avatar || backendData.user?.avatar || undefined,
        address: backendData.address || backendData.user?.address || undefined,
        emergencyContact: backendData.emergency_contact || backendData.user?.emergency_contact || undefined,
        allergies: backendData.allergies || '',
        medicalConditions: backendData.medical_conditions || '',
        patient_profile_id: backendData.patient_profile_id || backendData.user?.patient_profile_id || undefined
      };
      
      
      
      return mappedUser;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.getProfile:', apiError);
      throw new Error('Error al obtener usuario actual');
    }
  },

  /**
   * Actualizar perfil del usuario
   */
  updateProfile: async (profileData: UpdateProfileData): Promise<User> => {
    try {
      console.log('🔍 authService.updateProfile - Datos enviados:', profileData);
      
      // Mapear datos del frontend al formato del backend
      const backendData: Record<string, any> = {
        first_name: profileData.firstName || '',
        last_name: profileData.lastName || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        avatar: profileData.avatar,
        emergency_contact: profileData.emergencyContact || '',
        allergies: profileData.allergies || '',
        medical_conditions: profileData.medicalConditions || ''
      };
      
      const response = await api.patch('/users/profile/', backendData);
      
      // La respuesta tiene formato { message: string, user: {...} }
      const userData = response.data.user;
      
      // Mapear la respuesta del backend al formato del frontend
      const mappedUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        phone: userData.phone || '',
        role: userData.role || '',
        isActive: userData.is_active,
        dateJoined: userData.date_joined,
        lastLogin: userData.last_login,
        avatar: userData.avatar || '',
        address: userData.address || '',
        emergencyContact: userData.emergency_contact || '',
        allergies: userData.allergies || '',
        medicalConditions: userData.medical_conditions || '',
        patientProfileId: userData.patient_profile_id
      };
      
      console.log('🔍 authService.updateProfile - Usuario mapeado:', mappedUser);
      return mappedUser;
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      throw error;
    }
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (passwordData: ChangePasswordData): Promise<void> => {
    try {
      await api.post('/users/change-password/', passwordData);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.changePassword:', apiError);
      throw new Error('Error al cambiar contraseña');
    }
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password/', { email });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.requestPasswordReset:', apiError);
      throw new Error('Error al solicitar restablecimiento de contraseña');
    }
  },

  /**
   * Restablecer contraseña con token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/reset-password/', {
        token,
        password: newPassword
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en authService.resetPassword:', apiError);
      throw new Error('Error al restablecer contraseña');
    }
  },

  /**
   * Verificar si un token es válido
   */
  verifyToken: async (token: string): Promise<boolean> => {
    try {
      // Verificar que el token no sea nulo o vacío
      if (!token || token.trim() === '') {
        console.log('⚠️ Token vacío o nulo, no se puede verificar');
        return false;
      }
      
      console.log('🔍 Verificando token...');
      await api.post('/users/auth/verify/', { token });
      console.log('✅ Token verificado exitosamente');
      return true;
    } catch (error: any) {
      console.log('❌ Token inválido:', error.response?.data?.detail || error.message);
      return false;
    }
  },

  /**
   * Autenticación con Google OAuth
   */
  googleAuth: async (googleData: { credential: string; mode: 'login' | 'register' }): Promise<{
    success: boolean;
    data?: { access: string; refresh: string; user: User };
    error?: string;
  }> => {
    try {
      const response = await api.post('/users/auth/google/', {
        credential: googleData.credential,
        mode: googleData.mode
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error en Google Auth:', apiError);
      return {
        success: false,
        error: apiError.response?.data?.error || apiError.message || 'Error en autenticación con Google'
      };
    }
  },

  /**
   * Verificar el estado de autenticación
   */
  checkAuth: async (): Promise<User | null> => {
    try {
      const response = await api.get('/users/auth/me/');
      return response.data;
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
      return null;
    }
  }
};

/**
 * Utilidades para manejo de tokens
 */
export const tokenUtils = {
  /**
   * Guardar tokens en localStorage
   */
  saveTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  /**
   * Obtener token de acceso
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Obtener token de refresco
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Limpiar todos los tokens
   */
  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Verificar si hay tokens guardados
   */
  hasTokens: (): boolean => {
    return !!(tokenUtils.getAccessToken() && tokenUtils.getRefreshToken());
  }
};