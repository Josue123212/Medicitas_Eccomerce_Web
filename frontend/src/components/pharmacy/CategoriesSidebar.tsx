import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService, type Category } from '../../services/ecommerceService';

type Props = {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  className?: string;
};

export default function CategoriesSidebar({ selectedId, onSelect, className }: Props) {
  const { data } = useQuery({ queryKey: ['ecommerce', 'categories'], queryFn: () => ecommerceService.getCategories(), staleTime: 5 * 60 * 1000 });
  const cats = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return (
    <nav aria-label="Categorías" className={className}>
      <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <button
          className={`w-full text-left px-3 py-2 rounded-md transition ${selectedId === null ? 'bg-primary-600 text-white' : ''}`}
          onClick={() => onSelect(null)}
          type="button"
        >
          Todos
        </button>
        <div className="mt-2 space-y-1">
          {cats.map(c => (
            <button
              key={c.id}
              className={`w-full text-left px-3 py-2 rounded-md transition ${selectedId === c.id ? 'bg-primary-600 text-white' : ''}`}
              onClick={() => onSelect(c.id)}
              type="button"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
