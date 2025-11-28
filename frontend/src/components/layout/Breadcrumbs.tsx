import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigation } from '@/lib/hooks/useNavigation';

interface BreadcrumbsProps {
  className?: string;
}

// 🍞 Componente de Breadcrumbs Dinámicos
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className = '' }) => {
  const { breadcrumbs } = useNavigation();
  
  // No mostrar breadcrumbs si solo hay un elemento (Dashboard)
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {/* Separador */}
            {index > 0 && (
              <span 
                className="material-icons text-gray-400 mx-2 text-sm"
                aria-hidden="true"
              >
                chevron_right
              </span>
            )}
            
            {/* Breadcrumb Item */}
            {crumb.isLast ? (
              // Último elemento - no es clickeable
              <span 
                className="font-medium text-gray-900 truncate max-w-[200px]" 
                aria-current="page"
                title={crumb.name}
              >
                {crumb.name}
              </span>
            ) : (
              // Elementos anteriores - clickeables
              <Link
                to={crumb.href}
                className="text-gray-500 hover:text-primary transition-colors duration-200 truncate max-w-[150px]"
                title={crumb.name}
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;