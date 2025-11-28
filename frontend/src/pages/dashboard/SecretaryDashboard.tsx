import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { dashboardService } from '../../services/dashboardService';
import type { SecretaryDashboardStats } from '../../services/dashboardService';
import { 
  Calendar, 
  Users, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  CalendarPlus,
  FileText,
  Search
} from 'lucide-react';

const SecretaryDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔄 Obtener datos del dashboard desde la API
  const { 
    data: dashboardData, 
    isLoading, 
    error 
  } = useQuery<SecretaryDashboardStats>({
    queryKey: ['secretary-dashboard'],
    queryFn: () => dashboardService.getSecretaryDashboard(),
    refetchInterval: 30000, // Refrescar cada 30 segundos (más frecuente para secretaria)
    staleTime: 15000 // Considerar datos frescos por 15 segundos
  });

  // 🔄 Estados de carga
  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded mt-6"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // 🔄 Estado de error
  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error al cargar el dashboard</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // 🔄 Mapear datos del backend (ya no es necesario mapear, usamos directamente)
  const stats = dashboardData || null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Buenos días, {user?.first_name || 'Secretaria'}!
          </h1>
          <p className="text-gray-600 mt-2">Panel de gestión de citas y pacientes</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Citas Hoy
                </CardTitle>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.appointments_today?.total || 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-xs text-gray-500">
                  {stats?.appointments_today?.confirmed || 0} confirmadas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pacientes Nuevos
                </CardTitle>
                <UserPlus className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.patients?.new_today || 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">
                  Total: {stats?.patients?.total || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Doctores Disponibles
                </CardTitle>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.doctors?.available || 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <p className="text-xs text-gray-500">
                  de {stats?.doctors?.total || 0} doctores
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pendientes Confirmación
                </CardTitle>
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.appointments_this_week?.pending_confirmation || 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <p className="text-xs text-gray-500">
                  Esta semana
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => navigate('/secretary/appointments/new')}
              >
                <CalendarPlus className="w-6 h-6 text-blue-500" />
                <span className="text-sm">Nueva Cita</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-50 hover:border-green-300"
                onClick={() => navigate('/secretary/patients/new')}
              >
                <UserPlus className="w-6 h-6 text-green-500" />
                <span className="text-sm">Nuevo Paciente</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => navigate('/secretary/appointments')}
              >
                <Phone className="w-6 h-6 text-orange-500" />
                <span className="text-sm">Llamar Paciente</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => navigate('/secretary/patients')}
              >
                <Search className="w-6 h-6 text-purple-500" />
                <span className="text-sm">Buscar Paciente</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Citas Pendientes de Confirmación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.pending_appointments && stats.pending_appointments.length > 0 ? (
                  stats.pending_appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Dr. {appointment.doctor_name}</p>
                          <p className="text-xs text-gray-500 mb-3">{appointment.reason}</p>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{appointment.date}</span>
                            <Clock className="w-4 h-4 text-gray-400 ml-2" />
                            <span className="text-gray-600">{appointment.time}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                            <Phone className="w-4 h-4 mr-1" />
                            Llamar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-600 mb-2">
                      ¡Excelente trabajo!
                    </div>
                    <div className="text-sm text-gray-500">
                      No hay citas pendientes de confirmación
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Resumen del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Citas Programadas</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {stats?.appointments_today?.scheduled || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Confirmadas</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {stats?.appointments_today?.confirmed || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">Completadas</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {stats?.appointments_today?.completed || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Canceladas</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {stats?.appointments_today?.cancelled || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SecretaryDashboard;