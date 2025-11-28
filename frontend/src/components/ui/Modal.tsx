import React, { useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Button from './Button';

// Definimos las variantes del modal usando class-variance-authority
const modalVariants = cva(
  // Clases base que siempre se aplican
  "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all",
  {
    variants: {
      size: {
        sm: "sm:my-8 sm:w-full sm:max-w-sm",
        md: "sm:my-8 sm:w-full sm:max-w-md",
        lg: "sm:my-8 sm:w-full sm:max-w-lg",
        xl: "sm:my-8 sm:w-full sm:max-w-xl",
        "2xl": "sm:my-8 sm:w-full sm:max-w-2xl",
        "3xl": "sm:my-8 sm:w-full sm:max-w-3xl",
        "4xl": "sm:my-8 sm:w-full sm:max-w-4xl",
        full: "sm:my-8 sm:w-full sm:max-w-7xl"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);

// Interface para las props del componente Modal
export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

// Componente Modal principal
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}) => {
  // Efecto para manejar la tecla Escape
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        console.log('⌨️ Modal: Escape presionado - cerrando modal');
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={closeOnOverlayClick ? () => {
          console.log('🖱️ Modal: Click en overlay - cerrando modal');
          onClose();
        } : () => {}}
      >
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={cn(modalVariants({ size }), className)}>
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between p-6 pb-4">
                    <div className="flex-1">
                      {title && (
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-2 text-sm text-gray-600">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    
                    {showCloseButton && (
                      <button
                        type="button"
                        className="ml-4 rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        onClick={() => {
                          console.log('❌ Modal: Botón X presionado - cerrando modal');
                          onClose();
                        }}
                      >
                        <span className="sr-only">Cerrar</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={cn(
                  "px-6",
                  (title || showCloseButton) ? "pb-6" : "py-6"
                )}>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Componente ModalFooter para acciones
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 mt-6",
      className
    )}>
      {children}
    </div>
  );
};

// Hook personalizado para manejar modales
export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => {
    console.log('🔓 useModal.openModal() llamado - abriendo modal');
    setIsOpen(true);
  }, []);
  
  const closeModal = React.useCallback(() => {
    console.log('🔒 useModal.closeModal() llamado - cerrando modal');
    setIsOpen(false);
  }, []);
  
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  // Debug: Log cuando cambia el estado
  React.useEffect(() => {
    console.log('🎭 useModal estado cambió:', { isOpen });
  }, [isOpen]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

// Componente de confirmación predefinido
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de que quieres realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="mt-2">
        <p className="text-sm text-gray-600">
          {message}
        </p>
      </div>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

Modal.displayName = "Modal";
ModalFooter.displayName = "ModalFooter";

export { Modal, ModalFooter, modalVariants };
export default Modal;