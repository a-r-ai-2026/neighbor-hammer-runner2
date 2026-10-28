import * as THREE from 'three';
import { FixtureSpec } from './types';

export class ArchitecturalFixture {
  public group: THREE.Group;
  public spec: FixtureSpec;
  private glassPanels: THREE.Mesh[] = [];
  private crackOverlays: THREE.Group[] = [];
  private glassMat: THREE.MeshPhysicalMaterial;
  private crackMatStage1: THREE.LineBasicMaterial;
  private crackMatStage2: THREE.LineBasicMaterial;
  private currentDamageStage: number = 0; // 0, 1, 2, 3

  constructor(spec: FixtureSpec) {
    this.spec = spec;
    this.group = new THREE.Group();

    // Physically-based realistic glass material
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 1.0,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      thickness: 0.35,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      attenuationColor: new THREE.Color(0xbae6fd),
      attenuationDistance: 1.2,
      depthWrite: false,
    });

    // Crack materials
    this.crackMatStage1 = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });

    this.crackMatStage2 = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      linewidth: 3,
    });

    this.buildFixture();
  }

  private getFrameMaterial(): THREE.MeshStandardMaterial {
    switch (this.spec.frameMaterial) {
      case 'bronze':
        return new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.75,
          roughness: 0.35,
        });
      case 'natural_wood':
        return new THREE.MeshStandardMaterial({
          color: 0x78350f,
          metalness: 0.05,
          roughness: 0.7,
        });
      case 'dark_slate':
        return new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.4,
          roughness: 0.4,
        });
      case 'pvc_white':
      default:
        return new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          metalness: 0.1,
          roughness: 0.3,
        });
    }
  }

  private buildFixture() {
    const { width, height, depth } = this.spec;
    const frameMat = this.getFrameMaterial();
    const frameThickness = 0.22;

    // Outer Main Frame (Top, Bottom, Left, Right)
    // Bottom Sill (extra chunky)
    const sillGeo = new THREE.BoxGeometry(width + 0.4, 0.35, depth + 0.25);
    const sill = new THREE.Mesh(sillGeo, frameMat);
    sill.position.set(0, 0.175, 0);
    sill.castShadow = true;
    sill.receiveShadow = true;
    this.group.add(sill);

    // Top Header
    const topGeo = new THREE.BoxGeometry(width + 0.2, frameThickness, depth);
    const top = new THREE.Mesh(topGeo, frameMat);
    top.position.set(0, height - frameThickness / 2, 0);
    top.castShadow = true;
    this.group.add(top);

    // Left Jamb
    const jambGeo = new THREE.BoxGeometry(frameThickness, height, depth);
    const leftJamb = new THREE.Mesh(jambGeo, frameMat);
    leftJamb.position.set(-width / 2 + frameThickness / 2, height / 2, 0);
    leftJamb.castShadow = true;
    this.group.add(leftJamb);

    // Right Jamb
    const rightJamb = leftJamb.clone();
    rightJamb.position.x = width / 2 - frameThickness / 2;
    this.group.add(rightJamb);

    // Handle distinctive architectural features per window/door type
    switch (this.spec.id) {
      case 'sliding_doors':
      case 'french_doors':
        this.buildPatioDoors(width, height, depth, frameMat, frameThickness);
        break;
      case 'bay_window':
        this.buildBayWindow(width, height, depth, frameMat, frameThickness);
        break;
      case 'bow_window':
        this.buildBowWindow(width, height, depth, frameMat, frameThickness);
        break;
      case 'double_hung_window':
        this.buildDoubleHung(width, height, depth, frameMat, frameThickness);
        break;
      case 'casement_window':
      case 'gliding_window':
      case 'coastal_impact_window':
      case 'awning_window':
      case 'picture_window':
      case 'specialty_window':
      default:
        this.buildStandardOrSpecialty(width, height, depth, frameMat, frameThickness);
        break;
    }
  }

  private buildPatioDoors(width: number, height: number, depth: number, frameMat: THREE.Material, ft: number) {
    const doorWidth = (width - ft * 3) / 2;
    const doorHeight = height - ft * 2;
    const panelY = height / 2;

    // Track rail at bottom
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const track = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, depth * 0.7), trackMat);
    track.position.set(0, 0.38, 0);
    this.group.add(track);

    // Left Door Sash
    const leftSashX = -width / 4 + ft / 4;
    this.createDoorSash(leftSashX, panelY, doorWidth, doorHeight, depth * 0.75, frameMat, true);

    // Right Door Sash
    const rightSashX = width / 4 - ft / 4;
    this.createDoorSash(rightSashX, panelY, doorWidth, doorHeight, depth * 0.75, frameMat, false);
  }

  private createDoorSash(x: number, y: number, w: number, h: number, d: number, frameMat: THREE.Material, hasHandleLeft: boolean) {
    const sash = new THREE.Group();
    sash.position.set(x, y, 0);
    this.group.add(sash);

    const stileThickness = 0.16;
    // Sash frame
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(w, stileThickness, d), frameMat);
    topBar.position.y = h / 2 - stileThickness / 2;
    sash.add(topBar);

    const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(w, stileThickness * 1.5, d), frameMat);
    bottomBar.position.y = -h / 2 + (stileThickness * 1.5) / 2;
    sash.add(bottomBar);

    const leftStile = new THREE.Mesh(new THREE.BoxGeometry(stileThickness, h, d), frameMat);
    leftStile.position.x = -w / 2 + stileThickness / 2;
    sash.add(leftStile);

    const rightStile = leftStile.clone();
    rightStile.position.x = w / 2 - stileThickness / 2;
    sash.add(rightStile);

    // Glass pane inside sash
    const glassW = w - stileThickness * 2;
    const glassH = h - stileThickness * 2.5;
    const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(glassW, glassH), this.glassMat);
    glassMesh.position.set(0, 0, 0);
    sash.add(glassMesh);
    this.glassPanels.push(glassMesh);

    // Divided lites / French door mullions if specified
    if (this.spec.glassStyle === 'divided_lites') {
      const gridMat = frameMat;
      for (let i = 1; i <= 3; i++) {
        const horizGrid = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.05, 0.08), gridMat);
        horizGrid.position.set(0, -glassH / 2 + (glassH / 4) * i, 0.02);
        sash.add(horizGrid);
      }
      const vertGrid = new THREE.Mesh(new THREE.BoxGeometry(0.05, glassH, 0.08), gridMat);
      vertGrid.position.set(0, 0, 0.02);
      sash.add(vertGrid);
    }

    // Door Handle Lever
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(hasHandleLeft ? w / 2 - 0.25 : -w / 2 + 0.25, 0, d / 2 + 0.06);
    sash.add(handle);

    // Crack Overlay group for this panel
    const crackGroup = new THREE.Group();
    crackGroup.position.set(x, y, 0.03);
    this.group.add(crackGroup);
    this.crackOverlays.push(crackGroup);
  }

  private buildBayWindow(width: number, height: number, depth: number, frameMat: THREE.Material, ft: number) {
    const centerW = width * 0.5;
    const sideW = width * 0.28;
    const h = height - ft * 2;
    const y = height / 2;

    // Center Panel
    this.createWindowPane(0, y, 0, centerW, h, frameMat);

    // Angled Left Bay
    const leftBay = new THREE.Group();
    leftBay.position.set(-centerW / 2 - (sideW * Math.cos(Math.PI / 4)) / 2, y, (sideW * Math.sin(Math.PI / 4)) / 2);
    leftBay.rotation.y = Math.PI / 4;
    this.group.add(leftBay);
    this.createSubPane(leftBay, sideW, h, frameMat);

    // Angled Right Bay
    const rightBay = new THREE.Group();
    rightBay.position.set(centerW / 2 + (sideW * Math.cos(Math.PI / 4)) / 2, y, (sideW * Math.sin(Math.PI / 4)) / 2);
    rightBay.rotation.y = -Math.PI / 4;
    this.group.add(rightBay);
    this.createSubPane(rightBay, sideW, h, frameMat);
  }

  private buildBowWindow(width: number, height: number, depth: number, frameMat: THREE.Material, ft: number) {
    const panelCount = 4;
    const panelW = width / panelCount;
    const h = height - ft * 2;
    const y = height / 2;

    for (let i = 0; i < panelCount; i++) {
      const angle = (i - (panelCount - 1) / 2) * 0.22;
      const px = (i - (panelCount - 1) / 2) * panelW * 0.95;
      const pz = Math.cos(angle) * 0.8 - 0.8;

      const subGroup = new THREE.Group();
      subGroup.position.set(px, y, pz);
      subGroup.rotation.y = -angle;
      this.group.add(subGroup);
      this.createSubPane(subGroup, panelW * 0.92, h, frameMat);
    }
  }

  private buildDoubleHung(width: number, height: number, depth: number, frameMat: THREE.Material, ft: number) {
    const paneW = width - ft * 2;
    const halfH = (height - ft * 3) / 2;

    // Upper Sash
    const upperY = height * 0.72;
    this.createWindowPane(0, upperY, -0.06, paneW, halfH, frameMat);

    // Lower Sash (slightly stepped forward)
    const lowerY = height * 0.28;
    this.createWindowPane(0, lowerY, 0.06, paneW, halfH, frameMat);
  }

  private buildStandardOrSpecialty(width: number, height: number, depth: number, frameMat: THREE.Material, ft: number) {
    const paneW = width - ft * 2;
    const paneH = height - ft * 2;
    const y = height / 2;

    if (this.spec.id === 'specialty_window') {
      // Cathedral Arch Top
      const archRadius = paneW / 2;
      const archMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(archRadius, archRadius, 0.15, 24, 1, false, 0, Math.PI),
        frameMat
      );
      archMesh.rotation.z = Math.PI / 2;
      archMesh.position.set(0, height - 0.2, 0);
      this.group.add(archMesh);
    }

    if (this.spec.id === 'coastal_impact_window') {
      // Heavy storm corner brackets & reinforced middle strut
      const bracketMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.3, paneH, depth * 0.8), bracketMat);
      strut.position.set(0, y, 0);
      this.group.add(strut);
    }

    this.createWindowPane(0, y, 0, paneW, paneH, frameMat);
  }

  private createWindowPane(x: number, y: number, z: number, w: number, h: number, frameMat: THREE.Material) {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.glassMat);
    glass.position.set(x, y, z);
    this.group.add(glass);
    this.glassPanels.push(glass);

    // Divided lite grid if required
    if (this.spec.glassStyle === 'divided_lites') {
      const vGrid = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.08), frameMat);
      vGrid.position.set(x, y, z + 0.02);
      this.group.add(vGrid);

      const hGrid = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.08), frameMat);
      hGrid.position.set(x, y, z + 0.02);
      this.group.add(hGrid);
    }

    // Associated crack overlay
    const crackGroup = new THREE.Group();
    crackGroup.position.set(x, y, z + 0.03);
    this.group.add(crackGroup);
    this.crackOverlays.push(crackGroup);
  }

  private createSubPane(parent: THREE.Group, w: number, h: number, frameMat: THREE.Material) {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.glassMat);
    parent.add(glass);
    this.glassPanels.push(glass);

    const crackGroup = new THREE.Group();
    crackGroup.position.set(0, 0, 0.03);
    parent.add(crackGroup);
    this.crackOverlays.push(crackGroup);
  }

  /**
   * Apply damage crack stage (0: clean, 1: initial fracture, 2: heavy spiderweb, 3: shattered)
   */
  public setDamageStage(stage: number) {
    this.currentDamageStage = stage;

    // Clear existing crack lines
    this.crackOverlays.forEach((grp) => {
      while (grp.children.length > 0) {
        const obj = grp.children[0];
        grp.remove(obj);
      }
    });

    if (stage === 0) {
      // Pristine
      this.glassPanels.forEach((p) => (p.visible = true));
      return;
    }

    if (stage === 1) {
      // Stage 1: Fine hairline spiderweb center fracture
      this.crackOverlays.forEach((grp) => {
        const lines = this.generateSpiderwebCrack(0.8, 6, this.crackMatStage1);
        grp.add(lines);
      });
    } else if (stage === 2) {
      // Stage 2: Heavy multi-branching shattered spiderweb network
      this.crackOverlays.forEach((grp) => {
        const lines1 = this.generateSpiderwebCrack(1.4, 10, this.crackMatStage2);
        const lines2 = this.generateSpiderwebCrack(1.8, 12, this.crackMatStage2);
        grp.add(lines1);
        grp.add(lines2);
      });
    } else if (stage >= 3) {
      // Stage 3: Shattered! Hide solid glass panes (burst into particle fragments)
      this.glassPanels.forEach((p) => (p.visible = false));
    }
  }

  private generateSpiderwebCrack(radius: number, spokes: number, mat: THREE.Material): THREE.LineSegments {
    const points: THREE.Vector3[] = [];
    const cx = (Math.random() - 0.5) * 0.4;
    const cy = (Math.random() - 0.5) * 0.4;

    // Radiating jagged spokes
    const spokeAngles: number[] = [];
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      spokeAngles.push(angle);

      let prevPoint = new THREE.Vector3(cx, cy, 0);
      const segments = 4;
      for (let s = 1; s <= segments; s++) {
        const r = (radius / segments) * s;
        const jitter = (Math.random() - 0.5) * 0.15;
        const nextPoint = new THREE.Vector3(
          cx + Math.cos(angle + jitter) * r,
          cy + Math.sin(angle + jitter) * r,
          0
        );
        points.push(prevPoint);
        points.push(nextPoint);
        prevPoint = nextPoint;
      }
    }

    // Concentric spiderweb rings
    const rings = 3;
    for (let r = 1; r <= rings; r++) {
      const ringRadius = (radius / (rings + 1)) * r;
      for (let s = 0; s < spokes; s++) {
        const a1 = spokeAngles[s];
        const a2 = spokeAngles[(s + 1) % spokes];
        points.push(
          new THREE.Vector3(cx + Math.cos(a1) * ringRadius, cy + Math.sin(a1) * ringRadius, 0)
        );
        points.push(
          new THREE.Vector3(cx + Math.cos(a2) * ringRadius, cy + Math.sin(a2) * ringRadius, 0)
        );
      }
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.LineSegments(geo, mat);
  }

  public getDamageStage(): number {
    return this.currentDamageStage;
  }
}
