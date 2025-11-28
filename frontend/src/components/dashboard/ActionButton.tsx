import React from 'react';

interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  isLoading?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  description,
  icon,
  onClick,
  variant = 'secondary',
  disabled = false,
  isLoading = false
}) => {
  const baseClasses = "group relative w-full p-4 lg:p-6 rounded-xl transition-all duration-300 text-left border focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: `
      gradient-primary
      text-white border-transparent 
      shadow-lg hover:shadow-xl 
      transform hover:-translate-y-1
      focus:ring-primary
    `,
    secondary: `
      bg-background hover:bg-secondary-50 
      text-text-primary border-border 
      hover:border-primary 
      shadow-sm hover:shadow-md
      focus:ring-primary
    `
  };
  
  const disabledClasses = "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-sm";
  const loadingClasses = "animate-pulse cursor-wait";
  
  const iconClasses = variant === 'primary' 
    ? "text-white" 
    : "text-primary group-hover:text-primary-hover";
    
  const titleClasses = variant === 'primary'
    ? "text-white font-medium"
    : "text-text-primary font-medium group-hover:text-text-primary";
    
  const descriptionClasses = variant === 'primary'
    ? "text-primary-light"
    : "text-text-secondary group-hover:text-text-primary";

  const handleClick = () => {
    console.log('🔥 ActionButton onClick ejecutado');
    console.log('📝 Title:', title);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${disabled ? disabledClasses : ''}
        ${isLoading ? loadingClasses : ''}
      `.replace(/\s+/g, ' ').trim()}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${iconClasses}`}>
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            icon
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm lg:text-base ${titleClasses} mb-1`}>
            {title}
          </h3>
          <p className={`text-xs lg:text-sm ${descriptionClasses} leading-relaxed`}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Hover indicator for secondary variant */}
      {variant === 'secondary' && !isLoading && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </button>
  );
};

export { ActionButton };