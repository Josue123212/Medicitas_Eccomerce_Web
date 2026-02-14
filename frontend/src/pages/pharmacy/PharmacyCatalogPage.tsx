import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import FloatingAppointmentCTA from '../../components/pharmacy/FloatingAppointmentCTA';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService, type Product, type OfferSlide } from '../../services/ecommerceService';
import CategoriesNav from '../../components/pharmacy/CategoriesNav';
import { useSearchParams } from 'react-router-dom';
import { useModal } from '../../components/ui/Modal';
import FiltersDrawer from '../../components/pharmacy/FiltersDrawer';
import CategoriesSidebar from '../../components/pharmacy/CategoriesSidebar';
import CheckoutModal from '../../components/pharmacy/CheckoutModal';
import ChatbotModal from '../../components/pharmacy/ChatbotModal';

/**
 * 🛒 Catálogo (Autenticado) - Farmacia MediCitas
 * Igual a la vista de invitado pero con funciones desbloqueadas:
 * - Agregar al carrito
 * - Marcar como favorito
 * - Comprar ahora (simulado)
 *
 * Nota: Este componente reutiliza el contexto de autenticación (JWT) y
 * usa toasts para confirmar acciones. La lógica de carrito se maneja
 * localmente como demostración, lista para conectarse a un servicio real.
 */

// Datos reales desde backend
const useProducts = (categoryId: number | null) => {
  const query = useQuery({
    queryKey: ['ecommerce', 'products', selectedCategoryId ?? 'all'],
    queryFn: () => ecommerceService.getProducts(selectedCategoryId ? { category: selectedCategoryId } : undefined),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const products: Product[] = Array.isArray(query.data)
    ? (query.data as unknown as Product[])
    : (query.data?.results ?? []);
  return { ...query, products };
};

const promoSlides = [
  {
    id: 'promo-antigripales',
    title: 'Semana del Resfriado',
    subtitle: 'Hasta -20% en antigripales y vitamina C',
    ctaText: 'Ver selección',
    ctaLink: '/pharmacy/catalog',
    badge: 'Oferta',
  },
  {
    id: 'promo-cuidado-personal',
    title: 'Cuidado Personal',
    subtitle: 'Gel antibacterial y mascarillas con descuentos',
    ctaText: 'Explorar',
    ctaLink: '/pharmacy/catalog',
    badge: 'Especial',
  },
  {
    id: 'promo-alergias',
    title: 'Temporada de Alergias',
    subtitle: 'Aprovecha -15% en antihistamínicos',
    ctaText: 'Comprar ahora',
    ctaLink: '/pharmacy/catalog',
    badge: 'Top ventas',
  },
];

const useOffers = () => {
  const q = useQuery({
    queryKey: ['ecommerce', 'offers'],
    queryFn: () => ecommerceService.getOffers(),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const offers: OfferSlide[] = Array.isArray(q.data) ? (q.data as OfferSlide[]) : [];
  return { ...q, offers };
};

const PharmacyCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [params, setParams] = useSearchParams();
  const selectedCategoryId = params.get('category') ? Number(params.get('category')) : null;
  const { products, isLoading, error } = useProducts(selectedCategoryId);
  const { offers } = useOffers();
  const filtersModal = useModal(false);
  const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN as string) ?? 'http://localhost:8000';
  const [availableMap, setAvailableMap] = React.useState<Record<number, number>>({});

  // Estado local para carrito y favoritos (demostración)
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesData, setFavoritesData] = useState<{ id: number; product: number }[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orders, setOrders] = React.useState<Array<{ id: number; status: string; total: number; currency?: string; created_at: string }>>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const initRef = React.useRef(false);

  const debugAuth = (label?: string) => {
    try {
      console.log('[Catalog Debug]', label ?? 'state', { isAuthenticated, user });
      (window as any).__CATALOG_DEBUG = { isAuthenticated, user };
    } catch (e) {}
  };

  React.useEffect(() => {
    debugAuth('useEffect:init');
    if (initRef.current) return;
    initRef.current = true;
    if (isAuthenticated) {
      ecommerceService.getFavorites().then((list) => {
        setFavoritesData(list.map((f: any) => ({ id: f.id, product: Number(f.product) })));
        setFavorites(list.map((f: any) => Number(f.product)));
      }).catch(() => {});
      setOrdersLoading(true);
      ecommerceService.getOrders()
        .then((list) => setOrders(list as any))
        .catch(() => setOrdersError('No se pudo cargar tu historial'))
        .finally(() => setOrdersLoading(false));
      // Rehidratar contador del carrito desde el backend al recargar
      ecommerceService.getCart()
        .then((c: any) => {
          const items = Array.isArray(c?.items) ? c.items : [];
          setCart(items.map((it: any) => ({ id: Number(it.product), qty: Number(it.quantity) })));
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    const run = async () => {
      try {
        const entries = await Promise.all(products.map(async (p) => {
          try {
            const inv = await ecommerceService.getInventory(p.id);
            const available = Math.max(0, Number(inv.stock) - Number(inv.reserved_stock));
            return [p.id, available] as const;
          } catch {
            return [p.id, undefined] as const;
          }
        }));
        const next: Record<number, number> = {};
        entries.forEach(([id, avail]) => { if (typeof avail === 'number') next[id] = avail; });
        setAvailableMap(next);
      } catch {}
    };
    if (products.length) run();
  }, [products]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const requireAuth = (actionLabel?: string) => {
    debugAuth('requireAuth');
    toast((t) => (
      <span>
        {actionLabel ? `${actionLabel} requiere iniciar sesión.` : 'Esta acción requiere iniciar sesión.'}
        <button
          onClick={() => {
            toast.dismiss(t.id);
            navigate('/pharmacy/login', { state: { returnTo: '/pharmacy/catalog' } });
          }}
          style={{ marginLeft: 8, color: 'var(--primary)' }}
        >
          Iniciar sesión
        </button>
      </span>
    ));
  };

  const addToCart = async (productId: number) => {
    debugAuth('addToCart');
    if (!isAuthenticated) {
      requireAuth('Agregar al carrito');
      return;
    }
    try {
      const inv = await ecommerceService.getInventory(productId);
      const available = Math.max(0, Number(inv.stock) - Number(inv.reserved_stock));
      if (available <= 0) {
        toast.error('Producto agotado');
        return;
      }
      await ecommerceService.addCartItem(productId, 1);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'No se pudo agregar al carrito';
      toast.error(String(msg));
      return;
    }
    setCart((prev) => {
      const existing = prev.find((p) => p.id === productId);
      if (existing) {
        return prev.map((p) => (p.id === productId ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: productId, qty: 1 }];
    });
    toast.success('Agregado al carrito');
  };

  const toggleFavorite = (productId: number) => {
    debugAuth('toggleFavorite');
    if (!isAuthenticated) {
      requireAuth('Favoritos');
      return;
    }
    const fav = favoritesData.find((f) => f.product === productId);
    if (fav) {
      ecommerceService.removeFavorite(fav.id).catch(() => {});
      setFavorites((prev) => prev.filter((id) => id !== productId));
      setFavoritesData((prev) => prev.filter((f) => f.product !== productId));
    } else {
      ecommerceService.addFavorite(productId).then((created: any) => {
        if (created?.id) {
          setFavoritesData((prev) => [...prev, { id: created.id, product: productId }]);
        }
      }).catch(() => {});
      setFavorites((prev) => [...prev, productId]);
    }
    toast.success('Actualizado en favoritos');
  };

  const buyNow = async (productId: number) => {
    if (!isAuthenticated) {
      requireAuth('Comprar ahora');
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }
    try {
      await ecommerceService.clearCart();
    } catch {}
    try {
      const inv = await ecommerceService.getInventory(productId);
      const available = Math.max(0, Number(inv.stock) - Number(inv.reserved_stock));
      if (available <= 0) {
        toast.error('Producto agotado');
        return;
      }
      await ecommerceService.addCartItem(productId, 1);
    } catch {}
    setCart([{ id: productId, qty: 1 }]);
    setCheckoutOpen(true);
  };

  const handleLogout = async () => {
    try {
      if (isAuthenticated) {
        try { await ecommerceService.clearCart(); } catch {}
      }
      await logout();
      setCart([]);
      setFavorites([]);
    } catch (error) {
      console.error('Error al cerrar sesión desde farmacia:', error);
    }
  };

  const openCheckout = () => {
    debugAuth('openCheckout');
    if (!isAuthenticated) {
      requireAuth('Pagar');
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      {/* Header autenticado */}
      <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-white text-sm font-bold">FM</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                Catálogo — Farmacia MediCitas
              </h1>
              {isAuthenticated ? (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Sesión activa {user?.firstName ? `— Hola, ${user.firstName}` : ''}
                </p>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Estás explorando como invitado. Inicia sesión para comprar.
                </p>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/pharmacy">
              <button className="btn-outline px-3 py-2 rounded-lg font-medium transition-colors">← Información</button>
            </Link>
            {isAuthenticated && (
              <Link to="/pharmacy/orders">
                <button className="btn-outline px-3 py-2 rounded-lg font-medium transition-colors">Historial</button>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--text-secondary)' }}>shopping_cart</span>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Carrito</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)' }}>{cartCount}</span>
            </div>
            {/* Autenticación: mostrar login/register o logout */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="btn-outline px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-icons" style={{ fontSize: 18 }}>logout</span>
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="btn-outline px-3 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => navigate('/pharmacy/login', { state: { returnTo: '/pharmacy/catalog' } })}
                >
                  Iniciar Sesión
                </button>
                <button
                  className="btn-primary px-3 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => navigate('/pharmacy/register', { state: { returnTo: '/pharmacy/catalog' } })}
                >
                  Crear Cuenta
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Carrusel de promociones */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section aria-label="Promociones y ofertas de la semana" className="mb-8">
          <div className="relative rounded-2xl overflow-hidden border shadow-sm group" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary)' }}>
            {/* Solo mostramos el primer slide de forma estática en esta vista autenticada */}
            <div style={{ color: 'var(--text-on-primary)' }} className="px-6 sm:px-10 py-10 sm:py-12">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary), black 15%)',
                    color: 'var(--text-on-primary-90)',
                    border: '1px solid color-mix(in srgb, var(--primary), black 35%)',
                  }}
                >
                  {promoSlides[0].badge}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-on-primary-90)' }}>
                  Promociones exclusivas para cuentas activas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--text-on-primary)' }}>
                    {(offers[0]?.title || promoSlides[0].title)}
                  </h2>
                  <p className="text-sm sm:text-base mb-5" style={{ color: 'var(--text-on-primary-90)' }}>
                    {(offers[0]?.subtitle || promoSlides[0].subtitle)}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to={(offers[0]?.ctaLink || promoSlides[0].ctaLink)}>
                      <button className="btn-white px-4 py-2 rounded-lg font-medium transition-colors" style={{ color: 'var(--primary)' }}>
                        {(offers[0]?.ctaText || promoSlides[0].ctaText)}
                      </button>
                    </Link>
                    <Link to="/pharmacy/offers">
                      <button className="btn-outline-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Ver productos en oferta
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="h-40 sm:h-48 rounded-xl" style={{
                  backgroundImage: 'radial-gradient(ellipse at top left, color-mix(in srgb, var(--primary), white 20%) 0%, color-mix(in srgb, var(--primary), black 20%) 100%)',
                  opacity: 0.25,
                }} />
              </div>
            </div>
          </div>
        </section>

      {/* Listado de productos con acciones */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-light" style={{ color: 'var(--text-primary)' }}>
          Catálogo completo
        </h2>
        <Link to="/pharmacy">
          <button className="btn-outline px-4 py-2 rounded-lg font-medium transition-colors">← Volver</button>
        </Link>
      </div>

      <CategoriesNav
        selectedId={selectedCategoryId}
        onSelect={(id) => {
          const next = new URLSearchParams(params);
          if (id === null) next.delete('category'); else next.set('category', String(id));
          setParams(next, { replace: true });
        }}
        showAll
        className="mb-4"
      />

      <div className="sm:hidden flex justify-end mb-4">
        <button className="btn-outline px-3 py-2 rounded-md" onClick={filtersModal.openModal}>Filtrar</button>
      </div>

      <FiltersDrawer
        isOpen={filtersModal.isOpen}
        onClose={filtersModal.closeModal}
        selectedId={selectedCategoryId}
        onApply={(id) => {
          const next = new URLSearchParams(params);
          if (id === null) next.delete('category'); else next.set('category', String(id));
          setParams(next, { replace: true });
        }}
      />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block">
            <CategoriesSidebar
              selectedId={selectedCategoryId}
              onSelect={(id) => {
                const next = new URLSearchParams(params);
                if (id === null) next.delete('category'); else next.set('category', String(id));
                setParams(next, { replace: true });
              }}
            />
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isLoading && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse" style={{ border: '1px solid var(--border)' }}>
                  <div className="w-full h-32 mb-4 rounded-lg" style={{ backgroundColor: 'var(--primary)', opacity: 0.12 }} />
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </>
          )}
          {error && (
            <div className="col-span-full text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No se pudo cargar el catálogo.</p>
            </div>
          )}
          {products.map((p) => {
            const isFav = favorites.includes(p.id);
            const displayName = (p.name && p.name.trim()) ? p.name : `Producto #${p.id}`;
            const basePrice = Number(p.price?.amount ?? 0);
            const salePrice = Number(p.price?.sale_amount ?? basePrice);
            const hasDiscount = p.price?.sale_amount != null && (p.price?.sale_active === true) && salePrice < basePrice && basePrice > 0;
            const discountPct = hasDiscount ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;
            return (
              <div key={p.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition" style={{ border: '1px solid var(--border)' }}>
                <div className="group w-full h-48 sm:h-56 mb-4 rounded-lg flex items-center justify-end relative overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'var(--primary)', opacity: 0.08, display: imgLoaded[p.id] ? 'none' : 'block' }}
                  />
                  {p.images?.[0]?.image ? (
                    <img
                      src={p.images[0].image.startsWith('http') ? p.images[0].image : `${backendOrigin}${p.images[0].image}`}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      onLoad={() => setImgLoaded((prev) => ({ ...prev, [p.id]: true }))}
                    />
                  ) : null}
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-20 pointer-events-none" style={{ backgroundColor: 'black' }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="material-icons transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-on-primary)' }}>zoom_in</span>
                  </div>
                  {!isAuthenticated && (
                    <div className="absolute left-3 top-3 flex items-center gap-1 text-xs px-2 py-1 rounded-md"
                         style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <span className="material-icons" style={{ fontSize: 16 }}>lock</span>
                      <span>Inicia sesión para usar funciones</span>
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute pointer-events-none" style={{ top: 0, left: 0, zIndex: 2 }}>
                      <div style={{ position: 'absolute', top: 12, left: -28, width: 120, transform: 'rotate(-45deg)' }}>
                        <div className="text-xs font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)', padding: '4px 0', textAlign: 'center', borderRadius: 3 }}>
                          En oferta {discountPct ? `-${discountPct}%` : ''}
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    aria-pressed={isFav}
                    onClick={() => (isAuthenticated ? toggleFavorite(p.id) : requireAuth('Favoritos'))}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: isFav ? '1px solid var(--primary)' : '1px solid var(--border)',
                      zIndex: 2
                    }}
                  >
                    <span className="material-icons" style={{ color: isFav ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {isFav ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>
                <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{displayName}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: (p.price?.currency ?? 'USD') }).format(hasDiscount ? salePrice : basePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm line-through" style={{ color: 'var(--text-secondary)' }}>
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: (p.price?.currency ?? 'USD') }).format(basePrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => { const avail = availableMap[p.id]; const agotado = typeof avail === 'number' && avail <= 0; return (
                      <button
                        className="btn-outline px-3 py-2 rounded-md text-sm"
                        onClick={() => (isAuthenticated ? addToCart(p.id) : requireAuth('Agregar al carrito'))}
                        aria-disabled={!isAuthenticated || agotado}
                        style={{ opacity: (!isAuthenticated || agotado) ? 0.6 : 1, cursor: (!isAuthenticated || agotado) ? 'not-allowed' : 'pointer' }}
                      >
                        {agotado ? 'Agotado' : 'Agregar'}
                      </button>
                    )})()}
                    {(() => { const avail = availableMap[p.id]; const agotado = typeof avail === 'number' && avail <= 0; return (
                      <button
                        className="btn-primary px-3 py-2 rounded-md text-sm"
                        onClick={() => (isAuthenticated ? buyNow(p.id) : requireAuth('Comprar ahora'))}
                        aria-disabled={!isAuthenticated || agotado}
                        style={{ opacity: (!isAuthenticated || agotado) ? 0.6 : 1, cursor: (!isAuthenticated || agotado) ? 'not-allowed' : 'pointer' }}
                      >
                        Comprar ahora
                      </button>
                    )})()}
                  </div>
                </div>
                {hasDiscount && (
                  <div className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md mb-3"
                       style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                    <span className="material-icons" style={{ fontSize: 14 }}>local_offer</span>
                    <span>En oferta</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Link to={`/pharmacy/product/${p.id}`}>
                    <button className="btn-secondary px-3 py-2 rounded-md text-sm">Ver detalles</button>
                  </Link>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {isAuthenticated ? (isFav ? 'En favoritos' : 'Añade a favoritos para guardar') : 'Inicia sesión para guardar en favoritos'}
                  </span>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        <div className="mt-10 text-center">
          {isAuthenticated ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ¡Disfruta de todas las funciones! Tu sesión está activa.
            </p>
          ) : (
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg"
                 style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--text-secondary)' }}>info</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Para comprar o guardar favoritos, inicia sesión o crea tu cuenta.
              </p>
              <button
                className="btn-primary px-3 py-2 rounded-md text-sm"
                onClick={() => navigate('/pharmacy/login', { state: { returnTo: '/pharmacy/catalog' } })}
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <section aria-label="Historial de compra" className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-light" style={{ color: 'var(--text-primary)' }}>Historial de compra</h3>
              <Link to="/pharmacy/orders">
                <button className="btn-outline px-3 py-2 rounded-md text-sm">Ver todo</button>
              </Link>
            </div>
            {ordersLoading && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando historial…</p>
            )}
            {ordersError && (
              <p className="text-sm text-red-600">{ordersError}</p>
            )}
            {!ordersLoading && !ordersError && (
              <div className="space-y-3">
                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Orden #{o.id}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Estado: {o.status}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Fecha: {new Date(o.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: o.currency || 'USD' }).format(Number(o.total))}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aún no tienes compras registradas.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
        {isAuthenticated && cartCount > 0 && (
          <div className="mt-4 flex justify-center">
            <button className="btn-primary px-4 py-2 rounded-lg" onClick={openCheckout}>Pagar carrito</button>
          </div>
        )}
      </main>

      
      {/* Footer */}
      <footer className="bg-white py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Vista autenticada — Funciones habilitadas.
          </p>
        </div>
      </footer>

      {/* Botón flotante para agendar nueva cita (solo clientes) */}
      {isAuthenticated && <FloatingAppointmentCTA />}
      {isAuthenticated && (
        <div
          className="fixed z-50 flex flex-col items-end gap-3"
          style={{ bottom: 24, right: 24 }}
        >
          <button
            onClick={() => setChatOpen(true)}
            className="rounded-full shadow-lg flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--primary), white 70%))',
              color: 'var(--primary)',
              border: '1px solid var(--border)'
            }}
            aria-label="Abrir asistente"
          >
            <span className="material-icons" style={{ fontSize: 24 }}>smart_toy</span>
          </button>
          <button
            onClick={() => navigate('/pharmacy/cart')}
            className="rounded-full shadow-lg flex items-center justify-center relative"
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary), black 25%))',
              color: 'var(--text-on-primary)'
            }}
            aria-label="Ir al carrito"
          >
            <span className="material-icons" style={{ fontSize: 24 }}>shopping_cart</span>
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      )}
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} onSuccess={(orderId) => {
        toast.success('Pago confirmado');
        setCart([]);
        navigate('/pharmacy/success');
      }} />
      <ChatbotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default PharmacyCatalogPage;
