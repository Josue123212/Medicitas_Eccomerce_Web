import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useFormValidation } from '../lib/hooks/useFormValidation';
import { registerSchema, type RegisterFormData } from '../lib/validations';
import { useAuth } from '../contexts/AuthContext';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

/**
 * 📝 Página de Registro de Usuario
 * 
 * Características:
 * - Formulario con React Hook Form + Zod
 * - Validación en tiempo real
 * - Confirmación de contraseña
 * - Términos y condiciones
 * - Integración con toast notifications
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();

  // 🎯 Hook de validación con React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useFormValidation({ 
    schema: registerSchema,
    mode: 'onSubmit'
  });

  /**
   * 🔐 Maneja el envío del formulario de registro
   */
  const handleRegister = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      });
      
      // Redirigir al dashboard después del registro exitoso
      navigate('/dashboard');
    } catch (error) {
      // El error ya se maneja en el AuthContext con toast
      console.error('Error en registro:', error);
    }
  };

  /**
   * 👁️ Toggle para mostrar/ocultar contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * 👁️ Toggle para mostrar/ocultar confirmación de contraseña
   */
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  /**
   * 🎨 Maneja el éxito del registro con Google
   */
  const handleGoogleSuccess = () => {
    toast.success('¡Registro con Google exitoso!');
    navigate('/dashboard');
  };

  /**
   * 🚨 Maneja errores del registro con Google
   */
  const handleGoogleError = (error: string) => {
    toast.error(`Error con Google: ${error}`);
  };

  /**
   * 🧹 Limpia el formulario
   */
  const handleClearForm = () => {
    reset();
    toast.success('Formulario limpiado');
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex min-h-screen">
        {/* Header */}
        <div className="w-full">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-primary">
                      <span className="text-white text-sm font-bold">M</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">MediCitas</span>
                  </Link>
                  <span className="text-sm text-gray-500 hidden sm:block">• Registro</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-md lg:max-w-lg">
              {/* Título de la página */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  Crear Cuenta
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Únete a nuestra plataforma médica y gestiona tus citas de forma inteligente
                </p>
              </div>
          
              {/* Formulario moderno */}
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                  {/* Nombre y Apellido en grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="Tu nombre"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                        disabled={isLoading}
                        className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="Tu apellido"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                        disabled={isLoading}
                        className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Contraseñas en grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...register('confirmPassword')}
                          error={errors.confirmPassword?.message}
                          disabled={isLoading}
                          className="pr-10 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                          onClick={toggleConfirmPasswordVisibility}
                          aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="flex items-start space-x-3">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      {...register('acceptTerms')}
                      disabled={isLoading}
                      className="mt-1 h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 focus:ring-primary text-primary"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
                      Acepto los{' '}
                      <Link to="/terms" className="underline transition-colors text-primary hover:text-primary-hover">
                        términos y condiciones
                      </Link>
                      {' '}y la{' '}
                      <Link to="/privacy" className="underline transition-colors text-primary hover:text-primary-hover">
                        política de privacidad
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>
                  )}

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
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear Cuenta'
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
                  <div className="grid grid-cols-2 gap-3">
                    <GoogleAuthButton
                      mode="register"
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleClearForm}
                      disabled={isLoading}
                      className="focus:ring-2 focus:ring-offset-2 focus:ring-primary border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      🧹 Limpiar
                    </Button>
                  </div>
                </form>
              </div>

              {/* Enlaces de navegación */}
              <div className="text-center space-y-3 mt-6">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link 
                    to="/login" 
                    className="font-medium transition-colors text-primary hover:text-primary-hover"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
                <p className="text-sm">
                  <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                    ← Volver al inicio
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;