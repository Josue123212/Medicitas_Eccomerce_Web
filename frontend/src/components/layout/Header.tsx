import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import ProfileModal from '../modals/ProfileModal';

/**
 * 🎯 HEADER COMPONENT
 * 
 * Header responsive con logo, navegación y acciones de usuario.
 * Incluye botón hamburguesa para móvil y notificaciones.
 */

interface HeaderProps {
  onMenuClick: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = true }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, hasUnread, markAllAsRead, markAsRead } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header 
      className="shadow-sm border-b"
      style={{ 
        backgroundColor: 'var(--surface)', 
        borderColor: 'var(--border)' 
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md transition-colors duration-200"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Abrir menú"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-md transition-colors duration-200 relative"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Notificaciones"
            >
              <BellIcon className="h-6 w-6" />
              {/* Notification Badge */}
              {hasUnread && (
                <span 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'var(--border)' 
                }}
              >
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Notificaciones
                    </h3>
                    {hasUnread && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm transition-colors duration-200"
                        style={{ color: 'var(--primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--primary-dark)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {notifications.slice(0, 10).map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-opacity-50 transition-colors duration-200 cursor-pointer ${
                            !notification.is_read ? 'border-l-4' : ''
                          }`}
                          style={{ 
                            backgroundColor: !notification.is_read ? 'var(--primary-light)' : 'transparent',
                            borderLeftColor: !notification.is_read ? 'var(--primary)' : 'transparent'
                          }}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 
                                className={`text-sm font-medium truncate ${
                                  !notification.is_read ? 'font-semibold' : ''
                                }`}
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {notification.title}
                              </h4>
                              <p 
                                className="text-sm mt-1 line-clamp-2"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {notification.message}
                              </p>
                              <p 
                                className="text-xs mt-2"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {new Date(notification.created_at).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div 
                                className="w-2 h-2 rounded-full ml-2 mt-1 flex-shrink-0"
                                style={{ backgroundColor: 'var(--primary)' }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      {notifications.length > 10 && (
                        <div className="p-4 text-center">
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Mostrando las 10 notificaciones más recientes
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* User Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-200"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Menú de usuario"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 z-50"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)' 
                }}
              >
                {/* User Info */}
                <div 
                  className="px-4 py-3 border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user?.firstName || 'Usuario'} {user?.lastName || ''}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user?.email}
                  </p>
                  <p 
                    className="text-xs capitalize mt-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user?.role || 'Usuario'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-3" />
                    Mi Perfil
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200"
                    style={{ color: 'var(--error)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--error-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-icons text-base mr-3">logout</span>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};

export default Header;
