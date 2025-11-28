import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import App from './App.tsx'

// 🎯 OBJETIVO: Configurar React Query para gestión de estado del servidor
// 💡 CONCEPTO: QueryClient centraliza la configuración de cache y requests

// Crear instancia de QueryClient con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tiempo que los datos permanecen en cache (10 minutos)
      cacheTime: 10 * 60 * 1000,
      // Número de reintentos en caso de error
      retry: 1,
      // No refetch automático al enfocar la ventana
      refetchOnWindowFocus: false,
      // Refetch al reconectar a internet
      refetchOnReconnect: true,
      // Mostrar datos en cache mientras se actualiza en background
      refetchOnMount: 'always',
    },
    mutations: {
      // Reintentos para mutaciones
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        {/* Toaster para notificaciones globales */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        {/* DevTools solo en desarrollo */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            position="bottom-right"
          />
        )}
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
