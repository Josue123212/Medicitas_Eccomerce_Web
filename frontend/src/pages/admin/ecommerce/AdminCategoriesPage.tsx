import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ecommerceAdminService } from '../../../services/ecommerceAdminService';

type Category = { id: number; name: string; description?: string; is_active?: boolean };

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; description?: string; is_active: boolean }>({ name: '', description: '', is_active: true });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ecommerceAdminService.listCategories();
      const list = Array.isArray(res) ? res : (res.results ?? []);
      setCategories(list);
    } catch (e) {
      setError('No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await ecommerceAdminService.updateCategory(editingId, form);
      } else {
        await ecommerceAdminService.createCategory(form);
      }
      setForm({ name: '', description: '', is_active: true });
      setEditingId(null);
      await load();
    } catch (e) {}
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description ?? '', is_active: !!c.is_active });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <form onSubmit={submit} className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input className="w-full rounded-lg border-gray-300" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea className="w-full rounded-lg border-gray-300" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-span-12 md:col-span-3 flex items-center gap-2">
              <input id="cat-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <label htmlFor="cat-active" className="text-sm text-gray-700">Activa</label>
            </div>
            <div className="col-span-12 flex justify-end">
              <button type="submit" className="btn-primary px-4 py-2 rounded-lg">{editingId ? 'Guardar' : 'Crear categoría'}</button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          {loading && <p className="text-sm text-gray-500">Cargando…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Activa</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-3">{c.id}</td>
                  <td className="px-6 py-3">{c.name}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.is_active ? 'Sí' : 'No'}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded bg-yellow-100 text-yellow-800" onClick={() => startEdit(c)}>Editar</button>
                      <button className="px-3 py-1.5 rounded bg-red-100 text-red-800" onClick={async () => { if (!window.confirm('¿Eliminar categoría?')) return; await ecommerceAdminService.deleteCategory(c.id); await load(); }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
