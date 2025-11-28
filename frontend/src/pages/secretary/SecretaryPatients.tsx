import React, { useEffect, useMemo, useState } from 'react';
import type { PatientListItem, PatientFilters } from '../../services/patientService';
import patientService from '../../services/patientService';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  FileText,
  UserPlus,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Datos reales: los mocks han sido eliminados. Los pacientes se cargarán desde el backend mediante patientService.

const statusConfig = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' },
  disabled: { label: 'Deshabilitado', color: 'bg-red-100 text-red-800' }
};

const SecretaryPatients: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Añadir código de error para mostrar acciones específicas (p. ej., 401)
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(1);
  const [count, setCount] = useState<number>(0);
  // Navegación para redirigir al login si es necesario
  const navigate = useNavigate();
  // Estado de paginación adicional
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const fetchPatients = async (filters?: PatientFilters, options?: { append?: boolean; pageOverride?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const pageParam = options?.pageOverride ?? page;
      const res = await patientService.getPatients({ ...filters, page: pageParam, page_size: pageSize });
      if (options?.append) {
        setPatients(prev => {
          const merged = [...prev, ...(res.results || [])];
          const dedupMap = new Map<number, PatientListItem>();
          merged.forEach(p => dedupMap.set(p.id, p));
          return Array.from(dedupMap.values());
        });
      } else {
        setPatients(res.results || []);
      }
      setCount(res.count || (res.results ? res.results.length : 0));
      const effectivePageSize = res.page_size || pageSize || (res.results ? res.results.length : 20);
      setPageSize(effectivePageSize);
      const tp = res.total_pages ?? (res.count ? Math.ceil(res.count / effectivePageSize) : 1);
      setTotalPages(tp);
    } catch (err: any) {
      console.error('Error al cargar pacientes:', err);
      // Guardar el código de error si existe
      const status = err?.response?.status ?? null;
      if (status) setErrorCode(status);
      // Mensaje más claro según el tipo de error
      if (status === 401) {
        setError('No autorizado. Inicia sesión como secretaria para continuar.');
      } else if (status === 403) {
        setError('Permisos insuficientes. Tu usuario no tiene rol de secretaria.');
      } else if (err?.message) {
        setError(`No se pudo cargar la lista de pacientes: ${err.message}`);
      } else {
        setError('No se pudo cargar la lista de pacientes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchPatients({ search: searchTerm }, { append: false, pageOverride: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const goToPage = (newPage: number) => {
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setPage(newPage);
    fetchPatients({ search: searchTerm }, { append: false, pageOverride: newPage });
  };

  const filteredPatients = useMemo(() => {
    let list = patients;
    if (selectedStatus !== 'all') {
      list = list.filter(p => p.status === selectedStatus);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.full_name?.toLowerCase().includes(q)) ||
        (p.email?.toLowerCase().includes(q)) ||
        ((p.phone_number || '').includes(searchTerm))
      );
    }
    return list;
  }, [patients, selectedStatus, searchTerm]);

  const newCount = useMemo(() => {
    return patients.filter(p => {
      if (!p.created_at) return false;
      const created = new Date(p.created_at);
      const now = new Date();
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;
  }, [patients]);

  const handleCallPatient = (phone?: string) => {
    if (!phone) return;
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailPatient = (email?: string) => {
    if (!email) return;
    window.open(`mailto:${email}`);
  };

  const handleScheduleAppointment = (patientId: number) => {
    console.log('Programar cita para paciente:', patientId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
            <p className="text-gray-600 mt-2">Administra la información de los pacientes</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registrados (30 días)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {newCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.status === 'inactive').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    placeholder="Buscar por nombre, email o teléfono..."
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
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="disabled">Deshabilitados</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Pacientes ({filteredPatients.length} de {count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-700">Cargando pacientes...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-red-600 mb-2">{error}</div>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" onClick={() => fetchPatients()}>Reintentar</Button>
                    {errorCode === 401 && (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/login')}>
                        Ir al login
                      </Button>
                    )}
                  </div>
                </div>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const statusInfo = statusConfig[patient.status as keyof typeof statusConfig];
                  
                  return (
                    <div key={patient.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {(patient.full_name || 'P').split(' ').map(s => s[0]).slice(0,2).join('')}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900 text-lg">
                                  {patient.full_name || 'Nombre no disponible'}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 text-xs rounded-full ${statusInfo?.color}`}>
                                    {statusInfo?.label}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${patientService.getGenderBadge(patient.gender).color}`}>
                                    {patientService.getGenderBadge(patient.gender).label}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {patient.age} años
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{patient.phone_number || 'Sin teléfono'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{patient.email || 'Sin email'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Registrado: {new Date(patient.created_at).toLocaleDateString('es-ES')}</span>
                            </div>
                          </div>
                          
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleScheduleAppointment(patient.id)}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Cita
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50"
                            onClick={() => handleCallPatient(patient.phone_number)}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Llamar
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            onClick={() => handleEmailPatient(patient.email)}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
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
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-600 mb-2">
                    No se encontraron pacientes
                  </div>
                  <div className="text-sm text-gray-500">
                    Intenta ajustar los filtros de búsqueda
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Página {page} de {totalPages} | Mostrando {patients.length} de {count}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={loading || page <= 1} onClick={() => goToPage(page - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" disabled={loading || page >= totalPages} onClick={() => goToPage(page + 1)}>
                  Siguiente
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={loading || page >= totalPages}
                  onClick={() => {
                    const nextPage = page + 1;
                    fetchPatients({ search: searchTerm }, { append: true, pageOverride: nextPage });
                    setPage(nextPage);
                  }}
                >
                  Cargar más
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SecretaryPatients;