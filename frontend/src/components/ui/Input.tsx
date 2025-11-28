import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Definimos las variantes del input usando class-variance-authority
const inputVariants = cva(
  // Clases base que siempre se aplican
  "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:ring-primary-500",
        error: "border-red-500 focus:ring-red-500 text-red-900 placeholder:text-red-400",
        success: "border-green-500 focus:ring-green-500 text-green-900",
        warning: "border-yellow-500 focus:ring-yellow-500 text-yellow-900"
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

// Interface para las props del componente Input
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Componente Input principal
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    error, 
    success, 
    warning, 
    helperText, 
    leftIcon, 
    rightIcon, 
    id,
    ...props 
  }, ref) => {
    // Generamos un ID único si no se proporciona
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determinamos la variante basada en los estados
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // Mensaje a mostrar (prioridad: error > warning > success > helperText)
    const messageToShow = error || warning || success || helperText;
    const messageColor = error ? 'text-red-600' : warning ? 'text-yellow-600' : success ? 'text-green-600' : 'text-gray-600';

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          {/* Input Field */}
          <input
            id={inputId}
            className={cn(
              inputVariants({ variant: currentVariant, size, className }),
              leftIcon && "pl-10",
              rightIcon && "pr-10"
            )}
            ref={ref}
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {/* Helper Text / Error / Success / Warning Message */}
        {messageToShow && (
          <p className={cn("mt-1 text-xs", messageColor)}>
            {messageToShow}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
export default Input;