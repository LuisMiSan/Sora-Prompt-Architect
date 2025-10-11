
import React, { useState, useEffect, useCallback } from 'react';
import { SavedPrompt, Shot, PhysicsData, AudioData, CameraEffectsData, PromptData, PromptVersion } from './types';
import { generatePrompt } from './services/geminiService';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import GeneratedPrompt from './components/GeneratedPrompt';
import PromptGallery from './components/PromptGallery';

export interface SceneData extends PromptData {}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [promptToRemix, setPromptToRemix] = useState<SceneData | null>(null);
  const [lastGeneratedData, setLastGeneratedData] = useState<SceneData | null>(null);
  const [remixSourceId, setRemixSourceId] = useState<string | null>(null);

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
      const prompt = await generatePrompt(data);
      setGeneratedPrompt(prompt);
      setLastGeneratedData(data); // Save the data used for generation
    } catch (e) {
      setError('Failed to generate prompt. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      cameraEffects: version.cameraEffects || { depthOfField: 'natural', cameraMovement: 'none' },
      aspectRatio: version.aspectRatio || '16:9',
      cameoConsent: version.cameoConsent || false,
    });
    setRemixSourceId(promptId);
    setGeneratedPrompt(''); // Clear previous generation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeconstructedPrompt = useCallback((data: SceneData) => {
    setPromptToRemix(data);
    setRemixSourceId(null); // Ensure this is null to indicate it's not a remix of a saved prompt
    setGeneratedPrompt('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleClearRemix = useCallback(() => {
    setPromptToRemix(null);
    setRemixSourceId(null);
  }, []);

  return (
    <div className="min-h-screen bg-brand-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 bg-brand-surface p-6 rounded-2xl border border-brand-ui-border/50 shadow-2xl shadow-black/20">
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
              <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-xl shadow-lg shadow-red-500/10 animate-fade-in">
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            )}
            {generatedPrompt && (
              <GeneratedPrompt
                prompt={generatedPrompt}
                onSave={handleSavePrompt}
                canSave={!!lastGeneratedData}
              />
            )}
          </div>
        </div>
        <div className="mt-20">
          <PromptGallery
            prompts={savedPrompts}
            onRemix={handleRemixPrompt}
            onDelete={handleDeletePrompt}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </main>
    </div>
  );
};

export default App;