import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService, type Product } from '../../services/ecommerceService';

const useProducts = () => {
  const query = useQuery({
    queryKey: ['ecommerce', 'products', 'offers'],
    queryFn: () => ecommerceService.getProducts(),
    staleTime: 2 * 60 * 1000,
  });
  const all: Product[] = Array.isArray(query.data)
    ? (query.data as unknown as Product[])
    : (query.data?.results ?? []);
  const products = all.filter(p => p?.price?.sale_amount != null);
  return { ...query, products } as const;
};

const OffersPage: React.FC = () => {
  const { products, isLoading, error } = useProducts();
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN as string) ?? 'http://localhost:8000';

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-white text-sm font-bold">FM</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                Ofertas — Black Friday
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Productos con precio rebajado activos
              </p>
            </div>
          </div>
          <Link to="/pharmacy/catalog">
            <button className="btn-outline px-3 py-2 rounded-lg font-medium transition-colors">← Catálogo</button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-6">
          <div className="rounded-2xl p-6" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light" style={{ color: 'var(--text-primary)' }}>Productos en oferta</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Descuentos disponibles por tiempo limitado</p>
              </div>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No se pudo cargar las ofertas.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const img = p.images?.[0]?.image;
              const src = img ? (img.startsWith('http') ? img : `${backendOrigin}${img}`) : null;
              const base = Number(p.price?.amount ?? 0);
              const sale = Number(p.price?.sale_amount ?? base);
              const hasDiscount = p.price?.sale_amount != null && sale < base && base > 0;
              const discountPct = hasDiscount ? Math.round(((base - sale) / base) * 100) : 0;
              const displayName = (p.name && p.name.trim()) ? p.name : ((p.title && String(p.title).trim()) ? String(p.title) : `Producto #${p.id}`);
              return (
                <div key={p.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition" style={{ border: '1px solid var(--border)' }}>
                  <div className="group w-full h-48 sm:h-56 mb-4 rounded-lg relative overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
                    <div className="absolute inset-0" style={{ backgroundColor: 'var(--primary)', opacity: 0.08, display: imgLoaded[p.id] ? 'none' : 'block' }} />
                    {src ? (
                      <img
                        src={src}
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
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: (p.price?.currency ?? 'USD') }).format(hasDiscount ? sale : base)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm line-through" style={{ color: 'var(--text-secondary)' }}>
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: (p.price?.currency ?? 'USD') }).format(base)}
                        </span>
                      )}
                    </div>
                    <Link to={`/pharmacy/product/${p.id}`}>
                      <button className="btn-secondary px-3 py-2 rounded-md text-sm">Ver detalles</button>
                    </Link>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No hay productos en oferta.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OffersPage;
