
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg border border-brand-border">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
          language === 'en' ? 'bg-brand-accent-to text-white' : 'text-brand-text-secondary hover:bg-brand-surface'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
          language === 'es' ? 'bg-brand-accent-to text-white' : 'text-brand-text-secondary hover:bg-brand-surface'
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
    <header className="bg-brand-surface/80 backdrop-blur-lg border-b border-brand-border sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-accent-from to-brand-accent-to border-2 border-white/50 shadow-md rounded-xl flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M21.821 5.239c-.31-.387-.78-.62-1.285-.62h-2.39L15.86 2.14c-.218-.363-.615-.59-1.045-.59H4c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6.512c0-.52-.25-1.01-.679-1.273zM5 19V6h10v13H5zm14-1V8.223l-2-1.333V19h-2V6.89l-2-1.334V4h1.86l2.285 2.539H19z"/>
                    <path d="m11.14 3.55-4.28 4.28 1.414 1.414 4.28-4.28z"/>
                    <path d="m13.26 1.43-4.28 4.28 1.414 1.414 4.28-4.28z"/>
                </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-brand-text-primary tracking-tight">
              <span className="bg-gradient-to-r from-brand-accent-from to-brand-accent-to bg-clip-text text-transparent">{t('header.titleMain')}</span>
              <span className="ml-2 font-medium text-brand-text-secondary">{t('header.titleSubtitle')}</span>
            </h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;