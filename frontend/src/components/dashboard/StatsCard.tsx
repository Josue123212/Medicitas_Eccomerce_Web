import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  isLoading?: boolean;
  description?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  isLoading = false,
  description,
  onClick
}) => {
  // Clases base usando variables CSS del tema
  const baseClasses = "bg-white rounded-lg shadow-sm border border-secondary transition-all duration-300 p-6";
  
  // Colores usando variables CSS del tema
  const getColorStyles = (colorType: string) => {
    switch (colorType) {
      case 'success':
        return {
          iconColor: 'var(--success)',
          bgColor: 'var(--success-light)',
          borderColor: 'var(--success)'
        };
      case 'warning':
        return {
          iconColor: 'var(--warning)',
          bgColor: 'var(--warning-light)',
          borderColor: 'var(--warning)'
        };
      case 'error':
        return {
          iconColor: 'var(--error)',
          bgColor: 'var(--error-light)',
          borderColor: 'var(--error)'
        };
      case 'info':
        return {
          iconColor: 'var(--primary)',
          bgColor: 'var(--primary-light)',
          borderColor: 'var(--primary)'
        };
      default:
        return {
          iconColor: 'var(--primary)',
          bgColor: 'var(--primary-light)',
          borderColor: 'var(--primary)'
        };
    }
  };

  const colorStyles = getColorStyles(color);
  const Component = onClick ? 'button' : 'div';
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2' : '';

  // Estado de carga
  if (isLoading) {
    return (
      <div className={`${baseClasses} animate-pulse`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--surface)' }}></div>
          <div className="h-4 rounded w-24" style={{ backgroundColor: 'var(--surface)' }}></div>
        </div>
        <div className="h-8 rounded w-16 mb-2" style={{ backgroundColor: 'var(--surface)' }}></div>
        {description && <div className="h-3 rounded w-32" style={{ backgroundColor: 'var(--surface)' }}></div>}
      </div>
    );
  }

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${clickableClasses}`}
      style={{ 
        backgroundColor: 'var(--background)', 
        border: '1px solid var(--border)',
        ...(onClick && {
          '--focus-ring-color': 'var(--primary)'
        })
      } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            {icon && (
              <div className="flex-shrink-0" style={{ color: colorStyles.iconColor }}>
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {title}
            </h3>
          </div>
          
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {value}
          </div>
          
          {(subtitle || description) && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {subtitle || description}
            </p>
          )}
        </div>
        
        {trend && (
          <div className="flex-shrink-0 ml-4">
            <div className="flex items-center space-x-1 text-sm font-medium" style={{ 
              color: trend.isPositive ? 'var(--success)' : 'var(--error)' 
            }}>
              <svg 
                className={`w-4 h-4 ${
                  trend.isPositive ? 'rotate-0' : 'rotate-180'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {trend.label}
            </div>
          </div>
        )}
      </div>
      
      {onClick && (
        <div className="mt-4 flex items-center text-sm font-medium" style={{ color: 'var(--primary)' }}>
          <span>Ver detalles</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </Component>
  );
};

export { StatsCard };