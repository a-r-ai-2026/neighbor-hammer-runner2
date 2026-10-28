import * as THREE from 'three';
import { createToonMaterial } from './toonShading';

interface Particle {
  mesh: THREE.Mesh | THREE.Group;
  vx: number;
  vy: number;
  vz: number;
  rotVx: number;
  rotVy: number;
  rotVz: number;
  life: number;
  maxLife: number;
  initialScale: number;
  isPuff?: boolean;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];

  // Wind Waker Materials & Geometries
  private cartoonSmokeMat: THREE.MeshBasicMaterial;
  private starYellowMat: THREE.MeshBasicMaterial;
  private starWhiteMat: THREE.MeshBasicMaterial;
  private cartoonGlassMat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.cartoonSmokeMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
      transparent: true,
      opacity: 0.9,
    });

    this.starYellowMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      side: THREE.DoubleSide,
    });

    this.starWhiteMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    this.cartoonGlassMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
  }

  /**
   * Helper to create a Wind Waker 4-pointed cartoon comic star
   */
  private createCartoonStarMesh(size: number, isWhite = false): THREE.Mesh {
    const shape = new THREE.Shape();
    const points = 4;
    const outerRadius = size;
    const innerRadius = size * 0.28;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geo, isWhite ? this.starWhiteMat : this.starYellowMat);
    return mesh;
  }

  /**
   * Wind Waker Iconic Comic Smash Burst:
   * Puffy cartoon smoke spheres + exploding 4-pointed comic hit stars!
   */
  public emitSmashExplosion(pos: THREE.Vector3, count: number = 18) {
    // 1. Comic Stars bursting outward
    const starCount = Math.min(10, count);
    for (let i = 0; i < starCount; i++) {
      const star = this.createCartoonStarMesh(0.4 + Math.random() * 0.35, i % 2 === 0);
      star.position.copy(pos);

      const angle = Math.random() * Math.PI * 2;
      const speed = 4.0 + Math.random() * 7.0;

      this.scene.add(star);
      this.particles.push({
        mesh: star,
        vx: Math.cos(angle) * speed,
        vy: 2.5 + Math.random() * 5.0,
        vz: Math.sin(angle) * speed * 0.6,
        rotVx: 0,
        rotVy: 0,
        rotVz: (Math.random() - 0.5) * 16,
        life: 0,
        maxLife: 0.38 + Math.random() * 0.2,
        initialScale: 1.0,
      });
    }

    // 2. Wind Waker Puffy Spherical Smoke Clouds that pop and shrink
    const puffCount = 8;
    for (let i = 0; i < puffCount; i++) {
      const puffGeo = new THREE.SphereGeometry(0.35 + Math.random() * 0.25, 8, 8);
      const puffMesh = new THREE.Mesh(puffGeo, this.cartoonSmokeMat);
      puffMesh.position.copy(pos);

      const angle = (i / puffCount) * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.5;

      this.scene.add(puffMesh);
      this.particles.push({
        mesh: puffMesh,
        vx: Math.cos(angle) * speed,
        vy: 1.2 + Math.random() * 2.5,
        vz: Math.sin(angle) * speed * 0.5,
        rotVx: 0,
        rotVy: 0,
        rotVz: 0,
        life: 0,
        maxLife: 0.42 + Math.random() * 0.25,
        initialScale: 0.6,
        isPuff: true,
      });
    }
  }

  /**
   * Cartoon glass shatter fragments
   */
  public emitGlassShatter(centerX: number, height: number, width: number, count: number = 40) {
    for (let i = 0; i < count; i++) {
      const shardGeo = new THREE.BufferGeometry();
      const s = 0.25 + Math.random() * 0.35;
      const vertices = new Float32Array([
        0, 0, 0,
        s, s * 0.8, 0,
        s * 0.6, -s * 0.5, 0,
      ]);
      shardGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      shardGeo.computeVertexNormals();

      const mesh = new THREE.Mesh(shardGeo, this.cartoonGlassMat);
      const px = centerX + (Math.random() - 0.5) * width;
      const py = 0.5 + Math.random() * (height - 0.5);
      mesh.position.set(px, py, 0.2);

      const speed = 3.0 + Math.random() * 7.0;
      const angle = (Math.random() - 0.5) * Math.PI;

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: Math.sin(angle) * speed,
        vy: 2.0 + Math.random() * 5.0,
        vz: 3.0 + Math.random() * 5.0,
        rotVx: (Math.random() - 0.5) * 12,
        rotVy: (Math.random() - 0.5) * 12,
        rotVz: (Math.random() - 0.5) * 12,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.5,
        initialScale: 1.0,
      });
    }
  }

  /**
   * Wind Waker Rupee / Coin sparkle stars
   */
  public emitCoinSparkles(pos: THREE.Vector3, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const star = this.createCartoonStarMesh(0.25 + Math.random() * 0.18, true);
      star.position.copy(pos);

      const speed = 1.5 + Math.random() * 3.0;
      const angle = Math.random() * Math.PI * 2;

      this.scene.add(star);
      this.particles.push({
        mesh: star,
        vx: Math.cos(angle) * speed,
        vy: 2.0 + Math.random() * 3.0,
        vz: (Math.random() - 0.5) * 1.5,
        rotVx: 0,
        rotVy: 0,
        rotVz: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.25,
        initialScale: 1.0,
      });
    }
  }

  /**
   * Wind Waker style Expanding Shockwave Ring
   */
  public emitShockwave(origin: THREE.Vector3, count: number = 24) {
    // Expanding cyan cartoon ring
    const ringGeo = new THREE.RingGeometry(0.3, 0.65, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(origin);
    ring.position.y = 0.1;

    this.scene.add(ring);
    this.particles.push({
      mesh: ring,
      vx: 0,
      vy: 0,
      vz: -1.0,
      rotVx: 0,
      rotVy: 0,
      rotVz: 0,
      life: 0,
      maxLife: 0.5,
      initialScale: 1.0,
      isPuff: false,
    });

    // Outer cartoon stars
    for (let i = 0; i < 12; i++) {
      const star = this.createCartoonStarMesh(0.35, true);
      star.position.copy(origin);
      const angle = (i / 12) * Math.PI * 2;
      const speed = 9.0;

      this.scene.add(star);
      this.particles.push({
        mesh: star,
        vx: Math.cos(angle) * speed,
        vy: 1.0,
        vz: Math.sin(angle) * speed,
        rotVx: 0,
        rotVy: 0,
        rotVz: (Math.random() - 0.5) * 12,
        life: 0,
        maxLife: 0.45,
        initialScale: 1.0,
      });
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      const progress = p.life / p.maxLife;

      if (progress >= 1.0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;

      p.mesh.rotation.x += p.rotVx * delta;
      p.mesh.rotation.y += p.rotVy * delta;
      p.mesh.rotation.z += p.rotVz * delta;

      if (p.isPuff) {
        // Wind Waker cartoon puff: starts small, quickly puffs up, then dissolves
        let scale = 1.0;
        if (progress < 0.25) {
          scale = THREE.MathUtils.lerp(0.3, 1.4, progress / 0.25);
        } else {
          scale = THREE.MathUtils.lerp(1.4, 0.05, (progress - 0.25) / 0.75);
        }
        p.mesh.scale.setScalar(scale);
      } else {
        // Star & shard scale shrink
        const scale = THREE.MathUtils.lerp(p.initialScale, 0.01, progress * progress);
        p.mesh.scale.setScalar(scale);
      }
    }
  }

  public clearAll() {
    this.particles.forEach((p) => {
      this.scene.remove(p.mesh);
    });
    this.particles = [];
  }

  public dispose() {
    this.clearAll();
  }
}
