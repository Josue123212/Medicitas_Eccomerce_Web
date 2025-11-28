import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Modal,
  ModalFooter,
  ConfirmModal,
  useModal
} from './ui';
import { 
  UserIcon, 
  EnvelopeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UIComponentsTest: React.FC = () => {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hook para manejar modales
  const basicModal = useModal();
  const confirmModal = useModal();

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      toast.success('¡Formulario enviado correctamente!');
      console.log('Datos del formulario:', formData);
    } else {
      toast.error('Por favor, corrige los errores en el formulario');
    }
  };

  // Función para manejar la confirmación
  const handleConfirm = () => {
    toast.success('¡Acción confirmada!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 Prueba de Componentes UI
          </h1>
          <p className="text-gray-600">
            Demostración de todos los componentes base creados
          </p>
        </div>

        {/* Sección de Botones */}
        <Card>
          <CardHeader>
            <CardTitle>🔘 Componente Button</CardTitle>
            <CardDescription>
              Diferentes variantes y tamaños de botones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Variantes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Variantes:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              
              {/* Tamaños */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tamaños:</h4>
                <div className="flex items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <HeartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Estados */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Estados:</h4>
                <div className="flex gap-2">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Componente Input</CardTitle>
            <CardDescription>
              Campos de entrada con diferentes estados y validaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input básico */}
              <Input
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre"
                leftIcon={<UserIcon className="h-4 w-4" />}
                error={errors.name}
              />
              
              {/* Input con validación */}
              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ejemplo@correo.com"
                leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                error={errors.email}
              />
              
              {/* Input de contraseña */}
              <Input
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                error={errors.password}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              
              {/* Diferentes tamaños */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input size="sm" placeholder="Small input" />
                <Input size="md" placeholder="Medium input" />
                <Input size="lg" placeholder="Large input" />
              </div>
              
              {/* Estados de validación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  placeholder="Input con éxito" 
                  success="¡Perfecto!"
                />
                <Input 
                  placeholder="Input con advertencia" 
                  warning="Revisa este campo"
                />
                <Input 
                  placeholder="Input con error" 
                  error="Este campo es requerido"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Enviar Formulario
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sección de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Card Default</CardTitle>
              <CardDescription>
                Esta es una card con el estilo por defecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Contenido de la card con información relevante.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Acción</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Card Elevated</CardTitle>
              <CardDescription>
                Card con sombra elevada y efecto hover
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">4.8/5 estrellas</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Card Outlined</CardTitle>
              <CardDescription>
                Card con borde marcado y sin sombra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                Ver más
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Modales */}
        <Card>
          <CardHeader>
            <CardTitle>🪟 Componente Modal</CardTitle>
            <CardDescription>
              Ventanas modales con diferentes configuraciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={basicModal.openModal}>
                Abrir Modal Básico
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmModal.openModal}
              >
                Abrir Modal de Confirmación
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal Básico */}
        <Modal
          isOpen={basicModal.isOpen}
          onClose={basicModal.closeModal}
          title="Modal de Ejemplo"
          description="Este es un modal básico con contenido personalizado"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Este modal demuestra las capacidades del componente Modal.
              Puedes incluir cualquier contenido aquí.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Características:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Animaciones suaves de entrada y salida</li>
                <li>• Cierre con tecla Escape</li>
                <li>• Cierre al hacer clic fuera del modal</li>
                <li>• Diferentes tamaños disponibles</li>
                <li>• Totalmente accesible</li>
              </ul>
            </div>
          </div>
          
          <ModalFooter>
            <Button variant="secondary" onClick={basicModal.closeModal}>
              Cancelar
            </Button>
            <Button onClick={basicModal.closeModal}>
              Aceptar
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.closeModal}
          onConfirm={handleConfirm}
          title="Confirmar Acción"
          message="¿Estás seguro de que quieres realizar esta acción? Esta operación no se puede deshacer."
          confirmText="Sí, continuar"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default UIComponentsTest;