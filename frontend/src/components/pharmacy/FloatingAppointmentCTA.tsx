import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * FloatingAppointmentCTA
 * Botón flotante (draggable) para promocionar/agendar una nueva cita.
 * - Solo visible para usuarios autenticados con rol 'client'
 * - Navega a /client/appointments con state { openModal: true }
 * - Usa variables de tema y un estilo consistente con el diseño
 */
const FloatingAppointmentCTA: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [dragMoved, setDragMoved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Mostrar solo si autenticado y rol cliente
  const canShow = isAuthenticated && user?.role === 'client' && visible;

  useEffect(() => {
    const stored = localStorage.getItem('hideAppointmentCTA');
    if (stored === 'true') {
      setVisible(false);
    }
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart || !ref.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDragMoved(true);
    const newX = position.x + dx;
    const newY = position.y + dy;
    const maxX = window.innerWidth - ref.current.offsetWidth - 20;
    const maxY = window.innerHeight - ref.current.offsetHeight - 20;
    setPosition({ x: Math.max(20, Math.min(newX, maxX)), y: Math.max(20, Math.min(newY, maxY)) });
  };

  const onMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    setDragStart(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragStart, position]);

  const handleClick = () => {
    if (dragMoved) return; // no click si fue drag
    navigate('/client/appointments', { state: { openModal: true } });
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('hideAppointmentCTA', 'true');
  };

  if (!canShow) return null;

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      role="button"
      aria-label="Reserva tu próxima cita"
      className="fixed z-50 shadow-lg cursor-grab active:cursor-grabbing"
      style={{
        bottom: `${position.y}px`,
        right: `${position.x}px`,
        background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary), black 20%))',
        color: 'var(--text-on-primary)',
        borderRadius: 16,
        boxShadow: '0 8px 20px color-mix(in srgb, var(--primary), black 45%)',
      }}
    >
      <div className="flex items-center gap-3 pl-3 pr-2 py-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--primary), white 20%)' }}>
          <span className="material-icons" style={{ fontSize: 20, color: 'var(--text-on-primary)' }}>calendar_today</span>
        </div>
        <div className="pr-2">
          <div className="text-sm font-semibold">Ya eres parte de la familia MediCitas</div>
          <div className="text-xs opacity-90">Reserva tu próxima cita</div>
        </div>
        <button
          aria-label="Cerrar recordatorio"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--primary), black 20%)' }}
        >
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--text-on-primary)' }}>close</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingAppointmentCTA;