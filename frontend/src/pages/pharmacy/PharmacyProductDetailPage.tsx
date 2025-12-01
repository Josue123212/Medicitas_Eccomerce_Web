import React, { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ecommerceService, type Product } from '../../services/ecommerceService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import CheckoutModal from '../../components/pharmacy/CheckoutModal'

const useProduct = (id: number) => {
  const q = useQuery({
    queryKey: ['ecommerce', 'product', id],
    queryFn: () => ecommerceService.getProduct(id),
    staleTime: 2 * 60 * 1000,
  })
  return q
}

const useInventory = (productId: number) => {
  const q = useQuery({
    queryKey: ['ecommerce', 'inventory', productId],
    queryFn: () => ecommerceService.getInventory(productId),
    staleTime: 60 * 1000,
  })
  return q
}

const Badge: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = 'var(--primary)', children }) => (
  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--surface)', border: `1px solid ${color}`, color }}>{children}</span>
)

const QuantityStepper: React.FC<{ value: number; onChange: (n: number) => void; min?: number; max?: number }> = ({ value, onChange, min = 1, max = 10 }) => (
  <div className="inline-flex items-center gap-2" role="group" aria-label="Cantidad">
    <button className="btn-outline px-2 py-1 rounded-md" aria-label="Reducir" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
    <span role="spinbutton" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} className="px-2 py-1" style={{ border: '1px solid var(--border)', borderRadius: 6 }}>{value}</span>
    <button className="btn-outline px-2 py-1 rounded-md" aria-label="Aumentar" onClick={() => onChange(Math.min(max, value + 1))}>＋</button>
  </div>
)

const PharmacyProductDetailPage: React.FC = () => {
  const { id } = useParams()
  const productId = Number(id)
  const { data: product, isLoading, error } = useProduct(productId)
  const { data: inventory } = useInventory(productId)
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = React.useState<{ id: number; qty: number }[]>([])
  const [qty, setQty] = React.useState(1)
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const navigate = useNavigate()
  const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN as string) ?? 'http://localhost:8000'
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast("Inicia sesión para comprar")
      navigate('/pharmacy/login', { state: { returnTo: `/pharmacy/product/${productId}` } })
      return
    }
    try {
      await ecommerceService.addCartItem(productId, qty)
      toast.success('Agregado al carrito')
      setCart((prev) => {
        const existing = prev.find((p) => p.id === productId)
        if (existing) {
          return prev.map((p) => (p.id === productId ? { ...p, qty: p.qty + qty } : p))
        }
        return [...prev, { id: productId, qty }]
      })
    } catch {
      toast.error('No se pudo agregar al carrito')
    }
  }

  const buyNow = async () => {
    await addToCart()
    if (isAuthenticated) setCheckoutOpen(true)
  }

  const basePrice = Number(product?.price?.amount ?? 0)
  const salePrice = Number(product?.price?.sale_amount ?? basePrice)
  const hasDiscount = product?.price?.sale_amount != null && salePrice < basePrice && basePrice > 0
  const discountPct = hasDiscount ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0

  React.useEffect(() => {
    if (isAuthenticated) {
      ecommerceService.getCart()
        .then((c: any) => {
          const items = Array.isArray(c?.items) ? c.items : []
          setCart(items.map((it: any) => ({ id: Number(it.product), qty: Number(it.quantity) })))
        })
        .catch(() => {})
    } else {
      setCart([])
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Migas de pan" className="text-sm">
            <Link to="/pharmacy" className="text-primary-600">Farmacia</Link>
            <span className="mx-2" aria-hidden> / </span>
            <Link to="/pharmacy/catalog" className="text-primary-600">Catálogo</Link>
            <span className="mx-2" aria-hidden> / </span>
            <span style={{ color: 'var(--text-secondary)' }}>{product?.name ?? `Producto #${productId}`}</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)', height: 420 }} />
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)', height: 420 }} />
          </div>
        )}
        {error && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No se pudo cargar el producto.</p>
        )}
        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galería */}
            <section aria-label="Galería del producto" className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)' }}>
              <div className="w-full h-64 sm:h-72 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--surface)', position: 'relative' }}>
                {product.images?.[0]?.image ? (
                  <img
                    src={product.images[0].image.startsWith('http') ? product.images[0].image : `${backendOrigin}${product.images[0].image}`}
                    alt={product.name}
                    className="max-h-full w-auto object-contain"
                  />
                ) : (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sin imagen</div>
                )}
                {hasDiscount && (
                  <div className="absolute" style={{ top: 0, left: 0, zIndex: 2 }}>
                    <div style={{ position: 'absolute', top: 12, left: -28, width: 120, transform: 'rotate(-45deg)' }}>
                      <div className="text-xs font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)', padding: '4px 0', textAlign: 'center', borderRadius: 3 }}>
                        En oferta {discountPct ? `-${discountPct}%` : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                {product.images?.slice(0, 5).map((img) => (
                  <button key={img.id} className="w-16 h-16 rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }} aria-label="Miniatura">
                    <img src={img.image.startsWith('http') ? img.image : `${backendOrigin}${img.image}`} alt={`${product.name} miniatura`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </section>

            {/* Panel de información y acciones */}
            <section aria-label="Información del producto" className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid var(--border)' }}>
              <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{product.name}</h1>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
              <div className="flex items-center gap-2 mb-4">
                {inventory?.stock != null && (
                  <Badge color={inventory.stock > 0 ? 'var(--primary)' : 'var(--text-secondary)'}>
                    {inventory.stock > 0 ? 'En stock' : 'Agotado'}
                  </Badge>
                )}
                {inventory && inventory.min_stock > 0 && (inventory.stock - inventory.reserved_stock) <= inventory.min_stock && (
                  <Badge color={'var(--warning)'}>Baja disponibilidad</Badge>
                )}
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: (product.price?.currency ?? 'USD') }).format(hasDiscount ? salePrice : basePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-base line-through" style={{ color: 'var(--text-secondary)' }}>
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: (product.price?.currency ?? 'USD') }).format(basePrice)}
                  </span>
                )}
              </div>

              {/* Cantidad y CTAs */}
              <div className="flex items-center gap-4 mb-6">
                <QuantityStepper value={qty} onChange={setQty} min={1} max={Math.max(1, Number(inventory?.stock ?? 10))} />
                <button className="btn-outline px-4 py-2 rounded-lg" onClick={addToCart}>Agregar al carrito</button>
                <button className="btn-primary px-4 py-2 rounded-lg" onClick={buyNow}>Comprar ahora</button>
              </div>

              {/* Envío */}
              <div className="mb-6">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Entrega estimada: 24–48h. Devoluciones dentro de 7 días.</p>
              </div>

              {/* Pestañas básicas */}
              <div role="tablist" aria-label="Detalles" className="flex gap-2 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
                <button role="tab" aria-selected={true} className="px-3 py-2 text-sm" style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--primary)' }}>Descripción</button>
                <button role="tab" aria-selected={false} className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Composición</button>
                <button role="tab" aria-selected={false} className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Indicaciones</button>
              </div>
              <div role="tabpanel" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {product.description || 'Información no disponible.'}
              </div>
            </section>
          </div>
        )}
      </main>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} onSuccess={(orderId) => {
        toast.success('Pago confirmado')
        navigate('/pharmacy/success')
      }} />

      {isAuthenticated && (
        <div
          className="fixed z-50 flex flex-col items-end gap-3"
          style={{ bottom: 24, right: 24 }}
        >
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
    </div>
  )
}

export default PharmacyProductDetailPage
