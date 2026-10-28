import React from 'react';
import { PlayerStats } from '../game/types';
import { Hammer, Zap, Wrench, Shield, X, Coins } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onBuyUpgrade: (type: 'hammer' | 'speed' | 'repair' | 'shield', cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  stats,
  onBuyUpgrade,
}) => {
  if (!isOpen) return null;

  const hammerCost = stats.hammerRadiusLevel * 15;
  const speedCost = stats.moveSpeedLevel * 12;
  const repairCost = 10;
  const shieldCost = 18;

  const handlePurchase = (type: 'hammer' | 'speed' | 'repair' | 'shield', cost: number) => {
    if (stats.coins >= cost) {
      soundEngine.playCoin();
      onBuyUpgrade(type, cost);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden text-slate-100 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display text-white uppercase">
              Suburban Hardware & Upgrades
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-body">
              Spend coins to enhance Mr. Rogers and defend your glass fixtures
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Coin Balance */}
        <div className="flex items-center justify-between my-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <span className="text-sm font-semibold text-amber-200">Current Balance:</span>
          <div className="flex items-center gap-1.5 text-lg font-bold text-amber-400 font-display">
            <Coins className="w-5 h-5" />
            <span>{stats.coins} COINS</span>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Upgrade 1: Hammer Smash Radius */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Hammer Smash Radius</span>
                  <span className="text-xs text-slate-400 font-mono">
                    Lv {stats.hammerRadiusLevel}/5
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Expands sledgehammer shockwave reach to smash multiple incoming projectiles.
                </p>
              </div>
            </div>
            <button
              disabled={stats.coins < hammerCost || stats.hammerRadiusLevel >= 5}
              onClick={() => handlePurchase('hammer', hammerCost)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 uppercase tracking-wide bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {stats.hammerRadiusLevel >= 5 ? 'MAX' : `${hammerCost} Coins`}
            </button>
          </div>

          {/* Upgrade 2: Sprint Speed */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Sprint Speed</span>
                  <span className="text-xs text-slate-400 font-mono">
                    Lv {stats.moveSpeedLevel}/5
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Sprint across wide patio doors and picture windows faster.
                </p>
              </div>
            </div>
            <button
              disabled={stats.coins < speedCost || stats.moveSpeedLevel >= 5}
              onClick={() => handlePurchase('speed', speedCost)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 uppercase tracking-wide bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {stats.moveSpeedLevel >= 5 ? 'MAX' : `${speedCost} Coins`}
            </button>
          </div>

          {/* Upgrade 3: Emergency Glass Repair Kit */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Glass Repair Kit</span>
                  <span className="text-xs text-emerald-400 font-mono">
                    Owned: {stats.repairKits}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Consumable tool: Restores 1 glass crack mid-wave so your window doesn't break!
                </p>
              </div>
            </div>
            <button
              disabled={stats.coins < repairCost}
              onClick={() => handlePurchase('repair', repairCost)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 uppercase tracking-wide bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {repairCost} Coins
            </button>
          </div>

          {/* Upgrade 4: Impact Deflector Shield */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Impact Deflector</span>
                  <span className="text-xs text-cyan-400 font-mono">
                    Active: {stats.shields}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Automatically absorbs and pulverizes 1 stray hazard before it hits the glass.
                </p>
              </div>
            </div>
            <button
              disabled={stats.coins < shieldCost}
              onClick={() => handlePurchase('shield', shieldCost)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 uppercase tracking-wide bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {shieldCost} Coins
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm tracking-wide transition-colors uppercase font-display"
          >
            Resume Play
          </button>
        </div>
      </div>
    </div>
  );
};
