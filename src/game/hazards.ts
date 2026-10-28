import * as THREE from 'three';
import { Projectile, ProjectileType } from './types';
import { createToonMaterial } from './toonShading';

export class HazardManager {
  public scene: THREE.Scene;
  public projectiles: Projectile[] = [];
  public projectileMeshes: Map<string, THREE.Object3D> = new Map();

  // Cel-Shaded Materials for Wind Waker Aesthetic
  private rockGeo: THREE.DodecahedronGeometry;
  private rockMat: THREE.MeshToonMaterial;

  private golfBallGeo: THREE.SphereGeometry;
  private golfBallMat: THREE.MeshToonMaterial;

  private baseballGeo: THREE.SphereGeometry;
  private baseballMat: THREE.MeshToonMaterial;

  private bowlingBallGeo: THREE.SphereGeometry;
  private bowlingBallMat: THREE.MeshToonMaterial;

  private coinGeo: THREE.CylinderGeometry;
  private coinMat: THREE.MeshToonMaterial;

  private nextId: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Wind Waker Stylized Polygonal Boulder
    this.rockGeo = new THREE.DodecahedronGeometry(0.58, 0);
    this.rockMat = createToonMaterial(0x78716c, { steps: 3 });

    // 2. Wind Waker Cute Cartoon Golf Ball
    const { golfMap } = this.generateToonGolfTexture();
    this.golfBallGeo = new THREE.SphereGeometry(0.35, 16, 12);
    this.golfBallMat = createToonMaterial(0xffffff, { steps: 3 });
    this.golfBallMat.map = golfMap;

    // 3. Wind Waker Cartoon Baseball with bold red stitches
    const baseballMap = this.generateToonBaseballTexture();
    this.baseballGeo = new THREE.SphereGeometry(0.42, 16, 14);
    this.baseballMat = createToonMaterial(0xfefce8, { steps: 3 });
    this.baseballMat.map = baseballMap;

    // 4. Wind Waker Cartoon Midnight Bowling Ball
    const bowlingMap = this.generateToonBowlingTexture();
    this.bowlingBallGeo = new THREE.SphereGeometry(0.68, 18, 14);
    this.bowlingBallMat = createToonMaterial(0x1e1b4b, { steps: 3 });
    this.bowlingBallMat.map = bowlingMap;

    // 5. Wind Waker Cel-Shaded 24K Gold Coin / Rupee
    const coinMap = this.generateToonCoinTexture();
    this.coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16);
    this.coinMat = createToonMaterial(0xfacc15, { steps: 3 });
    this.coinMat.map = coinMap;
  }

  /**
   * Cel-shaded golf ball with clean stylized dimple dots and red number
   */
  private generateToonGolfTexture(): { golfMap: THREE.CanvasTexture } {
    const width = 256;
    const height = 128;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Pure cartoon white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Clean stylized cartoon dots
    ctx.fillStyle = '#cbd5e1';
    const cols = 16;
    const rows = 8;
    const dx = width / cols;
    const dy = height / rows;
    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2) * (dx / 2);
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.arc(c * dx + offsetX, (r + 0.5) * dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bold cartoon red "1"
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', width * 0.25, height * 0.5);
    ctx.fillText('1', width * 0.75, height * 0.5);

    const golfMap = new THREE.CanvasTexture(canvas);
    return { golfMap };
  }

  /**
   * Cartoon baseball texture with clean bold red seams
   */
  private generateToonBaseballTexture(): THREE.CanvasTexture {
    const width = 256;
    const height = 128;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, width, height);

    // Bold red curved seams
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.5, 36, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.5, 36, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();

    // Red stitch V-marks
    ctx.lineWidth = 2.5;
    for (let i = -30; i <= 30; i += 10) {
      ctx.beginPath();
      ctx.moveTo(width * 0.25 + 36, height * 0.5 + i - 4);
      ctx.lineTo(width * 0.25 + 44, height * 0.5 + i);
      ctx.lineTo(width * 0.25 + 36, height * 0.5 + i + 4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.75 - 36, height * 0.5 + i - 4);
      ctx.lineTo(width * 0.75 - 44, height * 0.5 + i);
      ctx.lineTo(width * 0.75 - 36, height * 0.5 + i + 4);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Cartoon bowling ball with 3 distinct punch holes & glossy crescent shine
   */
  private generateToonBowlingTexture(): THREE.CanvasTexture {
    const width = 256;
    const height = 128;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, width, height);

    // 3 cartoon black finger holes with cyan rims
    const drawHole = (cx: number, cy: number, r: number) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawHole(width * 0.3, height * 0.45, 7);
    drawHole(width * 0.3 + 14, height * 0.45 - 14, 5.5);
    drawHole(width * 0.3 - 14, height * 0.45 - 14, 5.5);

    // Cartoon white gloss crescent
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(width * 0.72, height * 0.38, 22, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Wind Waker style coin with star emblem and bold rim
   */
  private generateToonCoinTexture(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, size, size);

    // Inner bright circle
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Bold border
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    // Star in center
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', size / 2, size / 2);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Spawn a new hazard or coin down the lane
   */
  public spawnHazard(fixtureWidth: number, baseSpeed: number, level: number): Projectile {
    this.nextId++;
    const id = `p_${this.nextId}`;

    const isCoin = Math.random() < 0.38;
    let type: ProjectileType = 'rock';

    if (isCoin) {
      type = 'coin';
    } else {
      const rand = Math.random();
      if (rand < 0.45) {
        type = 'rock';
      } else if (rand < 0.8) {
        type = 'golf_ball';
      } else if (rand < 0.95 || level < 4) {
        type = 'baseball';
      } else {
        type = 'bowling_ball';
      }
    }

    // Lane width limits
    const halfW = (fixtureWidth * 0.85) / 2;
    const startX = (Math.random() - 0.5) * halfW * 2;
    const startY = type === 'coin' ? 1.2 : 0.8 + Math.random() * 0.8;
    const startZ = -45;

    // Slight trajectory curve toward the window
    const targetX = startX + (Math.random() - 0.5) * 1.5;
    const speed = isCoin ? baseSpeed * 0.8 : baseSpeed * (type === 'golf_ball' ? 1.25 : 1.0);
    const flightTime = Math.abs(startZ) / speed;
    const vx = (targetX - startX) / flightTime;
    const vy = 0;
    const vz = speed;

    const radius =
      type === 'bowling_ball'
        ? 0.68
        : type === 'rock'
        ? 0.58
        : type === 'baseball'
        ? 0.42
        : 0.35;

    const projectile: Projectile = {
      id,
      type,
      x: startX,
      y: startY,
      z: startZ,
      vx,
      vy,
      vz,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      rotSpeedX: (Math.random() - 0.5) * 6,
      rotSpeedY: (Math.random() - 0.5) * 6,
      radius,
      active: true,
      value: isCoin ? 3 : type === 'bowling_ball' ? 300 : type === 'rock' ? 150 : 100,
    };

    // Create 3D Mesh with Wind Waker Toon Shading
    const mesh = this.createMeshForType(type);
    mesh.position.set(startX, startY, startZ);
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.projectileMeshes.set(id, mesh);
    this.projectiles.push(projectile);

    return projectile;
  }

  private createMeshForType(type: ProjectileType): THREE.Object3D {
    switch (type) {
      case 'golf_ball':
        return new THREE.Mesh(this.golfBallGeo, this.golfBallMat);
      case 'baseball':
        return new THREE.Mesh(this.baseballGeo, this.baseballMat);
      case 'bowling_ball':
        return new THREE.Mesh(this.bowlingBallGeo, this.bowlingBallMat);
      case 'coin': {
        const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
        coin.rotation.x = Math.PI / 2;
        return coin;
      }
      case 'rock':
      default:
        return new THREE.Mesh(this.rockGeo, this.rockMat);
    }
  }

  public update(delta: number): {
    glassHitProjectiles: Projectile[];
    escapedCoins: Projectile[];
  } {
    const glassHitProjectiles: Projectile[] = [];
    const escapedCoins: Projectile[] = [];

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p.active) continue;

      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;

      p.rotX += p.rotSpeedX * delta;
      p.rotY += p.rotSpeedY * delta;

      const mesh = this.projectileMeshes.get(p.id);
      if (mesh) {
        mesh.position.set(p.x, p.y, p.z);
        if (p.type === 'coin') {
          mesh.rotation.y += delta * 4.5;
        } else {
          mesh.rotation.x = p.rotX;
          mesh.rotation.y = p.rotY;
        }
      }

      // Check if projectile reached window baseline (Z >= 0.2)
      if (p.z >= 0.2) {
        p.active = false;
        if (p.type === 'coin') {
          escapedCoins.push(p);
        } else {
          glassHitProjectiles.push(p);
        }
        this.removeProjectile(p.id);
      }
    }

    return { glassHitProjectiles, escapedCoins };
  }

  public checkHammerHits(hammerPos: THREE.Vector3, smashRadius: number): Projectile[] {
    const hitList: Projectile[] = [];

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active || p.type === 'coin') continue;

      const dx = p.x - hammerPos.x;
      const dy = p.y - hammerPos.y;
      const dz = p.z - hammerPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= smashRadius + p.radius) {
        p.active = false;
        hitList.push(p);
        this.removeProjectile(p.id);
      }
    }

    return hitList;
  }

  public checkCoinPickups(playerPos: THREE.Vector3, pickupRadius: number): Projectile[] {
    const collected: Projectile[] = [];

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active || p.type !== 'coin') continue;

      const dx = p.x - playerPos.x;
      const dy = p.y - playerPos.y;
      const dz = p.z - playerPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= pickupRadius + p.radius) {
        p.active = false;
        collected.push(p);
        this.removeProjectile(p.id);
      }
    }

    return collected;
  }

  public clearHazardsInRadius(center: THREE.Vector3, radius: number): Projectile[] {
    const pulverized: Projectile[] = [];

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active || p.type === 'coin') continue;

      const dx = p.x - center.x;
      const dy = p.y - center.y;
      const dz = p.z - center.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= radius) {
        p.active = false;
        pulverized.push(p);
        this.removeProjectile(p.id);
      }
    }

    return pulverized;
  }

  public removeProjectile(id: string) {
    const mesh = this.projectileMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.projectileMeshes.delete(id);
    }
    const idx = this.projectiles.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projectiles.splice(idx, 1);
    }
  }

  public clearAll() {
    this.projectiles.forEach((p) => {
      const mesh = this.projectileMeshes.get(p.id);
      if (mesh) {
        this.scene.remove(mesh);
      }
    });
    this.projectiles = [];
    this.projectileMeshes.clear();
  }
}
