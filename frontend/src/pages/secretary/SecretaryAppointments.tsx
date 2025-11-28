import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit
} from 'lucide-react';



const statusConfig = {
  scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending_confirmation: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  in_progress: { label: 'En Curso', color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
  no_show: { label: 'No Asistió', color: 'bg-orange-100 text-orange-800', icon: XCircle }
};

const SecretaryAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  // Cargar citas reales desde la API según el estado seleccionado
  useEffect(() => {
    let isMounted = true;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const filters = selectedStatus === 'all' ? {} : { status: selectedStatus as any };
        const response = await appointmentService.getAppointments(filters);
        const results = response?.results ?? [];

        // Normalizar estructura a la utilizada por la vista (compatibilidad con mocks anteriores)
        const normalized = results.map((a: any) => {
          const patientFullName = a.patient?.name 
            || a.patient?.full_name 
            || a.patient?.user?.full_name 
            || a.patient_info?.full_name 
            || a.patient_info?.user?.full_name 
            || a.patient_name
            || '';
      
          const patientFirstName = a.patient?.user?.firstName
            || a.patient?.user?.first_name
            || a.patient?.firstName
            || a.patient?.first_name
            || a.patient_info?.user?.firstName
            || a.patient_info?.user?.first_name
            || a.patient_info?.firstName
            || a.patient_info?.first_name
            || (patientFullName ? patientFullName.split(' ')[0] : '');
      
          const patientLastName = a.patient?.user?.lastName
            || a.patient?.user?.last_name
            || a.patient?.lastName
            || a.patient?.last_name
            || a.patient_info?.user?.lastName
            || a.patient_info?.user?.last_name
            || a.patient_info?.lastName
            || a.patient_info?.last_name
            || (patientFullName ? patientFullName.split(' ').slice(1).join(' ') : '');
      
          const patientEmail = a.patient?.user?.email 
            || a.patient?.email 
            || a.patient_info?.user?.email 
            || a.patient_info?.email 
            || '';
      
          const patientPhone = a.patient?.user?.phone 
            || a.patient?.user?.phone_number 
            || a.patient?.phone 
            || a.patient?.phone_number 
            || a.patient_info?.user?.phone 
            || a.patient_info?.user?.phone_number 
            || a.patient_info?.phone 
            || '';
      
          const doctorFullName = a.doctor_info?.full_name 
            || a.doctor?.full_name 
            || a.doctor?.user?.full_name 
            || a.doctor_info?.user?.full_name 
            || '';
      
          const doctorFirstName = a.doctor?.user?.firstName
            || a.doctor?.user?.first_name
            || a.doctor?.firstName
            || a.doctor?.first_name
            || a.doctor_info?.user?.firstName
            || a.doctor_info?.user?.first_name
            || a.doctor_info?.firstName
            || a.doctor_info?.first_name
            || (doctorFullName ? doctorFullName.split(' ')[0] : '');
      
          const doctorLastName = a.doctor?.user?.lastName
            || a.doctor?.user?.last_name
            || a.doctor?.lastName
            || a.doctor?.last_name
            || a.doctor_info?.user?.lastName
            || a.doctor_info?.user?.last_name
            || a.doctor_info?.lastName
            || a.doctor_info?.last_name
            || (doctorFullName ? doctorFullName.split(' ').slice(1).join(' ') : '');
      
          const doctorSpecialization = a.doctor_info?.specialization 
            || a.doctor?.specialization 
            || a.doctor_info?.specialty 
            || a.doctor?.specialty 
            || '';
      
          const normalizedPatient = {
            ...(a.patient || {}),
            user: {
              ...(a.patient?.user || {}),
              firstName: patientFirstName || '',
              lastName: patientLastName || '',
              email: patientEmail || '',
              phone: patientPhone || ''
            }
          };
      
          const normalizedDoctor = {
            ...(a.doctor || {}),
            user: {
              ...(a.doctor?.user || {}),
              firstName: doctorFirstName || '',
              lastName: doctorLastName || ''
            },
            specialization: doctorSpecialization || ''
          };
      
          return {
            ...a,
            appointment_date: a.appointment_date || a.date || a.datetime?.split('T')[0] || '',
            appointment_time: a.appointment_time || a.time || a.datetime?.split('T')[1]?.slice(0,5) || '',
            patient: normalizedPatient,
            doctor: normalizedDoctor
          };
        });

        if (isMounted) {
          setAppointments(normalized);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error al cargar citas:', err);
        if (isMounted) {
          setError(err?.userMessage || 'No se pudieron cargar las citas');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAppointments();
    return () => { isMounted = false; };
  }, [selectedStatus, reloadToken]);

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      (appointment.patient?.user?.firstName || '').toLowerCase().includes(term) ||
      (appointment.patient?.user?.lastName || '').toLowerCase().includes(term) ||
      (appointment.doctor?.user?.firstName || '').toLowerCase().includes(term) ||
      (appointment.doctor?.user?.lastName || '').toLowerCase().includes(term);
    
    return matchesStatus && matchesSearch;
  });

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      const res = await appointmentService.confirmAppointment(appointmentId);
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'confirmed' } : a));
    } catch (error: any) {
      console.error('Error al confirmar cita:', error);
      setError(error?.userMessage || 'No se pudo confirmar la cita');
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const res = await appointmentService.cancelAppointment(appointmentId);
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a));
    } catch (error: any) {
      console.error('Error al cancelar cita:', error);
      setError(error?.userMessage || 'No se pudo cancelar la cita');
    }
  };

  const handleCallPatient = (phone: string) => {
    console.log('Llamar a:', phone);
    // Aquí iría la lógica real de llamada
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
            <p className="text-gray-600 mt-2">Administra y confirma las citas médicas</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente o doctor..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending_confirmation">Pendientes</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="scheduled">Programadas</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Citas ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  <div className="text-lg font-medium text-gray-600">Cargando citas...</div>
                </div>
              )}
              {error && (
                <div className="text-center py-6 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-center gap-2 text-red-700 mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setReloadToken(t => t + 1)}>
                    Reintentar
                  </Button>
                </div>
              )}
              {!loading && !error && filteredAppointments.length > 0 && (
                 filteredAppointments.map((appointment) => {
                   const StatusIcon = statusConfig[appointment.status as keyof typeof statusConfig]?.icon || AlertCircle;
                   const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig];
                   
                   const patientName = [
                     appointment.patient?.user?.firstName,
                     appointment.patient?.user?.lastName
                   ].filter(Boolean).join(' ') 
                     || appointment.patient_info?.full_name 
                     || appointment.patient?.full_name 
                     || appointment.patient?.name 
                     || appointment.patient_name
                     || '';
                   
                   const patientPhoneDisplay = appointment.patient?.user?.phone 
                     || appointment.patient?.phone_number 
                     || appointment.patient?.phone 
                     || appointment.patient_info?.user?.phone 
                     || appointment.patient_info?.phone_number 
                     || appointment.patient_info?.phone 
                     || '';
                   
                   return (
                     <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="flex items-center gap-2">
                               <User className="w-4 h-4 text-gray-500" />
                               <span className="font-medium text-gray-900">
                                 {patientName || 'Paciente sin nombre'}
                               </span>
                             </div>
                             <span className={`px-2 py-1 text-xs rounded-full ${statusInfo?.color}`}>
                               {statusInfo?.label}
                             </span>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                             <div className="flex items-center gap-2">
                               <Calendar className="w-4 h-4" />
                               <span>{appointment.appointment_date}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <Clock className="w-4 h-4" />
                               <span>{appointment.appointment_time}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <User className="w-4 h-4" />
                               <span>{appointment.doctor.user.firstName} {appointment.doctor.user.lastName}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <Phone className="w-4 h-4" />
                               <span>{patientPhoneDisplay || 'Sin teléfono'}</span>
                             </div>
                           </div>
                           
                           <div className="text-sm">
                             <p className="text-gray-700 mb-1"><strong>Motivo:</strong> {appointment.reason}</p>
                             {appointment.notes && (
                               <p className="text-gray-600"><strong>Notas:</strong> {appointment.notes}</p>
                             )}
                           </div>
                         </div>
                         
                         <div className="flex flex-col gap-2 ml-4">
                           {(appointment.status === 'scheduled' || appointment.status === 'pending_confirmation') && (
                             <>
                               <Button 
                                 size="sm" 
                                 className="bg-green-600 hover:bg-green-700 text-white"
                                 onClick={() => handleConfirmAppointment(appointment.id)}
                               >
                                 <CheckCircle className="w-4 h-4 mr-1" />
                                 Confirmar
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                 onClick={() => handleCallPatient(patientPhoneDisplay)}
                               >
                                 <Phone className="w-4 h-4 mr-1" />
                                 Llamar
                               </Button>
                             </>
                           )}
                           
                           {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                             <>
                               <Button 
                                 size="sm" 
                                 variant="outline"
                                 className="border-blue-300 text-blue-600 hover:bg-blue-50"
                               >
                                 <Eye className="w-4 h-4 mr-1" />
                                 Ver
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="outline"
                                 className="border-gray-300 text-gray-600 hover:bg-gray-50"
                               >
                                 <Edit className="w-4 h-4 mr-1" />
                                 Editar
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="border-red-300 text-red-600 hover:bg-red-50"
                                 onClick={() => handleCancelAppointment(appointment.id)}
                               >
                                 <XCircle className="w-4 h-4 mr-1" />
                                 Cancelar
                               </Button>
                             </>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })
               )}

              {!loading && !error && filteredAppointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-600 mb-2">
                    No se encontraron citas
                  </div>
                  <div className="text-sm text-gray-500">
                    Intenta ajustar los filtros de búsqueda
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SecretaryAppointments;