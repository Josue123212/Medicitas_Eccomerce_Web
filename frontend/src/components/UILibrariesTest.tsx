import { useState } from 'react';
import { FaHeart, FaUser, FaCog, FaCheck } from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import { Fragment } from 'react';

export const UILibrariesTest = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showToast = () => {
    toast.success('¡React Hot Toast funcionando!', {
      duration: 3000,
      position: 'top-right',
    });
  };

  const showErrorToast = () => {
    toast.error('Toast de error de prueba', {
      duration: 3000,
      position: 'top-right',
    });
  };

  const showLoadingToast = () => {
    toast.loading('Cargando...', {
      duration: 2000,
      position: 'top-right',
    });
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <FaCheck className="text-green-500 mr-2" />
        Prueba de Librerías UI
      </h3>
      
      <div className="space-y-6">
        {/* React Icons Test */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <FaHeart className="text-red-500 mr-2" />
            React Icons
          </h4>
          <div className="flex space-x-4 text-2xl">
            <FaUser className="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors" title="Usuario" />
            <FaCog className="text-gray-500 hover:text-gray-600 cursor-pointer transition-colors" title="Configuración" />
            <FaHeart className="text-red-500 hover:text-red-600 cursor-pointer transition-colors" title="Favorito" />
            <FaCheck className="text-green-500 hover:text-green-600 cursor-pointer transition-colors" title="Completado" />
          </div>
          <p className="text-sm text-gray-600 mt-2">✅ React Icons funcionando correctamente</p>
        </div>

        {/* Headless UI Test */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-lg font-medium text-gray-800 mb-3">
            Headless UI (Dialog)
          </h4>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Abrir Modal
          </button>
          <p className="text-sm text-gray-600 mt-2">✅ Headless UI funcionando correctamente</p>
        </div>

        {/* React Hot Toast Test */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-3">
            React Hot Toast
          </h4>
          <div className="flex space-x-3">
            <button
              onClick={showToast}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Toast Éxito
            </button>
            <button
              onClick={showErrorToast}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Toast Error
            </button>
            <button
              onClick={showLoadingToast}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Toast Loading
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">✅ React Hot Toast funcionando correctamente</p>
        </div>
      </div>

      {/* Headless UI Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <FaCheck className="text-green-500 mr-2" />
                    Modal de Headless UI
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Este modal está construido con Headless UI y demuestra que la librería está funcionando correctamente.
                      Incluye transiciones suaves y es completamente accesible.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Toaster component for react-hot-toast */}
      <Toaster />
    </div>
  );
};

export default UILibrariesTest;