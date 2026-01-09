import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SavedPrompt, Shot, PhysicsData, AudioData, CameraEffectsData, PromptData, PromptVersion, AnimationData, SceneData } from './types';
import { generatePrompt, generateVideo, getVideosOperationStatus } from './services/geminiService';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import GeneratedPrompt from './components/GeneratedPrompt';
import PromptGallery from './components/PromptGallery';
import ApiKeyModal from './components/ApiKeyModal';
import GeneratedVideo from './components/GeneratedVideo';
import { useLanguage } from './context/LanguageContext';

const QUERY_HISTORY_KEY = 'sora-query-history';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [promptToRemix, setPromptToRemix] = useState<SceneData | null>(null);
  const [lastGeneratedData, setLastGeneratedData] = useState<SceneData | null>(null);
  const [remixSourceId, setRemixSourceId] = useState<string | null>(null);
  
  // Video Generation State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const pollingInterval = useRef<number | null>(null);

  const { t, language } = useLanguage();

  useEffect(() => {
    try {
      const storedPrompts = localStorage.getItem('sora-prompts');
      if (storedPrompts) {
        setSavedPrompts(JSON.parse(storedPrompts));
      }
    } catch (e) {
      console.error("Failed to parse prompts from localStorage", e);
      setSavedPrompts([]);
    }
    
    // Cleanup polling interval on unmount
    return () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
    }
  }, []);
  
  const resetVideoGenerationState = () => {
    setIsGeneratingVideo(false);
    setVideoGenerationError(null);
    setVideoGenerationProgress('');
    setGeneratedVideoUrl(null);
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const handleGeneratePrompt = useCallback(async (data: SceneData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    resetVideoGenerationState(); // Reset video state for new prompt
    try {
      const prompt = await generatePrompt(data, language);
      setGeneratedPrompt(prompt);
      setLastGeneratedData(data);

      try {
        const storedHistory = localStorage.getItem(QUERY_HISTORY_KEY);
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        const newQueryRecord = { ...data, timestamp: new Date().toISOString(), generatedPrompt: prompt, language: language };
        const updatedHistory = [...history, newQueryRecord];
        localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to save query to history", e);
      }
    } catch (e) {
      setError('Failed to generate prompt. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [language]);
  
  const startVideoGeneration = useCallback(async () => {
    if (!generatedPrompt || !lastGeneratedData) return;
    
    resetVideoGenerationState();
    setIsGeneratingVideo(true);
    setVideoGenerationProgress(t('generatedVideo.progress.start'));

    try {
        let operation = await generateVideo(generatedPrompt, lastGeneratedData.aspectRatio as '16:9' | '9:16');
        setVideoGenerationProgress(t('generatedVideo.progress.running'));

        pollingInterval.current = window.setInterval(async () => {
            try {
                operation = await getVideosOperationStatus(operation);
                if (operation.done) {
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                    setIsGeneratingVideo(false);

                    if (operation.error) {
                        console.error('Video generation error:', operation.error);
                        setVideoGenerationError(operation.error.message || t('generatedVideo.error'));
                        return;
                    }

                    setVideoGenerationProgress(t('generatedVideo.progress.downloading'));
                    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                         const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                         if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
                         const blob = await response.blob();
                         const objectUrl = URL.createObjectURL(blob);
                         setGeneratedVideoUrl(objectUrl);
                         setVideoGenerationProgress(t('generatedVideo.progress.complete'));
                    } else {
                        throw new Error("Video generation completed but no download link was found.");
                    }
                }
            } catch (pollError: any) {
                console.error("Polling error:", pollError);
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                setIsGeneratingVideo(false);
                if (pollError.message?.includes('Requested entity was not found')) {
                    setVideoGenerationError(t('generatedVideo.errorKey'));
                } else {
                    setVideoGenerationError(pollError.message || t('generatedVideo.error'));
                }
            }
        }, 5000);

    } catch (initialError: any) {
        console.error("Video generation failed to start:", initialError);
        setIsGeneratingVideo(false);
         if (initialError.message?.includes('Requested entity was not found')) {
            setVideoGenerationError(t('generatedVideo.errorKey'));
        } else {
            setVideoGenerationError(initialError.message || t('generatedVideo.error'));
        }
    }
  }, [generatedPrompt, lastGeneratedData, t]);

  const handleInitiateVideoGeneration = useCallback(async () => {
    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (hasKey) {
        startVideoGeneration();
    } else {
        setIsApiKeyModalOpen(true);
    }
  }, [startVideoGeneration]);


  const handleSavePrompt = useCallback((versionNotes: string) => {
    if (!generatedPrompt || !lastGeneratedData) return;
    const newVersion: PromptVersion = { ...lastGeneratedData, prompt: generatedPrompt, versionNotes, createdAt: new Date().toISOString() };
    let updatedPrompts;
    if (remixSourceId) {
      updatedPrompts = savedPrompts.map(p => p.id === remixSourceId ? { ...p, versions: [newVersion, ...p.versions] } : p);
    } else {
      const newSavedPrompt: SavedPrompt = { id: Date.now().toString(), versions: [newVersion], visibility: 'private' };
      updatedPrompts = [newSavedPrompt, ...savedPrompts];
    }
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('sora-prompts', JSON.stringify(updatedPrompts));
    setLastGeneratedData(null);
    setRemixSourceId(null);
  }, [savedPrompts, generatedPrompt, lastGeneratedData, remixSourceId]);

  const handleDeletePrompt = useCallback((id: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('sora-prompts', JSON.stringify(updatedPrompts));
  }, [savedPrompts]);
  
  const handleToggleVisibility = useCallback((id: string) => {
    const updatedPrompts = savedPrompts.map(p => {
      if (p.id === id) {
        return { ...p, visibility: p.visibility === 'public' ? 'private' : 'public' };
      }
      return p;
    });
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('sora-prompts', JSON.stringify(updatedPrompts));
  }, [savedPrompts]);

  const handleRemixPrompt = useCallback((promptId: string, version: PromptVersion) => {
    setPromptToRemix({
      sceneDescription: version.sceneDescription, shots: version.shots, cameos: version.cameos, cameoDescription: version.cameoDescription || '',
      audio: version.audio || { dialogue: '', soundEffects: '', sfxStyle: 'none', music: '', musicStyle: 'none' },
      physics: version.physics || { weightAndRigidity: 'normal-gravity', materialInteractions: 'realistic', environmentalForces: 'none' },
      animation: version.animation || { animationStyle: 'none', characterDesign: 'none', backgroundStyle: 'none', renderingStyle: 'none', frameRate: 'none' },
      cameraEffects: version.cameraEffects || { depthOfField: 'natural', cameraMovement: 'none', cameraAnimation: 'none' },
      aspectRatio: version.aspectRatio || '16:9', cameoConsent: version.cameoConsent || false,
    });
    setRemixSourceId(promptId);
    setGeneratedPrompt('');
    resetVideoGenerationState();
    document.getElementById('architect-tool')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleDeconstructedPrompt = useCallback((data: SceneData) => {
    setPromptToRemix(data);
    setRemixSourceId(null);
    setGeneratedPrompt('');
    resetVideoGenerationState();
    document.getElementById('architect-tool')?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  const handleClearRemix = useCallback(() => {
    setPromptToRemix(null);
    setRemixSourceId(null);
  }, []);

  const handleScrollToArchitect = () => {
    document.getElementById('architect-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
    <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSelectKey={async () => {
            await (window as any).aistudio?.openSelectKey();
            setIsApiKeyModalOpen(false);
            startVideoGeneration();
        }}
    />
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        
        <section className="text-center py-20 md:py-32">
            <h1 className="text-4xl md:text-6xl font-black text-brand-text-primary tracking-tighter">
                {t('hero.title.1')} <span className="bg-gradient-to-r from-brand-accent-from to-brand-accent-to bg-clip-text text-transparent">{t('hero.title.2')}</span> {t('hero.title.3')}
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-lg text-brand-text-secondary">{t('hero.subtitle')}</p>
            <div className="mt-8">
                <button onClick={handleScrollToArchitect} className="px-8 py-3 text-lg bg-gradient-to-r from-brand-accent-from to-brand-accent-to text-white font-bold rounded-lg transition-all duration-300 hover:shadow-glow-lg">
                    {t('hero.cta')}
                </button>
            </div>
        </section>

        <div id="architect-tool" className="grid grid-cols-1 lg:grid-cols-5 gap-10 scroll-mt-24">
          <div className="lg:col-span-3 bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-xl">
            <PromptForm onGenerate={handleGeneratePrompt} isLoading={isLoading} initialData={promptToRemix} remixSourceId={remixSourceId} onClearRemix={handleClearRemix} onDeconstruct={handleDeconstructedPrompt} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-8">
            {error && (
              <div className="bg-red-950 border border-red-700 text-red-300 p-4 rounded-xl shadow-lg shadow-red-500/10 animate-fade-in">
                <strong className="font-semibold text-red-200">Error:</strong> {error}
              </div>
            )}
            {generatedPrompt && (
              <GeneratedPrompt prompt={generatedPrompt} onSave={handleSavePrompt} canSave={!!lastGeneratedData} onGenerateVideo={handleInitiateVideoGeneration} isGeneratingVideo={isGeneratingVideo} aspectRatio={lastGeneratedData?.aspectRatio || '16:9'} />
            )}
            {(isGeneratingVideo || generatedVideoUrl || videoGenerationError) && (
                <GeneratedVideo
                    isLoading={isGeneratingVideo}
                    progressMessage={videoGenerationProgress}
                    videoUrl={generatedVideoUrl}
                    error={videoGenerationError}
                />
            )}
            {!generatedPrompt && !isLoading && (
                 <div className="h-full flex flex-col items-center justify-center bg-brand-surface border-2 border-dashed border-brand-border rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-accent-from/20 to-brand-accent-to/20 rounded-xl flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent-to" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-brand-text-primary">{t('app.outputPlaceholder.title')}</h3>
                    <p className="text-brand-text-secondary mt-1">{t('app.outputPlaceholder.subtitle')}</p>
                </div>
            )}
          </div>
        </div>

        <section className="mt-20 md:mt-32">
          <PromptGallery prompts={savedPrompts} onRemix={handleRemixPrompt} onDelete={handleDeletePrompt} onToggleVisibility={handleToggleVisibility} />
        </section>
      </main>
    </div>
    </>
  );
};

export default App;