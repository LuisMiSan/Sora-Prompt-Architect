
import React, { useState } from 'react';
import { SavedPrompt, PromptVersion } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PromptGalleryProps {
  prompts: SavedPrompt[];
  onRemix: (promptId: string, version: PromptVersion) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const VersionHistoryModal: React.FC<{
  prompt: SavedPrompt;
  onClose: () => void;
  onRemix: (promptId: string, version: PromptVersion) => void;
}> = ({ prompt, onClose, onRemix }) => {
  const { t } = useLanguage();
  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-brand-surface w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-brand-ui-border/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-brand-ui-border/50">
          <h3 className="text-xl font-bold text-white">{t('gallery.versionHistoryTitle')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          {prompt.versions.map((version, index) => (
            <div key={version.createdAt} className="bg-brand-primary p-4 rounded-lg border border-brand-ui-border/50">
              <div className="flex justify-between items-start mb-3 gap-4">
                <div>
                  <p className="text-sm text-brand-subtle">
                    {t('gallery.versionCreatedOn')} <span className="font-semibold text-brand-text">{new Date(version.createdAt).toLocaleString()}</span>
                    {index === 0 && <span className="ml-2 text-xs font-bold text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-full">{t('gallery.latest')}</span>}
                  </p>
                </div>
                <button 
                  onClick={() => { onRemix(prompt.id, version); onClose(); }}
                  className="bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                    {t('gallery.remixThisVersion')}
                </button>
              </div>
              {version.versionNotes && (
                <div className="mb-3">
                  <p className="text-xs text-brand-subtle font-semibold">{t('gallery.versionNotesLabel')}</p>
                  <p className="text-sm text-brand-text italic">"{version.versionNotes}"</p>
                </div>
              )}
              <div className="bg-brand-surface p-3 rounded-lg max-h-40 overflow-y-auto">
                 <p className="text-brand-text text-sm whitespace-pre-wrap">{version.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const PromptGallery: React.FC<PromptGalleryProps> = ({ prompts, onRemix, onDelete, onToggleVisibility }) => {
  const { t } = useLanguage();
  const [historyModalPrompt, setHistoryModalPrompt] = useState<SavedPrompt | null>(null);


  if (prompts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-white mb-2">{t('gallery.empty.title')}</h2>
        <p className="text-brand-subtle max-w-md mx-auto">{t('gallery.empty.subtitle')}</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-4xl font-bold text-white text-center">{t('gallery.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {prompts.map(prompt => {
          const latestVersion = prompt.versions[0];
          if (!latestVersion) return null;
          
          const firstVersion = prompt.versions[prompt.versions.length - 1];

          return (
          <div key={prompt.id} className="group bg-brand-surface p-5 rounded-2xl border border-brand-ui-border/50 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-glow hover:shadow-brand-glow hover:border-brand-accent/50">
            <div className="flex flex-col space-y-4">
                 <div className="flex justify-between items-start">
                    <p className="text-brand-text line-clamp-6 font-medium pr-4 text-sm">{latestVersion.prompt}</p>
                    <div className="flex-shrink-0">
                         <button
                            onClick={() => onToggleVisibility(prompt.id)}
                            title={t(`gallery.visibilityTooltip.${prompt.visibility === 'public' ? 'makePrivate' : 'makePublic'}`)}
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${prompt.visibility === 'public' ? 'bg-green-800/50 text-green-300 hover:bg-green-700/50' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600'}`}
                         >
                            {t(`gallery.visibility.${prompt.visibility}`)}
                         </button>
                    </div>
                </div>

                {latestVersion.versionNotes && (
                  <div className="p-3 bg-brand-primary rounded-lg border border-brand-ui-border/50">
                    <p className="text-xs text-brand-subtle font-semibold">{t('gallery.versionNotes')}</p>
                    <p className="text-sm text-brand-text italic">"{latestVersion.versionNotes}"</p>
                  </div>
                )}
                <div className="text-xs text-brand-subtle space-y-2">
                  <p>
                    <span className="font-semibold">{t('gallery.sceneIdea')}</span> <span className="italic">"{latestVersion.sceneDescription}"</span>
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                     <p>
                        <span className="font-semibold">{t('gallery.shots')}</span> {latestVersion.shots.length}
                     </p>
                     {latestVersion.aspectRatio && (
                        <p>
                            <span className="font-semibold">{t('gallery.format')}</span>
                            <span className="ml-1.5 inline-block bg-brand-ui-bg text-gray-200 px-2 py-0.5 rounded-full text-xs">
                                {latestVersion.aspectRatio}
                            </span>
                        </p>
                     )}
                     {latestVersion.cameos && latestVersion.cameoConsent && (
                         <p className="flex items-center">
                            <span className="font-semibold">{t('gallery.cameoConsent')}</span>
                            <span className="ml-1.5 flex items-center gap-1 text-green-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                {t('gallery.acknowledged')}
                            </span>
                         </p>
                     )}
                  </div>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-brand-ui-border/50 mt-4">
                <p className="text-xs text-brand-subtle">{new Date(firstVersion.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setHistoryModalPrompt(prompt)}
                        className="p-2 bg-brand-ui-bg hover:bg-brand-ui-border rounded-lg transition-colors"
                        title={t('gallery.history')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button
                    onClick={() => onRemix(prompt.id, latestVersion)}
                    className="p-2 bg-brand-accent hover:bg-brand-accent-hover rounded-lg transition-colors"
                    title={t('gallery.remixScene')}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </button>
                    <button
                    onClick={() => onDelete(prompt.id)}
                    className="p-2 bg-red-900/50 hover:bg-red-800/50 rounded-lg transition-colors"
                    title={t('gallery.deleteScene')}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
          </div>
        )})}
      </div>
    </div>
    {historyModalPrompt && (
        <VersionHistoryModal 
            prompt={historyModalPrompt}
            onClose={() => setHistoryModalPrompt(null)}
            onRemix={onRemix}
        />
    )}
    </>
  );
};

export default PromptGallery;