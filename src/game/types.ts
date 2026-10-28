/**
 * Game Types and Specifications for Mr. Rogers: Window Smash Defender
 */

export type ProjectileType = 'rock' | 'golf_ball' | 'baseball' | 'bowling_ball' | 'coin';

export interface Projectile {
  id: string;
  type: ProjectileType;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  radius: number;
  active: boolean;
  value: number; // score or coins
}

export type FixtureCategory = 'window' | 'door';

export interface FixtureSpec {
  id: string;
  name: string;
  category: FixtureCategory;
  width: number; // in world units (affects lane width and Mr Rogers patrol limit)
  height: number;
  depth: number;
  frameColor: string;
  frameMaterial: 'pvc_white' | 'bronze' | 'natural_wood' | 'dark_slate';
  description: string;
  facts: string[]; // Rolling architectural & engineering trivia
  panelsCount: number;
  isPatioDoor: boolean;
  glassStyle: 'clear' | 'double_pane' | 'divided_lites' | 'curved' | 'impact_rated' | 'arched';
}

export interface PlayerStats {
  hammerRadiusLevel: number; // 1 to 5 (radius 2.0 -> 3.6)
  moveSpeedLevel: number;    // 1 to 5 (speed 12 -> 24)
  repairKits: number;        // count of stored glass repair kits
  shields: number;           // count of active deflector shields
  coins: number;
  score: number;
  highScore: number;
}

export interface AbilitiesState {
  shockwaveCooldown: number; // in seconds (0 = ready to trigger)
  shockwaveMaxCooldown: number; // e.g. 10s
  timeSlowRemaining: number; // in seconds active
  timeSlowCooldown: number;  // in seconds (0 = ready)
  timeSlowMaxCooldown: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'level_cleared' | 'game_over';

export interface LevelConfig {
  levelNumber: number;
  fixture: FixtureSpec;
  projectileCount: number;
  spawnInterval: number; // in seconds
  baseSpeed: number;
  coinReward: number; // 5, 10, 15, 20...
}
