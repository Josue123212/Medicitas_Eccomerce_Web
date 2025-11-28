import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, UserCircleIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

// Schema de validación para el formulario de perfil
const profileSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    }
  });

  // Resetear el formulario cuando cambie el usuario
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleClose = () => {
    if (isEditing && isDirty) {
      if (window.confirm('¿Estás seguro de que quieres cerrar? Los cambios no guardados se perderán.')) {
        handleCancel();
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md rounded-lg shadow-xl"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Mi Perfil
                </h2>
                <p 
                  className="text-sm capitalize"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user?.role || 'Usuario'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ 
                    color: 'var(--primary)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Editar perfil"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--error-light)';
                  e.currentTarget.style.color = 'var(--error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Nombre
              </label>
              {isEditing ? (
                <div>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--background)',
                      borderColor: errors.firstName ? 'var(--error)' : 'var(--border)',
                      color: 'var(--text-primary)',
                      focusRingColor: 'var(--primary)'
                    }}
                    placeholder="Ingresa tu nombre"
                  />
                  {errors.firstName && (
                    <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              ) : (
                <p 
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {user?.firstName || 'No especificado'}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Apellido
              </label>
              {isEditing ? (
                <div>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--background)',
                      borderColor: errors.lastName ? 'var(--error)' : 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Ingresa tu apellido"
                  />
                  {errors.lastName && (
                    <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              ) : (
                <p 
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {user?.lastName || 'No especificado'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Email
              </label>
              {isEditing ? (
                <div>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--background)',
                      borderColor: errors.email ? 'var(--error)' : 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Ingresa tu email"
                  />
                  {errors.email && (
                    <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              ) : (
                <p 
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {user?.email || 'No especificado'}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Teléfono
              </label>
              {isEditing ? (
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Ingresa tu teléfono (opcional)"
                />
              ) : (
                <p 
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {user?.phone || 'No especificado'}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Dirección
              </label>
              {isEditing ? (
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 resize-none"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Ingresa tu dirección (opcional)"
                />
              ) : (
                <p 
                  className="px-3 py-2 rounded-lg min-h-[80px]"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {user?.address || 'No especificado'}
                </p>
              )}
            </div>

            {/* Botones de acción */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--error-light)';
                      e.currentTarget.style.color = 'var(--error)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || !isDirty}
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && isDirty) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;