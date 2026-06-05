import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/queryKeys';
import type { Customer, CustomerListResponse } from '@/types';

export interface CustomerFilters {
  q?: string;
  gender?: string;
  city?: string;
  religion?: string;
  profession?: string;
  stage?: string;
  minAge?: string;
  maxAge?: string;
  sort?: string;
  order?: string;
  page?: number;
}

export function useCustomers(filters: CustomerFilters) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v != null)
  );
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: async () =>
      (await api.get<CustomerListResponse>('/customers', { params })).data,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.customers.filterOptions,
    queryFn: async () =>
      (await api.get<{ cities: string[]; religions: string[] }>('/customers/filter-options')).data,
    staleTime: 5 * 60_000,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: async () => (await api.get<Customer>(`/customers/${id}`)).data,
    enabled: Boolean(id),
  });
}
