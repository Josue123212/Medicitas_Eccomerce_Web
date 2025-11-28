import React, { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

/**
 * 🏗️ LAYOUT PRINCIPAL
 * 
 * Componente de layout responsive con sidebar colapsable.
 * Implementa patrones de diseño del documento PATRONES_DISEÑO_DASHBOARD.md
 */

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Mobile Overlay */}
      {sidebarOpen && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${showSidebar ? 'lg:ml-72' : ''}`}>
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={showSidebar}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100 bg-white">
              <Breadcrumbs />
            </div>
            
            {/* Page Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export { Layout };
export default Layout;