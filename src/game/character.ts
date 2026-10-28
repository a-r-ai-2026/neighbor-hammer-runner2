import * as THREE from 'three';

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

  // Animation states
  private isSmashing: boolean = false;
  private smashTime: number = 0;
  private readonly smashDuration: number = 0.28;
  private walkCycle: number = 0;
  private currentSpeed: number = 0;
  private facingTilt: number = 0;

  constructor() {
    this.group = new THREE.Group();
    // Face forward down the lane towards oncoming hazards (away from the window behind him)
    this.group.rotation.y = Math.PI;

    // Reusable Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5b596,
      roughness: 0.6,
      metalness: 0.05,
    });

    const sweaterMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Crimson red knit sweater
      roughness: 0.85,
      metalness: 0.0,
    });

    const dungareesMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Denim blue work overalls
      roughness: 0.8,
      metalness: 0.05,
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Leather work boots
      roughness: 0.5,
      metalness: 0.1,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Rich brown hair & mustache
      roughness: 0.9,
      metalness: 0.0,
    });

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // Oak hardwood hammer handle
      roughness: 0.7,
      metalness: 0.05,
    });

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Heavy forged steel hammerhead
      roughness: 0.35,
      metalness: 0.85,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Polished brass accents
      roughness: 0.25,
      metalness: 0.9,
    });

    // --- TORSO & WAIST (Wreck-It Ralph broad burly frame) ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 1.35;
    this.group.add(this.torsoGroup);

    // Broad upper torso (sweater)
    const upperChest = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.9, 0.9),
      sweaterMat
    );
    upperChest.position.y = 0.45;
    upperChest.castShadow = true;
    this.torsoGroup.add(upperChest);

    // Collar detail
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 0.18, 12),
      sweaterMat
    );
    collar.position.y = 0.92;
    this.torsoGroup.add(collar);

    // Lower belly / dungarees
    const belly = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.7, 0.85),
      dungareesMat
    );
    belly.position.y = -0.15;
    belly.castShadow = true;
    this.torsoGroup.add(belly);

    // Suspender straps and brass buttons
    const suspenderL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.04), dungareesMat);
    suspenderL.position.set(-0.35, 0.35, 0.46);
    this.torsoGroup.add(suspenderL);

    const suspenderR = suspenderL.clone();
    suspenderR.position.x = 0.35;
    this.torsoGroup.add(suspenderR);

    const buttonL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), brassMat);
    buttonL.rotation.x = Math.PI / 2;
    buttonL.position.set(-0.35, 0.1, 0.49);
    this.torsoGroup.add(buttonL);

    const buttonR = buttonL.clone();
    buttonR.position.x = 0.35;
    this.torsoGroup.add(buttonR);

    // --- HEAD & STYLIZED FACE ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.25, 0.05);
    this.torsoGroup.add(this.headGroup);

    // Main head shape
    const headMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.7, 0.65),
      skinMat
    );
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Friendly cartoon nose
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12),
      skinMat
    );
    nose.position.set(0, -0.02, 0.36);
    this.headGroup.add(nose);

    // Thick cozy mustache
    const mustacheL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.28, 8),
      hairMat
    );
    mustacheL.rotation.z = Math.PI / 2.6;
    mustacheL.rotation.x = Math.PI / 8;
    mustacheL.position.set(-0.13, -0.14, 0.36);
    this.headGroup.add(mustacheL);

    const mustacheR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.28, 8),
      hairMat
    );
    mustacheR.rotation.z = -Math.PI / 2.6;
    mustacheR.rotation.x = Math.PI / 8;
    mustacheR.position.set(0.13, -0.14, 0.36);
    this.headGroup.add(mustacheR);

    // Bushy cartoon hair
    const hairTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.3, 0.72),
      hairMat
    );
    hairTop.position.set(0, 0.38, -0.02);
    this.headGroup.add(hairTop);

    const hairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.45, 0.2),
      hairMat
    );
    hairBack.position.set(0, 0.1, -0.32);
    this.headGroup.add(hairBack);

    // Cartoon eyes
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeWhiteMat);
    eyeL.position.set(-0.16, 0.12, 0.33);
    this.headGroup.add(eyeL);
    const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pupilMat);
    pupilL.position.set(-0.16, 0.12, 0.38);
    this.headGroup.add(pupilL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.16;
    this.headGroup.add(eyeR);
    const pupilR = pupilL.clone();
    pupilR.position.x = 0.16;
    this.headGroup.add(pupilR);

    // --- LEGS & BOOTS ---
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.38, 0.9, 0);
    this.group.add(this.leftLegPivot);

    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.65, 10), dungareesMat);
    legL.position.y = -0.32;
    legL.castShadow = true;
    this.leftLegPivot.add(legL);

    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.52), bootMat);
    bootL.position.set(0, -0.65, 0.08);
    bootL.castShadow = true;
    this.leftLegPivot.add(bootL);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.38, 0.9, 0);
    this.group.add(this.rightLegPivot);

    const legR = legL.clone();
    this.rightLegPivot.add(legR);
    const bootR = bootL.clone();
    this.rightLegPivot.add(bootR);

    // --- LEFT ARM (Idle / Balance) ---
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.85, 0.65, 0);
    this.torsoGroup.add(this.leftArmPivot);

    const bicepL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.55, 10), sweaterMat);
    bicepL.position.y = -0.25;
    this.leftArmPivot.add(bicepL);

    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.55, 10), skinMat);
    forearmL.position.y = -0.7;
    this.leftArmPivot.add(forearmL);

    const fistL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), skinMat);
    fistL.position.y = -1.0;
    this.leftArmPivot.add(fistL);

    // --- RIGHT ARM & SLEDGEHAMMER (The Smash Arm!) ---
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.85, 0.65, 0);
    this.torsoGroup.add(this.rightArmPivot);

    const bicepR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.55, 10), sweaterMat);
    bicepR.position.y = -0.25;
    this.rightArmPivot.add(bicepR);

    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.55, 10), skinMat);
    forearmR.position.y = -0.7;
    this.rightArmPivot.add(forearmR);

    const fistR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), skinMat);
    fistR.position.y = -1.0;
    this.rightArmPivot.add(fistR);

    // --- GIANT SLEDGEHAMMER ---
    this.hammerGroup = new THREE.Group();
    this.hammerGroup.position.set(0, -1.0, 0);
    this.rightArmPivot.add(this.hammerGroup);

    // Hardwood Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 1.9, 10),
      woodMat
    );
    handle.position.set(0, 0.35, 0.2);
    handle.rotation.x = Math.PI / 2.8;
    this.hammerGroup.add(handle);

    // Steel Hammerhead
    this.hammerHeadMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.55, 0.8),
      steelMat
    );
    this.hammerHeadMesh.position.set(0, 0.95, 0.52);
    this.hammerHeadMesh.castShadow = true;
    this.hammerGroup.add(this.hammerHeadMesh);

    // Brass collars and hazard bands on hammer
    const collarMesh1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10), brassMat);
    collarMesh1.position.set(0, 0.72, 0.39);
    collarMesh1.rotation.x = Math.PI / 2.8;
    this.hammerGroup.add(collarMesh1);

    // Soft contact shadow directly under Mr. Rogers
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
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
    // Impact phase occurs between 40% and 75% of the downward slam
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
    const targetTilt = vx * 0.06;
    this.facingTilt = THREE.MathUtils.damp(this.facingTilt, targetTilt, 12, delta);
    this.group.rotation.z = this.facingTilt;
    this.group.rotation.y = Math.PI;

    // Running leg & arm bob
    if (Math.abs(vx) > 0.1) {
      this.walkCycle += delta * Math.abs(vx) * 1.4;
      const legAngle = Math.sin(this.walkCycle) * 0.55;
      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;

      this.torsoGroup.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.08;
      this.leftArmPivot.rotation.x = -legAngle * 0.6;
    } else {
      // Idle settle
      this.walkCycle += delta * 2.0;
      this.leftLegPivot.rotation.x = THREE.MathUtils.damp(this.leftLegPivot.rotation.x, 0, 8, delta);
      this.rightLegPivot.rotation.x = THREE.MathUtils.damp(this.rightLegPivot.rotation.x, 0, 8, delta);
      this.torsoGroup.position.y = 1.35 + Math.sin(this.walkCycle) * 0.03;
      this.leftArmPivot.rotation.x = THREE.MathUtils.damp(this.leftArmPivot.rotation.x, 0.1, 6, delta);
    }

    // Smash Animation Arc
    if (this.isSmashing) {
      this.smashTime += delta;
      const progress = this.smashTime / this.smashDuration;

      if (progress <= 0.35) {
        // Wind-up: pull hammer back over shoulder
        const windUp = progress / 0.35;
        this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(0, -Math.PI * 0.8, windUp);
        this.rightArmPivot.rotation.z = THREE.MathUtils.lerp(0, -0.3, windUp);
        this.torsoGroup.rotation.x = THREE.MathUtils.lerp(0, -0.15, windUp);
      } else if (progress <= 0.65) {
        // Downward SLAM!
        const slam = (progress - 0.35) / 0.3;
        this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(-Math.PI * 0.8, Math.PI * 0.45, slam);
        this.rightArmPivot.rotation.z = THREE.MathUtils.lerp(-0.3, 0.1, slam);
        this.torsoGroup.rotation.x = THREE.MathUtils.lerp(-0.15, 0.25, slam);
      } else if (progress <= 1.0) {
        // Recovery back to ready position
        const recover = (progress - 0.65) / 0.35;
        this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.45, 0, recover);
        this.rightArmPivot.rotation.z = THREE.MathUtils.lerp(0.1, 0, recover);
        this.torsoGroup.rotation.x = THREE.MathUtils.lerp(0.25, 0, recover);
      } else {
        this.isSmashing = false;
        this.rightArmPivot.rotation.set(0, 0, 0);
        this.torsoGroup.rotation.x = 0;
      }
    } else {
      // Natural idle arm pose
      this.rightArmPivot.rotation.x = THREE.MathUtils.damp(this.rightArmPivot.rotation.x, 0, 10, delta);
      this.rightArmPivot.rotation.z = THREE.MathUtils.damp(this.rightArmPivot.rotation.z, 0, 10, delta);
    }
  }
}
