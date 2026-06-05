import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { STAGE_OPTIONS } from '@/lib/stages';
import { useFilterOptions } from '../api/useCustomers';
import type { useCustomerFilters } from '../hooks/useCustomerFilters';

type FilterApi = ReturnType<typeof useCustomerFilters>;

export function CustomerFilters({ filters, setFilter, clearAll, activeCount }: FilterApi) {
  const { data: options } = useFilterOptions();
  const [search, setSearch] = useState(filters.q ?? '');

  // Debounce the global search input → URL.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((filters.q ?? '') !== search) setFilter('q', search);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setSearch(filters.q ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  return (
    <div className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-soft">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, city, or company…"
          aria-label="Search clients"
          className="h-11 w-full rounded-2xl border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted transition-all duration-200 focus:border-rose focus:outline-none focus:ring-4 focus:ring-rose/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7">
        <Select
          aria-label="Gender"
          placeholder="All genders"
          value={filters.gender}
          onChange={(e) => setFilter('gender', e.target.value)}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
          ]}
        />
        <Select
          aria-label="City"
          placeholder="All cities"
          value={filters.city}
          onChange={(e) => setFilter('city', e.target.value)}
          options={(options?.cities ?? []).map((c) => ({ value: c, label: c }))}
        />
        <Select
          aria-label="Religion"
          placeholder="All religions"
          value={filters.religion}
          onChange={(e) => setFilter('religion', e.target.value)}
          options={(options?.religions ?? []).map((r) => ({ value: r, label: r }))}
        />
        <Select
          aria-label="Journey stage"
          placeholder="All stages"
          value={filters.stage}
          onChange={(e) => setFilter('stage', e.target.value)}
          options={STAGE_OPTIONS}
        />
        <input
          type="text"
          placeholder="Profession"
          aria-label="Profession"
          value={filters.profession}
          onChange={(e) => setFilter('profession', e.target.value)}
          className="h-11 rounded-2xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-muted transition-all duration-200 focus:border-rose focus:outline-none focus:ring-4 focus:ring-rose/10"
        />
        <input
          type="number"
          min={18}
          max={99}
          placeholder="Min age"
          aria-label="Minimum age"
          value={filters.minAge}
          onChange={(e) => setFilter('minAge', e.target.value)}
          className="h-11 rounded-2xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-muted transition-all duration-200 focus:border-rose focus:outline-none focus:ring-4 focus:ring-rose/10"
        />
        <input
          type="number"
          min={18}
          max={99}
          placeholder="Max age"
          aria-label="Maximum age"
          value={filters.maxAge}
          onChange={(e) => setFilter('maxAge', e.target.value)}
          className="h-11 rounded-2xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-muted transition-all duration-200 focus:border-rose focus:outline-none focus:ring-4 focus:ring-rose/10"
        />
      </div>

      {activeCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-muted">{activeCount} filter{activeCount > 1 ? 's' : ''} active</span>
          <Button variant="ghost" size="sm" leftIcon={<X className="h-4 w-4" />} onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
