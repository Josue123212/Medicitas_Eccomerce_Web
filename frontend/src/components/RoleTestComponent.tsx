import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useRoutePermissions } from '@/lib/hooks/useRoleRedirect';

/**
 * 🧪 COMPONENTE DE PRUEBA DE ROLES
 * 
 * Componente para probar la funcionalidad de rutas protegidas
 * y redirección automática según roles de usuario.
 */

const RoleTestComponent: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { canAccessRoute, getAccessibleRoutes, userRole } = useRoutePermissions();
  const [testingRole, setTestingRole] = useState<string>('');

  // Roles disponibles para prueba
  const testRoles = [
    { role: 'superadmin', name: 'Super Administrador', email: 'superadmin@test.com' },
    { role: 'admin', name: 'Administrador', email: 'admin@test.com' },
    { role: 'doctor', name: 'Doctor', email: 'doctor@test.com' },
    { role: 'secretary', name: 'Secretaria', email: 'secretary@test.com' },
    { role: 'client', name: 'Cliente', email: 'client@test.com' },
  ];

  // Rutas de prueba
  const testRoutes = [
    { path: '/admin/dashboard', name: 'Admin Dashboard' },
    { path: '/admin/users', name: 'Gestión Usuarios' },
    { path: '/admin/doctors', name: 'Gestión Doctores' },
    { path: '/doctor/dashboard', name: 'Doctor Dashboard' },
    { path: '/secretary/dashboard', name: 'Secretary Dashboard' },
    { path: '/client/dashboard', name: 'Client Dashboard' },
    { path: '/client/appointments', name: 'Mis Citas' },
  ];

  const handleRoleLogin = async (role: string, email: string, name: string) => {
    setTestingRole(role);
    try {
      // Simular login con el rol específico
      await login(email, 'password123');
    } catch (error) {
      console.error('Error en login de prueba:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setTestingRole('');
  };

  const handleNavigateToRoute = (path: string) => {
    navigate(path);
  };

  const getRouteStatus = (path: string) => {
    if (!user) return 'No autenticado';
    return canAccessRoute(path) ? '✅ Permitido' : '❌ Denegado';
  };

  const getRouteButtonVariant = (path: string) => {
    if (!user) return 'outline';
    return canAccessRoute(path) ? 'primary' : 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            🧪 Prueba de Rutas Protegidas por Rol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Usuario actual: <span className="font-medium">{user?.name || 'No autenticado'}</span>
            </p>
            <p className="text-gray-600">
              Rol: <span className="font-medium capitalize">{userRole || 'Ninguno'}</span>
            </p>
            {testingRole && (
              <p className="text-sm text-blue-600">
                Probando como: <span className="font-medium">{testingRole}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de Login por Rol */}
      <Card>
        <CardHeader>
          <CardTitle>1. Seleccionar Rol para Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {testRoles.map((roleData) => (
              <Button
                key={roleData.role}
                variant={testingRole === roleData.role ? 'primary' : 'outline'}
                onClick={() => handleRoleLogin(roleData.role, roleData.email, roleData.name)}
                className="text-left"
              >
                <div>
                  <div className="font-medium">{roleData.name}</div>
                  <div className="text-xs opacity-75">{roleData.role}</div>
                </div>
              </Button>
            ))}
          </div>
          
          {user && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Prueba de Rutas */}
      <Card>
        <CardHeader>
          <CardTitle>2. Probar Acceso a Rutas</CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Selecciona un rol arriba para probar el acceso a rutas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {testRoutes.map((route) => (
                  <div key={route.path} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{route.name}</div>
                      <div className="text-xs text-gray-500">{route.path}</div>
                      <div className="text-xs mt-1">
                        {getRouteStatus(route.path)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={getRouteButtonVariant(route.path) as any}
                      onClick={() => handleNavigateToRoute(route.path)}
                      disabled={!canAccessRoute(route.path)}
                    >
                      Ir
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Rutas Accesibles */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>3. Rutas Accesibles para {userRole}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getAccessibleRoutes().map((route) => (
                <div key={route} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <span className="text-sm font-medium text-green-800">{route}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNavigateToRoute(route)}
                  >
                    Navegar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instrucciones de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>Selecciona un rol</strong> para simular login con ese usuario</p>
            <p>2. <strong>Prueba las rutas</strong> - las permitidas aparecen en verde, las denegadas en rojo</p>
            <p>3. <strong>Intenta navegar</strong> a rutas no permitidas para ver la página de acceso denegado</p>
            <p>4. <strong>Cambia de rol</strong> para ver cómo cambian los permisos</p>
            <p>5. <strong>Verifica la redirección automática</strong> al hacer login</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleTestComponent;