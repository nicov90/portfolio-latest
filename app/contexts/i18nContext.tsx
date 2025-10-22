import React, { createContext, ReactNode, useContext, useState } from 'react';
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const translations = { es, en } as const;

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('es');

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
    
    return value !== undefined ? value : key;
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