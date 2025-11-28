import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  Database,
  UserCog
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔐 Verificar permisos de admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Acceso Denegado</h1>
          <p className="mt-2 text-gray-600">No tienes permisos para acceder al panel de administración.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 📋 Navegación del admin
  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/admin/dashboard'
    },
    {
      name: 'Clientes',
      href: '/admin/patients',
      icon: UserCheck,
      current: location.pathname.startsWith('/admin/patients')
    },
    {
      name: 'Doctores',
      href: '/admin/doctors',
      icon: Stethoscope,
      current: location.pathname.startsWith('/admin/doctors')
    },
    {
      name: 'Secretarias',
      href: '/admin/secretaries',
      icon: UserCog,
      current: location.pathname.startsWith('/admin/secretaries')
    },
    {
      name: 'Reportes',
      href: '/admin/reports',
      icon: BarChart3,
      current: location.pathname.startsWith('/admin/reports')
    },
    {
      name: 'Notificaciones',
      href: '/admin/notifications',
      icon: Bell,
      current: location.pathname.startsWith('/admin/notifications')
    }
  ];

  // 📋 Navegación del sistema (solo superadmin)
  const systemNavigation = isSuperAdmin ? [
    {
      name: 'Configuración',
      href: '/admin/system/settings',
      icon: Settings,
      current: location.pathname.startsWith('/admin/system')
    },
    {
      name: 'Logs de Auditoría',
      href: '/admin/system/audit',
      icon: FileText,
      current: location.pathname.startsWith('/admin/system/audit')
    },
    {
      name: 'Base de Datos',
      href: '/admin/system/database',
      icon: Database,
      current: location.pathname.startsWith('/admin/system/database')
    }
  ] : [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 📱 Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* 📋 Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* 🏢 Logo y título */}
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
            <div className="flex items-center">
              <Shield className="h-8 w-8" />
              <span className="ml-2 text-lg font-semibold">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 👤 Información del usuario */}
          <div className="px-6 py-4 bg-blue-50 border-b">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.charAt(0) || 'A'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'superadmin' ? 'Super Administrador' : 'Administrador'}
                </p>
              </div>
            </div>
          </div>

          {/* 📋 Navegación principal */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            <div className="space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* 🔧 Navegación del sistema (solo superadmin) */}
            {systemNavigation.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sistema
                </p>
                <div className="mt-2 space-y-1">
                  {systemNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          item.current
                            ? 'bg-red-100 text-red-700 border-r-2 border-red-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className={`mr-3 h-5 w-5 ${
                          item.current ? 'text-red-700' : 'text-gray-400 group-hover:text-gray-500'
                        }`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* 🚪 Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Main content */}
      <div className="lg:pl-64">
        {/* 📋 Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">
                Panel de Administración
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* 🔔 Notificaciones */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* ⚙️ Configuración rápida */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5" />
              </button>

              {/* 👤 Perfil */}
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.first_name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 📄 Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;