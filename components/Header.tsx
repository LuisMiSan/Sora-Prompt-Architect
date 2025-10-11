
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-brand-primary/50 p-1 rounded-lg border border-brand-ui-border/50">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
          language === 'en' ? 'bg-brand-accent text-white shadow-md shadow-brand-glow' : 'text-brand-subtle hover:bg-brand-surface'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
          language === 'es' ? 'bg-brand-accent text-white shadow-md shadow-brand-glow' : 'text-brand-subtle hover:bg-brand-surface'
        }`}
        aria-pressed={language === 'es'}
      >
        ES
      </button>
    </div>
  );
};


const Header: React.FC = () => {
  const { t } = useLanguage();
  return (
    <header className="bg-brand-surface/70 backdrop-blur-lg border-b border-brand-ui-border/50 sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-accent-bright border border-brand-ui-border/50 rounded-lg flex items-center justify-center shadow-lg shadow-brand-glow">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M7 6C7 4.89543 7.89543 4 9 4H17C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H9C7.89543 20 7 19.1046 7 18V6Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 12L14 9V15L10 12Z" fill="currentColor"/>
                </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              {t('header.title')}
            </h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;