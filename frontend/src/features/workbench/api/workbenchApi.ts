import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/queryKeys';
import type {
  Feedback,
  FeedbackReason,
  FeedbackResponse,
  IntroductionVariants,
  Match,
  MatchmakerInsights,
  MatchStatus,
  Note,
  NoteCategory,
  TimelineEvent,
} from '@/types';

// ── Queries ──────────────────────────────────────────────────────────
export function useMatches(customerId: string) {
  return useQuery({
    queryKey: queryKeys.matches(customerId),
    queryFn: async () => (await api.get<Match[]>(`/customers/${customerId}/matches`)).data,
    enabled: Boolean(customerId),
  });
}

export function useNotes(customerId: string) {
  return useQuery({
    queryKey: queryKeys.notes(customerId),
    queryFn: async () => (await api.get<Note[]>(`/customers/${customerId}/notes`)).data,
    enabled: Boolean(customerId),
  });
}

export function useTimeline(customerId: string) {
  return useQuery({
    queryKey: queryKeys.timeline(customerId),
    queryFn: async () =>
      (await api.get<TimelineEvent[]>(`/customers/${customerId}/timeline`)).data,
    enabled: Boolean(customerId),
  });
}

// ── Mutations ────────────────────────────────────────────────────────
export function useGenerateMatches(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await api.post<Match[]>(`/customers/${customerId}/matches/generate`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.timeline(customerId) });
    },
  });
}

export function useCreateNote(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { category: NoteCategory; content: string }) =>
      (await api.post<Note>(`/customers/${customerId}/notes`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notes(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.timeline(customerId) });
    },
  });
}

export function useInsights(customerId: string) {
  return useMutation({
    mutationFn: async () =>
      (await api.post<MatchmakerInsights>(`/customers/${customerId}/insights`)).data,
  });
}

export function useMatchExplanation() {
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<{ explanation: string; cached: boolean }>(`/matches/${matchId}/explanation`)).data,
  });
}

export function useGenerateIntroduction() {
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<{ variants: IntroductionVariants }>(`/matches/${matchId}/introduction`)).data,
  });
}

export function useSendMatch(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { matchId: string; introduction?: string; tone?: string }) =>
      (await api.post<Match>(`/matches/${vars.matchId}/send`, {
        introduction: vars.introduction,
        tone: vars.tone,
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.timeline(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.queue });
    },
  });
}

export function useUpdateMatchStatus(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { matchId: string; status: MatchStatus }) =>
      (await api.patch<Match>(`/matches/${vars.matchId}/status`, { status: vars.status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.queue });
    },
  });
}

export function useSubmitFeedback(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      matchId: string;
      response: FeedbackResponse;
      reason?: FeedbackReason;
      notes?: string;
    }) =>
      (await api.post<Feedback>(`/matches/${vars.matchId}/feedback`, {
        response: vars.response,
        reason: vars.reason,
        notes: vars.notes,
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.timeline(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.queue });
      qc.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) });
    },
  });
}

export function useUpdateStage(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stage: string) =>
      (await api.patch(`/customers/${customerId}/stage`, { stage })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.timeline(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.funnel });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.kpis });
    },
  });
}
