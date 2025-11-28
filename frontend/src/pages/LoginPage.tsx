import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useFormValidation } from '../lib/hooks/useFormValidation';
import { loginSchema, type LoginFormData } from '../lib/validations';
import { useAuth } from '../contexts/AuthContext';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

/**
 * 🔐 PÁGINA DE LOGIN
 * 
 * Página de autenticación para el sistema de citas médicas.
 * Utiliza React Hook Form con validaciones Zod para una mejor UX.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, isLoading } = useAuth();

  // 🎯 Hook de formulario con validaciones
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useFormValidation<LoginFormData>({
    schema: loginSchema,
  });

  /**
   * 🔑 Maneja el proceso de login
   */
  const handleLogin = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password
      });
      
      // Redirigir al dashboard después del login exitoso
      navigate('/dashboard');
    } catch (error) {
      // El error ya se maneja en el AuthContext con toast
      console.error('Error en login:', error);
    }
  };

  /**
   * 🔍 Toggle para mostrar/ocultar contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * 🎨 Maneja el éxito del login con Google
   */
  const handleGoogleSuccess = () => {
    toast.success('¡Login con Google exitoso!');
    navigate('/dashboard');
  };

  /**
   * 🚨 Maneja errores del login con Google
   */
  const handleGoogleError = (error: string) => {
    toast.error(`Error con Google: ${error}`);
  };

  /**
   * 🧹 Función temporal para limpiar caché y desbloquear campos
   */
  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Caché limpiado. Recarga la página.');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 py-6 sm:p-6 md:p-8 lg:p-8" style={{fontFamily: 'Inter, sans-serif'}}>
      <div className="w-full max-w-md mx-auto">
        {/* Header moderno */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <Link to="/" className="inline-flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center gradient-primary">
              <span className="text-white text-xs sm:text-sm font-bold">M</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-800">
              MediCitas
            </h1>
          </Link>
          <h2 className="text-lg sm:text-xl md:text-2xl font-light text-gray-800 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Accede a tu cuenta para gestionar tus citas médicas
          </p>
        </div>

        {/* Formulario moderno */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4 sm:space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
                className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                  disabled={isLoading}
                  className="pr-10 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !isValid}
              className="w-full focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-primary border-primary hover:bg-primary-hover"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o continúa con</span>
              </div>
            </div>

            {/* Social Login */}
            <GoogleAuthButton
              mode="login"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </form>

          {/* Enlaces de navegación */}
          <div className="text-center space-y-2 sm:space-y-3 mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600 px-2">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-medium transition-colors text-primary hover:text-primary-hover">
                Regístrate aquí
              </Link>
            </p>
            <p className="text-xs sm:text-sm text-gray-600 px-2">
              ¿Olvidaste tu contraseña?{' '}
              <Link to="/forgot-password" className="font-medium transition-colors text-primary hover:text-primary-hover">
                Recupérala aquí
              </Link>
            </p>
            <p className="text-xs sm:text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                ← Volver al inicio
              </Link>
            </p>
            
            {/* Botón de emergencia para limpiar caché */}
            {isLoading && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">¿Los campos están bloqueados?</p>
                <button
                  onClick={clearCache}
                  className="text-xs text-red-600 hover:text-red-700 underline transition-colors"
                >
                  🧹 Limpiar caché y recargar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información de demo */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4 lg:p-6">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs sm:text-sm font-medium">🚀</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1 sm:mb-2">Credenciales de Demo</h3>
              <div className="text-xs text-blue-700 space-y-0.5 sm:space-y-1">
                <p className="break-all"><span className="font-medium">Email:</span> demo@medicitas.com</p>
                <p><span className="font-medium">Contraseña:</span> demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;