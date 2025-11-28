import React from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/lib/hooks/useNavigation';

/**
 * 🧭 SIDEBAR COMPONENT
 * 
 * Sidebar responsive con navegación dinámica por roles.
 * Implementa patrones de diseño turquesa y Google Material Icons.
 */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { navigationItems, isItemActive } = useNavigation();

  // 🎨 Función para obtener clases de estilo según estado
  const getItemClasses = (isActive: boolean) => {
    const baseClasses = 'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200';
    
    if (isActive) {
      return `${baseClasses} text-white shadow-md`;
    }
    
    return `${baseClasses} text-gray-700 hover:bg-gray-50 hover:text-primary`;
  };

  // 🎨 Función para obtener estilos inline según estado
  const getItemStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        background: 'var(--primary)',
        backgroundColor: 'var(--primary)'
      };
    }
    return {};
  };

  // 🎨 Función para obtener clases de icono según estado
  const getIconClasses = (isActive: boolean) => {
    const baseClasses = 'material-icons text-xl mr-3 transition-colors duration-200';
    
    if (isActive) {
      return `${baseClasses} text-white`;
    }
    
    return `${baseClasses} text-gray-500 group-hover:text-primary`;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md gradient-primary"
              >
                <span>M</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                MediCitas
              </span>
            </div>
          </div>
          

          
          <div className="flex-1 flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const active = isItemActive(item);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={getItemClasses(active)}
                    style={getItemStyle(active)}
                    title={item.description}
                  >
                    <span className={getIconClasses(active)}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            
            {/* Logout Button */}
            <div className="px-2 mt-4">
              <button
                onClick={logout}
                className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <span className="material-icons text-xl mr-3 text-gray-500 group-hover:text-red-600 transition-colors duration-200">
                  logout
                </span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md gradient-primary"
              >
                <span>M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                MediCitas
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Cerrar menú"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const active = isItemActive(item);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={active ? {
                    background: 'var(--primary)',
                    backgroundColor: 'var(--primary)'
                  } : {}}
                >
                  <span 
                    className={`material-icons text-xl mr-3 ${
                      active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${
                      active ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;