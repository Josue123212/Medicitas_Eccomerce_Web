import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ecommerceAdminService } from '../../../services/ecommerceAdminService';
import ecommerceService from '../../../services/ecommerceService';
import type { AdminProduct } from '../../../services/ecommerceAdminService';
import type { Category } from '../../../services/ecommerceService';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm: Partial<AdminProduct> = {
  name: '',
  title: '',
  description: '',
  category_id: null,
  is_active: true,
};

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminProduct>>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadProducts = async () => {
    setLoading(true); setError(null);
    try {
      const res = await ecommerceAdminService.listProducts();
      const list = Array.isArray(res) ? res : (res.results ?? []);
      setProducts(list);
    } catch (err: any) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await ecommerceService.getCategories();
      setCategories(cats);
    } catch {}
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (editingId) {
        await ecommerceAdminService.updateProduct(editingId, form);
      } else {
        await ecommerceAdminService.createProduct(form);
      }
      await loadProducts();
      resetForm();
    } catch (err: any) {
      setError('No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      title: p.title ?? '',
      description: p.description ?? '',
      category_id: p.category_id ?? null,
      is_active: p.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    setLoading(true); setError(null);
    try {
      await ecommerceAdminService.deleteProduct(id);
      await loadProducts();
    } catch (err: any) {
      setError('No se pudo eliminar');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = useMemo(() => categories.map(c => ({ value: c.id, label: c.name })), [categories]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Productos</h1>
          <button onClick={resetForm} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Nuevo
          </button>
        </div>

        {error && <div className="p-3 rounded bg-red-50 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border rounded p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea className="mt-1 w-full border rounded px-3 py-2" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={form.category_id ?? ''} onChange={e => setForm(f => ({ ...f, category_id: e.target.value ? Number(e.target.value) : null }))}>
                <option value="">(Sin categoría)</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input id="is_active" type="checkbox" className="mr-2" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
              <label htmlFor="is_active" className="text-sm text-gray-700">Activo</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={loading}>{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancelar</button>
            )}
          </div>
        </form>

        <div className="bg-white border rounded">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Categoría</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Activo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.category_id ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.is_active ? 'Sí' : 'No'}</span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="inline-flex items-center px-2 py-1 text-sm rounded bg-amber-50 text-amber-700 hover:bg-amber-100 mr-2" onClick={() => startEdit(p)}>
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </button>
                    <button className="inline-flex items-center px-2 py-1 text-sm rounded bg-red-50 text-red-700 hover:bg-red-100" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Sin productos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
