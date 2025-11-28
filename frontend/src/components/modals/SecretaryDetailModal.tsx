import React from 'react';
import { Modal } from '../ui';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { 
  User, 
  Mail, 
  Phone, 
  Clock,
  Calendar,
  Briefcase,
  Shield,
  X,
  Edit
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SecretaryListItem } from '../../types/secretary';

interface SecretaryDetailModalProps {
  secretary: SecretaryListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (secretary: SecretaryListItem) => void;
}

const SecretaryDetailModal: React.FC<SecretaryDetailModalProps> = ({
  secretary,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!secretary) return null;

  // 🎨 Función para obtener badge de estado
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        Activa
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        Inactiva
      </Badge>
    );
  };

  // 🎨 Función para obtener badge de departamento
  const getDepartmentBadge = (department: string) => {
    const departmentColors: Record<string, string> = {
      'Recepción': 'bg-blue-100 text-blue-800',
      'Administración': 'bg-purple-100 text-purple-800',
      'Archivo': 'bg-gray-100 text-gray-800',
      'Enfermería': 'bg-pink-100 text-pink-800'
    };
    
    return (
      <Badge className={departmentColors[department] || 'bg-gray-100 text-gray-800'}>
        {department}
      </Badge>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Detalles de Secretaria"
      size="3xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Detalles de Secretaria
        </h2>
        {onEdit && (
          <Button
            onClick={() => onEdit(secretary)}
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="space-y-6">
          {/* 👤 Información Personal */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {secretary.user.first_name} {secretary.user.last_name}
                    </h3>
                    {getStatusBadge(secretary.user.is_active)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{secretary.user.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{secretary.user.phone || 'No especificado'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>ID: {secretary.employee_id || 'No asignado'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💼 Información Laboral */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  {getDepartmentBadge(secretary.department)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario de Trabajo
                  </label>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {secretary.shift_start && secretary.shift_end 
                        ? `${secretary.shift_start} - ${secretary.shift_end}`
                        : 'No especificado'
                      }
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Contratación
                  </label>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {secretary.hire_date 
                        ? format(parseISO(secretary.hire_date), 'dd/MM/yyyy', { locale: es })
                        : 'No especificada'
                      }
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario del Sistema
                  </label>
                  <span className="text-sm text-gray-600">@{secretary.user.username}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🔐 Permisos */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Permisos del Sistema</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${secretary.can_manage_appointments ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Gestión de Citas</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${secretary.can_manage_patients ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Gestión de Pacientes</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${secretary.can_view_reports ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Ver Reportes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📊 Estadísticas */}
          {(secretary.total_appointments_managed || secretary.total_patients_registered) && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {secretary.total_appointments_managed || 0}
                    </div>
                    <div className="text-sm text-gray-600">Citas Gestionadas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {secretary.total_patients_registered || 0}
                    </div>
                    <div className="text-sm text-gray-600">Pacientes Registrados</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
    </Modal>
  );
};

export default SecretaryDetailModal;