import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { authService, tokenUtils } from '../services/authService';
import type { User, LoginData, RegisterData, UpdateProfileData, ChangePasswordData } from '../types/auth';

// Tipos del contexto
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (loginData: LoginData) => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateUser: (user: User) => void;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  refreshUserProfile: () => Promise<void>;
}

// Acciones del reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Función para obtener el estado inicial inteligente
const getInitialState = (): AuthState => {
  const cachedUser = localStorage.getItem('user');
  const accessToken = tokenUtils.getAccessToken();
  const refreshToken = tokenUtils.getRefreshToken();
  
  // Si hay usuario en caché Y tokens, asumir que está autenticado inicialmente
  if (cachedUser && accessToken && refreshToken) {
    try {
      const user = JSON.parse(cachedUser);
      return {
        user,
        isAuthenticated: true,
        isLoading: false, // No mostrar cargando si hay datos en caché
        error: null,
      };
    } catch (error) {
      console.warn('Error al parsear usuario del caché:', error);
    }
  }
  
  // SIEMPRE empezar sin cargando para evitar bloqueos
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false, // Cambiar a false para evitar bloqueo inicial
    error: null,
  };
};

// Estado inicial
const initialState: AuthState = getInitialState();

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializingRef = useRef(false);

  // Función para limpiar datos de autenticación
  const clearAuthData = useCallback(() => {
    tokenUtils.clearTokens();
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    console.log('🧹 Datos de autenticación limpiados');
  }, []);

  // Función para intentar renovar token
  const attemptTokenRefresh = useCallback(async (refreshToken: string) => {
    try {
      console.log('🔄 Intentando renovar token...');
      
      // Timeout más corto para el refresh
      const refreshPromise = authService.refreshToken(refreshToken);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Refresh timeout')), 400)
      );
      
      const authResponse = await Promise.race([refreshPromise, timeoutPromise]) as any;
      
      tokenUtils.saveTokens(authResponse.accessToken, authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
      console.log('✅ Token renovado exitosamente');
    } catch (refreshError) {
      console.error('❌ Error al renovar token:', refreshError);
      clearAuthData();
      throw refreshError; // Re-lanzar para que el caller pueda manejarlo
    }
  }, [clearAuthData]);

  // Inicializar autenticación
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Evitar múltiples inicializaciones simultáneas
        if (initializingRef.current) return;
        
        initializingRef.current = true;
        
        const accessToken = tokenUtils.getAccessToken();
        const refreshToken = tokenUtils.getRefreshToken();
        
        // Si no hay tokens, limpiar inmediatamente sin mostrar cargando
        if (!accessToken || !refreshToken) {
          console.log('❌ No hay tokens guardados, limpiando estado...');
          if (isMounted) {
            clearAuthData();
          }
          return;
        }
        
        // Solo mostrar cargando si no hay usuario en caché Y hay tokens válidos
        const cachedUser = localStorage.getItem('user');
        if (!cachedUser && accessToken && refreshToken) {
          console.log('🔄 Mostrando loading para validar tokens...');
          dispatch({ type: 'AUTH_START' });
        }
        
        // ⏰ TIMEOUT DE SEGURIDAD - Si no se resuelve en 500ms, limpiar estado
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('⏰ Timeout de autenticación - limpiando estado');
            clearAuthData();
          }
        }, 500);
        
        // Primero verificar si hay usuario en localStorage
        if (cachedUser) {
          try {
            JSON.parse(cachedUser); // Verificar que el JSON es válido
            
            // Si ya tenemos el usuario en caché, validar en background sin bloquear la UI
            authService.getProfile()
              .then((profileUser) => {
                if (isMounted) {
                  dispatch({ type: 'AUTH_SUCCESS', payload: profileUser });
                  localStorage.setItem('user', JSON.stringify(profileUser));
                }
              })
              .catch(() => {
                attemptTokenRefresh(refreshToken).catch(() => {
                  if (isMounted) {
                    clearAuthData();
                  }
                });
              });
            
            clearTimeout(timeoutId);
            return; // Salir inmediatamente, la validación continúa en background
          } catch (error) {
            console.log('⚠️ Error al parsear caché, validando desde servidor...');
          }
        }
        
        // Si no hay caché válido, hacer validación completa
        try {
          console.log('🔍 Validando token desde servidor...');
          const profileUser = await Promise.race([
            authService.getProfile(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 400)
            )
          ]) as User;
          
          clearTimeout(timeoutId);
          if (isMounted) {
            dispatch({ type: 'AUTH_SUCCESS', payload: profileUser });
            console.log('✅ Autenticación restaurada desde servidor');
            localStorage.setItem('user', JSON.stringify(profileUser));
          }
        } catch (error) {
          console.log('⚠️ Error al validar token, intentando refresh...');
          try {
            await attemptTokenRefresh(refreshToken);
          } catch (refreshError: any) {
            console.error('❌ Error en refresh:', refreshError);
            
            // Solo limpiar datos si es un error de autenticación (401, 403)
            // No limpiar por errores de red o servidor (500, timeout, etc.)
            const shouldClearAuth = refreshError?.response?.status === 401 || 
                                   refreshError?.response?.status === 403 ||
                                   refreshError?.message?.includes('Invalid refresh token');
            
            if (shouldClearAuth) {
              console.log('🧹 Error de autenticación, limpiando datos');
              clearTimeout(timeoutId);
              if (isMounted) {
                clearAuthData();
              }
            } else {
              console.log('⚠️ Error temporal, manteniendo sesión');
              // Mantener el usuario del localStorage si existe
              const savedUser = localStorage.getItem('user');
              if (savedUser && isMounted) {
                try {
                  const user = JSON.parse(savedUser);
                  dispatch({ type: 'AUTH_SUCCESS', payload: user });
                  console.log('✅ Sesión mantenida desde localStorage');
                } catch (parseError) {
                  console.error('Error al parsear usuario guardado:', parseError);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error al inicializar autenticación:', error);
        clearTimeout(timeoutId);
        if (isMounted) {
          clearAuthData();
        }
      } finally {
        initializingRef.current = false;
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      initializingRef.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [attemptTokenRefresh, clearAuthData]);

  // Función de login
  const login = async (loginData: LoginData): Promise<void> => {
    try {
      console.log('🔐 Iniciando login con:', { email: loginData.email });
      dispatch({ type: 'AUTH_START' });
      
      const authResponse = await authService.login(loginData);
      console.log('✅ Login exitoso, respuesta:', authResponse);
      
      tokenUtils.saveTokens(authResponse.accessToken, authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
      
      toast.success(`¡Bienvenido/a, ${authResponse.user.firstName || 'Usuario'}!`);
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función de registro
  const register = async (registerData: RegisterData): Promise<void> => {
    try {
      console.log('🔄 Iniciando registro en AuthContext...');
      dispatch({ type: 'AUTH_START' });
      
      const authResponse = await authService.register(registerData);
      console.log('✅ Registro exitoso en AuthContext:', authResponse);
      
      tokenUtils.saveTokens(authResponse.accessToken, authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
      
      console.log('🎉 Usuario registrado y autenticado exitosamente');
      toast.success(`¡Bienvenido/a, ${authResponse.user.firstName || 'Usuario'}! Tu cuenta ha sido creada exitosamente.`);
    } catch (error: any) {
      console.error('❌ Error en AuthContext.register:', error);
      
      const errorMessage = error.message || 'Error al registrarse';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función de logout
  const logout = (): void => {
    try {
      authService.logout();
      tokenUtils.clearTokens();
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      tokenUtils.clearTokens();
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const updatedUser = await authService.updateProfile(data);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      const errorMessage = error.message || 'Error al actualizar perfil';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      await authService.changePassword(data);
      
      dispatch({ type: 'CLEAR_ERROR' });
      toast.success('Contraseña cambiada exitosamente');
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cambiar contraseña';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función para limpiar errores
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Función para refrescar perfil
  const refreshUserProfile = async (): Promise<void> => {
    try {
      const user = await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error: any) {
      console.error('❌ Error al refrescar perfil:', error);
    }
  };

  // Función para actualizar usuario (solo estado local)
  const updateUser = (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    changePassword,
    clearError,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// Hook para verificar roles
export const useRole = (requiredRole: string | string[]): boolean => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

// Hook para permisos
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    isClient: user?.role === 'client',
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'superadmin',
    hasAdminAccess: user?.role === 'admin' || user?.role === 'superadmin',
    canManageUsers: user?.role === 'superadmin',
    canViewReports: user?.role === 'admin' || user?.role === 'superadmin'
  };
};

// Exportación por defecto del contexto
export default AuthContext;