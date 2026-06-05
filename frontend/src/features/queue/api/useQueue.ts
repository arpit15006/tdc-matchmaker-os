import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/queryKeys';
import type { MatchStatus, QueueData } from '@/types';

export function useQueue() {
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: async () => (await api.get<QueueData>('/matches/queue')).data,
  });
}

export function useAdvanceQueueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { matchId: string; status: MatchStatus }) =>
      (await api.patch(`/matches/${vars.matchId}/status`, { status: vars.status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.queue });
    },
  });
}
