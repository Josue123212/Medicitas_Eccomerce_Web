import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFormValidation } from '../../lib/hooks/useFormValidation';
import { loginSchema, type LoginFormData } from '../../lib/validations';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';

/**
 * 🔐 Login (Farmacia)
 * Vista temática para la farmacia que reutiliza la lógica de autenticación JWT (AuthContext).
 */
const PharmacyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors, isValid } } = useFormValidation<LoginFormData>({
    schema: loginSchema,
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
      // Redirección pensada para continuidad en farmacia
      navigate('/pharmacy/catalog');
    } catch (error) {
      console.error('Error en login farmacia:', error);
      // El AuthContext ya maneja toasts
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleGoogleSuccess = () => {
    toast.success('¡Login con Google exitoso!');
    navigate('/pharmacy/catalog');
  };

  const handleGoogleError = (error: string) => {
    toast.error(`Error con Google: ${error}`);
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      {/* Header farmacia */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-on-primary)' }}>FM</span>
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>MediCitas</div>
              <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Farmacia</h1>
            </div>
          </div>
          <Link to="/pharmacy" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            ← Volver a farmacia
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8" style={{ border: '1px solid var(--border)' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-primary">
                <span className="text-sm font-bold" style={{ color: 'var(--text-on-primary)' }}>FM</span>
              </div>
              <span className="text-xl font-light" style={{ color: 'var(--text-primary)' }}>Iniciar Sesión — Farmacia</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Accede para comprar y gestionar tus pedidos</p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-icons text-gray-400">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

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

            {/* Social Login */}
            <GoogleAuthButton mode="login" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                ¿No tienes cuenta?{' '}
                <Link to="/pharmacy/register" className="font-medium" style={{ color: 'var(--primary)' }}>
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PharmacyLoginPage;