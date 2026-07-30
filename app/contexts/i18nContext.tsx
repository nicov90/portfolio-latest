"use client";
import React, { createContext, ReactNode, useContext } from 'react';
import { type SupportedLang, usePreferredLanguage } from '../hooks/usePreferredLanguage';
import { useSiteContentMap, type SiteContentMap } from '../hooks/useSiteContent';
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import ja from '../locales/ja/common.json';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const translations = { es, en, ja } as const;

// Recursively substitutes any DB-stored override found at `${prefix}.${nestedPath}`
// into the JSON-derived value, so structural consumers (e.g. `t('experience.items')`)
// transparently get per-field edits without every call site needing its own t() call.
function deepApplyOverrides(value: any, prefix: string, overrides: SiteContentMap): any {
  if (Object.prototype.hasOwnProperty.call(overrides, prefix)) {
    const raw = overrides[prefix];
    if (Array.isArray(value) || (value && typeof value === 'object')) {
      try {
        return JSON.parse(raw);
      } catch {
        return value;
      }
    }
    return raw;
  }

  if (Array.isArray(value)) {
    return value.map((item, i) => deepApplyOverrides(item, `${prefix}.${i}`, overrides));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const k of Object.keys(value)) {
      result[k] = deepApplyOverrides(value[k], `${prefix}.${k}`, overrides);
    }
    return result;
  }

  return value;
}

export const I18nProvider: React.FC<{ children: ReactNode; defaultLanguage?: SupportedLang }> = ({ children, defaultLanguage }) => {
  const { language, setLanguage } = usePreferredLanguage(defaultLanguage);
  const { data: overrides } = useSiteContentMap(language);

  const t = (key: string): any => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in language: ${language}`, { value, missingKey: k });
        return key; // Return the key if translation is not found
      }
    }

    if (value === undefined) return key;
    if (!overrides) return value;
    return deepApplyOverrides(value, key, overrides);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
