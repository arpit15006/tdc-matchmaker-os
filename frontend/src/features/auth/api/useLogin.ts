import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import type { Matchmaker } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}
interface LoginResponse {
  token: string;
  matchmaker: Matchmaker;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await api.post<LoginResponse>('/auth/login', payload);
      return res.data;
    },
  });
}
