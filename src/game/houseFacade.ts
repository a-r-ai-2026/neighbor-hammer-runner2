import * as THREE from 'three';
import { FixtureSpec } from './types';
import { createToonMaterial } from './toonShading';

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
   * Rebuild or adjust the Wind Waker cottage facade around the active window/patio door
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

    // Wind Waker Cel-Shaded Materials
    const wallMat = createToonMaterial(0xfffbeb, { steps: 3 }); // Stucco cream wall
    const trimMat = createToonMaterial(0xf8fafc, { steps: 3 }); // Clean white trim
    const timberMat = createToonMaterial(0xb45309, { steps: 3 }); // Warm Wind Waker timber
    const foundationMat = createToonMaterial(0x94a3b8, { steps: 3 }); // Cobblestone base
    const roofMat = createToonMaterial(0xe11d48, { steps: 3 }); // Terracotta clay roof
    const shutterMat = createToonMaterial(0x38bdf8, { steps: 3 }); // Pastel sky blue shutters

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
      wallMat
    );
    leftWall.position.set(-wallTotalWidth / 2 + leftWidth / 2, foundHeight + leftWallHeight / 2, wallZ);
    leftWall.receiveShadow = true;
    this.exteriorWallGroup.add(leftWall);

    // Wind Waker Timber Beam accents on Left Wall
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.35, leftWallHeight, 0.4), timberMat);
    leftPost.position.set(openingLeft - 0.2, foundHeight + leftWallHeight / 2, wallZ);
    this.exteriorWallGroup.add(leftPost);

    // 3. Right Exterior Wall Wing (Side of house to the right of window)
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftWidth, leftWallHeight, 0.35),
      wallMat
    );
    rightWall.position.set(wallTotalWidth / 2 - leftWidth / 2, foundHeight + leftWallHeight / 2, wallZ);
    rightWall.receiveShadow = true;
    this.exteriorWallGroup.add(rightWall);

    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.35, leftWallHeight, 0.4), timberMat);
    rightPost.position.set(openingRight + 0.2, foundHeight + leftWallHeight / 2, wallZ);
    this.exteriorWallGroup.add(rightPost);

    // 4. Wall Section Under Window (if window is raised above foundation)
    if (!isDoor && openingBottom > foundHeight) {
      const underHeight = openingBottom - foundHeight;
      const underWall = new THREE.Mesh(
        new THREE.BoxGeometry(fw, underHeight, 0.35),
        wallMat
      );
      underWall.position.set(0, foundHeight + underHeight / 2, wallZ);
      underWall.receiveShadow = true;
      this.exteriorWallGroup.add(underWall);
    }

    // 5. Architectural Window Header Casing & Crown Trim
    const casingThickness = 0.28;
    const casingDepth = 0.12;

    const headerCasing = new THREE.Mesh(
      new THREE.BoxGeometry(fw + 0.7, casingThickness, casingDepth),
      timberMat
    );
    headerCasing.position.set(0, openingTop + casingThickness / 2, wallZ - 0.14);
    headerCasing.castShadow = true;
    this.exteriorWallGroup.add(headerCasing);

    // Left Jamb Casing
    const leftCasing = new THREE.Mesh(
      new THREE.BoxGeometry(casingThickness, fh, casingDepth),
      timberMat
    );
    leftCasing.position.set(openingLeft - casingThickness / 2, openingBottom + fh / 2, wallZ - 0.14);
    leftCasing.castShadow = true;
    this.exteriorWallGroup.add(leftCasing);

    // Right Jamb Casing
    const rightCasing = leftCasing.clone();
    rightCasing.position.x = openingRight + casingThickness / 2;
    this.exteriorWallGroup.add(rightCasing);

    // Bottom Sill Trim
    if (!isDoor) {
      const sillTrim = new THREE.Mesh(
        new THREE.BoxGeometry(fw + 0.65, 0.18, 0.22),
        timberMat
      );
      sillTrim.position.set(0, openingBottom - 0.09, wallZ - 0.18);
      sillTrim.castShadow = true;
      this.exteriorWallGroup.add(sillTrim);
    }

    // 6. Wind Waker Pastel Sky-Blue Shutters
    if (!isDoor && fw <= 8.5) {
      const shutterWidth = 0.85;
      const leftShutter = new THREE.Mesh(
        new THREE.BoxGeometry(shutterWidth, fh * 0.95, 0.08),
        shutterMat
      );
      leftShutter.position.set(openingLeft - casingThickness - shutterWidth / 2 - 0.06, openingBottom + fh / 2, wallZ - 0.14);
      leftShutter.castShadow = true;
      this.exteriorWallGroup.add(leftShutter);

      // Gold hinge accents on left shutter
      const hingeMat = createToonMaterial(0xfacc15, { steps: 3 });
      const hinge1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.04), hingeMat);
      hinge1.position.set(leftShutter.position.x + shutterWidth / 2 - 0.1, leftShutter.position.y + fh * 0.35, wallZ - 0.19);
      this.exteriorWallGroup.add(hinge1);

      const hinge2 = hinge1.clone();
      hinge2.position.y = leftShutter.position.y - fh * 0.35;
      this.exteriorWallGroup.add(hinge2);

      const rightShutter = leftShutter.clone();
      rightShutter.position.x = openingRight + casingThickness + shutterWidth / 2 + 0.06;
      this.exteriorWallGroup.add(rightShutter);

      const hinge3 = hinge1.clone();
      hinge3.position.x = rightShutter.position.x - shutterWidth / 2 + 0.1;
      this.exteriorWallGroup.add(hinge3);

      const hinge4 = hinge2.clone();
      hinge4.position.x = rightShutter.position.x - shutterWidth / 2 + 0.1;
      this.exteriorWallGroup.add(hinge4);
    }

    // 7. Wind Waker Island Lantern Sconces
    const lanternMat = createToonMaterial(0x1e1b4b, { steps: 3 });
    const lanternGlowMat = createToonMaterial(0xfef08a, { steps: 3 });

    const sconceOffsets = [
      openingLeft - casingThickness - 1.4,
      openingRight + casingThickness + 1.4,
    ];

    sconceOffsets.forEach((sx) => {
      const sconceGroup = new THREE.Group();
      sconceGroup.position.set(sx, openingBottom + fh * 0.65, wallZ - 0.16);

      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.22), lanternMat);
      sconceGroup.add(bracket);

      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.38, 6), lanternMat);
      cage.position.set(0, 0, -0.2);
      sconceGroup.add(cage);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), lanternGlowMat);
      bulb.position.set(0, 0, -0.2);
      sconceGroup.add(bulb);

      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 6), roofMat);
      hat.position.set(0, 0.26, -0.2);
      sconceGroup.add(hat);

      this.exteriorWallGroup.add(sconceGroup);
    });

    // 8. Side Wing Terracotta Eaves (Only on left and right wings, central lane open)
    const buildWingRoof = (centerX: number, width: number) => {
      const eavesY = sideWallHeight;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.22, 1.4), timberMat);
      roof.position.set(centerX, eavesY + 0.11, wallZ - 0.2);
      this.exteriorWallGroup.add(roof);

      const slopedRoof = new THREE.Mesh(new THREE.PlaneGeometry(width + 0.8, 3.2), roofMat);
      slopedRoof.rotation.x = Math.PI / 5;
      slopedRoof.position.set(centerX, eavesY + 0.8, wallZ + 0.8);
      this.exteriorWallGroup.add(slopedRoof);
    };

    const leftWingCenter = -wallTotalWidth / 2 + leftWidth / 2;
    const rightWingCenter = wallTotalWidth / 2 - leftWidth / 2;
    buildWingRoof(leftWingCenter, leftWidth);
    buildWingRoof(rightWingCenter, leftWidth);

    // 9. Honey Cedar Platform Deck for Patio Doors or Garden Tufts for Windows
    if (isDoor) {
      const deckMat = createToonMaterial(0xd97706, { steps: 3 });
      const deckWidth = fw + 3.5;
      const deckDepth = 4.0;
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(deckWidth, 0.14, deckDepth),
        deckMat
      );
      deck.position.set(0, 0.07, wallZ - deckDepth / 2 - 0.08);
      deck.receiveShadow = true;
      this.exteriorWallGroup.add(deck);
    } else {
      const shrubMat = createToonMaterial(0x16a34a, { steps: 3 });
      const shrubPositions = [
        openingLeft - 1.2,
        openingLeft + fw * 0.25,
        openingRight - fw * 0.25,
        openingRight + 1.2,
      ];
      shrubPositions.forEach((bx) => {
        const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 8), shrubMat);
        shrub.scale.set(1.2, 0.75, 0.9);
        shrub.position.set(bx, 0.42, wallZ - 0.45);
        shrub.castShadow = true;
        this.exteriorWallGroup.add(shrub);
      });
    }
  }

  private buildSubtleInterior(fixture: FixtureSpec) {
    const fw = fixture.width;
    const fh = fixture.height;
    const isDoor = fixture.category === 'door' || fixture.isPatioDoor;
    const openingBottom = isDoor ? 0.05 : 0.45;
    const openingY = openingBottom + fh / 2;

    // Cozy honey wood floor plane inside the room
    const floorMat = createToonMaterial(0x92400e, { steps: 3 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(fw + 4.0, 4.0), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, openingBottom - 0.02, 2.2);
    this.interiorGroup.add(floor);

    // Cheerful curtains framing the interior edges
    const curtainMat = createToonMaterial(0xf43f5e, { steps: 3 });
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
