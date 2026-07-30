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

// Reads a previously explicit choice, if any, without subscribing to changes — used by things
// that only care about "what was already chosen before this page load" (e.g. the intro's
// rotating greeting), not live updates.
export function getSavedLanguage(): SupportedLang | null {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
    return saved ? normalizeToSupported(saved) : null;
  } catch {
    return null;
  }
}

// `initialDefault` comes from a server-side IP/region lookup (see app/page.tsx), so the very
// first client render already matches what the server sent — no navigator.language guess, no
// post-mount flash. A saved explicit choice in localStorage still wins over the regional default.
export function usePreferredLanguage(initialDefault: SupportedLang = 'en') {
  const [language, setLanguageState] = useState<SupportedLang>(initialDefault);

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
      if (saved) {
        setLanguageState(normalizeToSupported(saved));
      }
      // No saved preference: keep the server-resolved regional default already in state.
    } catch {
      // Fallback silently — state already holds the server-resolved default.
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
