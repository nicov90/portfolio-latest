"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type SiteContentMap = Record<string, string>;

export function useSiteContentMap(locale: string) {
  return useQuery({
    queryKey: ['site-content', locale],
    queryFn: async (): Promise<SiteContentMap> => {
      const res = await fetch(`/api/site-content?locale=${encodeURIComponent(locale)}`);
      if (!res.ok) throw new Error('Failed to fetch site content');
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useUpdateSiteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { section: string; key: string; locale: string; value: string }) => {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to update site content');
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['site-content', variables.locale] });
    },
  });
}

export function useResetSiteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { section: string; key: string; locale: string }) => {
      const params = new URLSearchParams(input);
      const res = await fetch(`/api/site-content?${params.toString()}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to reset site content');
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['site-content', variables.locale] });
    },
  });
}
