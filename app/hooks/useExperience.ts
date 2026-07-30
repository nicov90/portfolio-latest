"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type ExperienceItemPayload = {
  position: string;
  company: string;
  duration?: string | null;
  location?: string | null;
  description?: string | null;
  achievements?: string[];
  technologies?: string[];
  sortOrder?: number;
};

export type ExperienceItemTranslations = Record<string, {
  position?: string;
  company?: string;
  duration?: string;
  location?: string;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}>;

export function useExperienceItems() {
  return useQuery({
    queryKey: ['experience'],
    queryFn: async () => {
      const res = await fetch('/api/experience?allLocales=1');
      if (!res.ok) throw new Error('Failed to fetch experience items');
      return res.json();
    },
  });
}

export function useCreateExperienceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { item: ExperienceItemPayload; translations?: ExperienceItemTranslations }) => {
      const res = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to create experience item');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experience'] });
    },
  });
}

export function useUpdateExperienceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number; item?: Partial<ExperienceItemPayload>; translations?: ExperienceItemTranslations }) => {
      const res = await fetch(`/api/experience/${input.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: input.item, translations: input.translations }),
      });
      if (!res.ok) throw new Error('Failed to update experience item');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experience'] });
    },
  });
}

export function useDeleteExperienceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete experience item');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experience'] });
    },
  });
}
