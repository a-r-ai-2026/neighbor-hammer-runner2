import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { PlayerStats, FixtureSpec, GameStatus, AbilitiesState } from './game/types';
import { getLevelConfig } from './game/fixtureData';
import { soundEngine } from './game/audio';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { ShopModal } from './components/ShopModal';
import { LevelClearedModal } from './components/LevelClearedModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React State for HUD & UI
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [glassHits, setGlassHits] = useState<number>(0);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<'none' | 'mild' | 'severe'>('none');
  const [clearedReward, setClearedReward] = useState<number>(15);
  const [isZoomedOut, setIsZoomedOut] = useState<boolean>(true);

  // Mobile Device Tilt states
  const [tiltActive, setTiltActive] = useState<boolean>(false);
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const tiltZeroOffsetRef = useRef<number>(0);
  const rawGammaRef = useRef<number>(0);

  const [stats, setStats] = useState<PlayerStats>({
    hammerRadiusLevel: 1,
    moveSpeedLevel: 1,
    repairKits: 0,
    shields: 0,
    coins: 0,
    score: 0,
    highScore: 0,
  });

  const [abilities, setAbilities] = useState<AbilitiesState>({
    shockwaveCooldown: 0,
    shockwaveMaxCooldown: 10,
    timeSlowRemaining: 0,
    timeSlowCooldown: 0,
    timeSlowMaxCooldown: 14,
  });

  const levelConfig = getLevelConfig(level);
  const currentFixture: FixtureSpec = levelConfig.fixture;
  const nextFixture: FixtureSpec = getLevelConfig(level + 1).fixture;

  // Initialize GameEngine once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, {
      onScoreUpdate: (newScore, newCombo) => {
        setScore(newScore);
        setCombo(newCombo);
      },
      onCoinsUpdate: (newCoins) => {
        setStats((prev) => ({ ...prev, coins: newCoins }));
      },
      onGlassDamage: (hits) => {
        setGlassHits(hits);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator && hits > 0) {
          navigator.vibrate(hits >= 3 ? [80, 50, 140] : [45, 35, 60]);
        }
      },
      onLevelComplete: (clearedLevel, reward) => {
        setClearedReward(reward);
        setGameStatus('level_cleared');
      },
      onGameOver: (finalScore, endLevel) => {
        setScore(finalScore);
        setLevel(endLevel);
        setGameStatus('game_over');
      },
      onShieldChange: (shieldCount) => {
        setStats((prev) => ({ ...prev, shields: shieldCount }));
      },
      onScreenShake: (intensity) => {
        setScreenShake(intensity);
        setTimeout(() => setScreenShake('none'), intensity === 'mild' ? 250 : 450);
      },
      onAbilitiesUpdate: (ab) => {
        setAbilities({ ...ab });
      },
    });

    engineRef.current = engine;
    setStats({ ...engine.playerStats });

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Keyboard controls listener (Desktop support with Shift and Ability Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engineRef.current.setMoveDirection(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engineRef.current.setMoveDirection(1);
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleSmash();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
        e.preventDefault();
        const didTrigger = engineRef.current.useShiftCommand();
        if (didTrigger && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([40, 30, 80]);
        }
      } else if (e.code === 'Digit1') {
        engineRef.current.triggerSuperShockwave();
      } else if (e.code === 'Digit2') {
        engineRef.current.triggerTimeSlow();
      } else if (e.code === 'Digit3') {
        handleUseRepairKit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (
        e.code === 'ArrowLeft' ||
        e.code === 'KeyA' ||
        e.code === 'ArrowRight' ||
        e.code === 'KeyD'
      ) {
        engineRef.current.setMoveDirection(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mobile Device Tilt / Orientation listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!engineRef.current || !engineRef.current.isRunning) return;
      if (e.gamma !== null && e.gamma !== undefined) {
        rawGammaRef.current = e.gamma;
        const calibratedGamma = e.gamma - tiltZeroOffsetRef.current;
        setTiltAngle(calibratedGamma);
        setTiltActive(true);

        // Direct target mapping: tilting 16 degrees reaches full edge of the window
        const normX = Math.max(-1, Math.min(1, calibratedGamma / 16));
        engineRef.current.setDirectTargetX(normX);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const handleRequestTiltPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const perm = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (perm === 'granted') {
          setTiltActive(true);
        }
      } catch (err) {
        console.warn('Orientation permission error:', err);
      }
    } else {
      setTiltActive(true);
    }
  }, []);

  const handleCalibrateTilt = useCallback(() => {
    tiltZeroOffsetRef.current = rawGammaRef.current;
    setTiltAngle(0);
    if (engineRef.current) {
      engineRef.current.setDirectTargetX(0);
    }
  }, []);

  // Control handlers
  const handleStartGame = () => {
    handleRequestTiltPermission();
    if (!engineRef.current) return;
    engineRef.current.startGame();
    setLevel(1);
    setScore(0);
    setCombo(0);
    setGlassHits(0);
    setGameStatus('playing');
  };

  const handleNextLevel = () => {
    if (!engineRef.current) return;
    engineRef.current.nextLevel();
    setLevel(engineRef.current.currentLevel);
    setGlassHits(0);
    setGameStatus('playing');
  };

  const handleRetry = () => {
    handleStartGame();
  };

  const handleSmash = () => {
    if (engineRef.current) {
      const didSwing = engineRef.current.smash();
      if (didSwing && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    }
  };

  const handleUseRepairKit = () => {
    if (engineRef.current) {
      const didRepair = engineRef.current.useRepairKit();
      if (didRepair) {
        setStats({ ...engineRef.current.playerStats });
      }
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const handleToggleZoom = () => {
    if (engineRef.current) {
      const isWide = engineRef.current.toggleZoom();
      setIsZoomedOut(isWide);
    }
  };

  const handleBuyUpgrade = (type: 'hammer' | 'speed' | 'repair' | 'shield', cost: number) => {
    if (!engineRef.current) return;
    const currentStats = engineRef.current.playerStats;
    if (currentStats.coins < cost) return;

    currentStats.coins -= cost;

    if (type === 'hammer') {
      currentStats.hammerRadiusLevel = Math.min(5, currentStats.hammerRadiusLevel + 1);
    } else if (type === 'speed') {
      currentStats.moveSpeedLevel = Math.min(5, currentStats.moveSpeedLevel + 1);
    } else if (type === 'repair') {
      currentStats.repairKits += 1;
    } else if (type === 'shield') {
      currentStats.shields += 1;
    }

    try {
      localStorage.setItem('mr_rogers_coins', currentStats.coins.toString());
    } catch {
      // Ignore
    }

    setStats({ ...currentStats });
  };

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden bg-slate-950 font-body select-none ${
        screenShake === 'mild'
          ? 'animate-shake-mild'
          : screenShake === 'severe'
          ? 'animate-shake-severe'
          : ''
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Arcade HUD Overlay during gameplay */}
      {gameStatus === 'playing' && (
        <HUD
          level={level}
          fixture={currentFixture}
          score={score}
          combo={combo}
          glassHits={glassHits}
          stats={stats}
          abilities={abilities}
          isMuted={isMuted}
          isZoomedOut={isZoomedOut}
          onToggleZoom={handleToggleZoom}
          tiltActive={tiltActive}
          tiltAngle={tiltAngle}
          onCalibrateTilt={handleCalibrateTilt}
          onRequestTiltPermission={handleRequestTiltPermission}
          onToggleMute={handleToggleMute}
          onOpenShop={() => setIsShopOpen(true)}
          onUseRepairKit={handleUseRepairKit}
          onTriggerShockwave={() => engineRef.current?.triggerSuperShockwave()}
          onTriggerTimeSlow={() => engineRef.current?.triggerTimeSlow()}
          onSmash={handleSmash}
          onMoveLeftStart={() => engineRef.current?.setMoveDirection(-1)}
          onMoveLeftEnd={() => engineRef.current?.setMoveDirection(0)}
          onMoveRightStart={() => engineRef.current?.setMoveDirection(1)}
          onMoveRightEnd={() => engineRef.current?.setMoveDirection(0)}
          onPointerSteer={(normX) => engineRef.current?.setDirectTargetX(normX)}
        />
      )}

      {/* Start Game Screen */}
      {gameStatus === 'idle' && (
        <StartScreen
          onStart={handleStartGame}
          onOpenShop={() => setIsShopOpen(true)}
          coins={stats.coins}
          highScore={stats.highScore}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Level Victory Modal */}
      {gameStatus === 'level_cleared' && (
        <LevelClearedModal
          level={level}
          reward={clearedReward}
          nextFixture={nextFixture}
          score={score}
          onContinue={handleNextLevel}
          onOpenShop={() => setIsShopOpen(true)}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'game_over' && (
        <GameOverModal
          score={score}
          level={level}
          highScore={stats.highScore}
          fixtureName={currentFixture.name}
          onRetry={handleRetry}
          onOpenShop={() => setIsShopOpen(true)}
        />
      )}

      {/* Upgrades & Hardware Store Modal */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        stats={stats}
        onBuyUpgrade={handleBuyUpgrade}
      />
    </main>
  );
}
