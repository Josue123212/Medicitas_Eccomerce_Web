// 🏷️ Componente Label - Etiquetas para formularios

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 🎯 OBJETIVO: Componente de etiqueta accesible para formularios
 * 
 * 💡 CONCEPTO: Label reutilizable que:
 * - Proporciona etiquetas semánticamente correctas
 * - Mantiene consistencia visual
 * - Soporta diferentes variantes de estilo
 * - Es completamente accesible
 */

// ==========================================
// VARIANTES DE ESTILO
// ==========================================

const labelVariants = cva(
  // Estilos base
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-gray-700",
        required: "text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500",
        optional: "text-gray-500",
        error: "text-red-600",
        success: "text-green-600",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ==========================================
// INTERFACES
// ==========================================

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, required, children, ...props }, ref) => {
    // Determinar la variante basada en la prop required
    const finalVariant = required ? 'required' : variant;

    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant: finalVariant, size }), className)}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

// ==========================================
// EXPORTACIONES
// ==========================================

export { Label, labelVariants };
export type { LabelProps };