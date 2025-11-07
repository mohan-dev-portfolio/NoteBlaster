import React, { useState, useEffect, useCallback } from 'react';
import type { Question, GameResult } from '../../types';
import { Target, Check, X, Trophy, Play, RotateCw, ArrowLeft } from 'lucide-react';

interface GameProps {
  questions: Question[];
  onGoBack: () => void;
}

const TargetIcon: React.FC<{ blasted: boolean; missed: boolean }> = ({ blasted, missed }) => (
    <div className={`relative w-32 h-32 transition-transform duration-300 ${missed ? 'animate-shake' : ''}`}>
        <Target className={`w-32 h-32 text-secondary ${blasted ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`} />
        {blasted && <div className="absolute inset-0 bg-secondary rounded-full animate-shoot" />}
    </div>
);

export const ShootingQuizGame: React.FC<GameProps> = ({ questions, onGoBack }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameResult[]>([]);
  
  useEffect(() => {
    try {
        const storedScores = localStorage.getItem('noteBlasterLeaderboard');
        if (storedScores) {
            setLeaderboard(JSON.parse(storedScores));
        }
    } catch (e) {
        console.error("Could not parse leaderboard from localStorage", e);
        localStorage.removeItem('noteBlasterLeaderboard');
    }
  }, []);
  
  const shuffleOptions = useCallback((options: string[], answer: string): string[] => {
    const uniqueOptions = [...new Set([answer, ...options])];
    return uniqueOptions.sort(() => Math.random() - 0.5);
  }, []);

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  useEffect(() => {
    if (questions.length > 0 && gameState === 'playing') {
      const currentQuestion = questions[currentQuestionIndex];
      setShuffledOptions(shuffleOptions(currentQuestion.options, currentQuestion.answer));
    }
  }, [currentQuestionIndex, questions, gameState, shuffleOptions]);
  

  const handleAnswer = (option: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(option);
    const correct = option === questions[currentQuestionIndex].answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 10);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        endGame();
      }
    }, 1500);
  };
  
  const endGame = () => {
    setGameState('end');
    const newResult: GameResult = { score, date: new Date().toISOString() };
    const updatedLeaderboard = [...leaderboard, newResult]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('noteBlasterLeaderboard', JSON.stringify(updatedLeaderboard));
  };
  
  const startGame = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  if (gameState === 'start') {
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-secondary mb-4">Target Practice</h3>
        <p className="text-text-secondary mb-6">Test your knowledge! Answer questions correctly to blast the targets.</p>
        <button onClick={startGame} className="bg-secondary hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center mx-auto text-lg">
          <Play className="w-6 h-6 mr-2" />
          Start Game
        </button>
      </div>
    );
  }
  
  if (gameState === 'end') {
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-secondary mb-2">Game Over!</h3>
        <p className="text-4xl font-bold text-white mb-4">{score} <span className="text-lg text-text-secondary">points</span></p>
        <div className="my-6">
            <h4 className="text-lg font-semibold text-primary flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 mr-2"/> Leaderboard
            </h4>
            <ul className="text-left max-w-xs mx-auto">
                {leaderboard.length > 0 ? leaderboard.map((result, index) => (
                    <li key={index} className="flex justify-between p-1 bg-gray-800 rounded mb-1">
                        <span>{index + 1}. {new Date(result.date).toLocaleDateString()}</span>
                        <span className="font-bold">{result.score} pts</span>
                    </li>
                )) : <p className="text-text-secondary text-center">No scores yet. Play a game!</p>}
            </ul>
        </div>
        <div className="flex justify-center items-center space-x-4">
            <button onClick={onGoBack} className="bg-surface hover:bg-gray-600 text-text-secondary font-bold py-2 px-4 rounded text-sm transition-colors flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Game
            </button>
            <button onClick={startGame} className="bg-secondary hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center text-lg">
                <RotateCw className="w-6 h-6 mr-2" />
                Play Again
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full p-4 sm:p-6 bg-surface rounded-lg shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-text-secondary">Question {currentQuestionIndex + 1} / {questions.length}</div>
        <div className="text-xl font-bold text-primary">Score: {score}</div>
      </div>
      <div className="flex flex-col items-center justify-center my-8 h-32">
        <TargetIcon blasted={isCorrect === true} missed={isCorrect === false}/>
      </div>
      <div className="text-center mb-6 min-h-[84px]">
        <p className="text-lg font-semibold text-text-primary">{currentQuestion.question}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shuffledOptions.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isTheCorrectAnswer = option === currentQuestion.answer;
          let buttonClass = 'bg-gray-700 hover:bg-primary';
          if (isSelected) {
            buttonClass = isCorrect ? 'bg-green-600' : 'bg-red-600';
          } else if (selectedAnswer !== null && isTheCorrectAnswer) {
            buttonClass = 'bg-green-600';
          }
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-lg text-left text-white font-semibold transition-all duration-300 transform disabled:cursor-not-allowed disabled:scale-100 ${buttonClass}`}
            >
              <div className="flex items-center">
                <span className="mr-3 w-6 h-6 rounded-full bg-black bg-opacity-20 flex items-center justify-center font-mono">
                    {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {isSelected && (
                    <div className="ml-auto">
                        {isCorrect ? <Check size={24}/> : <X size={24}/>}
                    </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
