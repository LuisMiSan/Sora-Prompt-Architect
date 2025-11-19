import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectKey: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSelectKey }) => {
    const { t } = useLanguage();
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-brand-surface w-full max-w-lg rounded-2xl shadow-xl flex flex-col border border-brand-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-brand-border">
                    <h3 className="text-xl font-bold text-brand-text-primary">{t('apiKeyModal.title')}</h3>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-brand-text-secondary">{t('apiKeyModal.body')}</p>
                    <p className="text-sm text-brand-text-secondary">
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-accent-to hover:underline">
                            {t('apiKeyModal.linkText')}
                        </a>
                    </p>
                </div>
                 <div className="flex justify-end p-4 bg-brand-surface border-t border-brand-border rounded-b-2xl">
                    <button 
                        onClick={onSelectKey} 
                        type="button" 
                        className="px-5 py-2 text-sm bg-gradient-to-r from-brand-accent-from to-brand-accent-to hover:shadow-glow text-white font-semibold rounded-lg transition-all duration-300"
                    >
                        {t('apiKeyModal.button')}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;