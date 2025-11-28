import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * 🛍️ Landing Page - Farmacia MediCitas
 *
 * - Usa variables CSS de theme.css mediante var(--...)
 * - Navegación superior con Iniciar sesión / Crear cuenta
 * - CTA "Comenzar" que redirige al catálogo como invitado
 */
const PharmacyLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/pharmacy/catalog');
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)' }}>
      {/* Header propio de Farmacia */}
      <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text-on-primary)' }}>FM</span>
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>MediCitas</div>
              <h1 className="text-lg sm:text-xl font-light" style={{ color: 'var(--text-primary)' }}>
                Farmacia
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Categorías:</span>
              <div className="flex flex-wrap gap-2">
                {['Dolor', 'Alergias', 'Vitaminas', 'Cuidado Personal'].map((c) => (
                  <span key={c} className="px-3 py-1 rounded-full text-xs" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface)' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <nav className="flex justify-end items-center space-x-3">
            <Link to="/pharmacy/login">
              <button className="btn-outline px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors">Iniciar Sesión</button>
            </Link>
            <Link to="/pharmacy/register">
              <button className="btn-primary px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors">Crear Cuenta</button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero distinto: dos columnas con imagen y texto */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Visual placeholder */}
            <div className="rounded-2xl h-56 sm:h-72 lg:h-96" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--background) 100%)' }} />
            {/* Texto y CTA */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-light mb-4" style={{ color: 'var(--text-primary)' }}>
                Productos de salud confiables
              </h2>
              <p className="text-base sm:text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                Explora como invitado nuestro catálogo de medicamentos y productos. Compra cuando estés listo.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleStart} className="btn-primary px-6 py-3 rounded-lg font-medium">Comenzar</button>
              </div>
            </div>
          </div>
        </section>

        {/* Destacados y confianza */}
        <section className="py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Entrega rápida', desc: 'Recibe tus productos con seguimiento en tiempo real.' },
              { title: 'Marcas verificadas', desc: 'Solo productos con certificación sanitaria.' },
              { title: 'Integrado con MediCitas', desc: 'Recomendaciones según tu historial médico.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid var(--border)' }}>
                <h4 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA secundaria con gradiente */}
        <section className="py-10 lg:py-14">
          <div className="gradient-primary rounded-2xl p-8 lg:p-12 text-center" style={{ color: 'var(--text-on-primary)' }}>
            <h3 className="text-2xl sm:text-3xl font-light mb-3">Empieza hoy mismo</h3>
            <p className="text-base sm:text-lg mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text-on-primary-90)' }}>
              Navega el catálogo como invitado. Para comprar, inicia sesión o crea tu cuenta.
            </p>
            <button onClick={handleStart} className="w-full sm:w-auto px-8 py-4 bg-white rounded-lg font-medium" style={{ color: 'var(--primary)' }}>
              Ver Catálogo
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © 2024 Farmacia MediCitas — Salud y bienestar a tu alcance
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PharmacyLandingPage;