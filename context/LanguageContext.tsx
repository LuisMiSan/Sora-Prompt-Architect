import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('sora-lang') || 'en');
  const [translations, setTranslations] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [enResponse, esResponse] = await Promise.all([
          fetch('./i18n/en.json'),
          fetch('./i18n/es.json')
        ]);
        if (!enResponse.ok || !esResponse.ok) {
          throw new Error(`HTTP error! status: ${enResponse.status} ${esResponse.status}`);
        }
        const en = await enResponse.json();
        const es = await esResponse.json();
        setTranslations({ en, es });
      } catch (error) {
        console.error("Error loading translation files:", error);
        setTranslations({ en: {}, es: {} }); // Set empty translations on error
      }
    };
    loadTranslations();
  }, []);

  const setLanguage = (lang: string) => {
    if (translations && translations[lang]) {
      localStorage.setItem('sora-lang', lang);
      setLanguageState(lang);
    }
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    if (!translations) {
      return key; // Return key if translations are not loaded yet
    }
      
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

  if (!translations) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center">
        <p className="text-brand-text text-lg animate-pulse">Loading Application...</p>
      </div>
    );
  }

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
