// 📝 Componente Textarea - Área de texto para formularios

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 🎯 OBJETIVO: Componente de área de texto reutilizable
 * 
 * 💡 CONCEPTO: Textarea que:
 * - Mantiene consistencia visual con otros inputs
 * - Soporta diferentes tamaños y estados
 * - Es completamente accesible
 * - Incluye estados de error y éxito
 */

// ==========================================
// VARIANTES DE ESTILO
// ==========================================

const textareaVariants = cva(
  // Estilos base
  [
    "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
    "placeholder:text-gray-500",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
    "resize-vertical"
  ],
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:ring-blue-500",
        error: "border-red-500 focus:ring-red-500 focus:border-red-500",
        success: "border-green-500 focus:ring-green-500 focus:border-green-500",
      },
      size: {
        sm: "min-h-[60px] px-2 py-1 text-xs",
        default: "min-h-[80px] px-3 py-2 text-sm",
        lg: "min-h-[120px] px-4 py-3 text-base",
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

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
  success?: boolean;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, success, ...props }, ref) => {
    // Determinar la variante basada en los estados
    let finalVariant = variant;
    if (error) finalVariant = 'error';
    else if (success) finalVariant = 'success';

    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ variant: finalVariant, size }), className)}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// ==========================================
// EXPORTACIONES
// ==========================================

export { Textarea, textareaVariants };
export type { TextareaProps };