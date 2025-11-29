import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService, type Product } from '../../services/ecommerceService';
import CategoriesNav from '../../components/pharmacy/CategoriesNav';
import { useSearchParams } from 'react-router-dom';
import { useModal } from '../../components/ui/Modal';
import FiltersDrawer from '../../components/pharmacy/FiltersDrawer';
import CategoriesSidebar from '../../components/pharmacy/CategoriesSidebar';

/**
 * 🛒 Catálogo (Invitado) - Farmacia MediCitas
 * Muestra un listado básico de productos accesible sin autenticación.
 */
const useProducts = (categoryId: number | null) => {
  const query = useQuery({
    queryKey: ['ecommerce', 'products', 'guest', categoryId ?? 'all'],
    queryFn: () => ecommerceService.getProducts(categoryId ? { category: categoryId } : undefined),
    staleTime: 2 * 60 * 1000,
  });
  const products: Product[] = Array.isArray(query.data)
    ? (query.data as unknown as Product[])
    : (query.data?.results ?? []);
  return { ...query, products };
};

// Slides de promoción/ofertas de la semana
const promoSlides = [
  {
    id: 'promo-antigripales',
    title: 'Semana del Resfriado',
    subtitle: 'Hasta -20% en antigripales y vitamina C',
    ctaText: 'Ver selección',
    ctaLink: '/pharmacy/catalog?promo=resfriado',
    badge: 'Oferta',
  },
  {
    id: 'promo-cuidado-personal',
    title: 'Cuidado Personal',
    subtitle: 'Gel antibacterial y mascarillas con descuentos',
    ctaText: 'Explorar',
    ctaLink: '/pharmacy/catalog?promo=cuidado',
    badge: 'Especial',
  },
  {
    id: 'promo-alergias',
    title: 'Temporada de Alergias',
    subtitle: 'Aprovecha -15% en antihistamínicos',
    ctaText: 'Comprar ahora',
    ctaLink: '/pharmacy/catalog?promo=alergias',
    badge: 'Top ventas',
  },
];

const GuestCatalogPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [params, setParams] = useSearchParams();
  const selectedCategoryId = params.get('category') ? Number(params.get('category')) : null;
  const { products, isLoading, error } = useProducts(selectedCategoryId);
  const offersQuery = useQuery({ queryKey: ['ecommerce', 'offers'], queryFn: () => ecommerceService.getOffers(), staleTime: 2 * 60 * 1000 });
  const offers: OfferSlide[] = Array.isArray(offersQuery.data) ? (offersQuery.data as OfferSlide[]) : [];
  const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN as string) ?? 'http://localhost:8000';
  const filtersModal = useModal(false);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const goPrev = () => setCurrent((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  const goNext = () => setCurrent((prev) => (prev + 1) % promoSlides.length);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      {/* Header con acceso */}
      <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-white text-sm font-bold">FM</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
              Catálogo — Farmacia MediCitas
            </h1>
          </div>
          <nav className="flex items-center space-x-3">
            <Link to="/pharmacy/login">
              <button className="btn-outline px-4 py-2 rounded-lg font-medium transition-colors">Iniciar Sesión</button>
            </Link>
            <Link to="/pharmacy/register">
              <button className="btn-primary px-4 py-2 rounded-lg font-medium transition-colors">Crear Cuenta</button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Carrusel de promociones/ofertas de la semana */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section aria-label="Promociones y ofertas de la semana" className="mb-8">
          <div
            className="relative rounded-2xl overflow-hidden border shadow-sm group"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary)' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Slide actual */}
            {(offers && offers.length ? (offers as any[]) : promoSlides).map((slide: any, idx: number) => (
              <div
                key={slide.id}
                className={`transition-opacity duration-500 ${idx === current ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                style={{ color: 'var(--text-on-primary)' }}
              >
                <div className="px-6 sm:px-10 py-10 sm:py-12">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--primary), black 15%)',
                        color: 'var(--text-on-primary-90)',
                        border: '1px solid color-mix(in srgb, var(--primary), black 35%)',
                      }}
                    >
                      {slide.badge}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-on-primary-90)' }}>
                      Promociones actualizadas semanalmente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--text-on-primary)' }}>
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-sm sm:text-base mb-5" style={{ color: 'var(--text-on-primary-90)' }}>
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <Link to={(slide.ctaLink || (slide as any).cta_link || '/pharmacy/catalog')}>
                          <button
                            className="btn-white px-4 py-2 rounded-lg font-medium transition-colors"
                            style={{ color: 'var(--primary)' }}
                          >
                            {slide.ctaText || (slide as any).cta_text || 'Ver catálogo'}
                          </button>
                        </Link>
                        <Link to="/pharmacy/offers">
                          <button className="btn-outline-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Ver productos en oferta
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Visual decorativo */}
                    <div className="h-40 sm:h-48 rounded-xl" style={{
                      backgroundImage: 'radial-gradient(ellipse at top left, color-mix(in srgb, var(--primary), white 20%) 0%, color-mix(in srgb, var(--primary), black 20%) 100%)',
                      opacity: 0.25,
                    }} />
                  </div>
                </div>
              </div>
            ))}

            {/* Controles */}
            <button
              aria-label="Anterior"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--primary), black 25%)',
                border: '1px solid color-mix(in srgb, var(--primary), black 40%)',
                color: 'var(--text-on-primary)',
              }}
            >
              <span className="material-icons">chevron_left</span>
            </button>
            <button
              aria-label="Siguiente"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--primary), black 25%)',
                border: '1px solid color-mix(in srgb, var(--primary), black 40%)',
                color: 'var(--text-on-primary)',
              }}
            >
              <span className="material-icons">chevron_right</span>
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
              {promoSlides.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Ir al slide ${idx + 1}`}
                  onClick={() => setCurrent(idx)}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: idx === current ? 'var(--text-on-primary)' : 'color-mix(in srgb, var(--primary), black 45%)',
                    border: '1px solid color-mix(in srgb, var(--primary), black 55%)',
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Listado de productos */}
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-light" style={{ color: 'var(--text-primary)' }}>
            Explora como invitado
          </h2>
          <Link to="/pharmacy">
            <button className="btn-outline px-4 py-2 rounded-lg font-medium transition-colors">← Volver</button>
          </Link>
        </div>

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
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse" style={{ border: '1px solid var(--border)' }}>
                  <div className="w-full h-48 sm:h-56 mb-4 rounded-lg" style={{ backgroundColor: 'var(--primary)', opacity: 0.12 }} />
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
            const displayName = (p.name && p.name.trim()) ? p.name : ((p.title && String(p.title).trim()) ? String(p.title) : `Producto #${p.id}`);
            const basePrice = Number(p.price?.amount ?? 0);
            const salePrice = Number(p.price?.sale_amount ?? basePrice);
            const hasDiscount = p.price?.sale_amount != null && salePrice < basePrice && basePrice > 0;
            const discountPct = hasDiscount ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;
            return (
              <div key={p.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition" style={{ border: '1px solid var(--border)' }}>
              <div className="group w-full h-48 sm:h-56 mb-4 rounded-lg overflow-hidden relative" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="absolute inset-0" style={{ backgroundColor: 'var(--primary)', opacity: 0.08, display: imgLoaded[p.id] ? 'none' : 'block' }} />
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
                {hasDiscount && (
                  <div className="absolute pointer-events-none" style={{ top: 0, left: 0, zIndex: 2 }}>
                    <div style={{ position: 'absolute', top: 12, left: -28, width: 120, transform: 'rotate(-45deg)' }}>
                      <div className="text-xs font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)', padding: '4px 0', textAlign: 'center', borderRadius: 3 }}>
                        En oferta {discountPct ? `-${discountPct}%` : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{displayName}</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
              <div className="flex items-center justify-between">
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
                <button className="btn-primary px-3 py-2 rounded-md text-sm">Ver detalles</button>
              </div>
            </div>
          )})}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Para comprar necesitarás iniciar sesión o crear tu cuenta.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Vista de invitado — Algunas funciones pueden requerir autenticación.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GuestCatalogPage;
