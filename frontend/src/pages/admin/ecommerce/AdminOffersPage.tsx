import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ecommerceAdminService } from '../../../services/ecommerceAdminService';

type Offer = { id: number; title: string; subtitle?: string; badge?: string; cta_text?: string; cta_link?: string; position?: number; is_active?: boolean; image?: string };

const AdminOffersPage: React.FC = () => {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ title: string; subtitle?: string; badge?: string; cta_text?: string; cta_link?: string; position?: number; is_active: boolean; imageFile: File | null }>({ title: '', subtitle: '', badge: 'Oferta', cta_text: 'Ver productos en oferta', cta_link: '/pharmacy/offers', position: 0, is_active: false, imageFile: null });

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await ecommerceAdminService.listOffers();
      setItems(Array.isArray(list) ? list : (list?.results ?? []));
    } catch (e) {
      setError('Error al cargar ofertas');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ title: '', subtitle: '', badge: 'Oferta', cta_text: 'Ver productos en oferta', cta_link: '/pharmacy/offers', position: 0, is_active: false, imageFile: null }); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try {
      if (editingId) {
        await ecommerceAdminService.updateOffer(editingId, { title: form.title, subtitle: form.subtitle, badge: form.badge, cta_text: form.cta_text, cta_link: form.cta_link, position: form.position, is_active: form.is_active, image: form.imageFile ?? undefined });
      } else {
        await ecommerceAdminService.createOffer({ title: form.title, subtitle: form.subtitle, badge: form.badge, cta_text: form.cta_text, cta_link: form.cta_link, position: form.position, is_active: form.is_active, image: form.imageFile });
      }
      resetForm(); await load();
    } catch (e: any) { setError('Error al guardar la oferta'); }
  };

  const handleEdit = (it: Offer) => {
    setEditingId(it.id);
    setForm({ title: it.title || '', subtitle: it.subtitle || '', badge: it.badge || 'Oferta', cta_text: it.cta_text || 'Ver productos en oferta', cta_link: it.cta_link || '/pharmacy/offers', position: it.position ?? 0, is_active: Boolean(it.is_active), imageFile: null });
  };

  const handleDelete = async (id: number) => {
    try { await ecommerceAdminService.deleteOffer(id); await load(); } catch { setError('No se pudo eliminar'); }
  };

  const toggleActive = async (it: Offer) => {
    // Optimistic UI update para evitar parpadeos
    if (it.is_active) {
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, is_active: false } : x));
      try {
        await ecommerceAdminService.updateOffer(it.id, { is_active: false });
      } catch (e) {
        setError('No se pudo actualizar el estado');
        await load();
      }
    } else {
      setItems(prev => prev.map(x => ({ ...x, is_active: x.id === it.id })));
      try {
        const res = await ecommerceAdminService.activateOffer(it.id);
        setItems(prev => prev.map(x => ({ ...x, is_active: x.id === res.id })));
      } catch (e) {
        setError('No se pudo actualizar el estado');
        await load();
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ofertas (Carrusel)</h1>
          <button onClick={resetForm} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Nuevo</button>
        </div>

        {error && <div className="p-3 rounded bg-red-50 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border rounded p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.subtitle || ''} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Badge</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.badge || ''} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CTA Texto</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.cta_text || ''} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CTA Link</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.cta_link || ''} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Posición</label>
              <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={Number(form.position || 0)} onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
              <span className="text-sm">Activo</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagen (Carrusel)</label>
              <input type="file" accept="image/*" className="mt-1 w-full" onChange={e => setForm(f => ({ ...f, imageFile: (e.target.files?.[0] ?? null) }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">{editingId ? 'Guardar cambios' : 'Crear'}</button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded border">Cancelar</button>
            )}
          </div>
        </form>

        <div className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Listado</h2>
          {loading ? (
            <div>Cargando…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2">ID</th>
                  <th className="py-2">Título</th>
                  <th className="py-2">Subtítulo</th>
                  <th className="py-2">Badge</th>
                  <th className="py-2">CTA</th>
                  <th className="py-2">Link</th>
                  <th className="py-2">Posición</th>
                  <th className="py-2">Activo</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-2">{it.id}</td>
                    <td className="py-2">{it.title}</td>
                    <td className="py-2">{it.subtitle}</td>
                    <td className="py-2">{it.badge}</td>
                    <td className="py-2">{it.cta_text}</td>
                    <td className="py-2">{it.cta_link}</td>
                    <td className="py-2">{it.position}</td>
                    <td className="py-2">
                      <button
                        aria-checked={Boolean(it.is_active)}
                        role="switch"
                        onClick={() => toggleActive(it)}
                        className="inline-flex items-center"
                        style={{
                          width: 42,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: it.is_active ? 'var(--primary)' : '#333',
                          border: '1px solid var(--border)',
                          position: 'relative',
                          transition: 'background-color 200ms ease'
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: 'white',
                            position: 'absolute',
                            left: it.is_active ? 20 : 2,
                            top: 2,
                            transition: 'left 200ms ease, transform 150ms ease'
                          }}
                        />
                      </button>
                    </td>
                    <td className="py-2 flex gap-2">
                      <button className="px-3 py-1 rounded border" onClick={() => handleEdit(it)}>Editar</button>
                      <button className="px-3 py-1 rounded border" onClick={() => handleDelete(it.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td className="py-3" colSpan={9}>Sin ofertas</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOffersPage;
