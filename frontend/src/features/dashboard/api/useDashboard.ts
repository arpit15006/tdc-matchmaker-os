import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/queryKeys';
import type { DashboardKpis, FunnelStageCount } from '@/types';

export function useDashboardKpis() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpis,
    queryFn: async () => (await api.get<DashboardKpis>('/dashboard/kpis')).data,
  });
}

export function useFunnel() {
  return useQuery({
    queryKey: queryKeys.dashboard.funnel,
    queryFn: async () => (await api.get<FunnelStageCount[]>('/dashboard/funnel')).data,
  });
}
