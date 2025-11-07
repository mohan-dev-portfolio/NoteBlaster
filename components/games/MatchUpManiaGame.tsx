import React, { useState, useEffect, useMemo } from 'react';
import type { Question } from '../../types';
import { Copy, Play, RotateCw, ArrowLeft, Trophy, Timer } from 'lucide-react';

interface GameProps {
  questions: Question[];
  onGoBack: () => void;
}

interface Card {
  id: number;
  content: string;
  type: 'question' | 'answer';
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const NUM_PAIRS = 6; // Creates a 4x3 grid

const CardComponent: React.FC<{ card: Card; onCardClick: (id: number) => void; }> = ({ card, onCardClick }) => (
  <div className="[perspective:1000px] aspect-[3/4]" onClick={() => onCardClick(card.id)}>
    <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${card.isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
      {/* Front */}
      <div className={`absolute w-full h-full p-2 rounded-lg flex items-center justify-center text-center [backface-visibility:hidden] ${card.isMatched ? 'bg-indigo-900/50' : 'bg-surface hover:bg-gray-600 cursor-pointer border-2 border-indigo-400'}`}>
      </div>
      {/* Back */}
      <div className={`absolute w-full h-full p-2 rounded-lg flex items-center justify-center text-center text-sm [backface-visibility:hidden] [transform:rotateY(180deg)] ${card.isMatched ? 'bg-green-500' : 'bg-indigo-400'} text-black font-semibold`}>
        {card.content}
      </div>
    </div>
  </div>
);

export const MatchUpManiaGame: React.FC<GameProps> = ({ questions, onGoBack }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);

  const gameQuestions = useMemo(() => {
    return [...questions].sort(() => 0.5 - Math.random()).slice(0, NUM_PAIRS);
  }, [questions]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);
  
  useEffect(() => {
      if (flippedCards.length === 2) {
          const [first, second] = flippedCards;
          if (first.pairId === second.pairId) {
              // Match!
              setCards(prev => prev.map(c => (c.pairId === first.pairId ? {...c, isMatched: true, isFlipped: true} : c)));
              setFlippedCards([]);
          } else {
              // No match
              setTimeout(() => {
                  setCards(prev => prev.map(c => (c.id === first.id || c.id === second.id ? {...c, isFlipped: false} : c)));
                  setFlippedCards([]);
              }, 1000);
          }
      }
  }, [flippedCards]);

  const handleCardClick = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || flippedCards.length === 2) return;
    
    setCards(prev => prev.map(c => (c.id === id ? {...c, isFlipped: true} : c)));
    setFlippedCards(prev => [...prev, card]);
    if (flippedCards.length === 0) setMoves(m => m + 1);
  };
  
  const startGame = () => {
    const newCards: Card[] = [];
    gameQuestions.forEach((q, i) => {
        newCards.push({ id: i * 2, content: q.question, type: 'question', pairId: i, isFlipped: false, isMatched: false });
        newCards.push({ id: i * 2 + 1, content: q.answer, type: 'answer', pairId: i, isFlipped: false, isMatched: false });
    });
    setCards(newCards.sort(() => Math.random() - 0.5));
    setMoves(0);
    setTimer(0);
    setFlippedCards([]);
    setGameState('playing');
  };

  useEffect(() => {
      if (gameState === 'playing' && cards.length > 0 && cards.every(c => c.isMatched)) {
          setGameState('end');
      }
  }, [cards, gameState]);

  if (gameState === 'start') {
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-indigo-400 mb-4">Match-Up Mania</h3>
        <p className="text-text-secondary mb-6">Test your memory. Find all the matching question and answer pairs!</p>
        <button onClick={startGame} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center mx-auto text-lg">
          <Play className="w-6 h-6 mr-2" />
          Start Matching
        </button>
      </div>
    );
  }
  
  if (gameState === 'end') {
      const score = Math.max(0, 1000 - (moves * 10) - (timer * 5));
    return (
      <div className="text-center p-8 bg-surface rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-indigo-400 mb-2">Well Done!</h3>
        <p className="text-4xl font-bold text-white mb-2">{score} <span className="text-lg text-text-secondary">points</span></p>
        <p className="text-text-secondary">Finished in {timer} seconds with {moves} moves.</p>
        <div className="flex justify-center items-center space-x-4 mt-6">
            <button onClick={onGoBack} className="bg-surface hover:bg-gray-600 text-text-secondary font-bold py-2 px-4 rounded text-sm transition-colors flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" /> Change Game
            </button>
            <button onClick={startGame} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 flex items-center text-lg">
                <RotateCw className="w-6 h-6 mr-2" /> Play Again
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl p-4 sm:p-6 bg-surface rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold text-indigo-400">Moves: {moves}</div>
            <div className="flex items-center text-xl font-bold text-primary"><Timer className="w-5 h-5 mr-2" /> {timer}s</div>
        </div>
        <div className="grid grid-cols-4 gap-3">
            {cards.map(card => <CardComponent key={card.id} card={card} onCardClick={handleCardClick} />)}
        </div>
    </div>
  );
};
