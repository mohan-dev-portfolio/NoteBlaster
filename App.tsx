import React, { useState } from 'react';
import { FileUp, BookOpen, Gamepad2, LoaderCircle } from 'lucide-react';
import type { Question, StudyContent } from './types';
import { extractText } from './services/textExtractor';
import { generateStudyContent } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { NotesView } from './components/NotesView';
import { GameView } from './components/GameView';

type AppState = 'upload' | 'processing' | 'results' | 'error';
type View = 'notes' | 'game';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [studyContent, setStudyContent] = useState<StudyContent | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentView, setCurrentView] = useState<View>('notes');

  const handleFileUpload = async (file: File) => {
    setAppState('processing');
    setFileName(file.name);
    setError('');

    try {
      const text = await extractText(file);
      if (text.trim().length < 100) {
        throw new Error("Extracted text is too short. Please upload a file with more content.");
      }
      const content = await generateStudyContent(text);
      setStudyContent(content);
      setAppState('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("Error processing file:", errorMessage);
      setError(`Failed to process file. ${errorMessage}`);
      setAppState('error');
    }
  };
  
  const handleReset = () => {
    setAppState('upload');
    setStudyContent(null);
    setFileName('');
    setError('');
    setCurrentView('notes');
  };

  const renderContent = () => {
    switch (appState) {
      case 'upload':
        return <FileUpload onFileUpload={handleFileUpload} />;
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <LoaderCircle className="w-16 h-16 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Document...</h2>
            <p className="text-text-secondary">{fileName}</p>
            <p className="mt-4 text-sm max-w-md">Our AI is summarizing key points and generating your quiz. This might take a moment.</p>
          </div>
        );
      case 'results':
        if (!studyContent) return null;
        return (
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-4">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 sm:mb-0 truncate max-w-xs sm:max-w-md" title={fileName}>{fileName}</h2>
              <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentView('notes')} className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center transition-colors ${currentView === 'notes' ? 'bg-primary text-white' : 'bg-surface hover:bg-gray-600'}`}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Notes
                </button>
                <button onClick={() => setCurrentView('game')} className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center transition-colors ${currentView === 'game' ? 'bg-secondary text-white' : 'bg-surface hover:bg-gray-600'}`}>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Game Mode
                </button>
              </div>
            </div>
            {currentView === 'notes' ? <NotesView notes={studyContent.notes} /> : <GameView studyContent={studyContent} />}
          </div>
        );
      case 'error':
        return (
          <div className="text-center p-8 bg-surface rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <button onClick={handleReset} className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center mx-auto">
              <FileUp className="w-4 h-4 mr-2" />
              Upload a Different File
            </button>
          </div>
        )
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center p-4">
       <header className="w-full max-w-5xl mx-auto py-4 px-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary" style={{fontFamily: "'Press Start 2P', cursive"}}>NoteBlaster</h1>
        {appState === 'results' && (
          <button onClick={handleReset} className="bg-surface hover:bg-gray-600 text-text-secondary font-bold py-2 px-4 rounded text-sm transition-colors flex items-center">
            <FileUp className="w-4 h-4 mr-2" />
            New File
          </button>
        )}
      </header>
      <main className="flex-grow w-full flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
