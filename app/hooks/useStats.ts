"use client";
import { useQuery } from '@tanstack/react-query';

export interface StatsCountryEntry {
  country: string;
  uniqueIps: number;
  avgDurationSeconds: number | null;
}

export interface StatsResponse {
  totalUniqueIps: number;
  avgDurationSeconds: number | null;
  byCountry: StatsCountryEntry[];
  range: { from: string | null; to: string | null };
}

export function useStats(from: string | null, to: string | null) {
  return useQuery<StatsResponse>({
    queryKey: ['stats', from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      const res = await fetch(`/api/stats${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });
}
