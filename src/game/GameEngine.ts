import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { MrRogersCharacter } from './character';
import { ArchitecturalFixture } from './windows';
import { HazardManager } from './hazards';
import { ParticleSystem } from './particles';
import { SuburbanEnvironment } from './environment';
import { HouseFacade } from './houseFacade';
import { getLevelConfig } from './fixtureData';
import { soundEngine } from './audio';
import { PlayerStats, LevelConfig, AbilitiesState } from './types';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, combo: number) => void;
  onCoinsUpdate: (coins: number) => void;
  onGlassDamage: (hits: number, stageName: string) => void;
  onLevelComplete: (level: number, reward: number) => void;
  onGameOver: (finalScore: number, level: number) => void;
  onShieldChange: (shieldCount: number) => void;
  onScreenShake: (intensity: 'mild' | 'severe') => void;
  onAbilitiesUpdate?: (abilities: AbilitiesState) => void;
}

export class GameEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Post-processing & Cinematic Visuals
  public composer: EffectComposer;
  public bloomPass: UnrealBloomPass;
  private baseFov: number = 58;
  private fovImpulse: number = 0;

  // Game actors & systems
  private character: MrRogersCharacter;
  private currentFixture: ArchitecturalFixture | null = null;
  private houseFacade: HouseFacade;
  private hazardManager: HazardManager;
  private particleSystem: ParticleSystem;
  private environment: SuburbanEnvironment;

  // Level & Progression state
  public currentLevel: number = 1;
  public levelConfig: LevelConfig;
  public playerStats: PlayerStats;
  public glassHits: number = 0; // 0, 1, 2, 3 (loss at 3)
  public score: number = 0;
  public combo: number = 0;
  public projectilesRemainingToSpawn: number = 0;
  public isRunning: boolean = false;
  public isPaused: boolean = false;

  // Abilities State
  public abilities: AbilitiesState = {
    shockwaveCooldown: 0,
    shockwaveMaxCooldown: 10,
    timeSlowRemaining: 0,
    timeSlowCooldown: 0,
    timeSlowMaxCooldown: 14,
  };

  // Movement & Input state
  public targetPlayerX: number = 0;
  public playerX: number = 0;
  public playerVx: number = 0;
  private inputMoveDir: number = 0; // -1, 0, 1

  // Spawn timing
  private spawnTimer: number = 0;
  private clock: THREE.Clock;
  private animationFrameId: number | null = null;

  // Camera Shake Trauma & Elevated Bird's Eye Perspective
  private trauma: number = 0;
  public isZoomedOut: boolean = true; // Default wide view so full house & window fit
  public targetCameraPos = new THREE.Vector3(0, 10.5, 12.0);
  public targetLookAt = new THREE.Vector3(0, 1.2, -10.5);

  private callbacks: GameEngineCallbacks;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Default Stats
    this.playerStats = {
      hammerRadiusLevel: 1, // Range: 2.2 -> 3.8
      moveSpeedLevel: 1,    // Velocity: 14 -> 24
      repairKits: 0,
      shields: 0,
      coins: 0,
      score: 0,
      highScore: 0,
    };

    // Load saved high score & coins from localStorage if available
    try {
      const savedScore = localStorage.getItem('mr_rogers_highscore');
      if (savedScore) this.playerStats.highScore = parseInt(savedScore, 10) || 0;
      const savedCoins = localStorage.getItem('mr_rogers_coins');
      if (savedCoins) this.playerStats.coins = parseInt(savedCoins, 10) || 0;
    } catch {
      // Ignore storage errors in sandboxed iframes
    }

    // 1. Scene & Atmosphere (Cinematic Blue Sky & Fog Depth)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8);
    this.scene.fog = new THREE.Fog(0x38bdf8, 30, 85);

    // 2. Camera Setup (Dynamic responsive lane perspective)
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(56, aspect, 0.1, 140);
    this.camera.position.set(0, 6.8, 8.5);
    this.camera.lookAt(this.targetLookAt);

    // 3. WebGL Renderer with High-Fidelity ACESFilmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Procedural Studio Environment for realistic glass & metal reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Cinematic 3-Point Hollywood Lighting Setup
    // A. Ambient & Sky Hemisphere Bounce (Warm grass ground bounce + sky blue top)
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 0.7);
    this.scene.add(hemiLight);

    // B. Golden Key Sunlight (Crisp directional sunlight with soft PCF shadow edges)
    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.45);
    dirLight.position.set(14, 24, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.radius = 2.4;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 70;
    const d = 18;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    this.scene.add(dirLight);

    // C. Soft Rim Backlight (Accentuates silhouette from the side/back without blinding the camera)
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    rimLight.position.set(-15, 18, -25);
    rimLight.target.position.set(0, 1.5, 0);
    this.scene.add(rimLight);
    this.scene.add(rimLight.target);

    // D. Soft Interior Room Light spill through the window glass
    const interiorPoint = new THREE.PointLight(0xfef08a, 0.35, 8);
    interiorPoint.position.set(0, 2.0, 1.2);
    this.scene.add(interiorPoint);

    // 6. Post-Processing Pipeline (EffectComposer + Bloom + ACES Color Tone Mapping)
    const renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.22, // Bloom strength (clean movie glow on sparks, lights, coins without blinding washout)
      0.35, // Bloom radius
      0.88  // Bloom threshold (prevents white haze on walls and driveway)
    );
    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(outputPass);

    // 6. Subsystems
    this.environment = new SuburbanEnvironment();
    this.scene.add(this.environment.group);

    // Realistic Suburban House Wall Facade framing the window/patio door
    this.houseFacade = new HouseFacade();
    this.scene.add(this.houseFacade.group);

    this.particleSystem = new ParticleSystem(this.scene);
    this.hazardManager = new HazardManager(this.scene);

    // 7. Character Rig
    this.character = new MrRogersCharacter();
    this.character.group.position.set(0, 0, -2.5); // Guarding right in front of window
    this.scene.add(this.character.group);

    // 8. Level Config & Fixture Initialization
    this.levelConfig = getLevelConfig(this.currentLevel);
    this.loadLevelFixture(this.levelConfig);
    this.recalculateCameraFraming();

    // 9. Resize Listener
    window.addEventListener('resize', this.onWindowResize);

    // Start render loop
    this.startLoop();
  }

  public recalculateCameraFraming = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const aspect = w / h;
    const fixtureWidth = this.levelConfig?.fixture?.width || 8.0;

    // Portrait mobile vs landscape
    const isPortrait = aspect < 1.0;

    if (isPortrait) {
      // For mobile portrait, dynamically pull camera higher up and back so lane, hazards, and house wall fit
      const fov = this.isZoomedOut ? Math.min(74, 60 + (1 - aspect) * 18) : 56;
      this.baseFov = fov;
      this.camera.fov = fov;

      const halfW = (fixtureWidth / 2) * 1.35;
      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(fov / 2));
      const neededDist = halfW / (tanHalfFov * Math.max(0.42, aspect));
      const targetZ = this.isZoomedOut ? Math.max(12.5, neededDist) : Math.max(9.0, neededDist * 0.75);
      const targetY = 7.2 + (targetZ - 0.2) * 0.40; // Higher POV elevation

      this.targetCameraPos.set(0, targetY, targetZ);
      this.targetLookAt.set(0, 1.25, -9.5);
    } else {
      // Landscape or Desktop: elevated arcade view
      const fov = this.isZoomedOut ? 56 : 48;
      this.baseFov = fov;
      this.camera.fov = fov;

      const halfW = (fixtureWidth / 2) * 1.3;
      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(fov / 2));
      const neededDist = halfW / (tanHalfFov * aspect);
      const targetZ = this.isZoomedOut ? Math.max(8.5, neededDist) : Math.max(6.8, neededDist * 0.8);
      const targetY = 6.4 + (targetZ - 0.2) * 0.32; // Higher POV elevation

      this.targetCameraPos.set(0, targetY, targetZ);
      this.targetLookAt.set(0, 1.35, -12.0);
    }

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  };

  public toggleZoom = (): boolean => {
    this.isZoomedOut = !this.isZoomedOut;
    this.recalculateCameraFraming();
    return this.isZoomedOut;
  };

  public onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    if (this.composer) {
      this.composer.setSize(w, h);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(w, h);
    }
    this.recalculateCameraFraming();
  };

  /**
   * Load architectural window/door for the level and frame it with the house wall
   */
  public loadLevelFixture(config: LevelConfig) {
    if (this.currentFixture) {
      this.scene.remove(this.currentFixture.group);
    }
    this.levelConfig = config;
    this.currentFixture = new ArchitecturalFixture(config.fixture);
    this.currentFixture.group.position.set(0, 0, 0.2); // Positioned directly on baseline
    this.scene.add(this.currentFixture.group);

    // Update realistic house wall facade to fit new window/door dimensions
    this.houseFacade.updateFixture(config.fixture);

    // Re-frame camera to match new window width
    this.recalculateCameraFraming();

    // Reset glass damage
    this.glassHits = 0;
    this.currentFixture.setDamageStage(0);
    this.callbacks.onGlassDamage(0, 'Pristine');
  }

  /**
   * Start a new game or run
   */
  public startGame() {
    this.currentLevel = 1;
    this.score = 0;
    this.combo = 0;
    this.glassHits = 0;
    this.targetPlayerX = 0;
    this.playerX = 0;
    this.hazardManager.clearAll();
    this.particleSystem.clearAll();

    // Reset abilities
    this.abilities.shockwaveCooldown = 0;
    this.abilities.timeSlowRemaining = 0;
    this.abilities.timeSlowCooldown = 0;

    this.levelConfig = getLevelConfig(this.currentLevel);
    this.loadLevelFixture(this.levelConfig);
    this.projectilesRemainingToSpawn = this.levelConfig.projectileCount;
    this.spawnTimer = 0.5;

    this.isRunning = true;
    this.isPaused = false;
    soundEngine.startBgm();
    this.callbacks.onScoreUpdate(this.score, this.combo);
    this.callbacks.onCoinsUpdate(this.playerStats.coins);
    this.callbacks.onAbilitiesUpdate?.({ ...this.abilities });
  }

  /**
   * Proceed to next level
   */
  public nextLevel() {
    this.currentLevel++;
    this.glassHits = 0;
    this.hazardManager.clearAll();
    this.particleSystem.clearAll();

    this.levelConfig = getLevelConfig(this.currentLevel);
    this.loadLevelFixture(this.levelConfig);
    this.projectilesRemainingToSpawn = this.levelConfig.projectileCount;
    this.spawnTimer = 0.6;

    this.isRunning = true;
    this.isPaused = false;
    soundEngine.startBgm();
    this.callbacks.onAbilitiesUpdate?.({ ...this.abilities });
  }

  /**
   * Trigger the SMASH hammer strike!
   */
  public smash(): boolean {
    if (!this.isRunning || this.isPaused) return false;
    const didSwing = this.character.triggerSmash();
    if (didSwing) {
      soundEngine.playHammerSwing();

      // Check immediate smash hit in active radius
      const hammerPos = this.character.getHammerWorldPosition();
      // Radius scale based on upgrades: Lv1: 2.2, Lv2: 2.6, Lv3: 3.0, Lv4: 3.4, Lv5: 3.8
      const smashRadius = 1.8 + this.playerStats.hammerRadiusLevel * 0.4;
      
      // Delay hit detection slightly to match downward slam visual arc
      setTimeout(() => {
        if (!this.isRunning) return;
        const currentHammerPos = this.character.getHammerWorldPosition();
        const hits = this.hazardManager.checkHammerHits(currentHammerPos, smashRadius);

        if (hits.length > 0) {
          soundEngine.playHammerSmash();
          this.addTrauma(0.25);
          this.callbacks.onScreenShake('mild');

          hits.forEach((p) => {
            // Pulverize particle burst
            this.particleSystem.emitSmashExplosion(new THREE.Vector3(p.x, p.y, p.z));
            
            // Score and Combo increments
            this.combo++;
            const points = p.value * Math.min(5, this.combo);
            this.score += points;

            // Bonus coins on every hazard smashed plus combo bonuses
            const bonusCoins = 1 + (this.combo % 2 === 0 ? 2 : 0);
            this.playerStats.coins += bonusCoins;
            this.callbacks.onCoinsUpdate(this.playerStats.coins);
            soundEngine.playCoin();
          });

          this.callbacks.onScoreUpdate(this.score, this.combo);
          this.checkLevelCompletion();
        }
      }, 90);
    }
    return didSwing;
  }

  /**
   * Super Shockwave / Sonic Slam - smashes all hazards in front of Mr. Rogers
   */
  public triggerSuperShockwave(): boolean {
    if (!this.isRunning || this.isPaused || this.abilities.shockwaveCooldown > 0) return false;

    this.abilities.shockwaveCooldown = this.abilities.shockwaveMaxCooldown;
    soundEngine.playShockwave();
    this.addTrauma(0.65);
    this.addFovPunch(2.4);
    this.callbacks.onScreenShake('severe');

    const origin = new THREE.Vector3(this.playerX, 1.0, -2.5);
    this.particleSystem.emitShockwave(origin);

    const pulverized = this.hazardManager.clearHazardsInRadius(origin, 15.0);
    if (pulverized.length > 0) {
      pulverized.forEach((p) => {
        this.particleSystem.emitSmashExplosion(new THREE.Vector3(p.x, p.y, p.z), 18);
        this.combo++;
        this.score += p.value * Math.min(6, this.combo + 1);
        this.playerStats.coins += 2;
      });
      this.callbacks.onCoinsUpdate(this.playerStats.coins);
      this.callbacks.onScoreUpdate(this.score, this.combo);
      this.checkLevelCompletion();
    }

    this.callbacks.onAbilitiesUpdate?.({ ...this.abilities });
    return true;
  }

  /**
   * Time Slow / Bullet Time - slows down projectiles by 55% for 4.5 seconds
   */
  public triggerTimeSlow(): boolean {
    if (!this.isRunning || this.isPaused || this.abilities.timeSlowCooldown > 0) return false;

    this.abilities.timeSlowRemaining = 4.5;
    this.abilities.timeSlowCooldown = this.abilities.timeSlowMaxCooldown;
    soundEngine.playTimeSlow();
    this.callbacks.onAbilitiesUpdate?.({ ...this.abilities });
    return true;
  }

  /**
   * Shift Key Quick Command: activates the primary ready ability / power-up
   */
  public useShiftCommand(): boolean {
    if (!this.isRunning || this.isPaused) return false;

    if (this.abilities.shockwaveCooldown <= 0) {
      return this.triggerSuperShockwave();
    }
    if (this.abilities.timeSlowCooldown <= 0) {
      return this.triggerTimeSlow();
    }
    if (this.playerStats.repairKits > 0 && this.glassHits > 0) {
      return this.useRepairKit();
    }
    return false;
  }

  /**
   * Input steering: keyboard or continuous touch
   */
  public setMoveDirection(dir: number) {
    this.inputMoveDir = dir;
  }

  public setDirectTargetX(normX: number) {
    // normX between -1 and 1
    const halfW = (this.levelConfig.fixture.width * 0.85) / 2;
    this.targetPlayerX = normX * halfW;
  }

  /**
   * Use an emergency Glass Repair Kit
   */
  public useRepairKit(): boolean {
    if (this.playerStats.repairKits <= 0 || this.glassHits <= 0) return false;

    this.playerStats.repairKits--;
    this.glassHits = Math.max(0, this.glassHits - 1);
    if (this.currentFixture) {
      this.currentFixture.setDamageStage(this.glassHits);
    }
    soundEngine.playRepair();
    const stageNames = ['Pristine', 'Hairline Fracture', 'Severe Spiderweb', 'Shattered'];
    this.callbacks.onGlassDamage(this.glassHits, stageNames[this.glassHits]);
    return true;
  }

  /**
   * Add camera trauma for dynamic screen shake
   */
  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  /**
   * Action-movie impact zoom / FOV pulse
   */
  public addFovPunch(amount: number) {
    this.fovImpulse = Math.min(3.5, this.fovImpulse + amount);
  }

  /**
   * Main game physics and animation tick
   */
  private update = () => {
    const rawDelta = Math.min(this.clock.getDelta(), 0.1);
    const delta = rawDelta;

    if (this.isRunning && !this.isPaused) {
      // Cooldown timer ticks
      if (this.abilities.shockwaveCooldown > 0) {
        this.abilities.shockwaveCooldown = Math.max(0, this.abilities.shockwaveCooldown - delta);
      }
      if (this.abilities.timeSlowRemaining > 0) {
        this.abilities.timeSlowRemaining = Math.max(0, this.abilities.timeSlowRemaining - delta);
      }
      if (this.abilities.timeSlowCooldown > 0) {
        this.abilities.timeSlowCooldown = Math.max(0, this.abilities.timeSlowCooldown - delta);
      }
      this.callbacks.onAbilitiesUpdate?.({ ...this.abilities });

      // 1. Player lateral movement
      const moveSpeed = 13 + this.playerStats.moveSpeedLevel * 2.2;
      const halfLimit = (this.levelConfig.fixture.width * 0.85) / 2;

      if (this.inputMoveDir !== 0) {
        this.targetPlayerX += this.inputMoveDir * moveSpeed * delta;
      }
      this.targetPlayerX = THREE.MathUtils.clamp(this.targetPlayerX, -halfLimit, halfLimit);

      // Smooth damped sprint toward target
      const prevX = this.playerX;
      this.playerX = THREE.MathUtils.damp(this.playerX, this.targetPlayerX, 16, delta);
      this.playerVx = (this.playerX - prevX) / (delta || 0.016);
      this.character.group.position.x = this.playerX;

      // 2. Character animation tick
      this.character.update(delta, this.playerVx);

      // 3. Continuous strike check while hammer is in impact phase
      if (this.character.isInImpactPhase()) {
        const hammerPos = this.character.getHammerWorldPosition();
        const smashRadius = 1.8 + this.playerStats.hammerRadiusLevel * 0.4;
        const hits = this.hazardManager.checkHammerHits(hammerPos, smashRadius);
        if (hits.length > 0) {
          soundEngine.playHammerSmash();
          this.addTrauma(0.2);
          this.addFovPunch(1.3);
          hits.forEach((p) => {
            this.particleSystem.emitSmashExplosion(new THREE.Vector3(p.x, p.y, p.z));
            this.combo++;
            this.score += p.value * Math.min(5, this.combo);
          });
          this.callbacks.onScoreUpdate(this.score, this.combo);
          this.checkLevelCompletion();
        }
      }

      // 4. Coin pickups
      const playerWorldPos = new THREE.Vector3(this.playerX, 1.0, -2.5);
      const pickedCoins = this.hazardManager.checkCoinPickups(playerWorldPos, 1.6);
      if (pickedCoins.length > 0) {
        pickedCoins.forEach((c) => {
          soundEngine.playCoin();
          this.particleSystem.emitCoinSparkles(new THREE.Vector3(c.x, c.y, c.z));
          this.playerStats.coins += c.value;
          this.score += 50;
        });
        this.callbacks.onCoinsUpdate(this.playerStats.coins);
        this.callbacks.onScoreUpdate(this.score, this.combo);
      }

      // 5. Spawning Hazards & Coins
      const hazardTimeFactor = this.abilities.timeSlowRemaining > 0 ? 0.45 : 1.0;
      if (this.projectilesRemainingToSpawn > 0) {
        this.spawnTimer -= delta * hazardTimeFactor;
        if (this.spawnTimer <= 0) {
          this.hazardManager.spawnHazard(
            this.levelConfig.fixture.width,
            this.levelConfig.baseSpeed,
            this.currentLevel
          );
          this.projectilesRemainingToSpawn--;
          this.spawnTimer = this.levelConfig.spawnInterval * (0.8 + Math.random() * 0.4);
        }
      }

      // 6. Flying Projectiles update (respects time slow) & Glass Hits
      const { glassHitProjectiles } = this.hazardManager.update(delta * hazardTimeFactor);
      if (glassHitProjectiles.length > 0) {
        glassHitProjectiles.forEach((p) => {
          this.handleGlassImpact(p);
        });
      }

      // Check level completion if all spawned and all resolved
      this.checkLevelCompletion();
    }

    // 7. Environment & Particle system update
    this.environment.update(delta);
    this.particleSystem.update(delta);

    // 8. Dynamic Camera Tracking & Screen Shake
    this.updateCamera(delta);

    // 9. Post-Processed Cinematic Render Pass
    this.composer.render();

    this.animationFrameId = requestAnimationFrame(this.update);
  };

  /**
   * Handle an incoming projectile hitting the window
   */
  private handleGlassImpact(projectile: { x: number; y: number }) {
    // If deflector shield is active, block the impact!
    if (this.playerStats.shields > 0) {
      this.playerStats.shields--;
      this.callbacks.onShieldChange(this.playerStats.shields);
      soundEngine.playShieldBlock();
      this.particleSystem.emitSmashExplosion(new THREE.Vector3(projectile.x, 1.5, 0), 12);
      this.addTrauma(0.3);
      this.addFovPunch(1.5);
      this.callbacks.onScreenShake('mild');
      return;
    }

    // Reset combo
    this.combo = 0;
    this.callbacks.onScoreUpdate(this.score, this.combo);

    // Increment glass hit damage (Hit 1, Hit 2, Hit 3)
    this.glassHits++;
    this.currentFixture?.setDamageStage(this.glassHits);

    if (this.glassHits === 1) {
      soundEngine.playGlassHit(1);
      this.addTrauma(0.5);
      this.addFovPunch(1.8);
      this.callbacks.onScreenShake('mild');
      this.callbacks.onGlassDamage(1, 'Hairline Fracture');
    } else if (this.glassHits === 2) {
      soundEngine.playGlassHit(2);
      this.addTrauma(0.8);
      this.addFovPunch(2.4);
      this.callbacks.onScreenShake('severe');
      this.callbacks.onGlassDamage(2, 'Severe Spiderweb');
    } else if (this.glassHits >= 3) {
      // Shattered completely! Game Over
      soundEngine.playGlassShatter();
      soundEngine.stopBgm();
      this.addTrauma(1.0);
      this.addFovPunch(3.2);
      this.callbacks.onScreenShake('severe');
      this.callbacks.onGlassDamage(3, 'Shattered Glass');
      this.particleSystem.emitGlassShatter(0, this.levelConfig.fixture.height, this.levelConfig.fixture.width);

      this.isRunning = false;

      // Update High Score
      if (this.score > this.playerStats.highScore) {
        this.playerStats.highScore = this.score;
        try {
          localStorage.setItem('mr_rogers_highscore', this.score.toString());
        } catch {
          // Ignore
        }
      }

      // Save Coins
      try {
        localStorage.setItem('mr_rogers_coins', this.playerStats.coins.toString());
      } catch {
        // Ignore
      }

      setTimeout(() => {
        this.callbacks.onGameOver(this.score, this.currentLevel);
      }, 700);
    }
  }

  /**
   * Check if current level is cleared
   */
  private checkLevelCompletion() {
    if (
      this.isRunning &&
      this.projectilesRemainingToSpawn === 0 &&
      this.hazardManager.projectiles.length === 0 &&
      this.glassHits < 3
    ) {
      this.isRunning = false;
      soundEngine.playLevelUp();

      // Coin reward: starts at 5, increases by 5 each level: 5, 10, 15, 20...
      const reward = this.levelConfig.coinReward;
      this.playerStats.coins += reward;
      this.score += 500 * this.currentLevel;

      try {
        localStorage.setItem('mr_rogers_coins', this.playerStats.coins.toString());
      } catch {
        // Ignore
      }

      this.callbacks.onCoinsUpdate(this.playerStats.coins);
      this.callbacks.onScoreUpdate(this.score, this.combo);
      this.callbacks.onLevelComplete(this.currentLevel, reward);
    }
  }

  /**
   * Camera following, cinematic breathing sway, dynamic FOV pulse, and smooth trauma shake
   */
  private updateCamera(delta: number) {
    // Subtle lateral camera follow behind Mr Rogers
    const camTargetX = this.playerX * 0.35;
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, camTargetX, 8, delta);

    // Dynamic FOV impulse response (impact zooms)
    if (this.fovImpulse > 0.01) {
      this.fovImpulse = THREE.MathUtils.damp(this.fovImpulse, 0, 7, delta);
      this.camera.fov = this.baseFov - this.fovImpulse;
      this.camera.updateProjectionMatrix();
    } else if (Math.abs(this.camera.fov - this.baseFov) > 0.01) {
      this.camera.fov = this.baseFov;
      this.camera.updateProjectionMatrix();
    }

    // Handheld cinematic camera breathing sway
    const elapsed = this.clock.getElapsedTime();
    const swayX = Math.sin(elapsed * 0.95) * 0.04;
    const swayY = Math.cos(elapsed * 0.72) * 0.03;

    // Apply Screen Shake Trauma
    if (this.trauma > 0) {
      const shakeFactor = this.trauma * this.trauma;
      const shakeX = (Math.random() * 2 - 1) * 0.4 * shakeFactor;
      const shakeY = (Math.random() * 2 - 1) * 0.3 * shakeFactor;
      const shakeZ = (Math.random() * 2 - 1) * 0.2 * shakeFactor;

      this.camera.position.x += shakeX;
      this.camera.position.y = this.targetCameraPos.y + shakeY;
      this.camera.position.z = this.targetCameraPos.z + shakeZ;

      this.trauma = Math.max(0, this.trauma - delta * 2.2);
    } else {
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 8, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 8, delta);
    }

    this.camera.position.x += swayX;
    this.camera.position.y += swayY;

    this.camera.lookAt(this.playerX * 0.15, this.targetLookAt.y, this.targetLookAt.z);
  }

  public startLoop() {
    if (!this.animationFrameId) {
      this.clock.start();
      this.animationFrameId = requestAnimationFrame(this.update);
    }
  }

  public stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public dispose() {
    this.stopLoop();
    soundEngine.stopBgm();
    window.removeEventListener('resize', this.onWindowResize);
    this.houseFacade.dispose();
    this.hazardManager.clearAll();
    this.particleSystem.dispose();
    this.composer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
