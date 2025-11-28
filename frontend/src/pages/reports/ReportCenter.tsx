import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp, 
  Filter,
  Search,
  Eye,
  RefreshCw
} from 'lucide-react';

interface Report {
  id: number;
  title: string;
  type: 'appointments' | 'patients' | 'doctors' | 'financial' | 'performance';
  description: string;
  generated_date: string;
  status: 'ready' | 'generating' | 'error';
  file_url?: string;
  parameters: {
    date_range: string;
    filters?: string[];
  };
}

const ReportCenter: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [generatingReport, setGeneratingReport] = useState<number | null>(null);

  // Mock data - En producción esto vendría de la API
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: 1,
        title: 'Reporte de Citas Mensuales',
        type: 'appointments',
        description: 'Análisis completo de citas programadas, completadas y canceladas del mes',
        generated_date: '2024-01-15T10:30:00Z',
        status: 'ready',
        file_url: '/reports/appointments-january-2024.pdf',
        parameters: {
          date_range: '2024-01-01 to 2024-01-31',
          filters: ['completed', 'cancelled']
        }
      },
      {
        id: 2,
        title: 'Estadísticas de Pacientes',
        type: 'patients',
        description: 'Demografía de pacientes, nuevos registros y actividad',
        generated_date: '2024-01-14T15:45:00Z',
        status: 'ready',
        file_url: '/reports/patients-stats-january-2024.pdf',
        parameters: {
          date_range: '2024-01-01 to 2024-01-31'
        }
      },
      {
        id: 3,
        title: 'Rendimiento de Doctores',
        type: 'performance',
        description: 'Análisis de productividad y satisfacción por doctor',
        generated_date: '2024-01-13T09:20:00Z',
        status: 'generating',
        parameters: {
          date_range: '2024-01-01 to 2024-01-31',
          filters: ['consultation_time', 'patient_satisfaction']
        }
      },
      {
        id: 4,
        title: 'Reporte Financiero',
        type: 'financial',
        description: 'Ingresos, gastos y análisis financiero del período',
        generated_date: '2024-01-12T14:10:00Z',
        status: 'error',
        parameters: {
          date_range: '2024-01-01 to 2024-01-31'
        }
      }
    ];

    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointments':
        return 'bg-blue-100 text-blue-800';
      case 'patients':
        return 'bg-green-100 text-green-800';
      case 'doctors':
        return 'bg-purple-100 text-purple-800';
      case 'financial':
        return 'bg-yellow-100 text-yellow-800';
      case 'performance':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointments':
        return <Calendar className="w-4 h-4" />;
      case 'patients':
        return <Users className="w-4 h-4" />;
      case 'doctors':
        return <Activity className="w-4 h-4" />;
      case 'financial':
        return <TrendingUp className="w-4 h-4" />;
      case 'performance':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Listo';
      case 'generating':
        return 'Generando...';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'appointments':
        return 'Citas';
      case 'patients':
        return 'Pacientes';
      case 'doctors':
        return 'Doctores';
      case 'financial':
        return 'Financiero';
      case 'performance':
        return 'Rendimiento';
      default:
        return type;
    }
  };

  const handleGenerateReport = (reportId: number) => {
    setGeneratingReport(reportId);
    // Simular generación de reporte
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'ready' as const, generated_date: new Date().toISOString() }
          : report
      ));
      setGeneratingReport(null);
    }, 3000);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro de Reportes</h1>
            <p className="text-gray-600 mt-2">Genera y gestiona reportes del sistema</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <FileText className="w-4 h-4" />
            Nuevo Reporte
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Listos</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'ready').length}
                </p>
              </div>
              <Download className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generando</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'generating').length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Error</p>
                <p className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.status === 'error').length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar reportes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="appointments">Citas</option>
                <option value="patients">Pacientes</option>
                <option value="doctors">Doctores</option>
                <option value="financial">Financiero</option>
                <option value="performance">Rendimiento</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                      {getTypeText(report.type)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusText(report.status)}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                
                <div className="text-xs text-gray-500 mb-4">
                  <p>Generado: {new Date(report.generated_date).toLocaleDateString('es-ES')}</p>
                  <p>Período: {report.parameters.date_range}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {report.status === 'ready' && (
                    <>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                      <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {report.status === 'generating' && (
                    <div className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generando...
                    </div>
                  )}
                  
                  {report.status === 'error' && (
                    <button 
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={generatingReport === report.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${generatingReport === report.id ? 'animate-spin' : ''}`} />
                      Reintentar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron reportes que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportCenter;