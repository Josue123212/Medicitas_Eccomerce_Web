import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ecommerceAdminService } from '../../../services/ecommerceAdminService';
import type { AdminPrice } from '../../../services/ecommerceAdminService';
import { Pencil, Save } from 'lucide-react';

const AdminPricesPage: React.FC = () => {
  const [items, setItems] = useState<AdminPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<number, Partial<AdminPrice>>>({});
  // Mapa id -> nombre para mostrar el nombre del producto en la tabla
  const [productMap, setProductMap] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await ecommerceAdminService.listPrices();
      const list = Array.isArray(res) ? res : (res.results ?? []);
      setItems(list);
    } catch (err: any) {
      setError('Error al cargar precios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar precios y productos (para mapear id -> nombre)
  useEffect(() => {
    load();
    (async () => {
      try {
        const productsRes = await ecommerceAdminService.listProducts();
        const products = Array.isArray(productsRes) ? productsRes : (productsRes?.results ?? []);
        const map: Record<number, string> = {};
        for (const pr of products as any[]) {
          if (pr && typeof pr.id === 'number') map[pr.id] = String(pr.name ?? `Producto #${pr.id}`);
        }
        setProductMap(map);
      } catch (err) {
        // Silencioso: si falla, se mostrará fallback con el ID
      }
    })();
  }, []);

  const startEdit = (p: AdminPrice) => {
    setEditing(prev => ({ ...prev, [p.id]: { ...p } }));
  };

  const updateField = (id: number, field: keyof AdminPrice, value: any) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const save = async (id: number) => {
    const data = editing[id];
    if (!data) return;
    setLoading(true); setError(null);
    try {
      await ecommerceAdminService.updatePrice(id, {
        product_id: data.product_id!,
        currency: String(data.currency ?? 'USD'),
        amount: Number(data.amount ?? 0),
        sale_amount: data.sale_amount == null || data.sale_amount === '' ? null : Number(data.sale_amount),
        is_active: !!data.is_active,
        valid_from: String(data.valid_from ?? new Date().toISOString()),
      });
      await load();
      setEditing(prev => { const c = { ...prev }; delete c[id]; return c; });
    } catch (err: any) {
      setError('No se pudo guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Precios</h1>
        {error && <div className="p-3 rounded bg-red-50 text-red-700">{error}</div>}

        <div className="bg-white border rounded overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Producto</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Moneda</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Precio</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Oferta</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Activo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(p => {
                const isEditing = !!editing[p.id];
                const e = editing[p.id] || {};
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">
                      {/* Mostrar nombre del producto, con fallback al ID */}
                      {productMap[p.product_id] ?? `#${p.product_id}`}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input className="w-24 border rounded px-2 py-1" value={(e.currency as any) ?? p.currency} onChange={ev => updateField(p.id, 'currency', ev.target.value)} />
                      ) : (
                        p.currency
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-24 border rounded px-2 py-1" value={e.amount as any ?? p.amount} onChange={ev => updateField(p.id, 'amount', Number(ev.target.value))} />
                      ) : (
                        p.amount
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-24 border rounded px-2 py-1" value={e.sale_amount as any ?? (p.sale_amount ?? '')} onChange={ev => updateField(p.id, 'sale_amount', ev.target.value)} />
                      ) : (
                        p.sale_amount ?? '—'
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input type="checkbox" checked={(e.is_active as boolean | undefined) ?? p.is_active} onChange={ev => updateField(p.id, 'is_active', ev.target.checked)} />
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.is_active ? 'Sí' : 'No'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <button className="inline-flex items-center px-2 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700" onClick={() => save(p.id)} disabled={loading}>
                          <Save className="h-4 w-4 mr-1" /> Guardar
                        </button>
                      ) : (
                        <button className="inline-flex items-center px-2 py-1 text-sm rounded bg-amber-50 text-amber-700 hover:bg-amber-100" onClick={() => startEdit(p)}>
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPricesPage;
