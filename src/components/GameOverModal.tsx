import React from 'react';
import { RotateCcw, ShoppingBag, AlertTriangle, Trophy } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  level: number;
  highScore: number;
  fixtureName: string;
  onRetry: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  level,
  highScore,
  fixtureName,
  onRetry,
  onOpenShop,
}) => {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 text-center text-slate-100 shadow-2xl">
        {/* Warning Skull / Shatter Icon */}
        <div className="inline-flex p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 mb-3 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-black font-display uppercase tracking-tight text-red-500">
          Glass Shattered!
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          The <span className="font-semibold text-white">{fixtureName}</span> took 3 direct hits and shattered into pieces!
        </p>

        {isNewHighScore && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="my-5 grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Final Score</span>
            <span className="text-2xl font-black text-white font-mono">{score}</span>
          </div>
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Level Reached</span>
            <span className="text-2xl font-black text-amber-400 font-display">
              LEVEL {level}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onOpenShop}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Upgrade Shop</span>
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 uppercase font-display"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
