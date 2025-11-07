import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Question, GameResult } from '../../types';
import { Zap, Check, X, Trophy, Play, RotateCw, ArrowLeft, Timer } from 'lucide-react';

interface GameProps {
  questions: Question[];
  onGoBack: () => void;
}

const GAME_DURATION = 60; // 60 seconds

export const FlashcardFrenzyGame: React.FC<GameProps> = ({ questions, onGoBack }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
        const storedScores = localStorage.getItem('noteBlasterLeaderboard');
        if (storedScores) setLeaderboard(JSON.parse(storedScores));
    } catch (e) {
        console.error("Could not parse leaderboard", e);
    }
  }, []);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const endGame = useCallback(() => {
    setGameState('end');
    stopTimer();
    const newResult: GameResult = { score, date: new Date().toISOString() };
    const updatedLeaderboard = [...leaderboard, newResult]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('noteBlasterLeaderboard', JSON.stringify(updatedLeaderboard));
  }, [score, leaderboard]);
  
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameState === 'playing') {
      endGame();
    }
    return () => stopTimer();
  }, [gameState, timeLeft, endGame]);

  const shuffleArray = useCallback((array: any[]) => [...array].sort(() => Math.random() - 0.5), []);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  useEffect(() => {
    if (questions.length > 0 && gameState === 'playing') {
      const currentQ = shuffledQuestions[currentQuestionIndex];
      setShuffledOptions(shuffleArray([currentQ.answer, ...currentQ.options.filter(o => o !== currentQ.answer)]));
    }
  }, [currentQuestionIndex, gameState, shuffledQuestions, shuffleArray]);

  const handleAnswer = (option: string) => {
    if (isFlipped) return;
    const correct = option === shuffledQuestions[currentQuestionIndex].answer;
    setIsCorrect(correct);
    setIsFlipped(true);

    if (correct) {
      setScore(s => s + 10);
    }

    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setIsFlipped(false);
        setIsCorrect(null);
      } else {
        endGame();
      }
    }, 1200);
  };

  const startGame = () => {
    setScore(0);
    setShuffledQuestions(shuffleArray(questions));
    setCurrentQuestionIndex(0);
    setIsFlipped(false);
    setIsCorrect(null);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
  };

  if (gameState === 'start') {
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-primary mb-4">Flashcard Frenzy</h3>
        <p className="text-text-secondary mb-6">A rapid-fire quiz! Answer as many questions as you can in {GAME_DURATION} seconds.</p>
        <button onClick={startGame} className="bg-primary hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center mx-auto text-lg">
          <Play className="w-6 h-6 mr-2" />
          Start Frenzy
        </button>
      </div>
    );
  }
  
  if (gameState === 'end') {
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-primary mb-2">Time's Up!</h3>
        <p className="text-4xl font-bold text-white mb-4">{score} <span className="text-lg text-text-secondary">points</span></p>
        <div className="my-6">
            <h4 className="text-lg font-semibold text-secondary flex items-center justify-center mb-2"><Trophy className="w-5 h-5 mr-2"/> Leaderboard</h4>
            <ul className="text-left max-w-xs mx-auto">{leaderboard.length > 0 ? leaderboard.map((result, index) => (
                <li key={index} className="flex justify-between p-1 bg-gray-800 rounded mb-1">
                    <span>{index + 1}. {new Date(result.date).toLocaleDateString()}</span><span className="font-bold">{result.score} pts</span></li>
            )) : <p className="text-text-secondary text-center">No scores yet. Play a game!</p>}</ul>
        </div>
        <div className="flex justify-center items-center space-x-4">
            <button onClick={onGoBack} className="bg-surface hover:bg-gray-600 text-text-secondary font-bold py-2 px-4 rounded text-sm transition-colors flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Game
            </button>
            <button onClick={startGame} className="bg-primary hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center text-lg">
                <RotateCw className="w-6 h-6 mr-2" />
                Play Again
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const timePercentage = (timeLeft / GAME_DURATION) * 100;

  return (
    <div className="w-full max-w-2xl p-4 sm:p-6 bg-surface rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-text-secondary">Question {currentQuestionIndex + 1} / {shuffledQuestions.length}</div>
            <div className="flex items-center text-xl font-bold text-primary"><Timer className="w-5 h-5 mr-2" /> {timeLeft}s</div>
            <div className="text-xl font-bold text-secondary">Score: {score}</div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${timePercentage}%`, transition: 'width 0.5s linear' }}></div>
        </div>
        
        <div className="h-48 mb-6 [perspective:1000px]">
            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute w-full h-full p-6 bg-gray-700 rounded-lg flex items-center justify-center text-center [backface-visibility:hidden]">
                    <p className="text-lg font-semibold text-text-primary">{currentQuestion.question}</p>
                </div>
                {/* Back */}
                <div className={`absolute w-full h-full p-6 rounded-lg flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isCorrect ? <Check size={48} /> : <X size={48} />}
                    <p className="text-2xl font-bold mt-2">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                    {!isCorrect && <p className="mt-1 text-sm">Correct answer: {currentQuestion.answer}</p>}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shuffledOptions.map((option, index) => (
                <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={isFlipped}
                    className="p-4 rounded-lg text-left text-white font-semibold transition-all duration-300 transform bg-gray-700 hover:bg-primary disabled:cursor-not-allowed"
                >
                    <span className="mr-3 w-6 h-6 rounded-full bg-black bg-opacity-20 flex items-center justify-center font-mono shrink-0">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                </button>
            ))}
        </div>
    </div>
  );
};
