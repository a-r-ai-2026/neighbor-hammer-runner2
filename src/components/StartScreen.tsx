import React from 'react';
import { Play, Shield, Hammer, Sparkles, Volume2, VolumeX, Smartphone, Keyboard } from 'lucide-react';
import { FIXTURE_SPECS } from '../game/fixtureData';

interface StartScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  coins: number;
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenShop,
  coins,
  highScore,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-700 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl my-auto">
        {/* Top Sound Toggle */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>

        {/* Title Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold font-mono">
            3D Endless Runner · BrickBreaker Defender
          </span>
          <h1 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-white mt-1">
            Mr. Rogers: <span className="text-red-500">Window Smash</span> Defender
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            Channel your inner Wreck-It Ralph! Swing Mr. Rogers' giant sledgehammer to pulverize incoming rocks and golf balls before they smash the delicate architectural windows and patio doors behind you.
          </p>
        </div>

        {/* Rules & Gameplay Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 mb-2">
              <Hammer className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-white">Timed Hammer Smashes</span>
            <p className="text-xs text-slate-400 mt-1">
              Swing your sledgehammer at incoming hazards for explosive combos.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-white">3-Hit Glass Integrity</span>
            <p className="text-xs text-slate-400 mt-1">
              Hairline crack → Spiderweb → Total Glass Shatter! Protect your windows.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-white">Escalating Fixtures</span>
            <p className="text-xs text-slate-400 mt-1">
              Alternates between compact windows and huge patio doors every level.
            </p>
          </div>
        </div>

        {/* Architectural Fixtures Showcase */}
        <div className="mb-6 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
            Featured Windows & Doors:
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {FIXTURE_SPECS.map((f, i) => (
              <span
                key={f.id}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700"
              >
                {i + 1}. {f.name}
              </span>
            ))}
          </div>
        </div>

        {/* Controls Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-3 bg-slate-800/70 rounded-2xl border border-slate-700 text-xs text-slate-300">
          <div className="flex items-center gap-2.5 p-1">
            <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white block font-display uppercase tracking-wider">Mobile Phone:</strong>
              <span>Tilt phone to steer · <strong className="text-amber-300">Tap ANYWHERE</strong> on screen to swing hammer!</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-1">
            <Keyboard className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <strong className="text-white block font-display uppercase tracking-wider">Desktop PC / Mac:</strong>
              <span>A / D or Arrow Keys to steer · <strong className="text-blue-300">Spacebar</strong> to SMASH!</span>
            </div>
          </div>
        </div>

        {/* Scores & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block">High Score</span>
              <span className="text-base font-bold text-white">{highScore}</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 block">Saved Coins</span>
              <span className="text-base font-bold text-amber-400">{coins}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenShop}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700"
            >
              Hardware Shop
            </button>
            <button
              onClick={onStart}
              className="flex-1 sm:flex-initial px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-base transition-transform active:scale-95 shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 font-display uppercase tracking-wider"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
