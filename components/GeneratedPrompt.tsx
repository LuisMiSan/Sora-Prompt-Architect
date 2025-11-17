import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { VEO_SUPPORTED_ASPECT_RATIOS } from '../constants';

interface GeneratedPromptProps {
  prompt: string;
  onSave: (versionNotes: string) => void;
  canSave: boolean;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
  aspectRatio: string;
}

const GeneratedPrompt: React.FC<GeneratedPromptProps> = ({ prompt, onSave, canSave, onGenerateVideo, isGeneratingVideo, aspectRatio }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');

  const isVeoSupported = VEO_SUPPORTED_ASPECT_RATIOS.includes(aspectRatio);

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
    <div className="p-1 bg-gradient-to-br from-brand-accent-from to-brand-accent-to rounded-2xl shadow-xl animate-fade-in">
        <div className="bg-brand-surface p-6 rounded-[15px] space-y-4">
          <h2 className="text-2xl font-bold text-brand-text-primary">{t('generatedPrompt.title')}</h2>
          <div className="bg-brand-bg p-4 rounded-lg border border-brand-border max-h-80 overflow-y-auto">
            <p className="text-brand-text-primary whitespace-pre-wrap text-sm">{prompt}</p>
          </div>
           <div>
            <label htmlFor="versionNotes" className="block text-sm font-medium text-brand-text-secondary mb-2">
              {t('generatedPrompt.versionNotesLabel')}
            </label>
            <input
              type="text"
              id="versionNotes"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              className="w-full bg-brand-ui-bg border border-brand-border rounded-lg p-2.5 focus:border-brand-accent-to focus:ring-2 focus:ring-brand-accent-to/50 transition-all placeholder-brand-text-secondary/50 text-sm text-brand-text-primary"
              placeholder={t('generatedPrompt.versionNotesPlaceholder')}
              disabled={!canSave}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleCopy}
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-brand-ui-bg hover:bg-slate-600 border border-brand-border text-brand-text-primary font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              {copied ? t('buttons.copied') : t('buttons.copy')}
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-brand-ui-bg hover:bg-slate-600 border border-brand-border text-brand-text-primary font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canSave ? t('generatedPrompt.saveDisabledTooltip') : ''}
            >
              {t('buttons.save')}
            </button>
            <button
              onClick={onGenerateVideo}
              disabled={isGeneratingVideo || !isVeoSupported}
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent-from to-brand-accent-to hover:shadow-glow text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
              title={!isVeoSupported ? t('generatedPrompt.videoUnsupportedAspect') : ''}
            >
             {isGeneratingVideo ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {t('buttons.generatingVideo')}
                </>
             ) : (
                t('buttons.generateVideo')
             )}
            </button>
          </div>
        </div>
    </div>
  );
};

export default GeneratedPrompt;