import * as THREE from 'three';

export class SuburbanEnvironment {
  public group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.buildSuburbanScene();
  }

  private buildSuburbanScene() {
    // 1. Concrete Paved Driveway / Defense Lane
    const roadWidth = 14;
    const roadLength = 55;
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Smooth dark asphalt/concrete
      roughness: 0.85,
      metalness: 0.1,
    });
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth, roadLength),
      roadMat
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -roadLength / 2 + 2);
    road.receiveShadow = true;
    this.group.add(road);

    // Driveway yellow lane markers
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let z = -45; z <= 0; z += 5) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 2.5), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.01, z);
      this.group.add(stripe);
    }

    // Concrete Sidewalk Curbs
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, roadLength), curbMat);
    leftCurb.position.set(-roadWidth / 2 - 0.3, 0.125, -roadLength / 2 + 2);
    this.group.add(leftCurb);

    const rightCurb = leftCurb.clone();
    rightCurb.position.x = roadWidth / 2 + 0.3;
    this.group.add(rightCurb);

    // 2. Lush Green Suburban Lawns
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Vibrant manicured grass green
      roughness: 0.9,
      metalness: 0.05,
    });
    const lawnWidth = 35;
    const leftLawn = new THREE.Mesh(new THREE.PlaneGeometry(lawnWidth, roadLength + 10), grassMat);
    leftLawn.rotation.x = -Math.PI / 2;
    leftLawn.position.set(-roadWidth / 2 - lawnWidth / 2 - 0.6, 0.05, -roadLength / 2 + 2);
    leftLawn.receiveShadow = true;
    this.group.add(leftLawn);

    const rightLawn = leftLawn.clone();
    rightLawn.position.x = roadWidth / 2 + lawnWidth / 2 + 0.6;
    this.group.add(rightLawn);

    // 3. White Picket Fences along the property lines
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    for (let z = -48; z <= 2; z += 1.8) {
      // Left side picket post
      const picketL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.06), fenceMat);
      picketL.position.set(-roadWidth / 2 - 1.2, 0.6, z);
      picketL.castShadow = true;
      this.group.add(picketL);

      // Right side picket post
      const picketR = picketL.clone();
      picketR.position.x = roadWidth / 2 + 1.2;
      this.group.add(picketR);
    }
    // Horizontal fence rails
    const railMat = fenceMat;
    const railL1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, roadLength), railMat);
    railL1.position.set(-roadWidth / 2 - 1.2, 0.4, -roadLength / 2 + 2);
    this.group.add(railL1);
    const railL2 = railL1.clone();
    railL2.position.y = 0.9;
    this.group.add(railL2);

    const railR1 = railL1.clone();
    railR1.position.x = roadWidth / 2 + 1.2;
    this.group.add(railR1);
    const railR2 = railL2.clone();
    railR2.position.x = roadWidth / 2 + 1.2;
    this.group.add(railR2);

    // 4. Suburban Houses and Trees in Background
    this.buildSuburbanHouse(-roadWidth / 2 - 14, 0, -25, 0x3b82f6, 0x991b1b);
    this.buildSuburbanHouse(roadWidth / 2 + 14, 0, -32, 0xf59e0b, 0x1e3a8a);
    this.buildSuburbanHouse(-roadWidth / 2 - 16, 0, -45, 0x10b981, 0x7c2d12);
    this.buildSuburbanHouse(roadWidth / 2 + 16, 0, -15, 0x8b5cf6, 0x374151);

    // Stylized low-poly trees
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    const treePositions = [
      [-roadWidth / 2 - 5, -12],
      [-roadWidth / 2 - 7, -28],
      [-roadWidth / 2 - 6, -42],
      [roadWidth / 2 + 6, -18],
      [roadWidth / 2 + 8, -36],
      [roadWidth / 2 + 5, -48],
    ];

    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.8, 8), trunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 8), treeMat);
      foliage.position.y = 2.8;
      foliage.castShadow = true;
      tree.add(foliage);

      const foliageTop = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 8), treeMat);
      foliageTop.position.y = 4.0;
      foliageTop.castShadow = true;
      tree.add(foliageTop);

      this.group.add(tree);
    });
  }

  private buildSuburbanHouse(x: number, y: number, z: number, wallColor: number, roofColor: number) {
    const house = new THREE.Group();
    house.position.set(x, y, z);

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 });

    // House Main Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 8), wallMat);
    body.position.y = 2.5;
    body.castShadow = true;
    house.add(body);

    // Pitched Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.2, 3.5, 4), roofMat);
    roof.position.y = 6.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), new THREE.MeshStandardMaterial({ color: 0x7f1d1d }));
    chimney.position.set(2.2, 6.5, 0);
    chimney.castShadow = true;
    house.add(chimney);

    this.group.add(house);
  }
}
