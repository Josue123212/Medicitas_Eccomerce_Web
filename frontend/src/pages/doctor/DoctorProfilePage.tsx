import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Shield, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Award,
  MapPin
} from 'lucide-react';

import Layout from '../../components/layout/Layout';
import { doctorService } from '../../services/doctorService';
import type { DoctorProfile, DoctorProfileData } from '../../types/doctor';

/**
 * 🎯 PÁGINA MI PERFIL - DOCTOR
 * 
 * Interfaz para que el doctor gestione su perfil profesional usando datos reales del backend:
 * - Información personal del usuario (first_name, last_name, email, phone)
 * - Datos profesionales (medical_license, specialization, years_experience)
 * - Configuración (consultation_fee, bio, is_available, status)
 * - Horarios de trabajo (work_start_time, work_end_time, work_days)
 */

interface EditableField {
  field: keyof DoctorProfileData;
  value: string | number | boolean;
}

const DoctorProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingField, setEditingField] = React.useState<EditableField | null>(null);

  // 🔄 Query para obtener el perfil del doctor
  const { 
    data: profile, 
    isLoading, 
    error 
  } = useQuery<DoctorProfile>({
    queryKey: ['doctor-profile'],
    queryFn: () => doctorService.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🔄 Mutation para actualizar el perfil
  const updateProfileMutation = useMutation({
    mutationFn: (data: DoctorProfileData) => doctorService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
      setEditingField(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al actualizar el perfil');
    },
  });

  // 📝 Manejar actualización de campo individual
  const handleFieldUpdate = (field: keyof DoctorProfileData, value: string | number | boolean) => {
    if (!profile) return;

    const updateData: Partial<DoctorProfileData> = {
      [field]: value
    };

    updateProfileMutation.mutate(updateData as DoctorProfileData);
  };

  // 🎨 Componente para mostrar estado del doctor
  const StatusBadge: React.FC<{ status: string; isAvailable: boolean }> = ({ status, isAvailable }) => {
    const getStatusConfig = () => {
      if (status === 'disabled') {
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Deshabilitado' };
      }
      if (!isAvailable) {
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'No Disponible' };
      }
      return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Disponible' };
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  // 🎨 Componente para campo editable
  const EditableField: React.FC<{
    label: string;
    value: string | number;
    field: keyof DoctorProfileData;
    type?: 'text' | 'number' | 'textarea' | 'email';
    icon?: React.ComponentType<{ className?: string }>;
  }> = ({ label, value, field, type = 'text', icon: Icon }) => {
    const [localValue, setLocalValue] = React.useState(value.toString());
    const isCurrentlyEditing = editingField?.field === field;

    const handleSave = () => {
      const finalValue = type === 'number' ? Number(localValue) : localValue;
      handleFieldUpdate(field, finalValue);
    };

    const handleCancel = () => {
      setLocalValue(value.toString());
      setEditingField(null);
    };

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            {isCurrentlyEditing ? (
              type === 'textarea' ? (
                <textarea
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              ) : (
                <input
                  type={type}
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              )
            ) : (
              <p className="text-gray-900">{value}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isCurrentlyEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditingField({ field, value });
                setLocalValue(value.toString());
              }}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // 🔄 Estados de carga y error
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error al cargar el perfil
            </h3>
            <p className="text-red-600 mb-4">
              {error?.message || 'No se pudo cargar la información del perfil'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Verificar que tenemos los datos necesarios
  if (!profile.user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Datos incompletos
            </h3>
            <p className="text-yellow-600 mb-4">
              La información del usuario no está disponible
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Recargar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* 📋 Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600 mt-1">
                Gestiona tu información profesional y configuración
              </p>
            </div>
            <StatusBadge status={profile.status} isAvailable={profile.is_available} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 👤 Información Personal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información Personal
              </h2>
              
              <div className="space-y-4">
                <EditableField
                  label="Nombre"
                  value={profile.user.first_name || 'No especificado'}
                  field="first_name"
                  icon={User}
                />
                
                <EditableField
                  label="Apellido"
                  value={profile.user.last_name || 'No especificado'}
                  field="last_name"
                  icon={User}
                />
                
                <EditableField
                  label="Email"
                  value={profile.user.email || 'No especificado'}
                  field="email"
                  type="email"
                  icon={Mail}
                />
                
                <EditableField
                  label="Teléfono"
                  value={profile.user.phone || 'No especificado'}
                  field="phone"
                  icon={Phone}
                />
              </div>
            </div>

            {/* 🏥 Información Profesional */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Información Profesional
              </h2>
              
              <div className="space-y-4">
                <EditableField
                  label="Licencia Médica"
                  value={profile.medical_license || 'No especificado'}
                  field="medical_license"
                  icon={Shield}
                />
                
                <EditableField
                  label="Especialización"
                  value={profile.specialization || 'No especificado'}
                  field="specialization"
                  icon={Award}
                />
                
                <EditableField
                  label="Años de Experiencia"
                  value={profile.years_experience || 0}
                  field="years_experience"
                  type="number"
                  icon={Calendar}
                />
                
                <EditableField
                  label="Tarifa de Consulta"
                  value={profile.consultation_fee || 0}
                  field="consultation_fee"
                  type="number"
                  icon={DollarSign}
                />
                
                <EditableField
                  label="Biografía"
                  value={profile.bio || 'No especificado'}
                  field="bio"
                  type="textarea"
                  icon={FileText}
                />
              </div>
            </div>
          </div>

          {/* 📊 Panel Lateral */}
          <div className="space-y-6">
            {/* 🕒 Horarios */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Horarios de Trabajo
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Inicio:</span>
                  <span className="font-medium">{profile.work_start_time || '08:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fin:</span>
                  <span className="font-medium">{profile.work_end_time || '17:00'}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">Días laborales:</p>
                  <div className="flex flex-wrap gap-1">
                    {(profile.work_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']).map((day) => (
                      <span key={day} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 📈 Información de Cuenta */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Cuenta
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">#{profile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuario:</span>
                  <span className="font-medium">{profile.user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rol:</span>
                  <span className="font-medium capitalize">{profile.user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creado:</span>
                  <span className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actualizado:</span>
                  <span className="font-medium">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 🎛️ Configuración Rápida */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración Rápida
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Disponible</span>
                  <button
                    onClick={() => handleFieldUpdate('is_available', !profile.is_available)}
                    disabled={updateProfileMutation.isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                      profile.is_available ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.is_available ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfilePage;