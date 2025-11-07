import React, { useState, useEffect, useRef } from 'react';
import type { FillInTheBlankQuestion } from '../../types';
import { Keyboard, Play, RotateCw, ArrowLeft, Check, X, Trophy, Timer } from 'lucide-react';

interface GameProps {
  questions: FillInTheBlankQuestion[];
  onGoBack: () => void;
}

const GAME_DURATION = 60; // seconds

export const KeywordDashGame: React.FC<GameProps> = ({ questions, onGoBack }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [shuffledQuestions, setShuffledQuestions] = useState<FillInTheBlankQuestion[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft <= 0 && gameState === 'playing') {
      endGame();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, timeLeft]);
  
  useEffect(() => {
      if (gameState === 'playing') {
          inputRef.current?.focus();
      }
  }, [gameState, currentQuestionIndex]);

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('end');
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      endGame();
    }
    setUserInput('');
    setFeedback(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    setFeedback(null);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const isCorrect = userInput.trim().toLowerCase() === shuffledQuestions[currentQuestionIndex].answer.toLowerCase();
    
    if (isCorrect) {
      setScore(s => s + 10);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    
    setTimeout(nextQuestion, isCorrect ? 800 : 1500);
  };

  const startGame = () => {
    setScore(0);
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
    setCurrentQuestionIndex(0);
    setUserInput('');
    setFeedback(null);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
  };

  if (gameState === 'start') {
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-green-400 mb-4">Keyword Dash</h3>
        <p className="text-text-secondary mb-6">Type the correct answer and press Enter. How many can you get in {GAME_DURATION} seconds?</p>
        <button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center mx-auto text-lg">
          <Play className="w-6 h-6 mr-2" />
          Start Typing
        </button>
      </div>
    );
  }
  
  if (gameState === 'end') {
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-green-400 mb-2">Time's Up!</h3>
        <p className="text-4xl font-bold text-white mb-6">{score} <span className="text-lg text-text-secondary">points</span></p>
        <div className="flex justify-center items-center space-x-4">
            <button onClick={onGoBack} className="bg-surface hover:bg-gray-600 text-text-secondary font-bold py-2 px-4 rounded text-sm transition-colors flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Game
            </button>
            <button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center text-lg">
                <RotateCw className="w-6 h-6 mr-2" />
                Play Again
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  let inputBorderColor = 'border-gray-500 focus:border-green-400';
  if (feedback === 'correct') inputBorderColor = 'border-green-500';
  if (feedback === 'incorrect') inputBorderColor = 'border-red-500 animate-shake';

  return (
    <div className="w-full max-w-2xl p-4 sm:p-6 bg-surface rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-text-secondary">Question {currentQuestionIndex + 1} / {shuffledQuestions.length}</div>
            <div className="flex items-center text-xl font-bold text-primary"><Timer className="w-5 h-5 mr-2" /> {timeLeft}s</div>
            <div className="text-xl font-bold text-green-400">Score: {score}</div>
        </div>
        <div className="text-center my-8 min-h-[80px]">
            <p className="text-xl font-semibold text-text-primary">{currentQuestion.question}</p>
        </div>
        <form onSubmit={handleFormSubmit}>
            <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                disabled={!!feedback}
                className={`w-full p-4 bg-gray-800 border-2 rounded-lg text-center text-xl text-white outline-none transition-colors ${inputBorderColor}`}
                placeholder="Type your answer here..."
                autoComplete="off"
            />
        </form>
        <div className="text-center mt-4 min-h-[30px]">
            {feedback === 'correct' && <div className="text-green-500 flex items-center justify-center"><Check className="mr-2"/> Correct!</div>}
            {feedback === 'incorrect' && (
                <div className="text-red-500 flex flex-col items-center justify-center">
                    <div className="flex items-center"><X className="mr-2"/> Incorrect!</div>
                    <p className="text-sm text-gray-400 mt-1">Correct answer: {currentQuestion.answer}</p>
                </div>
            )}
        </div>
    </div>
  );
};
