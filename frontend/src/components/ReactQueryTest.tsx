import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiHelpers } from '@/services/api';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

// 🎯 OBJETIVO: Demostrar el uso de React Query con nuestro cliente API
// 💡 CONCEPTO: Hooks para queries y mutations con manejo de estado automático

// Tipos de ejemplo para la demostración
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const ReactQueryTest: React.FC = () => {
  const queryClient = useQueryClient();

  // 📊 QUERY: Obtener lista de usuarios (simulando API)
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      // Simulamos una llamada a nuestra API
      // En producción sería: return apiHelpers.get('/users/');
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!response.ok) throw new Error('Error al obtener usuarios');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 📊 QUERY: Obtener posts (con dependencia condicional)
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async (): Promise<Post[]> => {
      // Simulamos otra llamada a la API
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
      if (!response.ok) throw new Error('Error al obtener posts');
      return response.json();
    },
    enabled: !!users, // Solo ejecutar si tenemos usuarios
  });

  // 🔄 MUTATION: Crear nuevo post
  const createPostMutation = useMutation({
    mutationFn: async (newPost: Omit<Post, 'id'>): Promise<Post> => {
      // Simulamos creación de post
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) throw new Error('Error al crear post');
      return response.json();
    },
    onSuccess: (newPost) => {
      // Invalidar y refetch de posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(`Post "${newPost.title}" creado exitosamente!`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // 🔄 MUTATION: Eliminar post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number): Promise<void> => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar post');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post eliminado exitosamente!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Función para crear post de ejemplo
  const handleCreatePost = () => {
    const newPost = {
      title: `Post de prueba ${Date.now()}`,
      body: 'Este es un post de prueba creado con React Query',
      userId: 1,
    };
    createPostMutation.mutate(newPost);
  };

  // Función para eliminar post
  const handleDeletePost = (postId: number) => {
    deletePostMutation.mutate(postId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔄 React Query + API Demo
        </h1>
        <p className="text-gray-600">
          Demostración de gestión de estado del servidor con React Query
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={() => refetchUsers()} 
          disabled={usersLoading}
          variant="outline"
        >
          {usersLoading ? '🔄 Cargando...' : '🔄 Refetch Usuarios'}
        </Button>
        
        <Button 
          onClick={handleCreatePost}
          disabled={createPostMutation.isPending}
          variant="primary"
        >
          {createPostMutation.isPending ? '⏳ Creando...' : '➕ Crear Post'}
        </Button>
        
        <Button 
          onClick={() => queryClient.clear()}
          variant="destructive"
        >
          🗑️ Limpiar Cache
        </Button>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usuarios */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            👥 Usuarios
            {usersLoading && <span className="ml-2 text-sm text-blue-500">Cargando...</span>}
          </h2>
          
          {usersError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-700 text-sm">
                ❌ Error: {(usersError as Error).message}
              </p>
            </div>
          )}
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {users?.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-md p-3">
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">@{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📝 Posts
            {postsLoading && <span className="ml-2 text-sm text-blue-500">Cargando...</span>}
          </h2>
          
          {postsError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-700 text-sm">
                ❌ Error: {(postsError as Error).message}
              </p>
            </div>
          )}
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {posts?.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.body}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletePostMutation.isPending}
                    className="ml-2"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estado de mutaciones */}
      {(createPostMutation.isPending || deletePostMutation.isPending) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700 text-center">
            ⏳ Procesando operación...
          </p>
        </div>
      )}

      {/* Información de React Query DevTools */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="font-medium text-gray-900 mb-2">🛠️ React Query DevTools</h3>
        <p className="text-sm text-gray-600">
          Abre las DevTools (esquina inferior derecha) para ver:
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• Estado de queries en tiempo real</li>
          <li>• Cache de datos</li>
          <li>• Historial de requests</li>
          <li>• Configuración de stale time y cache time</li>
        </ul>
      </div>
    </div>
  );
};

export default ReactQueryTest;

// 📋 EXPLICACIÓN:
// 1. useQuery: Para obtener datos del servidor con cache automático
// 2. useMutation: Para operaciones que modifican datos (POST, PUT, DELETE)
// 3. queryClient: Para invalidar cache y refetch manual
// 4. Manejo automático de loading, error y success states
// 5. DevTools para debugging en desarrollo
// 6. Configuración optimizada de cache y stale time