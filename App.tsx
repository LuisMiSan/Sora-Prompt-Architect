

import React, { useState, useEffect, useCallback } from 'react';
import { SavedPrompt, Shot, PhysicsData, AudioData, CameraEffectsData, PromptData, PromptVersion } from './types';
import { generatePrompt } from './services/geminiService';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import GeneratedPrompt from './components/GeneratedPrompt';
import PromptGallery from './components/PromptGallery';
import { useLanguage } from './context/LanguageContext';

export interface SceneData extends PromptData {}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [promptToRemix, setPromptToRemix] = useState<SceneData | null>(null);
  const [lastGeneratedData, setLastGeneratedData] = useState<SceneData | null>(null);
  const [remixSourceId, setRemixSourceId] = useState<string | null>(null);
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
  }, []);

  const handleGeneratePrompt = useCallback(async (data: SceneData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    try {
      const prompt = await generatePrompt(data, language);
      setGeneratedPrompt(prompt);
      setLastGeneratedData(data); // Save the data used for generation
    } catch (e) {
      setError('Failed to generate prompt. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleSavePrompt = useCallback((versionNotes: string) => {
    if (!generatedPrompt || !lastGeneratedData) return;

    const newVersion: PromptVersion = {
      ...lastGeneratedData,
      prompt: generatedPrompt,
      versionNotes,
      createdAt: new Date().toISOString(),
    };

    let updatedPrompts;

    if (remixSourceId) {
      // This is a new version of an existing prompt.
      updatedPrompts = savedPrompts.map(p => {
        if (p.id === remixSourceId) {
          // Prepend the new version to the history
          return { ...p, versions: [newVersion, ...p.versions] };
        }
        return p;
      });
    } else {
      // This is a brand new prompt (or from an import).
      const newSavedPrompt: SavedPrompt = {
        id: Date.now().toString(),
        versions: [newVersion],
        visibility: 'private',
      };
      updatedPrompts = [newSavedPrompt, ...savedPrompts];
    }
    
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('sora-prompts', JSON.stringify(updatedPrompts));
    setLastGeneratedData(null);
    setRemixSourceId(null); // Clear remix/import source after saving
  }, [savedPrompts, generatedPrompt, lastGeneratedData, remixSourceId]);

  const handleDeletePrompt = useCallback((id: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('sora-prompts', JSON.stringify(updatedPrompts));
  }, [savedPrompts]);
  
  const handleToggleVisibility = useCallback((id: string) => {
    const updatedPrompts = savedPrompts.map(p => {
      if (p.id === id) {
        const newVisibility: 'public' | 'private' = p.visibility === 'public' ? 'private' : 'public';
        return { ...p, visibility: newVisibility };
      }
      return p;
    });
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('sora-prompts', JSON.stringify(updatedPrompts));
  }, [savedPrompts]);

  const handleRemixPrompt = useCallback((promptId: string, version: PromptVersion) => {
    setPromptToRemix({
      sceneDescription: version.sceneDescription,
      shots: version.shots,
      cameos: version.cameos,
      audio: version.audio || { dialogue: '', soundEffects: '', music: '' },
      physics: version.physics || { weightAndRigidity: '', materialInteractions: '', environmentalForces: '' },
      cameraEffects: version.cameraEffects || { depthOfField: 'natural', cameraMovement: 'none', cameraAnimation: 'none' },
      aspectRatio: version.aspectRatio || '16:9',
      cameoConsent: version.cameoConsent || false,
    });
    setRemixSourceId(promptId);
    setGeneratedPrompt(''); // Clear previous generation
    document.getElementById('architect-tool')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleDeconstructedPrompt = useCallback((data: SceneData) => {
    setPromptToRemix(data);
    setRemixSourceId(null); // Ensure this is null to indicate it's not a remix of a saved prompt
    setGeneratedPrompt('');
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
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32">
            <h1 className="text-4xl md:text-6xl font-black text-brand-text-primary tracking-tighter">
                {t('hero.title.1')} <span className="bg-gradient-to-r from-brand-accent-from to-brand-accent-to bg-clip-text text-transparent">{t('hero.title.2')}</span> {t('hero.title.3')}
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-lg text-brand-text-secondary">
                {t('hero.subtitle')}
            </p>
            <div className="mt-8">
                <button 
                  onClick={handleScrollToArchitect} 
                  className="px-8 py-3 text-lg bg-gradient-to-r from-brand-accent-from to-brand-accent-to text-white font-bold rounded-lg transition-all duration-300 hover:shadow-glow-lg">
                    {t('hero.cta')}
                </button>
            </div>
        </section>

        <div id="architect-tool" className="grid grid-cols-1 lg:grid-cols-5 gap-10 scroll-mt-24">
          <div className="lg:col-span-3 bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-xl">
            <PromptForm 
              onGenerate={handleGeneratePrompt} 
              isLoading={isLoading} 
              initialData={promptToRemix}
              remixSourceId={remixSourceId}
              onClearRemix={handleClearRemix}
              onDeconstruct={handleDeconstructedPrompt}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl shadow-lg shadow-red-500/10 animate-fade-in">
                <strong className="font-semibold text-red-800">Error:</strong> {error}
              </div>
            )}
            {generatedPrompt && (
              <GeneratedPrompt
                prompt={generatedPrompt}
                onSave={handleSavePrompt}
                canSave={!!lastGeneratedData}
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
          <PromptGallery
            prompts={savedPrompts}
            onRemix={handleRemixPrompt}
            onDelete={handleDeletePrompt}
            onToggleVisibility={handleToggleVisibility}
          />
        </section>
      </main>
    </div>
  );
};

export default App;