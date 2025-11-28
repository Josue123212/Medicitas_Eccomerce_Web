import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      <header className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-on-primary)' }}>FM</span>
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>MediCitas</div>
              <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>Farmacia</h1>
            </div>
          </div>
          <Link to="/pharmacy/catalog" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            ← Catálogo
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-8" style={{ border: '1px solid var(--border)' }}>
          <div className="text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>Pago exitoso</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Tu compra fue procesada correctamente. Puedes revisar el estado en tus pedidos.</p>
            <div className="flex justify-center gap-3">
              <Link to="/pharmacy/orders" className="px-5 py-3 rounded-lg font-medium bg-primary text-white">Ver pedidos</Link>
              <Link to="/pharmacy/catalog" className="px-5 py-3 rounded-lg font-medium border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>Seguir comprando</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
