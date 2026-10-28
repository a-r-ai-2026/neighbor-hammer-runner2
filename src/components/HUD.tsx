import React, { useState, useEffect } from 'react';
import { FixtureSpec, PlayerStats, AbilitiesState } from '../game/types';
import {
  Volume2,
  VolumeX,
  ShoppingBag,
  Wrench,
  Shield,
  Coins,
  Zap,
  Smartphone,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Hourglass,
  Info,
  ChevronUp,
} from 'lucide-react';

interface TapRipple {
  id: number;
  x: number;
  y: number;
}

interface HUDProps {
  level: number;
  fixture: FixtureSpec;
  score: number;
  combo: number;
  glassHits: number;
  stats: PlayerStats;
  abilities: AbilitiesState;
  isMuted: boolean;
  isZoomedOut: boolean;
  onToggleZoom: () => void;
  tiltActive: boolean;
  tiltAngle: number;
  onCalibrateTilt: () => void;
  onRequestTiltPermission: () => void;
  onToggleMute: () => void;
  onOpenShop: () => void;
  onUseRepairKit: () => void;
  onTriggerShockwave: () => void;
  onTriggerTimeSlow: () => void;
  onSmash: () => void;
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
  onPointerSteer: (normX: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  fixture,
  score,
  combo,
  glassHits,
  stats,
  abilities,
  isMuted,
  isZoomedOut,
  onToggleZoom,
  tiltActive,
  tiltAngle,
  onCalibrateTilt,
  onRequestTiltPermission,
  onToggleMute,
  onOpenShop,
  onUseRepairKit,
  onTriggerShockwave,
  onTriggerTimeSlow,
  onSmash,
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
  onPointerSteer,
}) => {
  const [ripples, setRipples] = useState<TapRipple[]>([]);

  // 1. Requirement: Instruction bar fades out 2 seconds after game/wave starts
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  useEffect(() => {
    setShowInstructions(true);
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 2000); // Fades out exactly after 2 seconds
    return () => clearTimeout(timer);
  }, [level]);

  // 2. Requirement: Rolling descriptions / interesting facts about each window/patio door
  const [currentFactIdx, setCurrentFactIdx] = useState<number>(0);
  const factsList = fixture.facts && fixture.facts.length > 0
    ? fixture.facts
    : [
        fixture.description,
        'High-grade suburban glazing engineered to withstand severe weather and projectile impacts.',
      ];

  useEffect(() => {
    setCurrentFactIdx(0);
    const factInterval = setInterval(() => {
      setCurrentFactIdx((prev) => (prev + 1) % factsList.length);
    }, 6000);
    return () => clearInterval(factInterval);
  }, [fixture.id, factsList.length]);

  const handleNextFact = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFactIdx((prev) => (prev + 1) % factsList.length);
  };

  // 3-strike glass status
  const maxHits = 3;
  const remainingGlassLives = Math.max(0, maxHits - glassHits);

  const getDamageLabel = () => {
    switch (glassHits) {
      case 0:
        return 'Pristine Glass';
      case 1:
        return 'Hairline Fracture';
      case 2:
        return 'Severe Spiderweb';
      default:
        return 'Shattered';
    }
  };

  // Tilt bubble indicator offset (-24px to +24px)
  const bubbleOffset = Math.max(-28, Math.min(28, (tiltAngle / 16) * 28));

  // Full-screen tap & drag handler for mobile smash & direct touch steering
  const handleScreenPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Steer Mr. Rogers directly to the horizontal tap position
    const normX = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
    onPointerSteer(normX);

    const newRipple: TapRipple = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    setRipples((prev) => [...prev.slice(-3), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 400);

    onSmash();
  };

  const handleScreenPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Continuous finger dragging steers Mr. Rogers smoothly
    if (e.buttons > 0 || e.pointerType === 'touch') {
      const normX = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
      onPointerSteer(normX);
    }
  };

  const isShockwaveReady = abilities.shockwaveCooldown <= 0;
  const isTimeSlowReady = abilities.timeSlowCooldown <= 0;
  const isTimeSlowActive = abilities.timeSlowRemaining > 0;

  return (
    <div
      onPointerDown={handleScreenPointerDown}
      onPointerMove={handleScreenPointerMove}
      className="absolute inset-0 pointer-events-auto cursor-crosshair flex flex-col justify-between p-1.5 sm:p-4 pt-[max(0.5rem,env(safe-area-inset-top,0.5rem))] pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] pl-[max(0.5rem,env(safe-area-inset-left,0.5rem))] pr-[max(0.5rem,env(safe-area-inset-right,0.5rem))] z-20 select-none overflow-hidden touch-none"
    >
      {/* Cinematic Slow-Mo Bullet-Time Vignette */}
      {isTimeSlowActive && (
        <div className="fixed inset-0 pointer-events-none z-10 border-4 sm:border-8 border-cyan-400/40 bg-gradient-to-b from-cyan-950/20 via-transparent to-cyan-950/20 animate-pulse">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-xl flex items-center gap-1.5 backdrop-blur-md border border-cyan-200">
            <Hourglass className="w-3.5 h-3.5 animate-spin text-slate-950" />
            <span>Bullet-Time Slow-Mo</span>
          </div>
        </div>
      )}

      {/* Visual Tap Shockwaves */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-amber-400 bg-red-500/20 pointer-events-none animate-ping"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* --- TOP HUD BAR --- */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="flex items-start justify-between gap-1 sm:gap-3 pointer-events-auto w-full"
      >
        {/* Left: Wave & Active Fixture Tag */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 shadow-xl max-w-[145px] sm:max-w-xs shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 font-mono tracking-wider uppercase">
              W{level}
            </span>
            <span className="text-slate-500 font-mono text-xs">/</span>
            <span className="text-[9px] sm:text-xs text-slate-300 font-semibold uppercase truncate">
              {fixture.category === 'door' ? 'Patio Door' : 'Window'}
            </span>
          </div>
          <div className="text-xs sm:text-base md:text-lg font-black text-white font-display uppercase tracking-tight truncate">
            {fixture.name}
          </div>

          {/* Glass Integrity Meter (3 Hits max) */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
            {[0, 1, 2].map((idx) => {
              const isAlive = idx < remainingGlassLives;
              return (
                <div
                  key={idx}
                  className={`w-3 sm:w-5 h-1.5 sm:h-2 rounded-sm transition-all ${
                    isAlive
                      ? remainingGlassLives === 3
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : remainingGlassLives === 2
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : 'bg-red-500 animate-pulse shadow-sm shadow-red-500/50'
                      : 'bg-slate-700/80'
                  }`}
                  title={`Glass Life ${idx + 1}`}
                />
              );
            })}
            <span className="text-[8px] sm:text-[11px] font-mono text-slate-300 ml-0.5 truncate">
              {getDamageLabel()}
            </span>
          </div>
        </div>

        {/* Center: Score & Combo */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3 py-1.5 sm:py-2 text-center shadow-xl min-w-[85px] sm:min-w-[110px]">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
            Score
          </span>
          <span className="text-base sm:text-2xl font-black text-white font-mono tabular-nums leading-none">
            {score}
          </span>
          {combo > 1 && (
            <div className="text-[9px] sm:text-xs font-black text-amber-400 font-display mt-0.5 animate-bounce">
              {combo}x COMBO!
            </div>
          )}
        </div>

        {/* Right: Coins, Zoom, Shop & Sound Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Active Deflector Shield Count */}
          {stats.shields > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-cyan-950/90 border border-cyan-400/60 rounded-xl text-cyan-300 shadow-md animate-pulse"
              title="Deflector Shield Active"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold font-mono">{stats.shields}</span>
            </div>
          )}

          {/* Coins Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-amber-400 font-display font-bold text-xs sm:text-sm shadow-md">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-mono tabular-nums">{stats.coins}</span>
          </div>

          {/* Zoom Toggle */}
          <button
            onClick={onToggleZoom}
            className="p-1.5 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-300 shadow-md active:scale-95 transition-all flex items-center gap-1"
            title={isZoomedOut ? 'Switch to Action Zoom' : 'Switch to High Aerial View'}
          >
            {isZoomedOut ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            <span className="text-[10px] font-mono font-bold hidden sm:inline">
              {isZoomedOut ? 'WIDE' : 'CLOSE'}
            </span>
          </button>

          {/* Shop Button */}
          <button
            onClick={onOpenShop}
            className="p-1.5 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white shadow-md active:scale-95 transition-all"
            title="Open Upgrades Shop"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Audio Mute Button (8-bit music toggle) */}
          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 shadow-md active:scale-95 transition-all"
            title={isMuted ? 'Unmute 8-Bit Backing Music' : 'Mute Sound & Music'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* --- ROLLING ARCHITECTURAL FACTS TICKER BAR --- */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleNextFact}
        className="pointer-events-auto mx-auto mt-1 max-w-xl w-full px-3 py-1.5 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-sky-500/30 text-slate-200 shadow-lg cursor-pointer hover:border-sky-400/60 transition-all flex items-center gap-2 group"
        title="Tap to read next architectural fact"
      >
        <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 bg-sky-500/20 rounded-md border border-sky-400/30 text-sky-300 text-[10px] font-mono font-bold uppercase">
          <Info className="w-3 h-3 text-sky-400 animate-pulse" />
          <span>FACT</span>
        </div>
        <p className="text-[11px] sm:text-xs font-medium text-slate-200 leading-snug line-clamp-2 transition-all flex-1">
          {factsList[currentFactIdx]}
        </p>
        <span className="text-[9px] font-mono text-slate-500 shrink-0 group-hover:text-sky-300 transition-colors">
          {currentFactIdx + 1}/{factsList.length} ↻
        </span>
      </div>

      {/* --- REQUIREMENT 1: INSTRUCTION BANNER (FADES OUT AFTER 2 SECONDS) --- */}
      <div
        className={`pointer-events-none mx-auto flex flex-col items-center transition-all duration-700 ${
          showInstructions
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-1.5 bg-slate-950/90 backdrop-blur-md rounded-full border border-amber-500/50 text-[11px] sm:text-xs font-bold text-amber-300 font-display uppercase tracking-wider shadow-2xl flex items-center gap-2">
          <span>📱 Tilt Phone to Steer</span>
          <span className="text-slate-500">·</span>
          <span className="text-white">🔨 Tap to Smash</span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-300">⚡ SHIFT for Super Power-Up!</span>
        </div>
      </div>

      {/* --- REQUIREMENT 5: SMALL ITEM / ABILITY BAR ON THE SIDE --- */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-auto z-30"
      >
        {/* Ability 1: Super Sonic Shockwave (Shift command) */}
        <button
          onClick={onTriggerShockwave}
          disabled={!isShockwaveReady}
          className={`relative group w-12 h-14 sm:w-15 sm:h-17 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 shadow-xl ${
            isShockwaveReady
              ? 'bg-gradient-to-b from-sky-600 to-blue-700 border-sky-300 text-white shadow-sky-600/40 hover:brightness-110 animate-pulse'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-500 cursor-not-allowed'
          }`}
          title="Super Shockwave - Pulverizes hazards across the entire lane (Hotkey: SHIFT or 1)"
        >
          <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${isShockwaveReady ? 'text-amber-300 fill-amber-300' : 'text-slate-500'}`} />
          <span className="text-[9px] sm:text-[10px] font-black font-display uppercase mt-0.5 tracking-tight">
            {isShockwaveReady ? 'BURST' : `${Math.ceil(abilities.shockwaveCooldown)}s`}
          </span>
          <span className="absolute -top-1.5 -left-1.5 px-1 py-0.2 bg-amber-400 text-slate-950 rounded text-[8px] font-mono font-bold uppercase shadow-sm">
            SHIFT
          </span>
        </button>

        {/* Ability 2: Time Slow / Matrix Reflex */}
        <button
          onClick={onTriggerTimeSlow}
          disabled={!isTimeSlowReady && !isTimeSlowActive}
          className={`relative group w-12 h-14 sm:w-15 sm:h-17 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 shadow-xl ${
            isTimeSlowActive
              ? 'bg-gradient-to-b from-purple-600 to-indigo-800 border-purple-300 text-white shadow-purple-600/40 animate-pulse'
              : isTimeSlowReady
              ? 'bg-slate-900/90 hover:bg-slate-800 border-purple-500/70 text-purple-300 shadow-purple-900/20'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-500 cursor-not-allowed'
          }`}
          title="Bullet-Time Slow - Slows incoming hazards by 55% for 4.5 seconds (Hotkey: 2)"
        >
          <Hourglass className={`w-5 h-5 sm:w-6 sm:h-6 ${isTimeSlowActive ? 'animate-spin text-amber-300' : isTimeSlowReady ? 'text-purple-300' : 'text-slate-500'}`} />
          <span className="text-[9px] sm:text-[10px] font-black font-display uppercase mt-0.5 tracking-tight">
            {isTimeSlowActive
              ? `${Math.ceil(abilities.timeSlowRemaining)}s SLOW`
              : isTimeSlowReady
              ? 'SLOW'
              : `${Math.ceil(abilities.timeSlowCooldown)}s`}
          </span>
          <span className="absolute -top-1.5 -left-1.5 px-1 py-0.2 bg-purple-400 text-slate-950 rounded text-[8px] font-mono font-bold uppercase shadow-sm">
            2
          </span>
        </button>

        {/* Ability 3: Deflector Shield Item */}
        <button
          onClick={() => {
            if (stats.shields === 0) onOpenShop();
          }}
          className={`relative group w-12 h-14 sm:w-15 sm:h-17 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 shadow-xl ${
            stats.shields > 0
              ? 'bg-gradient-to-b from-cyan-950 to-slate-900 border-cyan-400 text-cyan-300 shadow-cyan-500/20'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-500 hover:border-slate-500'
          }`}
          title={stats.shields > 0 ? `${stats.shields} Shield(s) Armed` : 'No Shields - Open Shop to Buy'}
        >
          <Shield className={`w-5 h-5 sm:w-6 sm:h-6 ${stats.shields > 0 ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-500'}`} />
          <span className="text-[9px] sm:text-[10px] font-bold font-mono mt-0.5">
            {stats.shields > 0 ? `ARMED (${stats.shields})` : 'SHIELD'}
          </span>
        </button>

        {/* Ability 4: Emergency Glass Repair Kit */}
        <button
          onClick={onUseRepairKit}
          disabled={stats.repairKits <= 0 || glassHits === 0}
          className={`relative group w-12 h-14 sm:w-15 sm:h-17 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 shadow-xl ${
            stats.repairKits > 0 && glassHits > 0
              ? 'bg-gradient-to-b from-emerald-600 to-green-700 border-emerald-300 text-white shadow-emerald-600/40 animate-bounce'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-500 cursor-not-allowed'
          }`}
          title="Repair Kit - Instantly mends 1 crack on the window (Hotkey: 3)"
        >
          <Wrench className={`w-5 h-5 sm:w-6 sm:h-6 ${stats.repairKits > 0 && glassHits > 0 ? 'text-white' : 'text-slate-500'}`} />
          <span className="text-[9px] sm:text-[10px] font-black font-display uppercase mt-0.5 tracking-tight">
            {stats.repairKits > 0 ? `FIX (${stats.repairKits})` : 'REPAIR'}
          </span>
          <span className="absolute -top-1.5 -left-1.5 px-1 py-0.2 bg-emerald-400 text-slate-950 rounded text-[8px] font-mono font-bold uppercase shadow-sm">
            3
          </span>
        </button>
      </div>

      {/* --- BOTTOM CONTROLS DOCK --- */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg mx-auto flex flex-col items-center gap-2 pointer-events-auto pb-1 sm:pb-3"
      >
        {/* Tilt Steer Status & Calibrate Pill */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-full text-xs text-slate-300 shadow-lg">
          <Smartphone className={`w-3.5 h-3.5 ${tiltActive ? 'text-emerald-400' : 'text-slate-400'}`} />
          {tiltActive ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] sm:text-[11px] text-emerald-300 font-semibold">
                Tilt Active
              </span>
              <div className="w-12 sm:w-14 h-2.5 sm:h-3 bg-slate-800 rounded-full relative overflow-hidden border border-slate-700">
                <div
                  className="absolute top-0.5 bottom-0.5 w-2 bg-emerald-400 rounded-full transition-all duration-75 shadow-sm"
                  style={{
                    left: `calc(50% + ${bubbleOffset}px - 4px)`,
                  }}
                />
              </div>
              <button
                onClick={onCalibrateTilt}
                className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 hover:text-white uppercase font-mono bg-slate-800 px-1.5 py-0.5 rounded transition-colors"
                title="Re-zero center position"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Zero</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onRequestTiltPermission}
              className="text-[10px] sm:text-[11px] font-mono text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>Tap to Enable Phone Tilt</span>
            </button>
          )}

          <div className="hidden sm:inline-block h-3 w-px bg-slate-700" />
          <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400">
            Keys: <strong className="text-white">A/D</strong> · <strong className="text-white">SPACE</strong> · <strong className="text-amber-300">SHIFT (Power-Up)</strong>
          </span>
        </div>

        {/* GIANT TAP ANYWHERE TO SMASH ACTION BUTTON */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
          {/* Optional Left Touch Pad fallback */}
          <button
            onPointerDown={onMoveLeftStart}
            onPointerUp={onMoveLeftEnd}
            onPointerLeave={onMoveLeftEnd}
            className="w-13 h-16 sm:w-16 sm:h-20 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shadow-lg active:scale-90 transition-transform touch-none"
            aria-label="Steer Left"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* MAIN HERO SMASH BUTTON */}
          <button
            onClick={onSmash}
            className="flex-1 max-w-sm h-16 sm:h-20 rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black text-lg sm:text-2xl flex items-center justify-center gap-2.5 shadow-2xl shadow-red-600/50 border-2 border-red-300 active:border-amber-300 transition-all touch-none font-display uppercase tracking-wider"
            aria-label="Tap Anywhere to Smash"
          >
            <Zap className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-amber-200" />
            <div className="flex flex-col text-left leading-tight">
              <span>TAP TO SMASH!</span>
              <span className="text-[9px] sm:text-xs font-mono font-normal opacity-90 text-amber-100">
                (or tap anywhere on screen)
              </span>
            </div>
          </button>

          {/* Optional Right Touch Pad fallback */}
          <button
            onPointerDown={onMoveRightStart}
            onPointerUp={onMoveRightEnd}
            onPointerLeave={onMoveRightEnd}
            className="w-13 h-16 sm:w-16 sm:h-20 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shadow-lg active:scale-90 transition-transform touch-none"
            aria-label="Steer Right"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
