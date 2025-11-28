import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface GoogleAuthButtonProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode,
  onSuccess,
  onError
}) => {
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Enviar el token de Google al backend
      const response = await authService.googleAuth({
        credential: credentialResponse.credential,
        mode: mode
      });

      if (response.success && response.data) {
        // Usar el contexto de autenticación para hacer login
        await login(response.data.access, response.data.refresh);
        onSuccess?.();
      } else {
        throw new Error(response.error || 'Error en autenticación con Google');
      }
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
    }
  };

  const handleGoogleError = () => {
    const errorMessage = 'Error al conectar con Google';
    console.error(errorMessage);
    onError?.(errorMessage);
  };

  // 🐛 DEBUG: Verificar configuración de Google OAuth
  React.useEffect(() => {
    console.log('🔍 Google OAuth Debug Info:');
    console.log('CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('Current URL:', window.location.href);
    console.log('Expected redirect_uri:', 'http://localhost:8000/api/auth/social/google/login/callback/');
  }, []);

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        width={320}
        text={mode === 'login' ? 'signin_with' : 'signup_with'}
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleAuthButton;