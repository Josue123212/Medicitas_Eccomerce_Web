import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ShoppingCart, Package, Database, BadgeDollarSign } from 'lucide-react';

const AdminEcommerceHome: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">E‑commerce</h1>
          <ShoppingCart className="h-8 w-8 text-blue-600" />
        </div>

        <p className="text-gray-600">Centro de administración de catálogo, inventario y precios.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/ecommerce/products" className="block p-6 bg-white rounded-lg shadow hover:shadow-md border">
            <div className="flex items-center mb-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h2 className="ml-2 text-lg font-semibold">Productos</h2>
            </div>
            <p className="text-gray-600">Crear, editar, listar y eliminar productos.</p>
          </Link>

          <Link to="/admin/ecommerce/inventory" className="block p-6 bg-white rounded-lg shadow hover:shadow-md border">
            <div className="flex items-center mb-3">
              <Database className="h-6 w-6 text-green-600" />
              <h2 className="ml-2 text-lg font-semibold">Inventario</h2>
            </div>
            <p className="text-gray-600">Actualizar stock, reservados, ubicación y mínimo.</p>
          </Link>

          <Link to="/admin/ecommerce/prices" className="block p-6 bg-white rounded-lg shadow hover:shadow-md border">
            <div className="flex items-center mb-3">
              <BadgeDollarSign className="h-6 w-6 text-amber-600" />
              <h2 className="ml-2 text-lg font-semibold">Precios</h2>
            </div>
            <p className="text-gray-600">Actualizar precios y ofertas por producto.</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEcommerceHome;
