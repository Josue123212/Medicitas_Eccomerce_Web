import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ecommerceAdminService } from '../../../services/ecommerceAdminService';
import type { AdminInventory } from '../../../services/ecommerceAdminService';
import { Pencil, Save } from 'lucide-react';

const AdminInventoryPage: React.FC = () => {
  const [items, setItems] = useState<AdminInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<number, Partial<AdminInventory>>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await ecommerceAdminService.listInventory();
      const list = Array.isArray(res) ? res : (res.results ?? []);
      setItems(list);
    } catch (err: any) {
      setError('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (i: AdminInventory) => {
    setEditing(prev => ({ ...prev, [i.id]: { ...i } }));
  };

  const updateField = (id: number, field: keyof AdminInventory, value: any) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const save = async (id: number) => {
    const data = editing[id];
    if (!data) return;
    setLoading(true); setError(null);
    try {
      await ecommerceAdminService.updateInventory(id, {
        product_id: data.product_id!,
        stock: Number(data.stock ?? 0),
        reserved_stock: Number(data.reserved_stock ?? 0),
        location: String(data.location ?? 'main'),
        min_stock: Number(data.min_stock ?? 0),
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
        <h1 className="text-2xl font-bold">Inventario</h1>
        {error && <div className="p-3 rounded bg-red-50 text-red-700">{error}</div>}

        <div className="bg-white border rounded overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Producto</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Stock</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Reservado</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Ubicación</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Mínimo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(i => {
                const isEditing = !!editing[i.id];
                const e = editing[i.id] || {};
                return (
                  <tr key={i.id}>
                    <td className="px-4 py-2">{i.id}</td>
                    <td className="px-4 py-2">{i.product_id}</td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input type="number" className="w-24 border rounded px-2 py-1" value={e.stock as any ?? i.stock} onChange={ev => updateField(i.id, 'stock', Number(ev.target.value))} />
                      ) : (
                        i.stock
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input type="number" className="w-24 border rounded px-2 py-1" value={e.reserved_stock as any ?? i.reserved_stock} onChange={ev => updateField(i.id, 'reserved_stock', Number(ev.target.value))} />
                      ) : (
                        i.reserved_stock
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input className="w-32 border rounded px-2 py-1" value={(e.location as any) ?? i.location} onChange={ev => updateField(i.id, 'location', ev.target.value)} />
                      ) : (
                        i.location
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input type="number" className="w-24 border rounded px-2 py-1" value={e.min_stock as any ?? i.min_stock} onChange={ev => updateField(i.id, 'min_stock', Number(ev.target.value))} />
                      ) : (
                        i.min_stock
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <button className="inline-flex items-center px-2 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700" onClick={() => save(i.id)} disabled={loading}>
                          <Save className="h-4 w-4 mr-1" /> Guardar
                        </button>
                      ) : (
                        <button className="inline-flex items-center px-2 py-1 text-sm rounded bg-amber-50 text-amber-700 hover:bg-amber-100" onClick={() => startEdit(i)}>
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

export default AdminInventoryPage;
