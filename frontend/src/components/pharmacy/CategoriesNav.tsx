import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService, type Category } from '../../services/ecommerceService';

type Props = {
  selectedId?: number | null;
  onSelect: (id: number | null) => void;
  showAll?: boolean;
  className?: string;
};

export default function CategoriesNav({ selectedId = null, onSelect, showAll = true, className }: Props) {
  const { data, isLoading, error } = useQuery({ queryKey: ['ecommerce', 'categories'], queryFn: () => ecommerceService.getCategories(), staleTime: 5 * 60 * 1000 });
  const items = useMemo(() => {
    const base: Array<{ id: number | string; name: string; slug?: string }> = showAll ? [{ id: 'all', name: 'Todos' }] : [];
    const cats: Category[] = Array.isArray(data) ? data : [];
    return [...base, ...cats.map(c => ({ id: c.id, name: c.name }))];
  }, [data, showAll]);

  if (isLoading) {
    return (
      <nav aria-label="Categorías" className={className}>
        <div role="radiogroup" aria-label="Seleccionar categoría" className="flex gap-2 overflow-x-auto py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-full border border-border bg-surface animate-pulse" />
          ))}
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <div role="alert" className={className}>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>No se pudieron cargar las categorías.</span>
          <button type="button" className="px-3 py-1 rounded-full border border-border" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={className}>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>No hay categorías.</span>
      </div>
    );
  }

  return (
    <nav aria-label="Categorías" className={className}>
      <div role="radiogroup" aria-label="Seleccionar categoría" className="flex gap-2 overflow-x-auto py-1">
        {items.map(item => {
          const isAll = item.id === 'all';
          const isSelected = (selectedId === null && isAll) || selectedId === item.id;
          return (
            <button
              key={item.id}
              role="radio"
              aria-checked={isSelected}
              className={`h-9 px-3 rounded-full border transition ${isSelected ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-primary border-border'}`}
              onClick={() => onSelect(isAll ? null : (item.id as number))}
              tabIndex={isSelected ? 0 : -1}
              type="button"
              {...(isSelected ? { 'aria-current': 'page' } : {})}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
