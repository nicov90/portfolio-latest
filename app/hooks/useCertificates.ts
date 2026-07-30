"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type CertificatePayload = {
  title: string;
  subtitle?: string | null; // text under title: date/level/etc
  description?: string | null;
  issuer?: string | null;
  imageUrl?: string | null;
  mediaPrefix?: string | null;
  verifyUrl?: string | null;
  downloadUrl?: string | null;
  sortOrder?: number;
};

export type CertificateTranslations = Record<string, {
  title?: string;
  subtitle?: string;
  description?: string;
}>;

export function useCertificates(lang?: string) {
  return useQuery({
    queryKey: ['certificates', lang || 'en'],
    queryFn: async () => {
      const url = lang ? `/api/certificates?lang=${encodeURIComponent(lang)}` : '/api/certificates';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch certificates');
      return res.json();
    },
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { certificate: CertificatePayload; translations?: CertificateTranslations }) => {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to create certificate');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

export function useUpdateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number; certificate: Partial<CertificatePayload>; translations?: CertificateTranslations }) => {
      const res = await fetch(`/api/certificates/${input.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificate: input.certificate, translations: input.translations }),
      });
      if (!res.ok) throw new Error('Failed to update certificate');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

export function useDeleteCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete certificate');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}
