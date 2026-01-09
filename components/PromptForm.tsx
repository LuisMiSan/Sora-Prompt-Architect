import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PromptParameters, Shot, PhysicsData, AudioData, CameraEffectsData, AnimationData, SceneData } from '../types';
import { PROMPT_OPTIONS, initialParameters, ASPECT_RATIO_OPTIONS } from '../constants';
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

const inputBaseClasses = "w-full bg-brand-ui-bg border border-brand-border rounded-lg p-2.5 focus:border-brand-accent-to focus:ring-2 focus:ring-brand-accent-to/50 transition-all placeholder-brand-text-secondary/50 text-sm text-brand-text-primary";
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-brand-surface w-full max-w-2xl rounded-2xl shadow-xl flex flex-col border border-brand-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-brand-border">
                    <h3 className="text-xl font-bold text-brand-text-primary">{t('promptForm.import.modalTitle')}</h3>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-brand-text-secondary text-sm">{t('promptForm.import.modalSubtitle')}</p>
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
                 <div className="flex justify-end gap-3 p-4 bg-brand-bg border-t border-brand-border rounded-b-2xl">
                    <button onClick={onClose} type="button" className="px-5 py-2 text-sm bg-brand-ui-bg hover:bg-slate-600 border border-brand-border rounded-lg transition-colors text-brand-text-primary font-semibold">
                        {t('promptForm.import.cancel')}
                    </button>
                    <button 
                        onClick={handleDeconstruct} 
                        type="button" 
                        disabled={isDeconstructing || !promptText.trim()}
                        className="px-5 py-2 text-sm bg-gradient-to-r from-brand-accent-from to-brand-accent-to hover:shadow-glow text-white font-semibold rounded-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  weightAndRigidity: 'normal-gravity',
  materialInteractions: 'realistic',
  environmentalForces: 'none',
};

const initialAudio: AudioData = {
  dialogue: '',
  soundEffects: '',
  sfxStyle: 'none',
  music: '',
  musicStyle: 'none',
};

const initialAnimationData: AnimationData = {
  animationStyle: 'none',
  characterDesign: 'none',
  backgroundStyle: 'none',
  renderingStyle: 'none',
  frameRate: 'none',
};

const initialCameraEffects: CameraEffectsData = {
  depthOfField: 'natural',
  cameraMovement: 'none',
  cameraAnimation: 'none',
  shotType: 'medium-shot',
  cameraAngle: 'eye-level',
  lens: '35mm',
  composition: 'rule-of-thirds',
};

const parameterGroups: Record<string, (keyof PromptParameters)[]> = {
  'camera': ['shotType', 'cameraAngle', 'cameraMovement', 'lens', 'composition', 'depthOfField'],
  'style': ['style', 'lighting', 'colorPalette', 'texture', 'filmQuality', 'genre'],
  'context': ['pacing', 'timeOfDay', 'location'],
};


const ShotEditor: React.FC<{
  shot: Shot;
  onUpdate: (id: string, updatedShot: Partial<Shot>) => void;
  isModal?: boolean; // Added to adjust styles if needed
}> = ({ shot, onUpdate, isModal = false }) => {
  const { t } = useLanguage();
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
    <div className="space-y-4 pt-2">
      <textarea
        name="description"
        placeholder={t('shotEditor.descriptionPlaceholder')}
        value={shot.description}
        onChange={handleInputChange}
        rows={3}
        className={textAreaBaseClasses}
      />
      <textarea
        name="constraints"
        placeholder={t('shotEditor.constraintsPlaceholder')}
        value={shot.constraints}
        onChange={handleInputChange}
        rows={2}
        className={textAreaBaseClasses}
      />
      <div className="bg-brand-surface rounded-lg border border-brand-border">
        <div className="flex border-b border-brand-border px-2 overflow-x-auto">
          {Object.keys(parameterGroups).map(groupName => (
            <button
              key={groupName}
              type="button"
              onClick={() => setActiveTab(groupName)}
              className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap relative ${
                activeTab === groupName
                  ? 'text-brand-text-primary'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              {t(`shotEditor.tabs.${groupName}`)}
              {activeTab === groupName && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-accent-from to-brand-accent-to rounded-full"></span>}
            </button>
          ))}
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parameterGroups[activeTab as keyof typeof parameterGroups].map(key => {
            const options = PROMPT_OPTIONS[key as keyof typeof PROMPT_OPTIONS];
            if (!options) return null;
            return (
              <div key={key}>
                <label htmlFor={`${key}-${shot.id}`} className="block text-xs font-medium text-brand-text-secondary mb-1.5 capitalize">
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
  );
};


const ShotEditorPanel: React.FC<{
  shot: Shot;
  index: number;
  onUpdate: (id: string, updatedShot: Partial<Shot>) => void;
  onDelete: (id: string) => void;
}> = ({ shot, index, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="bg-brand-bg border border-brand-border rounded-2xl p-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h4 className="font-bold text-lg text-brand-text-primary">
          {t('shotEditor.title', { index: index + 1 })}
          {shot.description && <span className="text-sm font-normal text-brand-text-secondary ml-2 italic hidden md:inline"> - {shot.description.substring(0, 30)}...</span>}
        </h4>
        <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(shot.id); }}
              className="p-1.5 text-brand-text-secondary hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
              title={t('shotEditor.delete')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <span className={`transition-transform transform text-brand-text-secondary ${isOpen ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </span>
        </div>
      </div>
      {isOpen && <div className="animate-fade-in"><ShotEditor shot={shot} onUpdate={onUpdate} /></div>}
    </div>
  );
};


const AdvancedPanel: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
     <div className="bg-brand-bg border border-brand-border rounded-2xl">
      <button
        type="button"
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="font-bold text-lg text-brand-text-primary">{title}</h3>
        <span className={`transition-transform transform text-brand-text-secondary ${isOpen ? 'rotate-180' : ''}`}>
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

const ShotEditorModal: React.FC<{
  shot: Shot;
  onClose: () => void;
  onUpdate: (id: string, updatedShot: Partial<Shot>) => void;
  index: number;
}> = ({ shot, onClose, onUpdate, index }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-surface w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col border border-brand-border" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-brand-border">
                    <h3 className="text-xl font-bold text-brand-text-primary">{t('shotEditor.modalTitle', { index: index + 1 })}</h3>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-6">
                    <ShotEditor shot={shot} onUpdate={onUpdate} isModal />
                </div>
                 <div className="flex justify-end p-4 bg-brand-bg border-t border-brand-border rounded-b-2xl">
                    <button onClick={onClose} type="button" className="px-5 py-2 text-sm bg-gradient-to-r from-brand-accent-from to-brand-accent-to hover:shadow-glow text-white font-semibold rounded-lg transition-all duration-300">
                        {t('shotEditor.closeButton')}
                    </button>
                 </div>
            </div>
        </div>
    );
};


// --- MAIN FORM COMPONENT ---

const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading, initialData, remixSourceId, onClearRemix, onDeconstruct }) => {
  const { t, language } = useLanguage();
  const [sceneDescription, setSceneDescription] = useState('');
  const [shots, setShots] = useState<Shot[]>([defaultShot()]);
  const [cameos, setCameos] = useState('');
  const [cameoDescription, setCameoDescription] = useState('');
  const [cameoConsent, setCameoConsent] = useState(false);
  const [physics, setPhysics] = useState<PhysicsData>(initialPhysics);
  const [audio, setAudio] = useState<AudioData>(initialAudio);
  const [animation, setAnimation] = useState<AnimationData>(initialAnimationData);
  const [cameraEffects, setCameraEffects] = useState<CameraEffectsData>(initialCameraEffects);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [thinkingMode, setThinkingMode] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [shotListView, setShotListView] = useState<'list' | 'storyboard'>('list');
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [editingShotIndex, setEditingShotIndex] = useState(0);
  
  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupport, setSpeechSupport] = useState(false);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition to support webkitSpeechRecognition

  const needsCameoConsent = !!cameos.trim() && !cameoConsent;

  useEffect(() => {
    // Fix: Cast window to `any` to access non-standard `SpeechRecognition` and `webkitSpeechRecognition` properties without TypeScript errors.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setSceneDescription(prev => (prev.trim() ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()).trim());
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      setSpeechSupport(false);
      console.warn("Speech recognition not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };


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
      setCameoDescription(initialData.cameoDescription || '');
      setAudio(initialData.audio || initialAudio);
      setPhysics(initialData.physics || initialPhysics);
      setAnimation(initialData.animation || initialAnimationData);
      setCameraEffects({ ...initialCameraEffects, ...initialData.cameraEffects });
      setAspectRatio(initialData.aspectRatio || '16:9');
      setCameoConsent(initialData.cameoConsent || false);
    }
  }, [initialData]);
  
  const handleReset = () => {
    setSceneDescription('');
    setShots([defaultShot()]);
    setCameos('');
    setCameoDescription('');
    setCameoConsent(false);
    setAudio(initialAudio);
    setPhysics(initialPhysics);
    setAnimation(initialAnimationData);
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
    if (editingShot && editingShot.id === id) {
      setEditingShot({ ...editingShot, ...updatedShot });
    }
  };
  
  const handleDeleteShot = (id: string) => {
    if (shots.length > 1) {
      setShots(shots.filter(s => s.id !== id));
    }
  };

  const handleEditShot = (shot: Shot, index: number) => {
      setEditingShot(shot);
      setEditingShotIndex(index);
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
        const result = await getSuggestions({ sceneDescription, shots, cameos, cameoDescription, audio, physics, animation, cameraEffects, aspectRatio, cameoConsent }, language, thinkingMode);
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
      onGenerate({ sceneDescription, shots, cameos, cameoDescription, audio, physics, animation, cameraEffects, aspectRatio, cameoConsent });
    }
  };

  const isEditing = !!initialData;
  const isRemixing = isEditing && !!remixSourceId;
  const isImported = isEditing && !remixSourceId;

  const StoryboardCard: React.FC<{ shot: Shot; index: number; onEdit: () => void; onDelete: (id: string) => void }> = ({ shot, index, onEdit, onDelete }) => {
    const keyParams = useMemo(() => {
      return Object.entries(shot.parameters)
        .filter(([key, value]) => value && value !== initialParameters[key as keyof PromptParameters])
        .slice(0, 3) // Show max 3 key parameters
        .map(([key, value]) => t(`promptOptions.labels.${key as keyof PromptParameters}`) + ': ' + t(`promptOptions.${PROMPT_OPTIONS[key as keyof typeof PROMPT_OPTIONS].find(o => o.value === value)?.labelKey || ''}`));
    }, [shot.parameters, t]);

    return (
        <div className="flex-shrink-0 w-80 bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-md text-brand-text-primary">{t('shotEditor.title', { index: index + 1 })}</h4>
                    <button type="button" onClick={() => onDelete(shot.id)} className="p-1.5 text-brand-text-secondary hover:text-red-500 rounded-lg hover:bg-red-500/10" title={t('shotEditor.delete')}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <p className="text-sm text-brand-text-secondary line-clamp-3 h-16">{shot.description || t('shotEditor.noDescription')}</p>
                <div className="mt-2 space-y-1">
                  {keyParams.map((param, i) => (
                    <span key={i} className="inline-block bg-brand-surface border border-brand-border text-brand-text-secondary text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded-full">{param}</span>
                  ))}
                </div>
            </div>
            <button type="button" onClick={onEdit} className="w-full mt-3 bg-brand-surface hover:bg-slate-700 border border-brand-border font-semibold text-brand-text-primary py-2 rounded-lg transition-colors">
                {t('shotEditor.editButton')}
            </button>
        </div>
    );
  };
    
  const AddShotCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="flex-shrink-0 w-80 flex items-center justify-center">
        <button type="button" onClick={onClick} className="w-full h-full flex items-center justify-center gap-2 text-center bg-brand-surface hover:bg-brand-accent-to/5 border-2 border-dashed border-brand-border hover:border-brand-accent-to text-brand-text-secondary hover:text-brand-accent-to font-semibold py-3 px-4 rounded-lg transition-colors">
            {t('promptForm.addShot')}
        </button>
    </div>
  );


  return (
    <>
    <ImportPromptModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDeconstruct={onDeconstruct}
    />
    {editingShot && (
        <ShotEditorModal
            shot={editingShot}
            index={editingShotIndex}
            onClose={() => setEditingShot(null)}
            onUpdate={handleUpdateShot}
        />
    )}
    <form onSubmit={handleSubmit} className="space-y-8">
       <div className="flex justify-between items-start gap-4">
        <div>
            <h2 className="text-3xl font-bold text-brand-text-primary">{t('promptForm.title')}</h2>
            <p className="text-brand-text-secondary text-sm mt-1">{t('promptForm.subtitle')}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-2 text-sm bg-brand-ui-bg hover:bg-slate-600 border border-brand-border rounded-lg transition-colors flex items-center gap-2 text-brand-text-primary font-semibold"
                title={t('promptForm.import.tooltip')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011 1v2.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8 6.586V4a1 1 0 011-1z" /><path d="M10 12a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                <span className="hidden sm:inline">{t('promptForm.import.button')}</span>
            </button>
            {isEditing && (
                <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-sm bg-brand-ui-bg hover:bg-slate-600 border border-brand-border rounded-lg transition-colors text-brand-text-primary font-semibold"
                >
                {t('promptForm.startNew')}
                </button>
            )}
        </div>
      </div>
       {isRemixing && (
        <div className="bg-brand-accent-to/10 border border-brand-accent-to/20 p-3 rounded-lg text-sm text-brand-accent-to/80 shadow-inner">
          {t('promptForm.remixingMessage')}
        </div>
      )}
      {isImported && (
        <div className="bg-blue-950/70 border border-blue-700 p-3 rounded-lg text-sm text-blue-300">
          {t('promptForm.importedMessage')}
        </div>
      )}
      
      <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-4">
        <div>
            <label htmlFor="sceneDescription" className="block text-sm font-medium text-brand-text-secondary mb-2">
            {t('promptForm.sceneDescriptionLabel')}
            </label>
            <div className="relative">
              <textarea
                id="sceneDescription"
                name="sceneDescription"
                rows={4}
                className={`${textAreaBaseClasses} pr-12`}
                placeholder={t('promptForm.sceneDescriptionPlaceholder')}
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                required
              />
              {speechSupport && (
                 <button
                    type="button"
                    onClick={handleToggleListening}
                    className={`absolute bottom-2.5 right-2.5 p-2 rounded-full transition-all duration-200 ${
                        isListening 
                        ? 'bg-red-500 text-white animate-pulse-fast' 
                        : 'bg-brand-ui-bg hover:bg-slate-600 text-brand-text-secondary'
                    }`}
                    title={isListening ? t('buttons.stopRecording') : t('buttons.startRecording')}
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                     <path d="M5.5 8.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V17h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-1.525A5 5 0 015.5 9.5v-1a.5.5 0 01.5-.5z" />
                   </svg>
                 </button>
              )}
            </div>
        </div>
        <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-brand-text-secondary mb-2">
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
      </div>


       <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="cameos" className="block text-sm font-medium text-brand-text-secondary">
                  {t('promptForm.cameosLabel')}
                </label>
                {needsCameoConsent && (
                    <div className="relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-brand-text-primary text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {t('promptForm.error.cameoConsentNeeded')}
                        </span>
                    </div>
                )}
              </div>
              <input
                type="text"
                id="cameos"
                value={cameos}
                onChange={(e) => setCameos(e.target.value)}
                className={inputBaseClasses}
                placeholder={t('promptForm.cameosPlaceholder')}
              />
            </div>

            <div className={`space-y-4 border-t border-brand-border pt-4 ${cameos.trim() ? 'animate-fade-in' : 'hidden'}`}>
                <div className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${needsCameoConsent ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : ''}`}>
                    <input
                        type="checkbox"
                        id="cameoConsent"
                        checked={cameoConsent}
                        onChange={(e) => setCameoConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-brand-border bg-brand-ui-bg text-brand-accent-to focus:ring-brand-accent-to"
                    />
                    <div>
                        <label htmlFor="cameoConsent" className="font-medium text-brand-text-primary">
                            {t('promptForm.cameoConsentLabel')}
                        </label>
                        <p className="text-xs text-brand-text-secondary">{t('promptForm.cameoConsentDescription')}</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="cameoDescription" className={`block text-sm font-medium mb-2 transition-colors ${cameoConsent ? 'text-brand-text-secondary' : 'text-slate-500'}`}>
                        {t('promptForm.cameoDescriptionLabel')}
                    </label>
                    <textarea
                        id="cameoDescription"
                        value={cameoDescription}
                        onChange={(e) => setCameoDescription(e.target.value)}
                        rows={2}
                        className={`${textAreaBaseClasses} disabled:bg-slate-600/50 disabled:cursor-not-allowed`}
                        placeholder={t('promptForm.cameoDescriptionPlaceholder')}
                        disabled={!cameoConsent}
                        title={!cameoConsent ? t('promptForm.cameoDescriptionDisabledTooltip') : ''}
                    />
                </div>
            </div>
       </div>

      <AdvancedPanel title={t('animationSettings.title')}>
        <p className="text-sm text-brand-text-secondary -mt-2 mb-6">{t('animationSettings.description')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label htmlFor="animationStyle" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('animationSettings.animationStyle')}
                </label>
                <select
                    id="animationStyle"
                    value={animation.animationStyle}
                    onChange={(e) => setAnimation(prev => ({...prev, animationStyle: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.animationStyle.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.animationStyle.${option.labelKey.split('.')[1]}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="characterDesign" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('animationSettings.characterDesign')}
                </label>
                <select
                    id="characterDesign"
                    value={animation.characterDesign}
                    onChange={(e) => setAnimation(prev => ({...prev, characterDesign: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.characterDesign.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.characterDesign.${option.labelKey.split('.')[1]}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="backgroundStyle" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('animationSettings.backgroundStyle')}
                </label>
                <select
                    id="backgroundStyle"
                    value={animation.backgroundStyle}
                    onChange={(e) => setAnimation(prev => ({...prev, backgroundStyle: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.backgroundStyle.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.backgroundStyle.${option.labelKey.split('.')[1]}`)}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="renderingStyle" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('animationSettings.renderingStyle')}
                </label>
                <select
                    id="renderingStyle"
                    value={animation.renderingStyle}
                    onChange={(e) => setAnimation(prev => ({...prev, renderingStyle: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.renderingStyle.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.renderingStyle.${option.labelKey.split('.')[1]}`)}</option>
                    ))}
                </select>
            </div>
            <div className='lg:col-span-2'>
                <label htmlFor="frameRate" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('animationSettings.frameRate')}
                </label>
                <select
                    id="frameRate"
                    value={animation.frameRate}
                    onChange={(e) => setAnimation(prev => ({...prev, frameRate: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.frameRate.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.frameRate.${option.labelKey.split('.')[1]}`)}</option>
                    ))}
                </select>
            </div>
        </div>
      </AdvancedPanel>

      <AdvancedPanel title={t('advancedSettings.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-brand-text-secondary border-b border-brand-border pb-2">{t('advancedSettings.physicsEngine')}</h4>
             <div>
                <label htmlFor="weightAndRigidity" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('promptOptions.labels.weightAndRigidity')}</label>
                <select id="weightAndRigidity" value={physics.weightAndRigidity} onChange={(e) => setPhysics(prev => ({...prev, weightAndRigidity: e.target.value}))} className={inputBaseClasses}>
                    {PROMPT_OPTIONS.weightAndRigidity.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="materialInteractions" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('promptOptions.labels.materialInteractions')}</label>
                 <select id="materialInteractions" value={physics.materialInteractions} onChange={(e) => setPhysics(prev => ({...prev, materialInteractions: e.target.value}))} className={inputBaseClasses}>
                    {PROMPT_OPTIONS.materialInteractions.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="environmentalForces" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('promptOptions.labels.environmentalForces')}</label>
                 <select id="environmentalForces" value={physics.environmentalForces} onChange={(e) => setPhysics(prev => ({...prev, environmentalForces: e.target.value}))} className={inputBaseClasses}>
                    {PROMPT_OPTIONS.environmentalForces.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
          </div>
          <div className="space-y-4">
             <h4 className="text-sm font-semibold text-brand-text-secondary border-b border-brand-border pb-2">{t('advancedSettings.soundscape')}</h4>
             <div>
              <label htmlFor="dialogue" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('advancedSettings.dialogue')}</label>
              <textarea id="dialogue" value={audio.dialogue} onChange={(e) => setAudio(prev => ({...prev, dialogue: e.target.value}))} rows={1} className={textAreaBaseClasses} placeholder={t('advancedSettings.dialoguePlaceholder')} />
            </div>
            <div>
                <label htmlFor="sfxStyle" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('advancedSettings.sfxStyle')}</label>
                 <select id="sfxStyle" value={audio.sfxStyle} onChange={(e) => setAudio(prev => ({...prev, sfxStyle: e.target.value}))} className={inputBaseClasses}>
                    {PROMPT_OPTIONS.sfxStyle.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
              <label htmlFor="soundEffects" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('advancedSettings.sfx')}</label>
              <textarea id="soundEffects" value={audio.soundEffects} onChange={(e) => setAudio(prev => ({...prev, soundEffects: e.target.value}))} rows={1} className={textAreaBaseClasses} placeholder={t('advancedSettings.sfxPlaceholder')} />
            </div>
             <div>
                 <label htmlFor="musicStyle" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('advancedSettings.musicStyle')}</label>
                 <select id="musicStyle" value={audio.musicStyle} onChange={(e) => setAudio(prev => ({...prev, musicStyle: e.target.value}))} className={inputBaseClasses}>
                    {PROMPT_OPTIONS.musicStyle.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
              <label htmlFor="music" className="block text-xs font-medium text-brand-text-secondary mb-1.5">{t('advancedSettings.music')}</label>
              <textarea id="music" value={audio.music} onChange={(e) => setAudio(prev => ({...prev, music: e.target.value}))} rows={1} className={textAreaBaseClasses} placeholder={t('advancedSettings.musicPlaceholder')} />
            </div>
          </div>
        </div>
      </AdvancedPanel>

      <AdvancedPanel title={t('cameraEffects.title')}>
        <p className="text-sm text-brand-text-secondary -mt-2 mb-6">{t('cameraEffects.description')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label htmlFor="sceneShotType" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('promptOptions.labels.shotType')}
                </label>
                <select
                    id="sceneShotType"
                    value={cameraEffects.shotType || 'medium-shot'}
                    onChange={(e) => setCameraEffects(prev => ({...prev, shotType: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.shotType.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sceneCameraAngle" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('promptOptions.labels.cameraAngle')}
                </label>
                <select
                    id="sceneCameraAngle"
                    value={cameraEffects.cameraAngle || 'eye-level'}
                    onChange={(e) => setCameraEffects(prev => ({...prev, cameraAngle: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.cameraAngle.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sceneLens" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('promptOptions.labels.lens')}
                </label>
                <select
                    id="sceneLens"
                    value={cameraEffects.lens || '35mm'}
                    onChange={(e) => setCameraEffects(prev => ({...prev, lens: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.lens.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sceneComposition" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('promptOptions.labels.composition')}
                </label>
                <select
                    id="sceneComposition"
                    value={cameraEffects.composition || 'rule-of-thirds'}
                    onChange={(e) => setCameraEffects(prev => ({...prev, composition: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.composition.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sceneCameraMovement" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('promptOptions.labels.cameraMovement')}
                </label>
                <select
                    id="sceneCameraMovement"
                    value={cameraEffects.cameraMovement}
                    onChange={(e) => setCameraEffects(prev => ({...prev, cameraMovement: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.cameraMovement.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="sceneCameraAnimation" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('promptOptions.labels.cameraAnimation')}
                </label>
                <select
                    id="sceneCameraAnimation"
                    value={cameraEffects.cameraAnimation || 'none'}
                    onChange={(e) => setCameraEffects(prev => ({...prev, cameraAnimation: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.cameraAnimation.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
            <div className='lg:col-span-2'>
                <label htmlFor="sceneDepthOfField" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                    {t('promptOptions.labels.depthOfField')}
                </label>
                <select
                    id="sceneDepthOfField"
                    value={cameraEffects.depthOfField}
                    onChange={(e) => setCameraEffects(prev => ({...prev, depthOfField: e.target.value}))}
                    className={inputBaseClasses}
                >
                    {PROMPT_OPTIONS.depthOfField.map(option => (
                        <option key={option.value} value={option.value}>{t(`promptOptions.${option.labelKey}`)}</option>
                    ))}
                </select>
            </div>
        </div>
      </AdvancedPanel>


      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-text-primary">{t('shotEditor.shotListTitle')}</h3>
          <div className="flex items-center gap-1 bg-brand-bg/50 p-1 rounded-lg border border-brand-border">
            <button type="button" onClick={() => setShotListView('list')} className={`px-2 py-1 rounded-md transition-all ${shotListView === 'list' ? 'bg-brand-accent-to text-white' : 'hover:bg-brand-surface'}`} title={t('shotEditor.listView')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
            </button>
            <button type="button" onClick={() => setShotListView('storyboard')} className={`px-2 py-1 rounded-md transition-all ${shotListView === 'storyboard' ? 'bg-brand-accent-to text-white' : 'hover:bg-brand-surface'}`} title={t('shotEditor.storyboardView')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2-2H4a2 2 0 01-2-2v-4z" /></svg>
            </button>
          </div>
        </div>
        
        {shotListView === 'list' ? (
            <div className="space-y-4">
                {shots.map((shot, index) => (
                    <ShotEditorPanel key={shot.id} shot={shot} index={index} onUpdate={handleUpdateShot} onDelete={handleDeleteShot} />
                ))}
            </div>
        ) : (
             <div className="flex overflow-x-auto gap-4 pb-4 -m-2 p-2">
                {shots.map((shot, index) => (
                    <StoryboardCard
                        key={shot.id}
                        shot={shot}
                        index={index}
                        onEdit={() => handleEditShot(shot, index)}
                        onDelete={handleDeleteShot}
                    />
                ))}
                <AddShotCard onClick={handleAddShot} />
            </div>
        )}
      </div>
      
       {shotListView === 'list' && (
        <button
            type="button"
            onClick={handleAddShot}
            className="w-full flex items-center justify-center gap-2 text-center bg-brand-surface hover:bg-brand-accent-to/5 border-2 border-dashed border-brand-border hover:border-brand-accent-to text-brand-text-secondary hover:text-brand-accent-to font-semibold py-3 px-4 rounded-lg transition-colors"
            >
            {t('promptForm.addShot')}
        </button>
       )}


       {(suggestions || isSuggesting || suggestionError) && (
        <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg text-brand-text-primary">{t('promptForm.suggestions.title')}</h4>
            <button type="button" onClick={() => { setSuggestions(null); setSuggestionError(null); }} className="text-brand-text-secondary hover:text-brand-text-primary">&times;</button>
          </div>
          {isSuggesting && <p className="text-brand-text-secondary animate-pulse-fast">{t('promptForm.suggestions.loading')}</p>}
          {suggestionError && <p className="text-red-500">{suggestionError}</p>}
          {suggestions && (
            <div>
              <ul className="list-disc list-inside text-brand-text-primary space-y-1">
                {suggestions.split('\n- ').map((s, i) => s.trim() && <li key={i}>{s.replace(/^-/, '').trim()}</li>)}
              </ul>
              <button
                type="button"
                onClick={handleApplySuggestions}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700 text-emerald-300 font-semibold py-2 px-4 rounded-lg transition-colors"
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
        <div className="relative group flex items-stretch bg-brand-ui-bg border border-brand-border rounded-lg">
          <button
            type="button"
            onClick={handleGetSuggestions}
            disabled={isLoading || isSuggesting}
            className="flex-grow flex items-center justify-center gap-2 text-brand-text-primary hover:bg-slate-600/70 font-bold py-3 pl-4 pr-2 rounded-l-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSuggesting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {t('buttons.thinking')}
              </>
            ) : t('buttons.getSuggestions') }
          </button>
          <div className="absolute left-0 bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-brand-text-primary text-brand-bg text-xs rounded py-1 px-2 shadow-lg">{t('promptForm.thinkingModeTooltip')}</div>
          </div>
          <div className="flex-shrink-0 flex items-center pl-2 pr-3 border-l border-brand-border">
            <input type="checkbox" id="thinking-mode" checked={thinkingMode} onChange={(e) => setThinkingMode(e.target.checked)} className="h-4 w-4 rounded border-brand-border text-brand-accent-to focus:ring-brand-accent-to"/>
            <label htmlFor="thinking-mode" className="ml-2 text-xs font-medium text-brand-text-secondary whitespace-nowrap">{t('promptForm.thinkingMode')}</label>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !sceneDescription.trim() || (!!cameos.trim() && !cameoConsent)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent-from to-brand-accent-to hover:shadow-glow text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
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
      
       <div className="mt-6 border-t border-brand-border pt-6">
            <h4 className="font-semibold text-brand-text-secondary text-sm">{t('promptForm.guidelines.title')}</h4>
            <ul className="list-disc list-inside text-xs text-slate-500 mt-2 space-y-1">
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