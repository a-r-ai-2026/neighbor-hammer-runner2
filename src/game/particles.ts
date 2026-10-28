import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rotVx: number;
  rotVy: number;
  life: number;
  maxLife: number;
  scaleDecay: boolean;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];

  // Geometries
  private sparkGeo: THREE.BoxGeometry;
  private shardGeo: THREE.BufferGeometry;
  private coinSparkleGeo: THREE.TetrahedronGeometry;

  // Materials
  private sparkMat: THREE.MeshBasicMaterial;
  private stoneMat: THREE.MeshStandardMaterial;
  private glassShardMat: THREE.MeshPhysicalMaterial;
  private goldSparkleMat: THREE.MeshBasicMaterial;

  // Ambient Sun Motes for Hollywood Golden-Hour Atmosphere
  private dustPoints: THREE.Points | null = null;
  private dustPositions: Float32Array | null = null;
  private dustOffsets: Float32Array | null = null;
  private readonly dustCount = 80;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.sparkGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
    // Emissive bright orange/gold spark that triggers bloom pass
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.9,
    });

    // Triangular glass shard geometry
    const shardGeom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 0,
      0.2, 0.3, 0.02,
      0.35, -0.1, 0,
    ]);
    shardGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    shardGeom.computeVertexNormals();
    this.shardGeo = shardGeom;

    this.glassShardMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transmission: 0.9,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    this.coinSparkleGeo = new THREE.TetrahedronGeometry(0.12);
    this.goldSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffdf20 });

    this.initCinematicSunMotes();
  }

  /**
   * Floating sun dust motes that catch golden sunlight rays
   */
  private initCinematicSunMotes() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.dustCount * 3);
    const offsets = new Float32Array(this.dustCount * 3);

    for (let i = 0; i < this.dustCount; i++) {
      const i3 = i * 3;
      // Bounding box in front of house: X: [-9, 9], Y: [0.6, 6.5], Z: [-4, 12]
      positions[i3] = (Math.random() - 0.5) * 18;
      positions[i3 + 1] = 0.6 + Math.random() * 6.0;
      positions[i3 + 2] = -4 + Math.random() * 16;

      offsets[i3] = Math.random() * Math.PI * 2;
      offsets[i3 + 1] = Math.random() * Math.PI * 2;
      offsets[i3 + 2] = 0.3 + Math.random() * 0.7; // Speed variation
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Circular soft glowing particle canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
      grad.addColorStop(0.3, 'rgba(255, 215, 120, 0.6)');
      grad.addColorStop(0.8, 'rgba(255, 180, 50, 0.15)');
      grad.addColorStop(1, 'rgba(255, 180, 50, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      map: texture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.dustPoints = new THREE.Points(geo, mat);
    this.dustPositions = positions;
    this.dustOffsets = offsets;
    this.scene.add(this.dustPoints);
  }

  /**
   * Explode rock/projectile into pulverized fragments and fire sparks
   */
  public emitSmashExplosion(pos: THREE.Vector3, count: number = 25) {
    for (let i = 0; i < count; i++) {
      const isSpark = Math.random() < 0.4;
      const mesh = new THREE.Mesh(
        isSpark ? this.sparkGeo : new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.12),
        isSpark ? this.sparkMat : this.stoneMat
      );

      mesh.position.copy(pos);
      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.2) * Math.PI;
      const speed = 4.0 + Math.random() * 10.0;

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: Math.cos(angle) * Math.cos(elev) * speed,
        vy: Math.abs(Math.sin(elev)) * speed + 2.0,
        vz: Math.sin(angle) * Math.cos(elev) * speed - 2.0,
        rotVx: (Math.random() - 0.5) * 15,
        rotVy: (Math.random() - 0.5) * 15,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        scaleDecay: true,
      });
    }
  }

  /**
   * Catastrophic glass shatter burst when window breaks completely on Hit 3
   */
  public emitGlassShatter(centerX: number, height: number, width: number, count: number = 55) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.shardGeo, this.glassShardMat);
      mesh.scale.setScalar(0.8 + Math.random() * 1.5);

      const px = centerX + (Math.random() - 0.5) * width;
      const py = 0.5 + Math.random() * (height - 0.5);
      const pz = 0.1;
      mesh.position.set(px, py, pz);

      const speed = 3.0 + Math.random() * 8.0;
      const angle = (Math.random() - 0.5) * Math.PI;

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: Math.sin(angle) * speed,
        vy: 2.0 + Math.random() * 6.0,
        vz: 2.0 + Math.random() * 5.0, // Fly toward camera
        rotVx: (Math.random() - 0.5) * 20,
        rotVy: (Math.random() - 0.5) * 20,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8,
        scaleDecay: false,
      });
    }
  }

  /**
   * Coin collection sparkle burst
   */
  public emitCoinSparkles(pos: THREE.Vector3, count: number = 14) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.coinSparkleGeo, this.goldSparkleMat);
      mesh.position.copy(pos);

      const speed = 2.0 + Math.random() * 4.0;
      const angle = Math.random() * Math.PI * 2;

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: Math.abs(Math.sin(angle)) * speed + 3.0,
        vz: (Math.random() - 0.5) * 2.0,
        rotVx: (Math.random() - 0.5) * 10,
        rotVy: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.35,
        scaleDecay: true,
      });
    }
  }

  /**
   * Expanding sonic ring and shockwave particles for Super Ability
   */
  public emitShockwave(origin: THREE.Vector3, count: number = 36) {
    const shockMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Electric cyan
    const energyGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(energyGeo, shockMat);
      mesh.position.copy(origin);

      const angle = (i / count) * Math.PI * 2;
      const speed = 12.0 + Math.random() * 4.0;

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 1.0 + Math.random() * 2.0,
        vz: Math.sin(angle) * speed - 4.0, // Push outwards down the lane
        rotVx: (Math.random() - 0.5) * 12,
        rotVy: (Math.random() - 0.5) * 12,
        life: 0,
        maxLife: 0.65,
        scaleDecay: true,
      });
    }
  }

  /**
   * Per-frame particle physics tick
   */
  public update(delta: number) {
    const gravity = -18.0;

    // 1. Drift Ambient Sun Dust Motes
    if (this.dustPoints && this.dustPositions && this.dustOffsets) {
      const pos = this.dustPositions;
      const off = this.dustOffsets;
      for (let i = 0; i < this.dustCount; i++) {
        const i3 = i * 3;
        off[i3] += delta * off[i3 + 2] * 0.8;
        off[i3 + 1] += delta * off[i3 + 2] * 0.5;

        // Gentle wandering
        pos[i3] += Math.sin(off[i3]) * delta * 0.35;
        pos[i3 + 1] += Math.cos(off[i3 + 1]) * delta * 0.25;
        pos[i3 + 2] -= delta * 0.45; // Gentle float down lane

        // Wrap around bounds
        if (pos[i3 + 2] < -5) pos[i3 + 2] = 12;
        if (pos[i3] > 9) pos[i3] = -9;
        if (pos[i3] < -9) pos[i3] = 9;
        if (pos[i3 + 1] > 6.5) pos[i3 + 1] = 0.6;
        if (pos[i3 + 1] < 0.6) pos[i3 + 1] = 6.5;
      }
      this.dustPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Dynamic Physics Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      p.vy += gravity * delta;
      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;

      p.mesh.rotation.x += p.rotVx * delta;
      p.mesh.rotation.y += p.rotVy * delta;

      // Bounce on ground
      if (p.mesh.position.y <= 0.05) {
        p.mesh.position.y = 0.05;
        p.vy = -p.vy * 0.35;
        p.vx *= 0.7;
        p.vz *= 0.7;
      }

      if (p.scaleDecay) {
        const remaining = 1 - p.life / p.maxLife;
        p.mesh.scale.setScalar(Math.max(0.01, remaining));
      }
    }
  }

  public clearAll() {
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.particles = [];
  }

  public dispose() {
    this.clearAll();
    if (this.dustPoints) {
      this.scene.remove(this.dustPoints);
      this.dustPoints.geometry.dispose();
      if (Array.isArray(this.dustPoints.material)) {
        this.dustPoints.material.forEach((m) => m.dispose());
      } else {
        this.dustPoints.material.dispose();
      }
      this.dustPoints = null;
    }
  }
}
