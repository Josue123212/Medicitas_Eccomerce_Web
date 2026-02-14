import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { ecommerceService } from '../../services/ecommerceService';
import CheckoutModal from '../../components/pharmacy/CheckoutModal';

const PharmacyCartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = React.useState<{ items: Array<{ id: number; product: number; quantity: number; unit_price: number; subtotal?: number; product_detail?: any }> } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    ecommerceService.getCart()
      .then((data) => { setCart(data); })
      .catch(() => { setError('No se pudo cargar tu carrito'); })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const total = React.useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, it) => sum + Number(it.subtotal ?? (Number(it.unit_price) * it.quantity)), 0);
  }, [cart]);

  const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN as string) || 'http://localhost:8000';

  const updateQuantity = async (itemId: number, nextQty: number) => {
    if (nextQty <= 0) {
      try {
        await ecommerceService.removeCartItem(itemId);
        setCart((prev) => prev ? { items: prev.items.filter((i) => i.id !== itemId) } : prev);
      } catch {}
      return;
    }
    try {
      await ecommerceService.updateCartItem(itemId, nextQty);
      const data = await ecommerceService.getCart();
      setCart(data);
    } catch {}
  };

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
                <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Carrito</h1>
              </div>
            </div>
            <Link to="/pharmacy" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              ← Volver a farmacia
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>Tu carrito</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Para ver y gestionar tu carrito, inicia sesión.</p>
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
              <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Tu carrito</h1>
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
            <h2 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>Resumen</h2>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Total: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(total)}
            </div>
          </div>

          {loading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && cart?.items?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Tu carrito está vacío.</p>
              <Link to="/pharmacy/catalog" className="px-5 py-3 rounded-lg font-medium bg-primary text-white">
                Explorar productos
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {cart?.items?.map((it) => {
              const img = it.product_detail?.images?.[0]?.image;
              const name = it.product_detail?.name || `Producto #${it.product}`;
              const src = img ? (img.startsWith('http') ? img : `${backendOrigin}${img}`) : null;
              return (
                <div key={it.id} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div className="flex items-center gap-3">
                    {src ? (
                      <img src={src} alt={name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded" style={{ backgroundColor: 'var(--primary)', opacity: 0.1 }} />
                    )}
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <button className="btn-outline px-2 py-1 rounded text-xs" onClick={() => updateQuantity(it.id, it.quantity - 1)}>-</button>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{it.quantity}</span>
                        <button className="btn-outline px-2 py-1 rounded text-xs" onClick={() => updateQuantity(it.id, it.quantity + 1)}>+</button>
                        <button className="btn-outline px-2 py-1 rounded text-xs" onClick={() => updateQuantity(it.id, 0)}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(Number(it.subtotal ?? (Number(it.unit_price) * it.quantity)))}
                  </div>
                </div>
              );
            })}
          </div>

          {cart?.items?.length ? (
            <div className="mt-6 flex justify-between">
              <button
                className="btn-outline px-4 py-2 rounded-lg"
                onClick={async () => { try { await ecommerceService.clearCart(); setCart({ items: [] }); } catch {} }}
              >
                Vaciar carrito
              </button>
              <button className="btn-primary px-5 py-3 rounded-lg" onClick={() => setCheckoutOpen(true)}>Proceder al pago</button>
            </div>
          ) : null}
        </div>
      </main>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(orderId) => {
          toast.success('Pago confirmado');
          navigate('/pharmacy/success');
        }}
      />
    </div>
  );
};

export default PharmacyCartPage;
