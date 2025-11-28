import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ecommerceService } from '../../services/ecommerceService';

const PharmacyOrdersPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
        <header className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-on-primary)' }}>FM</span>
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>MediCitas</div>
                <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Farmacia</h1>
              </div>
            </div>
            <Link to="/pharmacy" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              ← Volver a farmacia
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>Tus pedidos</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Para ver y gestionar tus pedidos, inicia sesión.</p>
            <div className="flex gap-3">
              <Link to="/pharmacy/login" className="px-5 py-3 rounded-lg font-medium bg-primary text-white">Iniciar Sesión</Link>
              <Link to="/pharmacy/catalog" className="px-5 py-3 rounded-lg font-medium border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>Ver Catálogo</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const [orders, setOrders] = React.useState<Array<{ id: number; status: string; total: number; currency?: string; created_at: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    ecommerceService.getOrders()
      .then((list) => setOrders(list as any))
      .catch(() => setError('No se pudieron cargar tus pedidos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      <header className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-on-primary)' }}>FM</span>
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>MediCitas</div>
              <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Tus pedidos</h1>
            </div>
          </div>
          <Link to="/pharmacy/catalog" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            ← Catálogo
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>Listado</h2>
            <Link to="/pharmacy/catalog" className="px-4 py-2 rounded-lg font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface)' }}>
              Seguir comprando
            </Link>
          </div>

          {loading && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando pedidos…</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Aún no tienes pedidos.</p>
              <Link to="/pharmacy/catalog" className="px-5 py-3 rounded-lg font-medium bg-primary text-white">
                Explorar productos
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Orden #{o.id}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Estado: {o.status}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Fecha: {new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: o.currency || 'USD' }).format(Number(o.total))}
                </div>
                <Link to={`/pharmacy/orders/${o.id}`}>
                  <button className="btn-outline px-3 py-2 rounded-md text-sm">Ver detalle</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacyOrdersPage;
