import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

/**
 * 🏠 LANDING PAGE CON HERENCIA DE COLORES
 * 
 * Esta página usa VARIABLES CSS que se heredan del archivo padre.
 * Cambiar en theme.css = cambio automático aquí.
 */
const HomePage: React.FC = () => {
  // === Estado y lógica para arrastrar el botón flotante ===
  const navigate = useNavigate();
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const startMouseRef = useRef<{ x: number; y: number } | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const beginDrag = (clientX: number, clientY: number) => {
    if (!fabRef.current) return;
    const rect = fabRef.current.getBoundingClientRect();
    offsetRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    startMouseRef.current = { x: clientX, y: clientY };
    setDragging(true);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!fabRef.current) return;
    const width = fabRef.current.offsetWidth;
    const height = fabRef.current.offsetHeight;
    const x = clamp(clientX - offsetRef.current.x, 8, window.innerWidth - width - 8);
    const y = clamp(clientY - offsetRef.current.y, 8, window.innerHeight - height - 8);
    setPos({ x, y });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      moveDrag(e.clientX, e.clientY);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragging) return;
      setDragging(false);
      const start = startMouseRef.current;
      if (start) {
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Si casi no hubo movimiento, tratamos como click para navegar
        if (dist < 5) {
          navigate('/pharmacy');
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging) return;
      setDragging(false);
      const start = startMouseRef.current;
      if (start) {
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) {
          navigate('/pharmacy');
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [dragging, navigate]);

  const handleMouseDown: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    beginDrag(e.clientX, e.clientY);
  };
  const handleTouchStart: React.TouchEventHandler<HTMLButtonElement> = (e) => {
    const t = e.touches[0];
    beginDrag(t.clientX, t.clientY);
  };
  return (
    <div className="min-h-screen" style={{fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--background)'}}>
      {/* Header moderno */}
      <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4 lg:py-6" style={{borderColor: 'var(--border)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                {/* 🎯 Logo con variable CSS heredada */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{backgroundColor: 'var(--primary)'}}
                >
                  <span className="text-white text-sm font-bold">M</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-light" style={{color: 'var(--text-primary)'}}>
                  MediCitas
                </h1>
              </div>
              <span className="hidden sm:block ml-3 text-xs sm:text-sm font-light" style={{color: 'var(--text-secondary)'}}>
                Sistema de Gestión Médica
              </span>
            </div>
            <nav className="flex items-center space-x-3 lg:space-x-4">
              <Link to="/login">
                {/* 🎯 Botón con clases CSS heredadas */}
                <button className="btn-outline px-4 py-2 rounded-lg font-medium transition-colors">
                  Iniciar Sesión
                </button>
              </Link>
              <Link to="/register">
                {/* 🎯 Botón con clases CSS heredadas */}
                <button className="btn-primary px-4 py-2 rounded-lg font-medium transition-colors">
                  Registrarse
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light mb-6 lg:mb-8 leading-tight" style={{color: 'var(--text-primary)'}}>
              Gestión Médica
              {/* 🎯 Título con variable CSS heredada */}
              <span className="block font-medium" style={{color: 'var(--primary)'}}>
                Inteligente y Eficiente
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-8 lg:mb-12 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
              Revoluciona la manera de gestionar citas médicas. Nuestro sistema integral 
              conecta pacientes, doctores y administradores en una plataforma moderna y segura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center">
              <Link to="/register">
                {/* 🎯 Botón principal con clases CSS heredadas */}
                <button className="btn-primary w-full sm:w-auto px-8 py-4 text-base lg:text-lg rounded-lg font-medium transition-colors">
                  Comenzar Ahora
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 lg:py-20">
          <div className="text-center mb-12 lg:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-4 lg:mb-6" style={{color: 'var(--text-primary)'}}>
              ¿Por qué elegir MediCitas?
            </h3>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{color: 'var(--text-secondary)'}}>
              Descubre las características que hacen de nuestro sistema la mejor opción
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* 🎯 Cards con variables CSS heredadas */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-6 lg:p-8 text-center hover:shadow-md transition-all duration-300" style={{border: '1px solid var(--border)'}}>
              <h4 className="text-lg sm:text-xl font-medium mb-4" style={{color: 'var(--text-primary)'}}>
                Agendar Citas
              </h4>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                Sistema intuitivo para programar citas médicas. Selecciona doctor, 
                fecha y hora en segundos.
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-6 lg:p-8 text-center hover:shadow-md transition-all duration-300" style={{border: '1px solid var(--border)'}}>
              <h4 className="text-lg sm:text-xl font-medium mb-4" style={{color: 'var(--text-primary)'}}>
                Red de Especialistas
              </h4>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                Acceso a doctores especializados verificados. Encuentra el 
                profesional ideal para tu consulta.
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-6 lg:p-8 text-center hover:shadow-md transition-all duration-300" style={{border: '1px solid var(--border)'}}>
              <h4 className="text-lg sm:text-xl font-medium mb-4" style={{color: 'var(--text-primary)'}}>
                Historial Digital
              </h4>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                Registro completo y seguro de tu historial médico. 
                Acceso instantáneo a consultas y resultados.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-12 lg:py-20">
          {/* 🎯 Sección CTA con gradiente heredado */}
          <div className="gradient-primary rounded-2xl lg:rounded-3xl p-8 lg:p-12 text-center text-white">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-4 lg:mb-6">
              ¿Listo para transformar tu gestión médica?
            </h3>
            <p className="text-base sm:text-lg mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed text-white/90">
              Únete a miles de profesionales de la salud que ya confían en MediCitas 
              para optimizar su práctica médica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              <Link to="/register">
                <button className="w-full sm:w-auto px-8 py-4 text-base lg:text-lg bg-white rounded-lg font-medium transition-colors" style={{color: 'var(--primary)'}}>
                  Crear Cuenta Gratis
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer moderno */}
      <footer className="bg-white py-8 lg:py-12" style={{borderTop: '1px solid var(--border)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h4 className="text-lg font-light" style={{color: 'var(--text-primary)'}}>
                🏥 MediCitas
              </h4>
            </div>
            <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>
              Sistema de gestión médica moderno y seguro
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs" style={{color: 'var(--text-secondary)'}}>
              <span>© 2024 MediCitas</span>
              <span>•</span>
              <span>Desarrollado con React + Django</span>
              <span>•</span>
              <span>Diseño responsive</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 🛍️ Botón flotante Farmacia MediCitas - arrastrable + indicador llamativo */}
      <div
        className="flex items-center gap-3"
        style={{
          position: 'fixed',
          zIndex: 50,
          ...(pos ? { left: pos.x, top: pos.y } : { bottom: 24, right: 24 })
        }}
      >
        {/* Indicador llamativo */}
        <div
          className="indicator-animate hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl shadow-md"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            color: 'var(--text-on-primary)',
            border: '1px solid color-mix(in srgb, var(--primary), black 25%)'
          }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>local_pharmacy</span>
          <span className="text-xs sm:text-sm font-medium">También visita nuestra farmacia digital</span>
        </div>

        {/* Botón flotante arrastrable */}
        <button
          ref={fabRef}
          aria-label="Abrir Farmacia MediCitas"
          title="Farmacia MediCitas"
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center fab-animate"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-on-primary)',
            border: '1px solid var(--primary-hover)',
            cursor: dragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <span className="material-icons">local_pharmacy</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;