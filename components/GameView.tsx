import React, { useState } from 'react';
import type { StudyContent } from '../types';
import { ShootingQuizGame } from './games/ShootingQuizGame';
import { FlashcardFrenzyGame } from './games/FlashcardFrenzyGame';
import { KeywordDashGame } from './games/KeywordDashGame';
import { MatchUpManiaGame } from './games/MatchUpManiaGame';
import { Target, Zap, Gamepad2, Keyboard, Copy, Info } from 'lucide-react';

interface GameViewProps {
  studyContent: StudyContent;
}

const GameCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; disabled?: boolean; disabledReason?: string; }> = ({ icon, title, description, onClick, disabled = false, disabledReason }) => (
    <div 
        onClick={!disabled ? onClick : undefined}
        className={`relative bg-gray-800 p-6 rounded-lg border border-gray-700 transition-all transform ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-gray-700 cursor-pointer hover:-translate-y-1'}`}
        title={disabled ? disabledReason : ''}
    >
        {disabled && <div className="absolute top-2 right-2 text-gray-400"><Info size={16} /></div>}
        <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto ${disabled ? 'bg-gray-600 text-gray-400' : 'bg-primary/20 text-primary'}`}>
            {icon}
        </div>
        <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
        <p className="text-text-secondary">{description}</p>
    </div>
);


export const GameView: React.FC<GameViewProps> = ({ studyContent }) => {
    const [activeGame, setActiveGame] = useState<'selection' | 'shooting' | 'flashcard' | 'typing' | 'matching'>('selection');

    const { questions, fillInTheBlankQuestions } = studyContent;

    const canPlayTypingGame = fillInTheBlankQuestions && fillInTheBlankQuestions.length > 0;
    const canPlayMatchingGame = questions && questions.length >= 4; // Need at least 4 pairs for a decent game

    const gameComponents = {
        shooting: <ShootingQuizGame questions={questions} onGoBack={() => setActiveGame('selection')} />,
        flashcard: <FlashcardFrenzyGame questions={questions} onGoBack={() => setActiveGame('selection')} />,
        typing: canPlayTypingGame ? <KeywordDashGame questions={fillInTheBlankQuestions} onGoBack={() => setActiveGame('selection')} /> : null,
        matching: canPlayMatchingGame ? <MatchUpManiaGame questions={questions} onGoBack={() => setActiveGame('selection')} /> : null
    };

    if (activeGame !== 'selection' && gameComponents[activeGame]) {
        return gameComponents[activeGame];
    }
  
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-surface rounded-lg shadow-lg border border-gray-700 text-center animate-[fadeIn_0.5s_ease-in-out]">
            <div className="flex items-center justify-center mb-4">
                <Gamepad2 className="w-8 h-8 text-secondary mr-3" />
                <h3 className="text-3xl font-bold text-secondary">Choose Your Challenge</h3>
            </div>
            <p className="text-text-secondary mb-8">Select a game to test your knowledge on the study material.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <GameCard 
                    icon={<Target size={32} />}
                    title="Target Practice"
                    description="Answer questions correctly to blast the targets. A classic test of accuracy."
                    onClick={() => setActiveGame('shooting')}
                />
                <GameCard 
                    icon={<Zap size={32} />}
                    title="Flashcard Frenzy"
                    description="A rapid-fire quiz. How many can you answer correctly before time runs out?"
                    onClick={() => setActiveGame('flashcard')}
                />
                <GameCard 
                    icon={<Keyboard size={32} />}
                    title="Keyword Dash"
                    description="Test your recall and typing speed. Fill in the blanks as fast as you can."
                    onClick={() => setActiveGame('typing')}
                    disabled={!canPlayTypingGame}
                    disabledReason="The AI couldn't generate enough fill-in-the-blank questions from this document."
                />
                <GameCard 
                    icon={<Copy size={32} />}
                    title="Match-Up Mania"
                    description="A memory challenge. Match the questions to their correct answers."
                    onClick={() => setActiveGame('matching')}
                    disabled={!canPlayMatchingGame}
                    disabledReason="This game requires at least 4 multiple-choice questions to play."
                />
            </div>
        </div>
    );
};
