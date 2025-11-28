import React from 'react';
import { Users, Shield, Edit, Trash2, Plus } from 'lucide-react';
// import { SystemUser } from '../../../types'; // Temporalmente comentado

interface UserManagementProps {
  users?: any[]; // Temporalmente cambiado de SystemUser[] a any[]
  isLoading?: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({ 
  users = [], 
  isLoading = false 
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-light text-purple border-purple-200';
      case 'admin':
        return 'bg-primary-light text-primary border-primary-200';
      case 'doctor':
        return 'bg-success-light text-success border-success-200';
      case 'secretary':
        return 'bg-warning-light text-warning border-warning-200';
      case 'client':
        return 'bg-secondary-100 text-text-muted border-border';
      default:
        return 'bg-secondary-100 text-text-muted border-border';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      case 'doctor':
        return 'Doctor';
      case 'secretary':
        return 'Secretaria';
      case 'client':
        return 'Cliente';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-success-light text-success border-success-200'
      : 'bg-danger-light text-danger border-danger-200';
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Gestión de Usuarios</h3>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-secondary-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Gestión de Usuarios</h3>
        </div>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-text-primary">Usuario</th>
                <th className="text-left py-3 px-4 font-medium text-text-primary">Email</th>
                <th className="text-left py-3 px-4 font-medium text-text-primary">Rol</th>
                <th className="text-left py-3 px-4 font-medium text-text-primary">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-text-primary">Último Acceso</th>
                <th className="text-right py-3 px-4 font-medium text-text-primary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-secondary-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-sm">
                          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.is_active)}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-sm">
                    {user.last_login || 'Nunca'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors">
                        <Shield className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-secondary hover:bg-secondary-100 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};