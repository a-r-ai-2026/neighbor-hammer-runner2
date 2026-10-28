import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FixtureSpec } from '../game/types';
import { Trophy, Coins, ArrowRight, ShoppingBag } from 'lucide-react';

interface LevelClearedModalProps {
  level: number;
  reward: number;
  nextFixture: FixtureSpec;
  score: number;
  onContinue: () => void;
  onOpenShop: () => void;
}

export const LevelClearedModal: React.FC<LevelClearedModalProps> = ({
  level,
  reward,
  nextFixture,
  score,
  onContinue,
  onOpenShop,
}) => {
  useEffect(() => {
    // Fire confetti cannon
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#dc2626', '#3b82f6', '#22c55e', '#ffffff'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center text-slate-100 shadow-2xl">
        {/* Trophy Badge */}
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-3">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-black font-display uppercase tracking-tight text-white">
          Level {level} Defended!
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Mr. Rogers protected the glass with flying colors!
        </p>

        {/* Rewards Box */}
        <div className="my-5 grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Coin Payout</span>
            <div className="flex items-center justify-center gap-1.5 text-xl font-black text-amber-400 font-display">
              <Coins className="w-5 h-5" />
              <span>+{reward}</span>
            </div>
          </div>
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Total Score</span>
            <span className="text-xl font-black text-white font-mono">{score}</span>
          </div>
        </div>

        {/* Up Next Fixture Card */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-left mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-display">
              Next Fixture (Level {level + 1})
            </span>
            <span className="text-xs text-slate-400 uppercase font-mono">
              {nextFixture.category === 'door' ? 'Patio Door' : 'Window'}
            </span>
          </div>
          <div className="text-base font-bold text-white mb-1">{nextFixture.name}</div>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            {nextFixture.description}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <span>Width: {nextFixture.width}m</span>
            <span>·</span>
            <span>Panels: {nextFixture.panelsCount}</span>
            <span>·</span>
            <span className="capitalize">Style: {nextFixture.glassStyle.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onOpenShop}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Hardware Shop</span>
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 uppercase font-display"
          >
            <span>Next Window</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
