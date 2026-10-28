import * as THREE from 'three';
import { createToonMaterial } from './toonShading';

export class MrRogersCharacter {
  public group: THREE.Group;
  private rightArmPivot: THREE.Group;
  private leftArmPivot: THREE.Group;
  private leftLegPivot: THREE.Group;
  private rightLegPivot: THREE.Group;
  private torsoGroup: THREE.Group;
  private headGroup: THREE.Group;
  private hammerGroup: THREE.Group;
  private hammerHeadMesh: THREE.Mesh;
  private swingSwooshMesh: THREE.Mesh;

  // Eyes & Eyeballs for Wind Waker expressive glance
  private leftPupil: THREE.Mesh;
  private rightPupil: THREE.Mesh;
  private leftEyebrow: THREE.Mesh;
  private rightEyebrow: THREE.Mesh;

  // Animation states
  private isSmashing: boolean = false;
  private smashTime: number = 0;
  private readonly smashDuration: number = 0.28;
  private walkCycle: number = 0;
  private currentSpeed: number = 0;
  private facingTilt: number = 0;
  private eyeBlinkTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();
    // Face forward down the lane towards oncoming hazards
    this.group.rotation.y = Math.PI;

    // Wind Waker Cel-Shaded Palette (Bright, vibrant, clean stepped tones)
    const skinMat = createToonMaterial(0xffcaa6, { steps: 3 });
    const sweaterMat = createToonMaterial(0xef4444, { steps: 3 }); // Bold Wind Waker Red
    const overallsMat = createToonMaterial(0x2563eb, { steps: 3 }); // Vibrant Wind Waker Cobalt Blue
    const bootMat = createToonMaterial(0x78350f, { steps: 3 });
    const hairMat = createToonMaterial(0x451a03, { steps: 3 });
    const eyeWhiteMat = createToonMaterial(0xffffff, { steps: 3 });
    const pupilMat = createToonMaterial(0x0f172a, { steps: 3 });
    const goldMat = createToonMaterial(0xfacc15, { steps: 3 });
    const woodMat = createToonMaterial(0xb45309, { steps: 3 });
    const ironMat = createToonMaterial(0x64748b, { steps: 3 });
    const outlineDarkMat = createToonMaterial(0x1e1b4b, { steps: 3 });

    // --- MAIN TORSO & HIPS ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 1.35;
    this.group.add(this.torsoGroup);

    // Wind Waker Stylized Chunky Torso (Tapered barrel shape)
    const chestGeo = new THREE.CylinderGeometry(0.55, 0.48, 0.85, 12);
    const chest = new THREE.Mesh(chestGeo, sweaterMat);
    chest.position.y = 0.35;
    chest.castShadow = true;
    this.torsoGroup.add(chest);

    // Chunky Knit Collar
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.12, 8, 16),
      sweaterMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.8;
    this.torsoGroup.add(collar);

    // Overalls Bib (Front denim patch with gold buckles)
    const bib = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.52, 0.14),
      overallsMat
    );
    bib.position.set(0, 0.22, 0.42);
    this.torsoGroup.add(bib);

    // Overalls Gold Buttons / Buckles
    const buckleL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8), goldMat);
    buckleL.rotation.x = Math.PI / 2;
    buckleL.position.set(-0.2, 0.42, 0.48);
    this.torsoGroup.add(buckleL);

    const buckleR = buckleL.clone();
    buckleR.position.x = 0.2;
    this.torsoGroup.add(buckleR);

    // Chunky Hips & Pelvis
    const hips = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.44, 0.42, 12),
      overallsMat
    );
    hips.position.y = -0.15;
    hips.castShadow = true;
    this.torsoGroup.add(hips);

    // --- WIND WAKER STYLIZED EXPRESSIVE HEAD ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.25, 0.05);
    this.torsoGroup.add(this.headGroup);

    // Round cute cartoon head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 16, 14),
      skinMat
    );
    head.scale.set(1.05, 0.98, 1.0);
    head.castShadow = true;
    this.headGroup.add(head);

    // Wind Waker Iconic Chunky Hair Cap with sideburns
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairCap.position.set(0, 0.08, -0.04);
    hairCap.rotation.x = -0.15;
    this.headGroup.add(hairCap);

    // Wind Waker stylized tuft of hair in front
    const hairTuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.45, 6),
      hairMat
    );
    hairTuft.rotation.set(-Math.PI * 0.35, 0.2, 0);
    hairTuft.position.set(0.12, 0.48, 0.5);
    this.headGroup.add(hairTuft);

    // Wind Waker Expressive Large Oval Eyes
    const eyeGeo = new THREE.SphereGeometry(0.18, 12, 10);
    eyeGeo.scale(1.0, 1.35, 0.25);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.22, 0.08, 0.5);
    leftEye.rotation.y = 0.15;
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.22, 0.08, 0.5);
    rightEye.rotation.y = -0.15;
    this.headGroup.add(rightEye);

    // Large dark cartoon pupils with glossy white gleam
    const pupilGeo = new THREE.SphereGeometry(0.11, 10, 8);
    pupilGeo.scale(1.0, 1.25, 0.2);

    this.leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.leftPupil.position.set(-0.22, 0.08, 0.56);
    this.headGroup.add(this.leftPupil);

    this.rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.rightPupil.position.set(0.22, 0.08, 0.56);
    this.headGroup.add(this.rightPupil);

    // White gleam dots in pupils (the signature Wind Waker twinkle!)
    const gleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const gleamL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), gleamMat);
    gleamL.position.set(-0.2, 0.12, 0.58);
    this.headGroup.add(gleamL);

    const gleamR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), gleamMat);
    gleamR.position.set(0.24, 0.12, 0.58);
    this.headGroup.add(gleamR);

    // Expressive Cartoon Eyebrows
    const browGeo = new THREE.BoxGeometry(0.22, 0.06, 0.05);
    this.leftEyebrow = new THREE.Mesh(browGeo, hairMat);
    this.leftEyebrow.position.set(-0.22, 0.32, 0.52);
    this.leftEyebrow.rotation.z = -0.12;
    this.headGroup.add(this.leftEyebrow);

    this.rightEyebrow = new THREE.Mesh(browGeo, hairMat);
    this.rightEyebrow.position.set(0.22, 0.32, 0.52);
    this.rightEyebrow.rotation.z = 0.12;
    this.headGroup.add(this.rightEyebrow);

    // Cute Round Red Nose (Salvatore / Wind Waker style)
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      createToonMaterial(0xf87171, { steps: 3 })
    );
    nose.position.set(0, -0.04, 0.58);
    this.headGroup.add(nose);

    // Friendly Cartoon Handlebar Mustache
    const stacheMat = hairMat;
    const stacheL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 6), stacheMat);
    stacheL.rotation.set(0, 0, -Math.PI / 2.3);
    stacheL.position.set(-0.16, -0.15, 0.54);
    this.headGroup.add(stacheL);

    const stacheR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 6), stacheMat);
    stacheR.rotation.set(0, 0, Math.PI / 2.3);
    stacheR.position.set(0.16, -0.15, 0.54);
    this.headGroup.add(stacheR);

    // --- LEGS & CARTOON BOOTS ---
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.28, 0.85, 0);
    this.group.add(this.leftLegPivot);

    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.65, 8), overallsMat);
    legL.position.y = -0.3;
    legL.castShadow = true;
    this.leftLegPivot.add(legL);

    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.48), bootMat);
    bootL.position.set(0, -0.62, 0.08);
    bootL.castShadow = true;
    this.leftLegPivot.add(bootL);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.28, 0.85, 0);
    this.group.add(this.rightLegPivot);

    const legR = legL.clone();
    this.rightLegPivot.add(legR);
    const bootR = bootL.clone();
    this.rightLegPivot.add(bootR);

    // --- LEFT ARM (Cute expressive cartoon pose) ---
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.68, 0.62, 0);
    this.torsoGroup.add(this.leftArmPivot);

    const bicepL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.48, 8), sweaterMat);
    bicepL.position.y = -0.22;
    this.leftArmPivot.add(bicepL);

    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.45, 8), skinMat);
    forearmL.position.y = -0.6;
    this.leftArmPivot.add(forearmL);

    const fistL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), skinMat);
    fistL.position.y = -0.85;
    this.leftArmPivot.add(fistL);

    // --- RIGHT ARM & WIND WAKER SLEDGEHAMMER ---
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.68, 0.62, 0);
    this.torsoGroup.add(this.rightArmPivot);

    const bicepR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.48, 8), sweaterMat);
    bicepR.position.y = -0.22;
    this.rightArmPivot.add(bicepR);

    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.45, 8), skinMat);
    forearmR.position.y = -0.6;
    this.rightArmPivot.add(forearmR);

    const fistR = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), skinMat);
    fistR.position.y = -0.85;
    this.rightArmPivot.add(fistR);

    // Wind Waker Sledgehammer
    this.hammerGroup = new THREE.Group();
    this.hammerGroup.position.set(0, -0.85, 0);
    this.rightArmPivot.add(this.hammerGroup);

    // Stylized Oak Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.075, 1.85, 8),
      woodMat
    );
    handle.position.set(0, 0.35, 0.18);
    handle.rotation.x = Math.PI / 2.8;
    this.hammerGroup.add(handle);

    // Chunky Beveled Cartoon Hammerhead
    this.hammerHeadMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.52, 0.78),
      ironMat
    );
    this.hammerHeadMesh.position.set(0, 0.95, 0.48);
    this.hammerHeadMesh.castShadow = true;
    this.hammerGroup.add(this.hammerHeadMesh);

    // Gold trim band around hammerhead
    const hammerBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.14, 0.82),
      goldMat
    );
    hammerBand.position.set(0, 0.95, 0.48);
    this.hammerGroup.add(hammerBand);

    // Wind Waker White/Yellow Cartoon Swoosh Arc Mesh (Visible only during swing)
    const swooshGeo = new THREE.RingGeometry(0.8, 1.75, 18, 1, 0, Math.PI * 0.75);
    const swooshMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.swingSwooshMesh = new THREE.Mesh(swooshGeo, swooshMat);
    this.swingSwooshMesh.rotation.set(Math.PI / 2, 0, Math.PI / 4);
    this.swingSwooshMesh.position.set(0, 0.5, 0.8);
    this.hammerGroup.add(this.swingSwooshMesh);

    // Wind Waker Contact Shadow (Dark crisp circular blob)
    const shadowGeo = new THREE.CircleGeometry(0.9, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x1e1b4b,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.group.add(shadow);
  }

  /**
   * Trigger the heavy sledgehammer smash arc!
   */
  public triggerSmash(): boolean {
    if (this.isSmashing) return false;
    this.isSmashing = true;
    this.smashTime = 0;
    return true;
  }

  public getIsSmashing(): boolean {
    return this.isSmashing;
  }

  /**
   * Check if hammer is in the active destruction impact phase
   */
  public isInImpactPhase(): boolean {
    if (!this.isSmashing) return false;
    const progress = this.smashTime / this.smashDuration;
    return progress >= 0.35 && progress <= 0.8;
  }

  /**
   * Get world position of the hammerhead for collision detection
   */
  public getHammerWorldPosition(): THREE.Vector3 {
    const target = new THREE.Vector3();
    this.hammerHeadMesh.getWorldPosition(target);
    return target;
  }

  /**
   * Per-frame animation tick
   */
  public update(delta: number, vx: number) {
    this.currentSpeed = vx;

    // Lateral tilt when moving left/right (leaning into motion)
    const targetTilt = vx * 0.08;
    this.facingTilt = THREE.MathUtils.damp(this.facingTilt, targetTilt, 12, delta);
    this.group.rotation.z = this.facingTilt;
    this.group.rotation.y = Math.PI;

    // Wind Waker Expressive Eye Glance
    const pupilShiftX = THREE.MathUtils.clamp(vx * 0.02, -0.06, 0.06);
    this.leftPupil.position.x = -0.22 + pupilShiftX;
    this.rightPupil.position.x = 0.22 + pupilShiftX;

    // Idle Eye Blink
    this.eyeBlinkTimer += delta;
    if (this.eyeBlinkTimer > 3.2) {
      this.headGroup.scale.y = 0.85;
      if (this.eyeBlinkTimer > 3.32) {
        this.eyeBlinkTimer = 0;
      }
    } else {
      this.headGroup.scale.y = 1.0;
    }

    // Running leg & arm bob
    if (Math.abs(vx) > 0.1) {
      this.walkCycle += delta * Math.abs(vx) * 1.5;
      const legAngle = Math.sin(this.walkCycle) * 0.65;
      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;

      this.torsoGroup.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.1;
      this.headGroup.rotation.z = Math.sin(this.walkCycle) * 0.06;
      this.leftArmPivot.rotation.x = -legAngle * 0.7;
    } else {
      // Idle settle (gentle cartoon breathing)
      this.walkCycle += delta * 2.2;
      this.leftLegPivot.rotation.x = THREE.MathUtils.damp(this.leftLegPivot.rotation.x, 0, 8, delta);
      this.rightLegPivot.rotation.x = THREE.MathUtils.damp(this.rightLegPivot.rotation.x, 0, 8, delta);
      this.torsoGroup.position.y = 1.35 + Math.sin(this.walkCycle) * 0.04;
      this.headGroup.rotation.z = THREE.MathUtils.damp(this.headGroup.rotation.z, 0, 6, delta);
      this.leftArmPivot.rotation.x = THREE.MathUtils.damp(this.leftArmPivot.rotation.x, 0.12, 6, delta);
    }

    // Wind Waker Smash Animation Arc
    if (this.isSmashing) {
      this.smashTime += delta;
      const progress = this.smashTime / this.smashDuration;

      // Eyebrow furrow during smash
      this.leftEyebrow.rotation.z = 0.25;
      this.rightEyebrow.rotation.z = -0.25;

      if (progress <= 0.32) {
        // Wind-up: pull hammer back high over shoulder
        const windUp = progress / 0.32;
        this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(0, -Math.PI * 0.85, windUp);
        this.rightArmPivot.rotation.z = THREE.MathUtils.lerp(0, -0.35, windUp);
        this.torsoGroup.rotation.x = THREE.MathUtils.lerp(0, -0.2, windUp);
        (this.swingSwooshMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      } else if (progress <= 0.68) {
        // Downward SLAM with Wind Waker swoosh flash!
        const slam = (progress - 0.32) / 0.36;
        this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(-Math.PI * 0.85, Math.PI * 0.48, slam);
        this.rightArmPivot.rotation.z = THREE.MathUtils.lerp(-0.35, 0.12, slam);
        this.torsoGroup.rotation.x = THREE.MathUtils.lerp(-0.2, 0.28, slam);
        (this.swingSwooshMesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(slam * Math.PI) * 0.85;
      } else if (progress <= 1.0) {
        // Recovery
        const recover = (progress - 0.68) / 0.32;
        this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.48, 0, recover);
        this.rightArmPivot.rotation.z = THREE.MathUtils.lerp(0.12, 0, recover);
        this.torsoGroup.rotation.x = THREE.MathUtils.lerp(0.28, 0, recover);
        (this.swingSwooshMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      } else {
        this.isSmashing = false;
        this.rightArmPivot.rotation.set(0, 0, 0);
        this.torsoGroup.rotation.x = 0;
        (this.swingSwooshMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        this.leftEyebrow.rotation.z = -0.12;
        this.rightEyebrow.rotation.z = 0.12;
      }
    } else {
      this.rightArmPivot.rotation.x = THREE.MathUtils.damp(this.rightArmPivot.rotation.x, 0, 10, delta);
      this.rightArmPivot.rotation.z = THREE.MathUtils.damp(this.rightArmPivot.rotation.z, 0, 10, delta);
      (this.swingSwooshMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  public dispose() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}
