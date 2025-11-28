import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Plus,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';

// Configuración de estados reales del backend
const statusConfig = {
  scheduled: { label: 'Programada', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
  confirmed: { label: 'Confirmada', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  completed: { label: 'Completada', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
  cancelled: { label: 'Cancelada', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  no_show: { label: 'No asistió', color: 'bg-gray-500', textColor: 'text-gray-700', bgColor: 'bg-gray-50' }
};

const SecretaryCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar citas reales del backend para el mes actual
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
      try {
        const response = await appointmentService.getAppointments({
          date_from: firstDay,
          date_to: lastDay,
          ...(selectedStatus !== 'all' ? { status: selectedStatus as any } : {}),
          page_size: 100,
          ordering: 'date,time'
        } as any);
        setAppointments(response?.results || []);
      } catch (err: any) {
        setError(err?.userMessage || err?.message || 'Error al cargar citas');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [currentDate, selectedStatus]);

  // Generar días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: prevDate.toISOString().split('T')[0]
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day).toISOString().split('T')[0];
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate
      });
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: nextDate.toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: string) => {
    return filteredAppointments.filter(apt => apt.date === date);
  };

  const getFilteredAppointments = () => {
    if (selectedStatus === 'all') return appointments;
    return appointments.filter(apt => apt.status === selectedStatus);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentDate);
  const filteredAppointments = getFilteredAppointments();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendario de Citas</h1>
            <p className="text-gray-600 mt-2">Gestiona y visualiza las citas médicas</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (<div className="mb-2 text-sm text-red-600">{error}</div>)}
                {loading && (<div className="mb-2 text-sm text-gray-600">Cargando citas...</div>)}
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayAppointments = getAppointmentsForDate(day.fullDate);
                    const isSelected = selectedDate === day.fullDate;
                    const isToday = day.fullDate === new Date().toISOString().split('T')[0];
                    
                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[80px] p-1 border border-gray-200 cursor-pointer transition-colors
                          ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                          ${isToday ? 'bg-blue-100' : ''}
                        `}
                        onClick={() => setSelectedDate(day.fullDate)}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                          {day.date}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map(apt => {
                            const statusInfo = statusConfig[apt.status as keyof typeof statusConfig] || { bgColor: 'bg-gray-50', textColor: 'text-gray-700' };
                            const patientName = apt.patient_name || (apt.patient_info && apt.patient_info.full_name) || 'Paciente';
                            return (
                              <div
                                key={apt.id}
                                className={`text-xs p-1 rounded ${statusInfo.bgColor} ${statusInfo.textColor} truncate`}
                                title={`${appointmentService.formatTime(apt.time)} - ${patientName}`}
                              >
                                {appointmentService.formatTime(apt.time)} {patientName}
                              </div>
                            );
                          })}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayAppointments.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de Citas
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">Todos los estados</option>
                      <option value="scheduled">Programadas</option>
                      <option value="confirmed">Confirmadas</option>
                      <option value="completed">Completadas</option>
                      <option value="cancelled">Canceladas</option>
                      <option value="no_show">No asistió</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Appointments */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Citas del {new Date(selectedDate).toLocaleDateString('es-ES')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getAppointmentsForDate(selectedDate).length > 0 ? (
                      getAppointmentsForDate(selectedDate).map(apt => {
                        const statusInfo = (statusConfig[apt.status as keyof typeof statusConfig] as any) || { label: 'Estado', bgColor: 'bg-gray-50', textColor: 'text-gray-700' };
                        const patientName = apt.patient_name || (apt.patient_info && apt.patient_info.full_name) || (apt.patient && `${apt.patient.firstName || ''} ${apt.patient.lastName || ''}`.trim()) || 'Paciente';
                        const doctorName = apt.doctor_name || (apt.doctor_info && apt.doctor_info.full_name) || (apt.doctor && `${apt.doctor.firstName || ''} ${apt.doctor.lastName || ''}`.trim()) || 'Doctor';
                        const spec = apt.specialty || (apt.doctor_info && apt.doctor_info.specialty) || '';
                        const reason = apt.reason || apt.description || '';
                        
                        return (
                          <div key={apt.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-sm">
                                  {appointmentService.formatTime(apt.time)}
                                </span>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            
                            <div className="text-sm space-y-1">
                              <p className="font-medium text-gray-900">
                                {patientName}
                              </p>
                              <p className="text-gray-600">
                                {doctorName}{spec ? ` • ${spec}` : ''}
                              </p>
                              {reason && (
                                <p className="text-gray-500 text-xs">
                                  {reason}
                                </p>
                              )}
                              {apt.duration && (
                                <p className="text-gray-500 text-xs">
                                  {apt.duration} minutos
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-1 mt-3">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                Ver
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No hay citas programadas
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Resumen de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const count = filteredAppointments.filter(apt => 
                      apt.status === status && apt.date === new Date().toISOString().split('T')[0]
                    ).length;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                          <span className="text-sm text-gray-600">{config.label}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SecretaryCalendar;