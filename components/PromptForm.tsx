
import React, { useState, useEffect, useMemo } from 'react';
import { PromptParameters, Shot, PhysicsData, AudioData, CameraEffectsData } from '../types';
import { PROMPT_OPTIONS, initialParameters, ASPECT_RATIO_OPTIONS } from '../constants';
import { SceneData } from '../App';
import { getSuggestions, deconstructPrompt } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';

interface PromptFormProps {
  onGenerate: (data: SceneData) => void;
  isLoading: boolean;
  initialData: SceneData | null;
  remixSourceId: string | null;
  onClearRemix: () => void;
  onDeconstruct: (data: SceneData) => void;
}

const inputBaseClasses = "w-full bg-brand-primary border border-brand-ui-border/80 rounded-lg p-2.5 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/50 transition-all placeholder-brand-subtle/50 text-sm";
const textAreaBaseClasses = `${inputBaseClasses} resize-y`;

// --- SUB-COMPONENTS ---

const ImportPromptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDeconstruct: (data: SceneData) => void;
}> = ({ isOpen, onClose, onDeconstruct }) => {
    const { t } = useLanguage();
    const [promptText, setPromptText] = useState('');
    const [isDeconstructing, setIsDeconstructing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeconstruct = async () => {
        if (!promptText.trim()) return;
        setIsDeconstructing(true);
        setError(null);
        try {
            const deconstructedData = await deconstructPrompt(promptText);
            onDeconstruct(deconstructedData);
            onClose();
            setPromptText('');
        } catch (e: any) {
            setError(e.message || t('promptForm.import.errorMessage'));
        } finally {
            setIsDeconstructing(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-brand-surface w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col border border-brand-ui-border/50 shadow-black/40"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-brand-ui-border/50">
                    <h3 className="text-xl font-bold text-white">{t('promptForm.import.modalTitle')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-brand-subtle text-sm">{t('promptForm.import.modalSubtitle')}</p>
                    <textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        rows={8}
                        className={textAreaBaseClasses}
                        placeholder={t('promptForm.import.placeholder')}
                        disabled={isDeconstructing}
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
                 <div className="flex justify-end gap-3 p-4 bg-brand-primary/50 border-t border-brand-ui-border/50 rounded-b-2xl">
                    <button onClick={onClose} type="button" className="px-5 py-2 text-sm bg-brand-ui-bg hover:bg-brand-ui-border border border-brand-ui-border rounded-lg transition-colors">
                        {t('promptForm.import.cancel')}
                    </button>
                    <button 
                        onClick={handleDeconstruct} 
                        type="button" 
                        disabled={isDeconstructing || !promptText.trim()}
                        className="px-5 py-2 text-sm bg-gradient-to-r from-brand-accent to-brand-accent-bright hover:shadow-glow hover:shadow-brand-glow text-white font-semibold rounded-lg transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isDeconstructing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {t('promptForm.import.deconstructingButton')}
                            </>
                        ) : t('promptForm.import.deconstructButton')}
                    </button>
                 </div>
            </div>
        </div>
    );
};

const defaultShot = (): Shot => ({
  id: Date.now().toString() + Math.random(),
  description: '',
  parameters: { ...initialParameters },
  constraints: '',
});

const initialPhysics: PhysicsData = {
  weightAndRigidity: '',
  materialInteractions: '',
  environmentalForces: '',
};

const initialAudio: AudioData = {
  dialogue: '',
  soundEffects: '',
  music: '',
};

const initialCameraEffects: CameraEffectsData = {
  depthOfField: 'natural',
  cameraMovement: 'none',
};

const parameterGroups: Record<string, (keyof PromptParameters)[]> = {
  'camera': ['shotType', 'cameraAngle', 'cameraMovement', 'lens', 'composition', 'depthOfField'],
  'style': ['style', 'lighting', 'colorPalette', 'texture', 'filmQuality', 'genre'],
  'context': ['pacing', 'timeOfDay', 'location'],
};


const ShotEditor: React.FC<{
  shot: Shot;
  index: number;
  onUpdate: (id: string, updatedShot: Partial<Shot>) => void;
  onDelete: (id: string) => void;
}> = ({ shot, index, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(Object.keys(parameterGroups)[0]);

  const handleParameterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate(shot.id, {
      parameters: { ...shot.parameters, [name]: value },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate(shot.id, { [name]: value });
  };

  return (
    <div className="bg-brand-primary/50 border border-brand-ui-border/50 rounded-2xl p-4 space-y-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h4 className="font-bold text-lg text-white">
          {t('shotEditor.title', { index: index + 1 })}
          {shot.description && <span className="text-sm font-normal text-brand-subtle ml-2 italic hidden md:inline"> - {shot.description.substring(0, 30)}...</span>}
        </h4>
        <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(shot.id); }}
              className="p-1.5 text-brand-subtle hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              title={t('shotEditor.delete')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <span className={`transition-transform transform ${isOpen ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </span>
        </div>
      </div>
      {isOpen && (
        <div className="animate-fade-in space-y-4 pt-2">
          <textarea
            name="description"
            placeholder={t('shotEditor.descriptionPlaceholder')}
            value={shot.description}
            onChange={handleInputChange}
            rows={2}
            className={textAreaBaseClasses}
          />
          <input
            type="text"
            name="constraints"
            placeholder={t('shotEditor.constraintsPlaceholder')}
            value={shot.constraints}
            onChange={handleInputChange}
            className={inputBaseClasses}
            />
          <div className="bg-brand-primary/50 rounded-lg border border-brand-ui-border/50">
            <div className="flex border-b border-brand-ui-border/50 px-2 overflow-x-auto">
              {Object.keys(parameterGroups).map(groupName => (
                <button
                  key={groupName}
                  type="button"
                  onClick={() => setActiveTab(groupName)}
                  className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap relative ${
                    activeTab === groupName
                      ? 'text-white'
                      : 'text-brand-subtle hover:text-white'
                  }`}
                >
                  {t(`shotEditor.tabs.${groupName}`)}
                  {activeTab === groupName && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-accent to-brand-accent-bright rounded-full"></span>}
                </button>
              ))}
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parameterGroups[activeTab as keyof typeof parameterGroups].map(key => {
                  const options = PROMPT_OPTIONS[key as keyof typeof PROMPT_OPTIONS];
                  if (!options) return null;
                  return (
                    <div key={key}>
                      <label htmlFor={`${key}-${shot.id}`} className="block text-xs font-medium text-brand-subtle mb-1.5 capitalize">
                        {t(`promptOptions.labels.${key}`)}
                      </label>
                      <select
                        id={`${key}-${shot.id}`}
                        name={key}
                        value={shot.parameters[key as keyof PromptParameters]}
                        onChange={handleParameterChange}
                        className={inputBaseClasses}
                      >
                        {options.map(option => (
                          <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdvancedPanel: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
     <div className="bg-brand-primary/50 border border-brand-ui-border/50 rounded-2xl">
      <button
        type="button"
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <span className={`transition-transform transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </span>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-6 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};


// --- MAIN FORM COMPONENT ---

const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading, initialData, remixSourceId, onClearRemix, onDeconstruct }) => {
  const { t, language } = useLanguage();
  const [sceneDescription, setSceneDescription] = useState('');
  const [shots, setShots] = useState<Shot[]>([defaultShot()]);
  const [cameos, setCameos] = useState('');
  const [cameoConsent, setCameoConsent] = useState(false);
  const [physics, setPhysics] = useState<PhysicsData>(initialPhysics);
  const [audio, setAudio] = useState<AudioData>(initialAudio);
  const [cameraEffects, setCameraEffects] = useState<CameraEffectsData>(initialCameraEffects);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleApplySuggestions = () => {
    if (!suggestions) return;
    const divider = t('promptForm.suggestions.divider');
    setSceneDescription(prev => `${prev.trim()}\n\n${divider}\n${suggestions}`);
    setSuggestions(null);
  };

  useEffect(() => {
    if (initialData) {
      setSceneDescription(initialData.sceneDescription);
      setShots(initialData.shots.length > 0 ? initialData.shots : [defaultShot()]);
      setCameos(initialData.cameos);
      setAudio(initialData.audio || initialAudio);
      setPhysics(initialData.physics || initialPhysics);
      setCameraEffects(initialData.cameraEffects || initialCameraEffects);
      setAspectRatio(initialData.aspectRatio || '16:9');
      setCameoConsent(initialData.cameoConsent || false);
    }
  }, [initialData]);
  
  const handleReset = () => {
    setSceneDescription('');
    setShots([defaultShot()]);
    setCameos('');
    setCameoConsent(false);
    setAudio(initialAudio);
    setPhysics(initialPhysics);
    setCameraEffects(initialCameraEffects);
    setAspectRatio('16:9');
    setSuggestions(null);
    setSuggestionError(null);
    onClearRemix();
  };

  const handleAddShot = () => {
    setShots([...shots, defaultShot()]);
  };
  
  const handleUpdateShot = (id: string, updatedShot: Partial<Shot>) => {
    setShots(shots.map(s => s.id === id ? { ...s, ...updatedShot } : s));
  };
  
  const handleDeleteShot = (id: string) => {
    if (shots.length > 1) {
      setShots(shots.filter(s => s.id !== id));
    }
  };
  
  const handleGetSuggestions = async () => {
    if (!sceneDescription.trim()) {
        setSuggestionError(t('promptForm.error.descriptionNeeded'));
        return;
    }
    setIsSuggesting(true);
    setSuggestions(null);
    setSuggestionError(null);
    try {
        const result = await getSuggestions({ sceneDescription, shots, cameos, audio, physics, cameraEffects, aspectRatio, cameoConsent }, language);
        setSuggestions(result);
    } catch (e) {
        setSuggestionError(t('promptForm.error.suggestionsFailed'));
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sceneDescription.trim()) {
      onGenerate({ sceneDescription, shots, cameos, audio, physics, cameraEffects, aspectRatio, cameoConsent });
    }
  };

  const isEditing = !!initialData;
  const isRemixing = isEditing && !!remixSourceId;
  const isImported = isEditing && !remixSourceId;

  return (
    <>
    <ImportPromptModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDeconstruct={onDeconstruct}
    />
    <form onSubmit={handleSubmit} className="space-y-8">
       <div className="flex justify-between items-start gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">{t('promptForm.title')}</h2>
            <p className="text-brand-subtle text-sm mt-1">{t('promptForm.subtitle')}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-2 text-sm bg-brand-surface hover:bg-brand-ui-bg border border-brand-ui-border rounded-lg transition-colors flex items-center gap-2"
                title={t('promptForm.import.tooltip')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011 1v2.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8 6.586V4a1 1 0 011-1z" /><path d="M10 12a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                {t('promptForm.import.button')}
            </button>
            {isEditing && (
                <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-sm bg-brand-primary hover:bg-brand-surface border border-brand-ui-border rounded-lg transition-colors"
                >
                {t('promptForm.startNew')}
                </button>
            )}
        </div>
      </div>
       {isRemixing && (
        <div className="bg-brand-accent/10 border border-brand-accent/50 p-3 rounded-lg text-sm text-brand-text shadow-inner shadow-brand-glow/50">
          {t('promptForm.remixingMessage')}
        </div>
      )}
      {isImported && (
        <div className="bg-blue-900/20 border border-blue-500/50 p-3 rounded-lg text-sm text-blue-200">
          {t('promptForm.importedMessage')}
        </div>
      )}
      
      <div>
        <label htmlFor="sceneDescription" className="block text-sm font-medium text-brand-subtle mb-2">
          {t('promptForm.sceneDescriptionLabel')}
        </label>
        <textarea
          id="sceneDescription"
          name="sceneDescription"
          rows={4}
          className={textAreaBaseClasses}
          placeholder={t('promptForm.sceneDescriptionPlaceholder')}
          value={sceneDescription}
          onChange={(e) => setSceneDescription(e.target.value)}
          required
        />
      </div>

       <div className="bg-brand-primary/50 border border-brand-ui-border/50 rounded-2xl p-4 space-y-3">
            <label htmlFor="cameos" className="block text-sm font-medium text-brand-subtle">
              {t('promptForm.cameosLabel')}
            </label>
            <input
              type="text"
              id="cameos"
              value={cameos}
              onChange={(e) => setCameos(e.target.value)}
              className={inputBaseClasses}
              placeholder={t('promptForm.cameosPlaceholder')}
            />
            <div className="flex items-start space-x-3 pt-2">
                <input
                    type="checkbox"
                    id="cameoConsent"
                    checked={cameoConsent}
                    onChange={(e) => setCameoConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-brand-ui-border bg-brand-ui-bg text-brand-accent focus:ring-brand-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!cameos.trim()}
                />
                <div>
                    <label htmlFor="cameoConsent" className={`font-medium transition-colors ${cameos.trim() ? 'text-brand-text' : 'text-gray-500'}`}>
                        {t('promptForm.cameoConsentLabel')}
                    </label>
                    <p className={`text-xs transition-colors ${cameos.trim() ? 'text-brand-subtle' : 'text-gray-500'}`}>{t('promptForm.cameoConsentDescription')}</p>
                </div>
            </div>
       </div>

      <AdvancedPanel title={t('advancedSettings.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-brand-subtle border-b border-brand-ui-border pb-2">{t('advancedSettings.physicsEngine')}</h4>
            <div>
              <label htmlFor="weightAndRigidity" className="block text-xs font-medium text-brand-subtle mb-1.5">{t('advancedSettings.weightAndRigidity')}</label>
              <textarea id="weightAndRigidity" value={physics.weightAndRigidity} onChange={(e) => setPhysics(prev => ({...prev, weightAndRigidity: e.target.value}))} rows={2} className={textAreaBaseClasses} placeholder={t('advancedSettings.weightAndRigidityPlaceholder')} />
            </div>
            <div>
              <label htmlFor="materialInteractions" className="block text-xs font-medium text-brand-subtle mb-1.5">{t('advancedSettings.materialInteractions')}</label>
              <textarea id="materialInteractions" value={physics.materialInteractions} onChange={(e) => setPhysics(prev => ({...prev, materialInteractions: e.target.value}))} rows={2} className={textAreaBaseClasses} placeholder={t('advancedSettings.materialInteractionsPlaceholder')} />
            </div>
            <div>
              <label htmlFor="environmentalForces" className="block text-xs font-medium text-brand-subtle mb-1.5">{t('advancedSettings.environmentalForces')}</label>
              <textarea id="environmentalForces" value={physics.environmentalForces} onChange={(e) => setPhysics(prev => ({...prev, environmentalForces: e.target.value}))} rows={2} className={textAreaBaseClasses} placeholder={t('advancedSettings.environmentalForcesPlaceholder')} />
            </div>
          </div>
          <div className="space-y-4">
             <h4 className="text-sm font-semibold text-brand-subtle border-b border-brand-ui-border pb-2">{t('advancedSettings.soundscape')}</h4>
             <div>
              <label htmlFor="dialogue" className="block text-xs font-medium text-brand-subtle mb-1.5">{t('advancedSettings.dialogue')}</label>
              <textarea id="dialogue" value={audio.dialogue} onChange={(e) => setAudio(prev => ({...prev, dialogue: e.target.value}))} rows={2} className={textAreaBaseClasses} placeholder={t('advancedSettings.dialoguePlaceholder')} />
            </div>
            <div>
              <label htmlFor="soundEffects" className="block text-xs font-medium text-brand-subtle mb-1.5">{t('advancedSettings.sfx')}</label>
              <textarea id="soundEffects" value={audio.soundEffects} onChange={(e) => setAudio(prev => ({...prev, soundEffects: e.target.value}))} rows={2} className={textAreaBaseClasses} placeholder={t('advancedSettings.sfxPlaceholder')} />
            </div>
            <div>
              <label htmlFor="music" className="block text-xs font-medium text-brand-subtle mb-1.5">{t('advancedSettings.music')}</label>
              <textarea id="music" value={audio.music} onChange={(e) => setAudio(prev => ({...prev, music: e.target.value}))} rows={2} className={textAreaBaseClasses} placeholder={t('advancedSettings.musicPlaceholder')} />
            </div>
          </div>
        </div>
      </AdvancedPanel>

      <div>
        <label htmlFor="aspectRatio" className="block text-sm font-medium text-brand-subtle mb-2">
          {t('promptForm.aspectRatioLabel')}
        </label>
        <select
          id="aspectRatio"
          name="aspectRatio"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          className={inputBaseClasses}
        >
          {ASPECT_RATIO_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Shot List</h3>
        {shots.map((shot, index) => (
          <ShotEditor key={shot.id} shot={shot} index={index} onUpdate={handleUpdateShot} onDelete={handleDeleteShot} />
        ))}
      </div>
      
       <button
          type="button"
          onClick={handleAddShot}
          className="w-full flex items-center justify-center gap-2 text-center bg-brand-primary/20 hover:bg-brand-accent/10 border-2 border-dashed border-brand-ui-border/80 hover:border-brand-accent text-brand-subtle hover:text-brand-accent font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {t('promptForm.addShot')}
        </button>

       {(suggestions || isSuggesting || suggestionError) && (
        <div className="bg-brand-primary/50 border border-brand-ui-border/50 rounded-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg text-white">{t('promptForm.suggestions.title')}</h4>
            <button type="button" onClick={() => { setSuggestions(null); setSuggestionError(null); }} className="text-gray-400 hover:text-white">&times;</button>
          </div>
          {isSuggesting && <p className="text-brand-subtle animate-pulse-fast">{t('promptForm.suggestions.loading')}</p>}
          {suggestionError && <p className="text-red-400">{suggestionError}</p>}
          {suggestions && (
            <div>
              <ul className="list-disc list-inside text-brand-text space-y-1">
                {suggestions.split('\n- ').map((s, i) => s.trim() && <li key={i}>{s.replace(/^-/, '').trim()}</li>)}
              </ul>
              <button
                type="button"
                onClick={handleApplySuggestions}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586L7.707 10.293zM3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
                {t('buttons.applySuggestions')}
              </button>
            </div>
          )}
        </div>
       )}

      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGetSuggestions}
          disabled={isLoading || isSuggesting}
          className="w-full flex items-center justify-center gap-2 bg-brand-surface border border-brand-accent text-brand-accent hover:bg-brand-accent/10 font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
           {isSuggesting ? (
             <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {t('buttons.thinking')}
             </>
           ) : t('buttons.getSuggestions') }
        </button>
        <button
          type="submit"
          disabled={isLoading || !sceneDescription.trim() || (!!cameos.trim() && !cameoConsent)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-accent-bright hover:shadow-glow hover:shadow-brand-glow text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
          title={!!cameos.trim() && !cameoConsent ? t('promptForm.error.cameoConsentNeeded') : ""}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('buttons.generating')}
            </>
          ) : (
            t('buttons.generate')
          )}
        </button>
      </div>
      
       <div className="mt-6 border-t border-brand-ui-border/50 pt-6">
            <h4 className="font-semibold text-brand-subtle text-sm">{t('promptForm.guidelines.title')}</h4>
            <ul className="list-disc list-inside text-xs text-gray-500 mt-2 space-y-1">
                <li>{t('promptForm.guidelines.one')}</li>
                <li>{t('promptForm.guidelines.two')}</li>
                <li>{t('promptForm.guidelines.three')}</li>
            </ul>
        </div>
    </form>
    </>
  );
};

export default PromptForm;