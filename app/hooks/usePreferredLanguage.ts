"use client";
import { useEffect, useMemo, useState } from 'react';

const SUPPORTED = ["es", "en", "ja"] as const;
export type SupportedLang = typeof SUPPORTED[number];

function normalizeToSupported(code: string | null | undefined): SupportedLang {
  const c = (code || '').toLowerCase();
  if (!c) return 'en';
  // Exact match
  if ((SUPPORTED as readonly string[]).includes(c)) return c as SupportedLang;
  // Match by prefix (e.g., es-AR -> es)
  const prefix = c.split('-')[0];
  if ((SUPPORTED as readonly string[]).includes(prefix)) return prefix as SupportedLang;
  return 'en';
}

export function usePreferredLanguage() {
  const [language, setLanguageState] = useState<SupportedLang>('en');

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
      if (saved) {
        setLanguageState(normalizeToSupported(saved));
        return;
      }
      const nav = typeof navigator !== 'undefined' ? (navigator.language || (navigator as any).userLanguage) : 'en';
      setLanguageState(normalizeToSupported(nav));
    } catch {
      // Fallback silently
      setLanguageState('en');
    }
  }, []);

  const setLanguage = useMemo(() => (
    (lang: string) => {
      const norm = normalizeToSupported(lang);
      setLanguageState(norm);
      try { if (typeof window !== 'undefined') localStorage.setItem('lang', norm); } catch {}
    }
  ), []);

  return { language, setLanguage } as const;
}
