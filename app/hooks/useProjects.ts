"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type ProjectPayload = {
  title: string;
  description?: string | null;
  tech?: string[];
  images?: string[];
  demoUrl?: string | null;
  githubUrl?: string | null;
  videoUrl?: string | null;
  featured?: boolean;
  sortOrder?: number;
};

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects?allLocales=1');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { project: ProjectPayload; translations?: Record<string, { title?: string; description?: string }> }) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
