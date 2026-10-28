import React from 'react';
import { Play, Shield, Hammer, Sparkles, Volume2, VolumeX, Smartphone, Keyboard, Zap } from 'lucide-react';
import { FIXTURE_SPECS } from '../game/fixtureData';
import { soundEngine } from '../game/audio';

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
  const handleStartWithAudioUnlock = () => {
    soundEngine.resumeAudio();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 sm:p-7 text-slate-100 shadow-2xl my-auto max-h-[96vh] overflow-y-auto">
        {/* Top Sound Toggle */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.resumeAudio();
              onToggleMute();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/80 active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4.5 h-4.5 text-red-400" /> : <Volume2 className="w-4.5 h-4.5 text-emerald-400" />}
          </button>
        </div>

        {/* Title Header */}
        <div className="text-center mb-4 sm:mb-6 pr-10 pl-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-bold font-mono block">
            3D Endless Runner · BrickBreaker Defender
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-white mt-0.5 leading-none">
            Mr. Rogers: <span className="text-red-500">Window Smash</span> Defender
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Swing Mr. Rogers' giant sledgehammer to pulverize incoming rocks and golf balls before they smash the architectural windows and patio doors behind you!
          </p>
        </div>

        {/* Rules & Gameplay Callouts */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="p-2 sm:p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex flex-col items-center text-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/20 text-red-400 mb-1 sm:mb-2">
              <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-[11px] sm:text-sm text-white leading-tight">Hammer Smashes</span>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden xs:block">
              Swing at incoming hazards for explosive combos.
            </p>
          </div>

          <div className="p-2 sm:p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex flex-col items-center text-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/20 text-blue-400 mb-1 sm:mb-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-[11px] sm:text-sm text-white leading-tight">3-Hit Glass Lives</span>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden xs:block">
              Hairline crack → Spiderweb → Shatter! Protect the glass.
            </p>
          </div>

          <div className="p-2 sm:p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex flex-col items-center text-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-sky-500/20 text-sky-400 mb-1 sm:mb-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-[11px] sm:text-sm text-white leading-tight">Super Abilities</span>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden xs:block">
              Sonic Shockwave & Slow-Mo bullet time!
            </p>
          </div>
        </div>

        {/* Architectural Fixtures Showcase */}
        <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
            Featured Windows & Doors:
          </span>
          <div className="flex flex-wrap gap-1 text-[10px] sm:text-xs">
            {FIXTURE_SPECS.slice(0, 8).map((f, i) => (
              <span
                key={f.id}
                className="px-2 py-0.5 bg-slate-800/90 text-slate-300 rounded-md border border-slate-700/80"
              >
                {i + 1}. {f.name}
              </span>
            ))}
            <span className="px-2 py-0.5 bg-slate-800/50 text-slate-400 rounded-md">
              +3 more architectural fixtures
            </span>
          </div>
        </div>

        {/* Controls Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5 p-2.5 sm:p-3 bg-slate-800/70 rounded-2xl border border-slate-700/80 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-1">
            <Smartphone className="w-4.5 h-4.5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white block font-display uppercase tracking-wider text-[11px] sm:text-xs">Mobile Phone:</strong>
              <span className="text-[10px] sm:text-xs text-slate-300">
                Tilt phone or touch/drag to steer · <strong className="text-amber-300">Tap ANYWHERE</strong> to SMASH!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1">
            <Keyboard className="w-4.5 h-4.5 text-blue-400 shrink-0" />
            <div>
              <strong className="text-white block font-display uppercase tracking-wider text-[11px] sm:text-xs">Desktop PC / Mac:</strong>
              <span className="text-[10px] sm:text-xs text-slate-300">
                <strong className="text-white">A / D</strong> to steer · <strong className="text-blue-300">SPACE</strong> to SMASH · <strong className="text-amber-300">SHIFT</strong> for Power-Up!
              </span>
            </div>
          </div>
        </div>

        {/* Scores & Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">High Score</span>
              <span className="text-sm sm:text-base font-bold text-white">{highScore}</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Coins</span>
              <span className="text-sm sm:text-base font-bold text-amber-400">{coins}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                soundEngine.resumeAudio();
                onOpenShop();
              }}
              className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors border border-slate-700 active:scale-95"
            >
              Shop
            </button>
            <button
              onClick={handleStartWithAudioUnlock}
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-black text-sm sm:text-base transition-transform active:scale-95 shadow-xl shadow-red-600/30 flex items-center justify-center gap-1.5 sm:gap-2 font-display uppercase tracking-wider"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>Start Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
