import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CustomerFilters } from '../api/useCustomers';

/** URL-synced customer filter state (shareable, back-button safe). */
export function useCustomerFilters() {
  const [params, setParams] = useSearchParams();

  const filters: CustomerFilters = useMemo(
    () => ({
      q: params.get('q') ?? '',
      gender: params.get('gender') ?? '',
      city: params.get('city') ?? '',
      religion: params.get('religion') ?? '',
      profession: params.get('profession') ?? '',
      stage: params.get('stage') ?? '',
      minAge: params.get('minAge') ?? '',
      maxAge: params.get('maxAge') ?? '',
      sort: params.get('sort') ?? 'name',
      order: params.get('order') ?? 'asc',
      page: Number(params.get('page') ?? '1'),
    }),
    [params]
  );

  const setFilter = useCallback(
    (key: keyof CustomerFilters, value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          if (key !== 'page') next.delete('page'); // reset paging on filter change
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const setSort = useCallback(
    (sort: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const currentSort = next.get('sort');
          const currentOrder = next.get('order') ?? 'asc';
          if (currentSort === sort) {
            next.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
          } else {
            next.set('sort', sort);
            next.set('order', 'asc');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const clearAll = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const activeCount = ['q', 'gender', 'city', 'religion', 'profession', 'stage', 'minAge', 'maxAge'].filter(
    (k) => params.get(k)
  ).length;

  return { filters, setFilter, setSort, clearAll, activeCount, setPage: (p: number) => setFilter('page', String(p)) };
}
