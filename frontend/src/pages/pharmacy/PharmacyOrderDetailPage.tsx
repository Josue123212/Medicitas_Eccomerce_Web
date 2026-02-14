import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ecommerceService } from '../../services/ecommerceService';

const PharmacyOrderDetailPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
      setError('Orden no encontrada');
      setLoading(false);
      return;
    }
    ecommerceService.getOrder(Number(id))
      .then((o) => setOrder(o))
      .catch(() => setError('No se pudo cargar el detalle de la orden'))
      .finally(() => setLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando...</p>
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
                <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Orden</h1>
              </div>
            </div>
            <Link to="/pharmacy" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              ← Volver a farmacia
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>Detalle de orden</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Inicia sesión para ver tus órdenes.</p>
            <div className="flex gap-3">
              <Link to="/pharmacy/login" className="px-5 py-3 rounded-lg font-medium bg-primary text-white">Iniciar Sesión</Link>
              <Link to="/pharmacy/catalog" className="px-5 py-3 rounded-lg font-medium border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>Ver Catálogo</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      <header className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-on-primary)' }}>FM</span>
            </div>
            <div>
              <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Orden #{order?.id || id}</h1>
            </div>
          </div>
          <Link to="/pharmacy/orders" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            ← Historial
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)' }}>
          {loading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando detalle…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && order && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Estado</div>
                  <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{order.status}</div>
                </div>
                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: order.currency || 'USD' }).format(Number(order.total))}
                </div>
              </div>

              <div>
                <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Items</div>
                <div className="space-y-3">
                  {order.items?.map((it: any) => {
                    const img = it.product_detail?.images?.[0]?.image;
                    const name = it.product_detail?.name || `Producto #${it.product}`;
                    const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN as string) || 'http://localhost:8000';
                    const src = img ? (img.startsWith('http') ? img : `${backendOrigin}${img}`) : null;
                    return (
                      <div key={it.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                        <div className="flex items-center gap-3">
                          {src ? (
                            <img src={src} alt={name} className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded" style={{ backgroundColor: 'var(--primary)', opacity: 0.1 }} />
                          )}
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cantidad: {it.quantity}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: order.currency || 'USD' }).format(Number(it.subtotal ?? (Number(it.unit_price) * Number(it.quantity))))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Pago</div>
                <div className="p-3 rounded-lg" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>Proveedor: {order.payment?.provider || 'stripe'}</div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>Estado: {order.payment?.status || 'succeeded'}</div>
                  {order.payment?.external_id && (
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>ID: {order.payment.external_id}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PharmacyOrderDetailPage;
