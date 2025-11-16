import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface GeneratedVideoProps {
    isLoading: boolean;
    progressMessage: string;
    videoUrl: string | null;
    error: string | null;
}

const GeneratedVideo: React.FC<GeneratedVideoProps> = ({ isLoading, progressMessage, videoUrl, error }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-4">
                {error ? t('generatedVideo.error') : t('generatedVideo.title')}
            </h2>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                    <p>{error}</p>
                </div>
            )}

            {!error && isLoading && (
                <div className="flex items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
                    <svg className="animate-spin h-6 w-6 text-brand-accent-to" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-brand-text-secondary font-medium">{progressMessage}</p>
                </div>
            )}

            {videoUrl && (
                <div>
                    <video
                        src={videoUrl}
                        controls
                        className="w-full rounded-lg border border-brand-border"
                        autoPlay
                        loop
                    />
                </div>
            )}
        </div>
    );
};

export default GeneratedVideo;
