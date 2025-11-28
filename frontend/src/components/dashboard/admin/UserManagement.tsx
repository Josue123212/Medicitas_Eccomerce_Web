import React, { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Edit, Trash2, UserPlus, Eye } from 'lucide-react';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'doctor' | 'secretary' | 'admin' | 'client';
  status: 'active' | 'inactive' | 'suspended';
  last_login: string;
  created_at: string;
  department?: string;
}

interface UserManagementProps {
  users?: AdminUser[];
  isLoading?: boolean;
  onEditUser?: (user: AdminUser) => void;
  onDeleteUser?: (userId: number) => void;
  onViewUser?: (user: AdminUser) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users = [], 
  isLoading = false,
  onEditUser,
  onDeleteUser,
  onViewUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-danger-light text-danger';
      case 'doctor':
        return 'bg-primary-light text-primary';
      case 'secretary':
        return 'bg-warning-light text-warning';
      case 'client':
        return 'bg-success-light text-success';
      default:
        return 'bg-secondary-200 text-text-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-light text-success';
      case 'inactive':
        return 'bg-secondary-200 text-text-secondary';
      case 'suspended':
        return 'bg-danger-light text-danger';
      default:
        return 'bg-secondary-200 text-text-secondary';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'doctor':
        return 'Doctor';
      case 'secretary':
        return 'Secretaria';
      case 'client':
        return 'Cliente';
      default:
        return role;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <div className="h-6 bg-secondary-200 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-10 w-10 bg-secondary-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Gestión de Usuarios
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="doctor">Doctor</option>
            <option value="secretary">Secretaria</option>
            <option value="client">Cliente</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-primary-light rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {((user.name && typeof user.name === 'string') ? user.name : 'Usuario').split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-text-primary">{user.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{user.email}</span>
                    {user.department && (
                      <span>• {user.department}</span>
                    )}
                    <span>• Último acceso: {user.last_login}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewUser?.(user)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEditUser?.(user)}
                  className="p-2 text-text-secondary hover:text-warning hover:bg-warning-light rounded-lg transition-colors"
                  title="Editar usuario"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteUser?.(user.id)}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                  title="Eliminar usuario"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-text-secondary">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-border rounded hover:bg-secondary-50 transition-colors">
              Anterior
            </button>
            <span className="px-3 py-1 text-sm bg-primary text-white rounded">1</span>
            <button className="px-3 py-1 text-sm border border-border rounded hover:bg-secondary-50 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;