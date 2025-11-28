import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { appointmentService } from '../../services/appointmentService';
import type { CreateAppointmentData, UpdateAppointmentData } from '../../types/appointment';

// 🎯 OBJETIVO: Página de demostración de componentes de citas
// 💡 CONCEPTO: Mostrar AppointmentCard y AppointmentForm en acción

const AppointmentComponents: React.FC = () => {
  // 🔧 Estados locales
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<number | null>(null);

  // 📊 Query client para invalidar cache
  const queryClient = useQueryClient();

  // 📋 Query para obtener citas
  const { 
    data: appointmentsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['appointments', { limit: 5 }],
    queryFn: () => appointmentService.getAppointments({ 
      // Obtener solo las primeras 5 citas para la demo
    }),
    staleTime: 5 * 60 * 1000
  });

  // 🔄 Mutación para crear cita
  const createMutation = useMutation({
    mutationFn: (data: CreateAppointmentData) => appointmentService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
      alert('Cita creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita');
    }
  });

  // ✏️ Mutación para actualizar cita
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentData }) => 
      appointmentService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setEditingAppointment(null);
      alert('Cita actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating appointment:', error);
      alert('Error al actualizar la cita');
    }
  });

  // ✅ Mutación para confirmar cita
  const confirmMutation = useMutation({
    mutationFn: (id: number) => appointmentService.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert('Cita confirmada exitosamente');
    },
    onError: (error) => {
      console.error('Error confirming appointment:', error);
      alert('Error al confirmar la cita');
    }
  });

  // ❌ Mutación para cancelar cita
  const cancelMutation = useMutation({
    mutationFn: (id: number) => appointmentService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert('Cita cancelada exitosamente');
    },
    onError: (error) => {
      console.error('Error canceling appointment:', error);
      alert('Error al cancelar la cita');
    }
  });

  // ✅ Mutación para completar cita
  const completeMutation = useMutation({
    mutationFn: (id: number) => appointmentService.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert('Cita completada exitosamente');
    },
    onError: (error) => {
      console.error('Error completing appointment:', error);
      alert('Error al completar la cita');
    }
  });

  // 📝 Manejar envío de formulario
  const handleFormSubmit = (data: CreateAppointmentData | UpdateAppointmentData) => {
    if (editingAppointment) {
      updateMutation.mutate({ 
        id: editingAppointment, 
        data: data as UpdateAppointmentData 
      });
    } else {
      createMutation.mutate(data as CreateAppointmentData);
    }
  };

  // 🎨 Render del componente
  return (
    <div className="space-y-6">
      {/* 📋 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Componentes de Citas
          </h1>
          <p className="text-gray-600">
            Demostración de AppointmentCard y AppointmentForm
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* 📝 Formulario de cita */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AppointmentForm
              mode="create"
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              loading={createMutation.isPending}
              error={createMutation.error?.message}
            />
          </div>
        </div>
      )}

      {/* ✏️ Formulario de edición */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AppointmentForm
              mode="edit"
              appointment={appointmentsData?.results.find(a => a.id === editingAppointment)}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditingAppointment(null)}
              loading={updateMutation.isPending}
              error={updateMutation.error?.message}
            />
          </div>
        </div>
      )}

      {/* 📊 Lista de citas */}
      <Card>
        <CardHeader>
          <CardTitle>Citas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2">Cargando citas...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">
                Error al cargar las citas: {error.message}
              </p>
            </div>
          ) : appointmentsData?.results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay citas disponibles</p>
              <Button
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                Crear primera cita
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointmentsData?.results.slice(0, 5).map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onConfirm={(id) => confirmMutation.mutate(id)}
                  onCancel={(id) => {
                    if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
                      cancelMutation.mutate(id);
                    }
                  }}
                  onComplete={(id) => completeMutation.mutate(id)}
                  onReschedule={(id) => {
                    setEditingAppointment(id);
                  }}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📋 Información de uso */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Componentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">AppointmentCard</h3>
            <p className="text-sm text-gray-600">
              Componente reutilizable para mostrar información de una cita con acciones contextuales.
              Incluye información del doctor, paciente, fecha, hora y estado de la cita.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">AppointmentForm</h3>
            <p className="text-sm text-gray-600">
              Formulario completo para crear y editar citas con validación, selección de doctor,
              horarios disponibles y manejo de errores.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Características:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Validación con Zod y React Hook Form</li>
              <li>• Carga dinámica de horarios disponibles</li>
              <li>• Estados de carga y manejo de errores</li>
              <li>• Acciones contextuales según el estado</li>
              <li>• Diseño responsive y accesible</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentComponents;

// 📋 EXPLICACIÓN:
// 1. **Demostración Completa**: Muestra ambos componentes en acción
// 2. **Integración Real**: Usa servicios reales y React Query
// 3. **Mutaciones**: Implementa todas las acciones de citas
// 4. **UX Completa**: Modales, confirmaciones y feedback
// 5. **Manejo de Estados**: Loading, error y success states
// 6. **Documentación**: Información sobre los componentes

// 🚀 PRÓXIMOS PASOS:
// - Agregar esta ruta al router principal
// - Implementar notificaciones toast
// - Añadir animaciones de transición
// - Crear tests unitarios para los componentes