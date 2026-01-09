import React, { createContext, useState, useContext, ReactNode } from 'react';
import { en, es } from '../i18n/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('sora-lang') || 'en');
  
  // Initialize translations directly from imported objects
  const translations: Record<string, any> = { en, es };

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      localStorage.setItem('sora-lang', lang);
      setLanguageState(lang);
    }
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const currentTranslations = translations[language] || translations.en;
    const keys = key.split('.');
    let result = currentTranslations;

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult = translations.en;
        for(const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if (fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }

    let translatedString = String(result || key);

    if (replacements && typeof translatedString === 'string') {
        Object.keys(replacements).forEach(rKey => {
            translatedString = translatedString.replace(`{{${rKey}}}`, String(replacements[rKey]));
        });
    }

    return translatedString;
  };

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};