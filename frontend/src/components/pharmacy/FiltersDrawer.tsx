import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService, type Category } from '../../services/ecommerceService';
import Modal, { ModalFooter } from '../ui/Modal';
import Button from '../ui/Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedId: number | null;
  onApply: (id: number | null) => void;
};

export default function FiltersDrawer({ isOpen, onClose, selectedId, onApply }: Props) {
  const { data } = useQuery({ queryKey: ['ecommerce', 'categories'], queryFn: () => ecommerceService.getCategories(), staleTime: 5 * 60 * 1000 });
  const cats = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [localId, setLocalId] = useState<number | null>(selectedId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros" size="full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Categorías</span>
          <button className="text-sm" style={{ color: 'var(--primary)' }} onClick={() => setLocalId(null)}>Quitar selección</button>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          <button
            role="radio"
            aria-checked={localId === null}
            className={`w-full text-left px-3 py-2 transition ${localId === null ? 'bg-primary-600 text-white' : ''}`}
            onClick={() => setLocalId(null)}
            type="button"
          >
            Todos
          </button>
          {cats.map(c => (
            <button
              key={c.id}
              role="radio"
              aria-checked={localId === c.id}
              className={`w-full text-left px-3 py-2 transition ${localId === c.id ? 'bg-primary-600 text-white' : ''}`}
              onClick={() => setLocalId(c.id)}
              type="button"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={() => { onApply(localId); onClose(); }}>Aplicar</Button>
      </ModalFooter>
    </Modal>
  );
}
