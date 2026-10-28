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
    this.buildCozyInterior(fixture);
  }

  private buildHouseWall(fixture: FixtureSpec) {
    const wallTotalWidth = 40;
    const wallHeight = 13.5;
    const wallZ = 0.25;

    // Siding material (crisp suburban horizontal clapboard siding)
    const sidingMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Modern slate siding
      roughness: 0.75,
      metalness: 0.05,
    });

    // White trim and casing material
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Foundation brick / concrete water table material
    const foundationMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Roof shingle material
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
    const openingBottom = isDoor ? 0.05 : 0.4;
    const openingTop = openingBottom + fh;

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

    // 2. Left Exterior Wall Block
    const leftWidth = (wallTotalWidth - fw) / 2;
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftWidth, wallHeight - foundHeight, 0.35),
      sidingMat
    );
    leftWall.position.set(-wallTotalWidth / 2 + leftWidth / 2, foundHeight + (wallHeight - foundHeight) / 2, wallZ);
    leftWall.receiveShadow = true;
    this.exteriorWallGroup.add(leftWall);

    // Add horizontal siding reveal grooves on Left Wall
    for (let sy = foundHeight + 0.3; sy < wallHeight; sy += 0.42) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(leftWidth, 0.04, 0.38), sidingMat);
      plank.position.set(-wallTotalWidth / 2 + leftWidth / 2, sy, wallZ + 0.015);
      this.exteriorWallGroup.add(plank);
    }

    // 3. Right Exterior Wall Block
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftWidth, wallHeight - foundHeight, 0.35),
      sidingMat
    );
    rightWall.position.set(wallTotalWidth / 2 - leftWidth / 2, foundHeight + (wallHeight - foundHeight) / 2, wallZ);
    rightWall.receiveShadow = true;
    this.exteriorWallGroup.add(rightWall);

    // Add horizontal siding reveal grooves on Right Wall
    for (let sy = foundHeight + 0.3; sy < wallHeight; sy += 0.42) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(leftWidth, 0.04, 0.38), sidingMat);
      plank.position.set(wallTotalWidth / 2 - leftWidth / 2, sy, wallZ + 0.015);
      this.exteriorWallGroup.add(plank);
    }

    // 4. Wall Section Under Window (if window has apron sill)
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

    // 5. Wall Section Above Window Header
    const topHeight = wallHeight - openingTop;
    if (topHeight > 0) {
      const topWall = new THREE.Mesh(
        new THREE.BoxGeometry(fw, topHeight, 0.35),
        sidingMat
      );
      topWall.position.set(0, openingTop + topHeight / 2, wallZ);
      topWall.receiveShadow = true;
      this.exteriorWallGroup.add(topWall);

      for (let sy = openingTop + 0.3; sy < wallHeight; sy += 0.42) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.04, 0.38), sidingMat);
        plank.position.set(0, sy, wallZ + 0.015);
        this.exteriorWallGroup.add(plank);
      }
    }

    // 6. Exterior Architectural Casing & Trim around Window/Door
    const casingThickness = 0.28;
    const casingDepth = 0.12;

    // Header Trim / Drip Cap
    const headerCasing = new THREE.Mesh(
      new THREE.BoxGeometry(fw + 0.7, casingThickness, casingDepth),
      trimMat
    );
    headerCasing.position.set(0, openingTop + casingThickness / 2, wallZ - 0.16);
    headerCasing.castShadow = true;
    this.exteriorWallGroup.add(headerCasing);

    // Decorative Crown Pediment above Header
    const pediment = new THREE.Mesh(
      new THREE.BoxGeometry(fw + 0.95, 0.14, casingDepth + 0.08),
      trimMat
    );
    pediment.position.set(0, openingTop + casingThickness + 0.07, wallZ - 0.18);
    pediment.castShadow = true;
    this.exteriorWallGroup.add(pediment);

    // Left Jamb Casing
    const leftCasing = new THREE.Mesh(
      new THREE.BoxGeometry(casingThickness, fh, casingDepth),
      trimMat
    );
    leftCasing.position.set(openingLeft - casingThickness / 2, openingBottom + fh / 2, wallZ - 0.16);
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
      sillTrim.position.set(0, openingBottom - 0.09, wallZ - 0.2);
      sillTrim.castShadow = true;
      this.exteriorWallGroup.add(sillTrim);
    }

    // 7. Decorative Window Shutters (for standard/casement/double-hung windows)
    if (!isDoor && fw <= 8.5) {
      const shutterMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a, // Classic colonial navy blue shutters
        roughness: 0.5,
      });
      const shutterWidth = 0.9;
      const leftShutter = new THREE.Mesh(
        new THREE.BoxGeometry(shutterWidth, fh * 0.95, 0.08),
        shutterMat
      );
      leftShutter.position.set(openingLeft - casingThickness - shutterWidth / 2 - 0.05, openingBottom + fh / 2, wallZ - 0.16);
      leftShutter.castShadow = true;
      this.exteriorWallGroup.add(leftShutter);

      // Louvers on shutter
      for (let ly = -fh * 0.42; ly <= fh * 0.42; ly += 0.22) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(shutterWidth - 0.1, 0.04, 0.04), trimMat);
        louver.position.set(leftShutter.position.x, leftShutter.position.y + ly, wallZ - 0.21);
        this.exteriorWallGroup.add(louver);
      }

      const rightShutter = leftShutter.clone();
      rightShutter.position.x = openingRight + casingThickness + shutterWidth / 2 + 0.05;
      this.exteriorWallGroup.add(rightShutter);

      for (let ly = -fh * 0.42; ly <= fh * 0.42; ly += 0.22) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(shutterWidth - 0.1, 0.04, 0.04), trimMat);
        louver.position.set(rightShutter.position.x, rightShutter.position.y + ly, wallZ - 0.21);
        this.exteriorWallGroup.add(louver);
      }
    }

    // 8. Outdoor Wall Carriage Lantern Sconces (Flanking left and right)
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const lanternGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });

    const sconceOffsets = [
      openingLeft - casingThickness - 1.5,
      openingRight + casingThickness + 1.5,
    ];

    sconceOffsets.forEach((sx) => {
      const sconceGroup = new THREE.Group();
      sconceGroup.position.set(sx, openingBottom + fh * 0.65, wallZ - 0.18);

      // Mount bracket
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.25), lanternMat);
      sconceGroup.add(bracket);

      // Lantern cage
      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.45, 6), lanternMat);
      cage.position.set(0, 0, -0.22);
      sconceGroup.add(cage);

      // Glowing filament
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), lanternGlowMat);
      bulb.position.set(0, 0, -0.22);
      sconceGroup.add(bulb);

      // Sconce roof hat
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 6), lanternMat);
      hat.position.set(0, 0.28, -0.22);
      sconceGroup.add(hat);

      this.exteriorWallGroup.add(sconceGroup);
    });

    // 9. Roofline, Eaves, Soffit and Gutters along top of house wall
    const roofEavesY = wallHeight;
    const overhangZ = wallZ - 0.75;

    // Soffit underside
    const soffit = new THREE.Mesh(
      new THREE.BoxGeometry(wallTotalWidth + 2.0, 0.15, 1.2),
      trimMat
    );
    soffit.position.set(0, roofEavesY - 0.08, overhangZ + 0.3);
    this.exteriorWallGroup.add(soffit);

    // Fascia board
    const fascia = new THREE.Mesh(
      new THREE.BoxGeometry(wallTotalWidth + 2.0, 0.45, 0.12),
      trimMat
    );
    fascia.position.set(0, roofEavesY + 0.1, overhangZ - 0.3);
    this.exteriorWallGroup.add(fascia);

    // Sloped Roof plane
    const roof = new THREE.Mesh(
      new THREE.PlaneGeometry(wallTotalWidth + 2.5, 6.0),
      roofMat
    );
    roof.rotation.x = Math.PI / 5; // 36 degree roof pitch
    roof.position.set(0, roofEavesY + 1.6, overhangZ + 1.8);
    roof.receiveShadow = true;
    this.exteriorWallGroup.add(roof);

    // Aluminum Gutters running entire roof edge
    const gutter = new THREE.Mesh(
      new THREE.BoxGeometry(wallTotalWidth + 2.2, 0.2, 0.16),
      gutterMat
    );
    gutter.position.set(0, roofEavesY + 0.05, overhangZ - 0.4);
    this.exteriorWallGroup.add(gutter);

    // Vertical Downspouts on left and right corner of house
    const downspoutL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, wallHeight, 8),
      gutterMat
    );
    downspoutL.position.set(-wallTotalWidth / 2 + 0.6, wallHeight / 2, wallZ - 0.2);
    this.exteriorWallGroup.add(downspoutL);

    const downspoutR = downspoutL.clone();
    downspoutR.position.x = wallTotalWidth / 2 - 0.6;
    this.exteriorWallGroup.add(downspoutR);

    // 10. Patio Platform Deck for Patio Doors or Foundation Garden Beds for Windows
    if (isDoor) {
      // Elegant composite wood patio deck plank platform
      const deckMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, // Warm cedar/redwood deck
        roughness: 0.65,
        metalness: 0.05,
      });
      const deckWidth = fw + 4.0;
      const deckDepth = 4.5;
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(deckWidth, 0.15, deckDepth),
        deckMat
      );
      deck.position.set(0, 0.075, wallZ - deckDepth / 2 - 0.1);
      deck.receiveShadow = true;
      this.exteriorWallGroup.add(deck);

      // Deck planks lines
      for (let dz = -deckDepth + 0.3; dz <= 0; dz += 0.35) {
        const seam = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 0.02, 0.02), trimMat);
        seam.position.set(0, 0.155, wallZ + dz);
        this.exteriorWallGroup.add(seam);
      }
    } else {
      // Foundation evergreen shrubs planted under the window
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
        const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), shrubMat);
        shrub.scale.set(1.2, 0.75, 0.9);
        shrub.position.set(bx, 0.45, wallZ - 0.55);
        shrub.castShadow = true;
        this.exteriorWallGroup.add(shrub);
      });
    }
  }

  /**
   * Build cozy indoor living room visible through the window glass
   */
  private buildCozyInterior(fixture: FixtureSpec) {
    const fw = fixture.width;
    const fh = fixture.height;
    const isDoor = fixture.category === 'door' || fixture.isPatioDoor;
    const openingBottom = isDoor ? 0.05 : 0.4;
    const openingY = openingBottom + fh / 2;

    const roomW = fw + 6;
    const roomH = fh + 4;
    const roomD = 5.0;
    const roomCenterZ = 0.3 + roomD / 2;

    // Interior warm paint wall material
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7, // Warm golden candlelight cream
      roughness: 0.8,
      side: THREE.BackSide,
    });

    // Hardwood parquet floor
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Rich mahogany wood
      roughness: 0.4,
      metalness: 0.1,
    });

    // Room enclosure
    const roomGeo = new THREE.BoxGeometry(roomW, roomH, roomD);
    const room = new THREE.Mesh(roomGeo, wallMat);
    room.position.set(0, openingY, roomCenterZ);
    this.interiorGroup.add(room);

    // Warm Interior Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, openingBottom - 0.02, roomCenterZ);
    this.interiorGroup.add(floor);

    // Cozy interior ceiling lamp light
    const lampLight = new THREE.PointLight(0xffedd5, 1.8, 12, 1.2);
    lampLight.position.set(0, openingY + fh * 0.4, roomCenterZ - 0.5);
    this.interiorGroup.add(lampLight);

    // Cozy framed wall art on interior back wall
    const artFrameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
    const artCanvasMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Landscape blue sky painting
    const artFrame = new THREE.Mesh(new THREE.BoxGeometry(fw * 0.45, fh * 0.4, 0.05), artFrameMat);
    artFrame.position.set(0, openingY + 0.3, roomCenterZ + roomD / 2 - 0.08);
    this.interiorGroup.add(artFrame);

    const artCanvas = new THREE.Mesh(new THREE.PlaneGeometry(fw * 0.4, fh * 0.35), artCanvasMat);
    artCanvas.rotation.y = Math.PI;
    artCanvas.position.set(0, openingY + 0.3, roomCenterZ + roomD / 2 - 0.12);
    this.interiorGroup.add(artCanvas);

    // Indoor curtain drapes flanking interior sides
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Rich cozy ruby red curtains
      roughness: 0.7,
    });
    const curtainW = 0.65;
    const leftCurtain = new THREE.Mesh(
      new THREE.BoxGeometry(curtainW, fh * 1.05, 0.2),
      curtainMat
    );
    leftCurtain.position.set(-fw / 2 + curtainW / 2 + 0.15, openingY, 0.45);
    this.interiorGroup.add(leftCurtain);

    const rightCurtain = leftCurtain.clone();
    rightCurtain.position.x = fw / 2 - curtainW / 2 - 0.15;
    this.interiorGroup.add(rightCurtain);
  }

  public dispose() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}
