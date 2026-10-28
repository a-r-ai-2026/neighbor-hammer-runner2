# Mr. Rogers: Window Smash Defender (3D Endless Runner)

An action-packed 3D endless arcade runner and BrickBreaker hybrid where players control **Mr. Rogers**—a lovable, burly suburban hero inspired by Wreck-It Ralph—wielding a giant sledgehammer to defend a bottom bar featuring realistic architectural windows and patio doors from incoming flying rocks, stray golf balls, and projectiles.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following core design preferences were confirmed in Phase 1 and are baked into the plan:
> - **Visual Art Style**: Stylized 3D cartoon arcade with vibrant materials, bouncy animations, and explosive smash particles.
> - **Camera View**: Dynamic third-person perspective positioned behind Mr. Rogers looking down the suburban lane toward incoming projectile hazards, keeping the active window/door frame prominently anchored at the bottom baseline.
> - **Sound & Feedback**: High-energy procedural arcade audio using Web Audio API (synthesized hammer thuds, glass fracture crunches, coin chimes, cheering) paired with screen shake and mobile haptics.

- **Window & Patio Door Progression**: Alternates level by level between windows and patio doors, escalating in width, glass area, and structural complexity:
  1. *Level 1*: Awning Window (compact, awning sash)
  2. *Level 2*: Sliding Patio Doors (wide dual-track glass sliders)
  3. *Level 3*: Casement Window (side-hinged architectural frame)
  4. *Level 4*: French Patio Doors (double door with divided lites / mullions)
  5. *Level 5*: Double Hung Window (classic double vertical sash)
  6. *Level 6*: Bay Window (3-segment angled protruding frame)
  7. *Level 7*: Bow Window (wide curved multi-panel panoramic frame)
  8. *Level 8*: Picture Window (massive expansive high-vulnerability glass pane)
  9. *Level 9*: Coastal Impact Window (heavy-duty storm-grade reinforced frame)
  10. *Level 10+*: Specialty Geometric Arch Windows & Endless Boss Waves
- **Three-Strike Glass Breaking System**: 
  - 1st Hit: Spiderweb crack overlay + crunch sound + moderate screen shake.
  - 2nd Hit: Deep splintered glass fractures + alarm cue + heavy screen shake.
  - 3rd Hit: Catastrophic shatter animation with exploding glass fragments and level failure.
- **Economy & Upgrades**: Coin rewards start at 5 and increase by +5 per level. Shop upgrades include *Hammer Shockwave Radius*, *Mr. Rogers Sprint Speed*, and *Emergency Glass Repair Kits*.

---

### 1. Overview & Core Concept

- **What It Does**: Combines the high-speed thrill of *Temple Run* projectile dodging with the defensive reflex mechanics of *BrickBreaker*. As projectiles launch down a suburban fairway/driveway, the player maneuvers Mr. Rogers left and right to intercept them with timed hammer smashes before they strike the fragile glass fixture behind him.
- **Target Audience**: Casual and arcade mobile/web gamers who love satisfying physical feedback, quirky humorous characters, and escalating reflex challenges.
- **Key Value**: Delivering tactile, juice-packed destruction physics and defensive satisfaction with genuine architectural window and door variations rendered in Three.js WebGL.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme
- **Aesthetic Direction**: Stylized Pixar/Arcade Suburban cartoon world. A sunlit neighborhood lane framed by picket fences, lush green hedges, sidewalk curbs, and suburban roofs under a skybox.
- **Color Palette**:
  - *Grass & Lawn*: Vibrant suburban green (`#22c55e`, `#15803d`)
  - *Mr. Rogers*: Crimson red knit sweater (`#dc2626`), denim blue dungarees (`#1d4ed8`), leather brown work boots, brass hammer head with hardwood handle.
  - *Window Frames & Glass*: High-gloss PVC white, architectural bronze, and clear physical glass (`MeshPhysicalMaterial` with transmission: 0.92, roughness: 0.08, clearcoat: 1.0, and chromatic reflection).
  - *Accents & Particles*: Amber gold coins (`#f59e0b`), fiery orange smash impact sparks, and icy blue glass shard particles.
- **Typography**: Athletic display fonts (`Barlow Condensed` / `Plus Jakarta Sans`) with tabular numerals for score, level, and coin counters.

#### Key User Flows & HUD
- **Start / Home Screen**: Play button, high score trophy, quick upgrade shop drawer, and level preview showcasing the current window type.
- **Active Gameplay**:
  - Full-screen 3D viewport with dynamic lane perspective.
  - Minimalist top bar: Level progress bar, current window/door name tag, coin pouch, and 3 glass integrity hearts/indicators.
  - Bottom mobile controls: Left/Right touch glide bar (plus tilt accelerometer support on mobile) and an oversized glowing tactile **SMASH** button.
  - Keyboard/Mouse controls: `A`/`D` or `Left`/`Right` arrow keys to move, `Spacebar` or mouse click to smash.
- **Level Transition / Shop Modal**:
  - Victory fanfare when clearing a wave.
  - Coin earnings tally (+5, +10, +15...).
  - Upgrade store to purchase:
    1. *Hammer Radius*: Increases smash reach and shockwave area.
    2. *Running Shoes*: Boosts Mr. Rogers' lateral movement velocity.
    3. *Glass Repair Kit*: Restores damaged cracks on the active window.
    4. *Impact Shield*: Absorbs 1 stray projectile automatically.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Procedural Three.js 3D Models vs Heavy External Asset Files**
  - *Chosen Approach*: 100% procedural 3D construction for Mr. Rogers (multi-part stylized character rig with head, hair, red sweater torso, dungarees, muscular arms, and giant sledgehammer), 10 architectural window/door types, hazards, and particle systems.
  - *Why*: Eliminates 404 network risks, zero load latency, instant 60 FPS rendering, and full programmatic control over hammer swing arcs and procedural glass crack generation.
- **Decision 2: Web Audio API Synthesizer vs External MP3s**
  - *Chosen Approach*: Pure synthesized procedural audio using Web Audio API nodes (bandpass noise, exponential frequency sweeps, oscillator chords).
  - *Why*: Guarantees instant zero-latency sound effects on mobile iOS/Android and desktop with dynamic pitch variation on consecutive hits without external asset dependencies.
- **Decision 3: Unified Touch + Keyboard + Tilt Input Architecture**
  - *Chosen Approach*: Multi-modal input listener supporting continuous pointer drag, virtual on-screen buttons, device orientation (tilt), and standard WASD/Spacebar keyboard mapping.
  - *Why*: Provides seamless playability whether tested on desktop Chrome, Android, or iPhone.

---

### 4. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                     App.tsx (Root Game State)                   │
│  - Level & Progression (Level 1..10+ Window Sequence)           │
│  - Coins & Shop Upgrades (Speed, Hammer Radius, Repair)         │
│  - Glass Health (3 Hits Max) & Audio Controller Engine          │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 ▼                               ▼
┌─────────────────────────────────┐   ┌───────────────────────────┐
│     Three.js Game Canvas        │   │    Arcade HUD Overlay     │
│ - Scene, Camera & Lights        │   │ - Level & Window Type Tag │
│ - MrRogers Character Rig (Walk, │   │ - Glass Damage Meter (1-3)│
│   Idle, Hammer Smash Arc)       │   │ - Coin Balance & Distance │
│ - Architectural Window/Door Bar │   │ - Upgrade Shop Dialog     │
│   (Awning -> French Doors...)   │   │ - Touch Joystick / Tilt   │
│ - Projectile Waves & Spawner    │   │ - Big Tactile SMASH Button│
│ - Glass Fracture Decal/Shards   │   │ - GameOver / Victory View │
│ - Particle Burst VFX Engine     │   │                           │
└─────────────────────────────────┘   └───────────────────────────┘
```

#### Modules & Data Model:
- **`three`**: Core 3D engine with `RoomEnvironment`, `MeshPhysicalMaterial`, and smooth damping kinematics.
- **`src/game/audio.ts`**: Web Audio API sound generator (hammer whoosh, stone pulverize crunch, glass crack, glass shatter, coin chime, level fanfare).
- **`src/game/character.ts`**: Procedural Mr. Rogers character rig with articulated swing arm, sledgehammer, animated running bob, and smash impact timings.
- **`src/game/windows.ts`**: Procedural architectural geometry generator for all 10 window and patio door specifications with dynamic width, frame profiles, divided lites, and glass crack states.
- **`src/game/hazards.ts`**: Projectile manager spawning rocks, golf balls, baseballs with trajectory curves and collision bounding boxes.
- **`src/game/particles.ts`**: GPU-optimized particle emitters for rock debris sparks, glass shards, and gold coin collection sparkles.

---

### 5. Verification & Validation Plan
1. **Compilation Check**: Run `compile_applet` to ensure Three.js dependencies and TypeScript code compile cleanly without missing types.
2. **Gameplay Loop Verification**:
   - Verify Mr. Rogers moves smoothly left and right across varying window widths.
   - Verify smash timing destroys incoming rocks and golf balls within hammer range.
   - Verify unblocked projectiles impact the glass, triggering realistic crack stages 1 -> 2 -> 3 and game over.
   - Verify level transitions alternate between windows and doors while increasing coin drops (+5 each level).
   - Verify coin upgrades (hammer range, speed, repair kits) take effect immediately in gameplay.
