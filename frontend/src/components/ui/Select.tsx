// 🔽 Componente Select - Selector desplegable para formularios

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

/**
 * 🎯 OBJETIVO: Componente de selector desplegable accesible
 * 
 * 💡 CONCEPTO: Select personalizado que:
 * - Mantiene consistencia visual con otros inputs
 * - Es completamente accesible con teclado
 * - Soporta diferentes estados y variantes
 * - Incluye animaciones suaves
 */

// ==========================================
// VARIANTES DE ESTILO
// ==========================================

const selectVariants = cva(
  [
    "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
    "placeholder:text-gray-500",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
    "cursor-pointer"
  ],
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:ring-blue-500",
        error: "border-red-500 focus:ring-red-500 focus:border-red-500",
        success: "border-green-500 focus:ring-green-500 focus:border-green-500",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ==========================================
// INTERFACES
// ==========================================

export interface SelectProps extends VariantProps<typeof selectVariants> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  error?: boolean;
  success?: boolean;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

// ==========================================
// CONTEXTO
// ==========================================

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

// ==========================================
// COMPONENTES
// ==========================================

const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  children, 
  disabled = false 
}) => {
  const [open, setOpen] = React.useState(false);

  const contextValue = React.useMemo(() => ({
    value,
    onValueChange,
    open,
    setOpen
  }), [value, onValueChange, open]);

  React.useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        className={cn(selectVariants(), className)}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>
    );
  }
);

SelectTrigger.displayName = "SelectTrigger";

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const { value } = useSelectContext();
  
  return (
    <span className={cn("block truncate", className)}>
      {value || (
        <span className="text-gray-500">{placeholder}</span>
      )}
    </span>
  );
};

const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { open, setOpen } = useSelectContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children, className, onSelect }) => {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  const handleSelect = () => {
    onValueChange?.(value);
    onSelect?.(value);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-gray-100 focus:bg-gray-100",
        isSelected && "bg-blue-50 text-blue-600",
        className
      )}
      onClick={handleSelect}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
};

// ==========================================
// EXPORTACIONES
// ==========================================

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  selectVariants
};

export type {
  SelectProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectItemProps,
  SelectValueProps
};