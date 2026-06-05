type FilterRecord = Record<string, unknown>;

/** Centralized, typed query-key factory. */
export const queryKeys = {
  auth: { me: ['auth', 'me'] as const },
  dashboard: {
    kpis: ['dashboard', 'kpis'] as const,
    funnel: ['dashboard', 'funnel'] as const,
  },
  customers: {
    list: (filters: FilterRecord) => ['customers', 'list', filters] as const,
    filterOptions: ['customers', 'filter-options'] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
  },
  matches: (customerId: string) => ['matches', customerId] as const,
  notes: (customerId: string) => ['notes', customerId] as const,
  timeline: (customerId: string) => ['timeline', customerId] as const,
  insights: (customerId: string) => ['insights', customerId] as const,
  queue: ['queue'] as const,
  success: ['success-stories'] as const,
};
