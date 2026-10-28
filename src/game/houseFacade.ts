import * as THREE from 'three';
import { FixtureSpec } from './types';

export class HouseFacade {
  public group: THREE.Group;
  private currentFixture: FixtureSpec | null = null;
  private interiorGroup: THREE.Group;
  private exteriorWallGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.interiorGroup = new THREE.Group();
    this.exteriorWallGroup = new THREE.Group();

    this.group.add(this.interiorGroup);
    this.group.add(this.exteriorWallGroup);
  }

  /**
   * Rebuild or adjust the house facade around the active window/patio door
   */
  public updateFixture(fixture: FixtureSpec) {
    this.currentFixture = fixture;

    // Clear previous geometries
    while (this.exteriorWallGroup.children.length > 0) {
      const obj = this.exteriorWallGroup.children[0];
      this.exteriorWallGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
      }
    }
    while (this.interiorGroup.children.length > 0) {
      const obj = this.interiorGroup.children[0];
      this.interiorGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
      }
    }

    this.buildHouseWall(fixture);
    this.buildSubtleInterior(fixture);
  }

  private buildHouseWall(fixture: FixtureSpec) {
    const wallTotalWidth = 42;
    const wallZ = 0.25;

    // Siding material (crisp suburban horizontal clapboard siding)
    const sidingMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Modern slate grey siding
      roughness: 0.75,
      metalness: 0.05,
    });

    // White trim and casing material
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Foundation concrete / stone water table material
    const foundationMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Roof shingle material for side wing eaves
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
    });

    // Copper / bronze gutter material
    const gutterMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.6,
      roughness: 0.3,
    });

    const fw = fixture.width;
    const fh = fixture.height;
    const isDoor = fixture.category === 'door' || fixture.isPatioDoor;

    // Opening coordinates
    const openingLeft = -fw / 2;
    const openingRight = fw / 2;
    const openingBottom = isDoor ? 0.05 : 0.45;
    const openingTop = openingBottom + fh;

    // Flanking side wall height (comfortably frames the window on the sides without occluding camera)
    const sideWallHeight = Math.max(5.5, openingTop + 1.2);

    // 1. Foundation Base Wall (Runs full width at bottom ground level)
    const foundHeight = 0.65;
    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(wallTotalWidth, foundHeight, 0.45),
      foundationMat
    );
    foundation.position.set(0, foundHeight / 2, wallZ);
    foundation.receiveShadow = true;
    this.exteriorWallGroup.add(foundation);

    // Decorative water table trim cap above foundation
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(wallTotalWidth + 0.2, 0.12, 0.5),
      trimMat
    );
    cap.position.set(0, foundHeight + 0.06, wallZ + 0.02);
    this.exteriorWallGroup.add(cap);

    // 2. Left Exterior Wall Wing (Side of house to the left of window)
    const leftWidth = (wallTotalWidth - fw) / 2;
    const leftWallHeight = sideWallHeight - foundHeight;
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftWidth, leftWallHeight, 0.35),
      sidingMat
    );
    leftWall.position.set(-wallTotalWidth / 2 + leftWidth / 2, foundHeight + leftWallHeight / 2, wallZ);
    leftWall.receiveShadow = true;
    this.exteriorWallGroup.add(leftWall);

    // Add horizontal siding reveal grooves on Left Wall
    for (let sy = foundHeight + 0.3; sy < sideWallHeight; sy += 0.42) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(leftWidth, 0.04, 0.38), sidingMat);
      plank.position.set(-wallTotalWidth / 2 + leftWidth / 2, sy, wallZ + 0.015);
      this.exteriorWallGroup.add(plank);
    }

    // 3. Right Exterior Wall Wing (Side of house to the right of window)
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftWidth, leftWallHeight, 0.35),
      sidingMat
    );
    rightWall.position.set(wallTotalWidth / 2 - leftWidth / 2, foundHeight + leftWallHeight / 2, wallZ);
    rightWall.receiveShadow = true;
    this.exteriorWallGroup.add(rightWall);

    // Add horizontal siding reveal grooves on Right Wall
    for (let sy = foundHeight + 0.3; sy < sideWallHeight; sy += 0.42) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(leftWidth, 0.04, 0.38), sidingMat);
      plank.position.set(wallTotalWidth / 2 - leftWidth / 2, sy, wallZ + 0.015);
      this.exteriorWallGroup.add(plank);
    }

    // 4. Wall Section Under Window (if window is raised above foundation)
    if (!isDoor && openingBottom > foundHeight) {
      const underHeight = openingBottom - foundHeight;
      const underWall = new THREE.Mesh(
        new THREE.BoxGeometry(fw, underHeight, 0.35),
        sidingMat
      );
      underWall.position.set(0, foundHeight + underHeight / 2, wallZ);
      underWall.receiveShadow = true;
      this.exteriorWallGroup.add(underWall);

      for (let sy = foundHeight + 0.2; sy < openingBottom; sy += 0.38) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.04, 0.38), sidingMat);
        plank.position.set(0, sy, wallZ + 0.015);
        this.exteriorWallGroup.add(plank);
      }
    }

    // 5. Architectural Window Header Casing & Crown Trim (Framing top of window without blocking view)
    const casingThickness = 0.28;
    const casingDepth = 0.12;

    // Header Trim / Drip Cap directly above the window sash
    const headerCasing = new THREE.Mesh(
      new THREE.BoxGeometry(fw + 0.7, casingThickness, casingDepth),
      trimMat
    );
    headerCasing.position.set(0, openingTop + casingThickness / 2, wallZ - 0.14);
    headerCasing.castShadow = true;
    this.exteriorWallGroup.add(headerCasing);

    // Decorative Crown Pediment above Header
    const pediment = new THREE.Mesh(
      new THREE.BoxGeometry(fw + 0.95, 0.14, casingDepth + 0.08),
      trimMat
    );
    pediment.position.set(0, openingTop + casingThickness + 0.07, wallZ - 0.16);
    pediment.castShadow = true;
    this.exteriorWallGroup.add(pediment);

    // Left Jamb Casing
    const leftCasing = new THREE.Mesh(
      new THREE.BoxGeometry(casingThickness, fh, casingDepth),
      trimMat
    );
    leftCasing.position.set(openingLeft - casingThickness / 2, openingBottom + fh / 2, wallZ - 0.14);
    leftCasing.castShadow = true;
    this.exteriorWallGroup.add(leftCasing);

    // Right Jamb Casing
    const rightCasing = leftCasing.clone();
    rightCasing.position.x = openingRight + casingThickness / 2;
    this.exteriorWallGroup.add(rightCasing);

    // Bottom Sill / Apron Trim
    if (!isDoor) {
      const sillTrim = new THREE.Mesh(
        new THREE.BoxGeometry(fw + 0.65, 0.18, 0.22),
        trimMat
      );
      sillTrim.position.set(0, openingBottom - 0.09, wallZ - 0.18);
      sillTrim.castShadow = true;
      this.exteriorWallGroup.add(sillTrim);
    }

    // 6. Decorative Shutters on left and right for standard windows
    if (!isDoor && fw <= 8.5) {
      const shutterMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a, // Classic colonial navy blue shutters
        roughness: 0.5,
      });
      const shutterWidth = 0.85;
      const leftShutter = new THREE.Mesh(
        new THREE.BoxGeometry(shutterWidth, fh * 0.95, 0.08),
        shutterMat
      );
      leftShutter.position.set(openingLeft - casingThickness - shutterWidth / 2 - 0.06, openingBottom + fh / 2, wallZ - 0.14);
      leftShutter.castShadow = true;
      this.exteriorWallGroup.add(leftShutter);

      // Louvers on left shutter
      for (let ly = -fh * 0.42; ly <= fh * 0.42; ly += 0.22) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(shutterWidth - 0.1, 0.04, 0.03), trimMat);
        louver.position.set(leftShutter.position.x, leftShutter.position.y + ly, wallZ - 0.19);
        this.exteriorWallGroup.add(louver);
      }

      const rightShutter = leftShutter.clone();
      rightShutter.position.x = openingRight + casingThickness + shutterWidth / 2 + 0.06;
      this.exteriorWallGroup.add(rightShutter);

      // Louvers on right shutter
      for (let ly = -fh * 0.42; ly <= fh * 0.42; ly += 0.22) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(shutterWidth - 0.1, 0.04, 0.03), trimMat);
        louver.position.set(rightShutter.position.x, rightShutter.position.y + ly, wallZ - 0.19);
        this.exteriorWallGroup.add(louver);
      }
    }

    // 7. Outdoor Carriage Lantern Sconces (Flanking left and right on the house wall)
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const lanternGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });

    const sconceOffsets = [
      openingLeft - casingThickness - 1.4,
      openingRight + casingThickness + 1.4,
    ];

    sconceOffsets.forEach((sx) => {
      const sconceGroup = new THREE.Group();
      sconceGroup.position.set(sx, openingBottom + fh * 0.65, wallZ - 0.16);

      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.22), lanternMat);
      sconceGroup.add(bracket);

      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.4, 6), lanternMat);
      cage.position.set(0, 0, -0.2);
      sconceGroup.add(cage);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lanternGlowMat);
      bulb.position.set(0, 0, -0.2);
      sconceGroup.add(bulb);

      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.16, 6), lanternMat);
      hat.position.set(0, 0.25, -0.2);
      sconceGroup.add(hat);

      this.exteriorWallGroup.add(sconceGroup);
    });

    // 8. Side Wing Rooflines and Gutters (Only on the left and right wings, leaving the center clear)
    const buildWingRoof = (centerX: number, width: number) => {
      const eavesY = sideWallHeight;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.18, 1.4), trimMat);
      roof.position.set(centerX, eavesY + 0.09, wallZ - 0.2);
      this.exteriorWallGroup.add(roof);

      const slopedRoof = new THREE.Mesh(new THREE.PlaneGeometry(width + 0.8, 3.2), roofMat);
      slopedRoof.rotation.x = Math.PI / 5;
      slopedRoof.position.set(centerX, eavesY + 0.8, wallZ + 0.8);
      this.exteriorWallGroup.add(slopedRoof);

      const gutter = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.16, 0.14), gutterMat);
      gutter.position.set(centerX, eavesY + 0.05, wallZ - 0.85);
      this.exteriorWallGroup.add(gutter);
    };

    const leftWingCenter = -wallTotalWidth / 2 + leftWidth / 2;
    const rightWingCenter = wallTotalWidth / 2 - leftWidth / 2;
    buildWingRoof(leftWingCenter, leftWidth);
    buildWingRoof(rightWingCenter, leftWidth);

    // 9. Patio Platform Deck for Doors or Foundation Garden Beds for Windows
    if (isDoor) {
      const deckMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, // Warm cedar deck
        roughness: 0.65,
        metalness: 0.05,
      });
      const deckWidth = fw + 3.5;
      const deckDepth = 4.0;
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(deckWidth, 0.14, deckDepth),
        deckMat
      );
      deck.position.set(0, 0.07, wallZ - deckDepth / 2 - 0.08);
      deck.receiveShadow = true;
      this.exteriorWallGroup.add(deck);

      for (let dz = -deckDepth + 0.3; dz <= 0; dz += 0.35) {
        const seam = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 0.02, 0.02), trimMat);
        seam.position.set(0, 0.145, wallZ + dz);
        this.exteriorWallGroup.add(seam);
      }
    } else {
      const shrubMat = new THREE.MeshStandardMaterial({
        color: 0x166534,
        roughness: 0.9,
      });
      const shrubPositions = [
        openingLeft - 1.2,
        openingLeft + fw * 0.25,
        openingRight - fw * 0.25,
        openingRight + 1.2,
      ];
      shrubPositions.forEach((bx) => {
        const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), shrubMat);
        shrub.scale.set(1.2, 0.75, 0.9);
        shrub.position.set(bx, 0.42, wallZ - 0.45);
        shrub.castShadow = true;
        this.exteriorWallGroup.add(shrub);
      });
    }
  }

  /**
   * Subtle interior elements behind the window glass without blocking camera sightlines
   */
  private buildSubtleInterior(fixture: FixtureSpec) {
    const fw = fixture.width;
    const fh = fixture.height;
    const isDoor = fixture.category === 'door' || fixture.isPatioDoor;
    const openingBottom = isDoor ? 0.05 : 0.45;
    const openingY = openingBottom + fh / 2;

    // Cozy mahogany floor plane inside the room
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.5,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(fw + 4.0, 4.0), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, openingBottom - 0.02, 2.2);
    this.interiorGroup.add(floor);

    // Curtains framing the interior edges
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Ruby red velvet curtains
      roughness: 0.7,
    });
    const curtainW = 0.5;
    const leftCurtain = new THREE.Mesh(
      new THREE.BoxGeometry(curtainW, fh * 0.95, 0.15),
      curtainMat
    );
    leftCurtain.position.set(-fw / 2 + curtainW / 2 + 0.1, openingY, 0.45);
    this.interiorGroup.add(leftCurtain);

    const rightCurtain = leftCurtain.clone();
    rightCurtain.position.x = fw / 2 - curtainW / 2 - 0.1;
    this.interiorGroup.add(rightCurtain);
  }

  public dispose() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}
