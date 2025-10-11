
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface GeneratedPromptProps {
  prompt: string;
  onSave: (versionNotes: string) => void;
  canSave: boolean;
}

const GeneratedPrompt: React.FC<GeneratedPromptProps> = ({ prompt, onSave, canSave }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');

  useEffect(() => {
    setCopied(false);
    setVersionNotes(''); // Reset notes for new prompt
  }, [prompt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSave = () => {
    onSave(versionNotes);
  };

  return (
    <div className="p-1 bg-gradient-to-br from-brand-accent to-brand-accent-bright rounded-2xl shadow-2xl shadow-black/20 animate-fade-in">
        <div className="bg-brand-surface p-6 rounded-[15px] space-y-4">
          <h2 className="text-2xl font-bold text-white">{t('generatedPrompt.title')}</h2>
          <div className="bg-brand-primary p-4 rounded-lg border border-brand-ui-border/50 max-h-80 overflow-y-auto">
            <p className="text-brand-text whitespace-pre-wrap text-sm">{prompt}</p>
          </div>
           <div>
            <label htmlFor="versionNotes" className="block text-sm font-medium text-brand-subtle mb-2">
              {t('generatedPrompt.versionNotesLabel')}
            </label>
            <input
              type="text"
              id="versionNotes"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              className="w-full bg-brand-primary border border-brand-ui-border/80 rounded-lg p-2.5 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/50 transition-all placeholder-brand-subtle/50 text-sm"
              placeholder={t('generatedPrompt.versionNotesPlaceholder')}
              disabled={!canSave}
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-ui-bg hover:bg-brand-ui-border border border-brand-ui-border text-brand-text font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              {copied ? t('buttons.copied') : t('buttons.copy')}
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-accent-bright hover:shadow-glow hover:shadow-brand-glow text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
              title={!canSave ? t('generatedPrompt.saveDisabledTooltip') : t('generatedPrompt.saveTooltip')}
            >
              {t('buttons.save')}
            </button>
          </div>
        </div>
    </div>
  );
};

export default GeneratedPrompt;