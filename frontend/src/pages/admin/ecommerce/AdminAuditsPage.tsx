import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { logisticsService, type AuditItem } from '../../../services/logisticsService';
import { ecommerceAdminService } from '../../../services/ecommerceAdminService';

const AdminAuditsPage: React.FC = () => {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ product_id: number; quantity: number; action: 'block' | 'release'; reason?: string }>({ product_id: 0, quantity: 0, action: 'block', reason: '' });
  const [filter, setFilter] = useState<{ product_id?: number; action?: 'all' | 'block' | 'release' }>({ product_id: undefined, action: 'all' });

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await logisticsService.listAudits();
      setItems(list);
    } catch (e) {
      setError('No se pudo cargar auditorías');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try {
      await logisticsService.createAudit(form);
      setForm({ product_id: 0, quantity: 0, action: 'block', reason: '' });
      await load();
    } catch (e) {
      setError('No se pudo crear la auditoría');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Auditorías</h1>
        {error && <div className="p-3 rounded bg-red-50 text-red-700">{error}</div>}

        <form onSubmit={submit} className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Producto ID</label>
            <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.product_id} onChange={e => setForm(prev => ({ ...prev, product_id: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Cantidad</label>
            <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Acción</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={form.action} onChange={e => setForm(prev => ({ ...prev, action: e.target.value as 'block' | 'release' }))}>
              <option value="block">Bloquear</option>
              <option value="release">Liberar</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Motivo</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={form.reason ?? ''} onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="p.ej. caducidad" />
          </div>
          <div>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Crear</button>
          </div>
        </form>

        <div className="bg-white border rounded p-4 overflow-x-auto">
          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium">Filtrar por Producto ID</label>
              <input type="number" className="mt-1 w-40 border rounded px-3 py-2" value={filter.product_id ?? ''} onChange={e => setFilter(prev => ({ ...prev, product_id: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Acción</label>
              <select className="mt-1 w-40 border rounded px-3 py-2" value={filter.action} onChange={e => setFilter(prev => ({ ...prev, action: e.target.value as any }))}>
                <option value="all">Todas</option>
                <option value="block">Bloquear</option>
                <option value="release">Liberar</option>
              </select>
            </div>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Cantidad</th>
                <th className="px-3 py-2 text-left">Acción</th>
                <th className="px-3 py-2 text-left">Motivo</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(items.filter(a => (filter.product_id ? a.productId === filter.product_id : true) && (filter.action === 'all' ? true : a.action === filter.action))).map(a => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{a.id}</td>
                  <td className="px-3 py-2">{a.productId}</td>
                  <td className="px-3 py-2">{a.quantity}</td>
                  <td className="px-3 py-2">{a.action}</td>
                  <td className="px-3 py-2">{a.reason}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${a.status === 'recorded' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>{a.status ?? '—'}</span>
                  </td>
                  <td className="px-3 py-2">{a.createdAt}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="px-3 py-4 text-center text-gray-500" colSpan={7}>Sin auditorías</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditsPage;
