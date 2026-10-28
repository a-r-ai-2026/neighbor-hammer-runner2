import * as THREE from 'three';
import { Projectile, ProjectileType } from './types';

export class HazardManager {
  public scene: THREE.Scene;
  public projectiles: Projectile[] = [];
  public projectileMeshes: Map<string, THREE.Object3D> = new Map();

  // Shared Geometries and Materials for high performance
  private rockGeo: THREE.BufferGeometry;
  private rockMat: THREE.MeshStandardMaterial;

  private golfBallGeo: THREE.SphereGeometry;
  private golfBallMat: THREE.MeshPhysicalMaterial;

  private baseballGeo: THREE.SphereGeometry;
  private baseballMat: THREE.MeshStandardMaterial;

  private bowlingBallGeo: THREE.SphereGeometry;
  private bowlingBallMat: THREE.MeshStandardMaterial;

  private coinGeo: THREE.CylinderGeometry;
  private coinMat: THREE.MeshStandardMaterial;

  private nextId: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Rock geometry (distorted icosahedron)
    this.rockGeo = new THREE.DodecahedronGeometry(0.55, 1);
    // Add procedural roughness to rock vertices
    const pos = this.rockGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      v.multiplyScalar(0.85 + (Math.sin(v.x * 5) + Math.cos(v.y * 5)) * 0.12);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    this.rockGeo.computeVertexNormals();

    this.rockMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });

    // Realistic Golf Ball with authentic dimples, red number stamp & alignment line
    const { golfMap, golfBumpMap } = this.generateGolfBallTextures();
    this.golfBallGeo = new THREE.SphereGeometry(0.33, 32, 28);
    this.golfBallMat = new THREE.MeshPhysicalMaterial({
      map: golfMap,
      bumpMap: golfBumpMap,
      bumpScale: 0.08,
      roughness: 0.22,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    });

    // Baseball with authentic red curved seams and stitches
    this.baseballGeo = new THREE.SphereGeometry(0.38, 28, 24);
    this.baseballMat = new THREE.MeshStandardMaterial({
      map: this.generateBaseballTexture(),
      roughness: 0.55,
      metalness: 0.05,
    });

    // Cinematic Bowling Ball with deep cosmic marble pearlescent sheen and 3 finger holes
    this.bowlingBallGeo = new THREE.SphereGeometry(0.7, 32, 28);
    this.bowlingBallMat = new THREE.MeshPhysicalMaterial({
      map: this.generateBowlingBallTexture(),
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    });

    // High-Gloss 24K Embossed Collectible Coin
    this.coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
    this.coinMat = new THREE.MeshStandardMaterial({
      map: this.generateCoinTexture(),
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.18,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
    });
  }

  /**
   * Procedural golf ball canvas texture with dimple depression grid, red #1 stamp & arrow lines
   */
  private generateGolfBallTextures(): { golfMap: THREE.CanvasTexture; golfBumpMap: THREE.CanvasTexture } {
    const width = 512;
    const height = 256;

    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = width;
    colorCanvas.height = height;
    const ctx = colorCanvas.getContext('2d')!;

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = width;
    bumpCanvas.height = height;
    const bCtx = bumpCanvas.getContext('2d')!;

    // Base colors
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#808080'; // 50% neutral surface height
    bCtx.fillRect(0, 0, width, height);

    // Staggered hexagonal lattice of golf ball dimples
    const cols = 28;
    const rows = 14;
    const dx = width / cols;
    const dy = height / rows;
    const r = dx * 0.44;

    for (let row = 0; row < rows; row++) {
      const offsetX = (row % 2) * (dx / 2);
      for (let col = 0; col < cols; col++) {
        const cx = col * dx + offsetX;
        const cy = (row + 0.5) * dy;

        // Bump map dimple (concave depression: dark center, bright rim highlight)
        const bGrad = bCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        bGrad.addColorStop(0, '#1a1a1a');
        bGrad.addColorStop(0.65, '#555555');
        bGrad.addColorStop(0.9, '#b8b8b8');
        bGrad.addColorStop(1, '#808080');
        bCtx.fillStyle = bGrad;
        bCtx.beginPath();
        bCtx.arc(cx, cy, r, 0, Math.PI * 2);
        bCtx.fill();

        // Diffuse map dimple shadow
        const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        cGrad.addColorStop(0, '#cbd5e1');
        cGrad.addColorStop(0.8, '#f1f5f9');
        cGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Authentic Golf Ball Branding & Alignment Marks
    // Red "1" number stamp (classic Titleist style)
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', width * 0.25, height * 0.48);
    ctx.fillText('1', width * 0.75, height * 0.48);

    // Brand title & alignment bar
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('◄ ROGERS TOUR ►', width * 0.25, height * 0.7);
    ctx.fillText('◄ ROGERS TOUR ►', width * 0.75, height * 0.7);

    // Alignment arrow stripes
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.48);
    ctx.lineTo(width * 0.16, height * 0.48);
    ctx.moveTo(width * 0.34, height * 0.48);
    ctx.lineTo(width * 0.42, height * 0.48);

    ctx.moveTo(width * 0.58, height * 0.48);
    ctx.lineTo(width * 0.66, height * 0.48);
    ctx.moveTo(width * 0.84, height * 0.48);
    ctx.lineTo(width * 0.92, height * 0.48);
    ctx.stroke();

    const golfMap = new THREE.CanvasTexture(colorCanvas);
    golfMap.wrapS = THREE.RepeatWrapping;
    golfMap.wrapT = THREE.ClampToEdgeWrapping;

    const golfBumpMap = new THREE.CanvasTexture(bumpCanvas);
    golfBumpMap.wrapS = THREE.RepeatWrapping;
    golfBumpMap.wrapT = THREE.ClampToEdgeWrapping;

    return { golfMap, golfBumpMap };
  }

  /**
   * Authentic baseball leather texture with red curved seams and angled stitches
   */
  private generateBaseballTexture(): THREE.CanvasTexture {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Creamy white leather
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Subtle leather grain noise
    ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Red baseball seams
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;

    // Draw 2 curved seam paths
    const drawSeam = (offsetY: number, inverted: boolean) => {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const angle = (x / width) * Math.PI * 2;
        const y = offsetY + Math.sin(angle) * (inverted ? -45 : 45);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Individual angled stitches along the seam
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.5;
      for (let x = 8; x < width; x += 14) {
        const angle = (x / width) * Math.PI * 2;
        const y = offsetY + Math.sin(angle) * (inverted ? -45 : 45);
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 5);
        ctx.lineTo(x + 3, y + 5);
        ctx.stroke();
      }
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
    };

    drawSeam(height * 0.35, false);
    drawSeam(height * 0.65, true);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Deep cosmic marble bowling ball texture with 3 drilled finger holes
   */
  private generateBowlingBallTexture(): THREE.CanvasTexture {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Deep midnight base
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.3, '#1e1b4b');
    grad.addColorStop(0.6, '#172554');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Swirling pearlescent ribbons
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 14;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(width * 0.5 + i * 20, height * 0.5 - i * 15, 60 + i * 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3 drilled black finger holes
    const drawHole = (cx: number, cy: number, r: number) => {
      // Bevel rim
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.fill();

      // Deep dark hole cavity
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawHole(width * 0.25, height * 0.45, 9);
    drawHole(width * 0.25 + 18, height * 0.45 - 20, 7);
    drawHole(width * 0.25 - 18, height * 0.45 - 20, 7);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * 24K Gold Coin texture with stamped star and coin edge ridges
   */
  private generateCoinTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Radial gold luster
    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.9, '#b45309');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Circular coin border ridge
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rim dots
    ctx.fillStyle = '#fef3c7';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x = size / 2 + Math.cos(a) * (size * 0.36);
      const y = size / 2 + Math.sin(a) * (size * 0.36);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Embossed Star emblem in center
    ctx.fillStyle = '#fffbeb';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Spawn a new hazard or coin down the lane
   */
  public spawnHazard(fixtureWidth: number, baseSpeed: number, level: number): Projectile {
    this.nextId++;
    const id = `p_${this.nextId}`;

    // Increased coin spawn rate (38%) for faster progression
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
    const startY = type === 'coin' ? 1.2 : 0.8 + Math.random() * 0.9;
    const startZ = -45; // Far end of the suburban lane

    // Slight trajectory curve toward the window
    const targetX = startX + (Math.random() - 0.5) * 1.5;
    const speed = isCoin ? baseSpeed * 0.8 : baseSpeed * (type === 'golf_ball' ? 1.25 : 1.0);
    const flightTime = Math.abs(startZ) / speed;
    const vx = (targetX - startX) / flightTime;
    const vy = 0;
    const vz = speed;

    const radius =
      type === 'bowling_ball'
        ? 0.7
        : type === 'rock'
        ? 0.55
        : type === 'baseball'
        ? 0.4
        : 0.32;

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
      rotSpeedX: (Math.random() - 0.5) * 8,
      rotSpeedY: (Math.random() - 0.5) * 8,
      radius,
      active: true,
      value: isCoin ? 3 : type === 'bowling_ball' ? 300 : type === 'rock' ? 150 : 100,
    };

    // Create 3D Mesh
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
      case 'golf_ball': {
        const mesh = new THREE.Mesh(this.golfBallGeo, this.golfBallMat);
        return mesh;
      }
      case 'baseball': {
        const mesh = new THREE.Mesh(this.baseballGeo, this.baseballMat);
        return mesh;
      }
      case 'bowling_ball': {
        const mesh = new THREE.Mesh(this.bowlingBallGeo, this.bowlingBallMat);
        return mesh;
      }
      case 'coin': {
        const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
        coin.rotation.x = Math.PI / 2;
        return coin;
      }
      case 'rock':
      default: {
        const mesh = new THREE.Mesh(this.rockGeo, this.rockMat);
        return mesh;
      }
    }
  }

  /**
   * Per-frame update of flying projectiles
   */
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
          mesh.rotation.y += delta * 5.0; // Spin coin
        } else {
          mesh.rotation.x = p.rotX;
          mesh.rotation.y = p.rotY;
        }
      }

      // Check if projectile reached the bottom window baseline (Z >= 0.2)
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

  /**
   * Check collision with hammer smash hit zone
   */
  public checkHammerHits(
    hammerPos: THREE.Vector3,
    smashRadius: number
  ): Projectile[] {
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

  /**
   * Pulverize all incoming hazards in a wide shockwave radius (Super Ability)
   */
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

  /**
   * Check Mr. Rogers body collision with flying coins
   */
  public checkCoinPickups(playerPos: THREE.Vector3, pickupRadius: number): Projectile[] {
    const collected: Projectile[] = [];

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active || p.type !== 'coin') continue;

      const dx = p.x - playerPos.x;
      const dz = p.z - playerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= pickupRadius + p.radius) {
        p.active = false;
        collected.push(p);
        this.removeProjectile(p.id);
      }
    }

    return collected;
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
      if (mesh) this.scene.remove(mesh);
    });
    this.projectiles = [];
    this.projectileMeshes.clear();
  }
}
