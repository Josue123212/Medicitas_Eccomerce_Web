import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ShoppingCart, Package, Database, BadgeDollarSign, Tags, BadgePercent, Bot, ShieldCheck } from 'lucide-react';

const AdminEcommerceHome: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">E‑commerce</h1>
          <ShoppingCart className="h-8 w-8 text-blue-600" />
        </div>

        <p className="text-gray-600">Centro de administración de catálogo, inventario y precios.</p>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          <Link to="/admin/ecommerce/categories" className="block p-6 bg-white rounded-lg shadow hover:shadow-md border">
            <div className="flex items-center mb-3">
              <Tags className="h-6 w-6 text-purple-600" />
              <h2 className="ml-2 text-lg font-semibold">Categorías</h2>
            </div>
            <p className="text-gray-600">Crear, editar y eliminar categorías del catálogo.</p>
          </Link>
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

          <Link to="/admin/ecommerce/offers" className="block p-6 bg-white rounded-lg shadow hover:shadow-md border">
            <div className="flex items-center mb-3">
              <BadgePercent className="h-6 w-6 text-pink-600" />
              <h2 className="ml-2 text-lg font-semibold">Ofertas</h2>
            </div>
            <p className="text-gray-600">Gestionar carrusel: título, eslogan, imagen y CTA.</p>
          </Link>

          <Link to="/admin/ecommerce/agent" className="block p-6 bg-white rounded-lg shadow hover:shadow-md border">
            <div className="flex items-center mb-3">
              <Bot className="h-6 w-6 text-indigo-600" />
              <h2 className="ml-2 text-lg font-semibold">Agente</h2>
            </div>
            <p className="text-gray-600">Chat de comandos con el agente administrativo.</p>
          </Link>

          <Link to="/admin/ecommerce/audits" className="block p-6 bg-white rounded-lg shadow hover:shadow-md border">
            <div className="flex items-center mb-3">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
              <h2 className="ml-2 text-lg font-semibold">Auditorías</h2>
            </div>
            <p className="text-gray-600">Registrar bloqueos/liberaciones y revisar historial.</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEcommerceHome;
