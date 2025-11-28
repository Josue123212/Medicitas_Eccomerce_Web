// Exportaciones centralizadas de todos los componentes UI

// Badge Component
export { Badge } from './Badge';

// Button Component
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

// Input Component
export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

// Card Components
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  cardVariants 
} from './Card';
export type { 
  CardProps, 
  CardHeaderProps, 
  CardTitleProps, 
  CardDescriptionProps, 
  CardContentProps, 
  CardFooterProps 
} from './Card';

// Modal Components
export { 
  Modal, 
  ModalFooter, 
  ConfirmModal, 
  useModal, 
  modalVariants 
} from './Modal';
export type { 
  ModalProps, 
  ModalFooterProps, 
  ConfirmModalProps 
} from './Modal';

// Tabs Components
export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  tabsVariants 
} from './Tabs';

// Label Component
export { Label, labelVariants } from './Label';
export type { LabelProps } from './Label';

// Textarea Component
export { Textarea, textareaVariants } from './Textarea';
export type { TextareaProps } from './Textarea';

// Select Components
export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem, 
  selectVariants 
} from './Select';
export type { 
  SelectProps, 
  SelectTriggerProps, 
  SelectContentProps, 
  SelectItemProps, 
  SelectValueProps 
} from './Select';

// Re-exportar componentes por defecto para facilitar importaciones
export { default as ButtonComponent } from './Button';
export { default as InputComponent } from './Input';
export { default as CardComponent } from './Card';
export { default as ModalComponent } from './Modal';
export { default as TabsComponent } from './Tabs';