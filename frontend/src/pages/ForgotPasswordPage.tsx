import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

// 🎯 Schema de validación con Zod
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido')
    .max(254, 'El email es demasiado largo'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// 📧 Interfaz para la respuesta de la API
interface ForgotPasswordResponse {
  message: string;
  email_sent: boolean;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // 🔧 Configuración del formulario con React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur', // Validar cuando el usuario sale del campo
  });

  // 📤 Función para enviar solicitud de recuperación
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const response = await api.post<ForgotPasswordResponse>(
        '/users/auth/password-reset/request/',
        data
      );

      // ✅ Mostrar mensaje de éxito
      toast.success('¡Solicitud enviada correctamente!');
      setEmailSent(true);
      
      console.log('Respuesta:', response.data);
    } catch (error: any) {
      // ❌ Manejo de errores
      console.error('Error al solicitar recuperación:', error);
      
      if (error.response?.data?.email) {
        toast.error(error.response.data.email[0]);
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Error al enviar la solicitud. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🎨 Vista de confirmación después de enviar el email
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              ¡Email enviado!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Si el email <strong>{getValues('email')}</strong> está registrado en nuestro sistema,
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Revisa tu bandeja de entrada y la carpeta de spam.
              El enlace expirará en 24 horas.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/login"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Link>
            
            <button
              onClick={() => setEmailSent(false)}
              className="w-full text-center text-sm text-primary hover:text-primary-hover transition-colors"
            >
              ¿Necesitas enviar otro email?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 Formulario principal
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No te preocupes, te ayudamos a recuperarla.
            Ingresa tu email y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors`}
                placeholder="tu-email@ejemplo.com"
              />
              <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Enviar enlace de recuperación
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}