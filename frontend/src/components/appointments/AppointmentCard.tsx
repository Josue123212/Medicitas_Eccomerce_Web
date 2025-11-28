import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import type { Appointment, RescheduleAppointmentData } from '../../types/appointment';

// 🎯 OBJETIVO: Componente reutilizable para mostrar información de una cita
// 💡 CONCEPTO: Card visual con toda la información relevante y acciones disponibles

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
  onReschedule?: (id: number, data: RescheduleAppointmentData) => void;
  onComplete?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
  onComplete,
  showActions = true,
  compact = false,
  className = ''
}) => {
  // 🎨 Configuración de colores por estado
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      case 'no_show':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 📅 Formateo de fecha y hora
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔧 Implementación del componente
  return (
    <Card className={`transition-shadow hover:shadow-md ${className}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
              Cita #{appointment.id}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status_display}
              </Badge>
              {appointment.is_today && (
                <Badge variant="warning">Hoy</Badge>
              )}
              {appointment.is_past && (
                <Badge variant="default">Pasada</Badge>
              )}
            </div>
          </div>
          
          {/* Menú de acciones */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : 'pt-2'}>
        <div className="space-y-4">
          {/* 👨‍⚕️ Información del Doctor */}
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 mt-0.5" style={{ color: 'var(--text-muted)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Dr. Pedro García
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Neurologo
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Especialista
              </p>
            </div>
          </div>

          {/* 👤 Información del Paciente */}
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 mt-0.5" style={{ color: 'var(--text-muted)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {appointment.patient?.name || 'Paciente no disponible'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {appointment.patient?.email}
              </p>
              {appointment.patient?.phone_number && (
                <div className="flex items-center space-x-1 mt-1">
                  <PhoneIcon className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {appointment.patient.phone_number}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 📅 Fecha y Hora */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {formatDate(appointment.appointment_date)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {formatTime(appointment.appointment_time)}
              </span>
            </div>
          </div>

          {/* 📝 Motivo de la cita */}
          {appointment.reason && (
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Motivo de la consulta:
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {appointment.reason}
              </p>
            </div>
          )}

          {/* 📋 Notas adicionales */}
          {appointment.notes && (
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Notas:
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {appointment.notes}
              </p>
            </div>
          )}

          {/* 🔧 Botones de acción */}
          {showActions && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {appointment.status === 'scheduled' && onConfirm && (
                <Button
                  size="sm"
                  onClick={() => onConfirm(appointment.id)}
                  className="flex items-center space-x-1"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Confirmar</span>
                </Button>
              )}

              {appointment.can_be_cancelled && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(appointment.id)}
                  className="flex items-center space-x-1"
                >
                  <XCircleIcon className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
              )}

              {appointment.can_be_rescheduled && onReschedule && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Abrir modal de reprogramación
                    console.log('Reprogramar cita:', appointment.id);
                  }}
                  className="flex items-center space-x-1"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Reprogramar</span>
                </Button>
              )}

              {appointment.status === 'confirmed' && onComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onComplete(appointment.id)}
                  className="flex items-center space-x-1"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Completar</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;

// 📋 EXPLICACIÓN:
// 1. **Componente Reutilizable**: Puede usarse en diferentes contextos
// 2. **Props Flexibles**: Permite personalizar comportamiento y apariencia
// 3. **Estados Visuales**: Colores y badges según el estado de la cita
// 4. **Información Completa**: Muestra doctor, paciente, fecha, hora y motivo
// 5. **Acciones Contextuales**: Botones según el estado y permisos
// 6. **Responsive**: Se adapta a diferentes tamaños de pantalla
// 7. **Accesible**: Usa iconos y colores apropiados para UX

// 🚀 PRÓXIMOS PASOS:
// - Implementar modal de reprogramación
// - Agregar confirmaciones para acciones destructivas
// - Añadir animaciones de transición
// - Implementar drag & drop para reprogramar