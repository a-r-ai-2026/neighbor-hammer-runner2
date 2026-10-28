import * as THREE from 'three';

export class SuburbanEnvironment {
  public group: THREE.Group;
  private cloudsGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.cloudsGroup = new THREE.Group();
    this.group.add(this.cloudsGroup);
    this.buildSuburbanScene();
    this.buildCinematicSkyAndClouds();
  }

  private buildSuburbanScene() {
    // 1. Concrete & Asphalt Driveway / Defense Lane (Movie-quality PBR sheen)
    const roadWidth = 14;
    const roadLength = 55;
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x273549, // Deep cinematic asphalt
      roughness: 0.65,
      metalness: 0.18, // Catches low-angle golden sun reflections
    });
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth, roadLength, 16, 32),
      roadMat
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -roadLength / 2 + 2);
    road.receiveShadow = true;
    this.group.add(road);

    // Weathered Asphalt tire tracks (subtle dark rubber trails)
    const tireMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.45,
    });
    const trackL = new THREE.Mesh(new THREE.PlaneGeometry(1.6, roadLength - 4), tireMat);
    trackL.rotation.x = -Math.PI / 2;
    trackL.position.set(-2.8, 0.005, -roadLength / 2 + 2);
    this.group.add(trackL);

    const trackR = trackL.clone();
    trackR.position.x = 2.8;
    this.group.add(trackR);

    // Driveway reflective yellow center lane dashes
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2, // Subtle glow
    });
    for (let z = -45; z <= 0; z += 5) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 2.6), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.012, z);
      this.group.add(stripe);
    }

    // Concrete Sidewalk Curbs with bevels
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.28, roadLength), curbMat);
    leftCurb.position.set(-roadWidth / 2 - 0.32, 0.14, -roadLength / 2 + 2);
    leftCurb.castShadow = true;
    leftCurb.receiveShadow = true;
    this.group.add(leftCurb);

    const rightCurb = leftCurb.clone();
    rightCurb.position.x = roadWidth / 2 + 0.32;
    this.group.add(rightCurb);

    // Concrete Sidewalk Paver Walkways
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.75 });
    const leftWalk = new THREE.Mesh(new THREE.PlaneGeometry(2.4, roadLength), sidewalkMat);
    leftWalk.rotation.x = -Math.PI / 2;
    leftWalk.position.set(-roadWidth / 2 - 1.85, 0.145, -roadLength / 2 + 2);
    leftWalk.receiveShadow = true;
    this.group.add(leftWalk);

    const rightWalk = leftWalk.clone();
    rightWalk.position.x = roadWidth / 2 + 1.85;
    this.group.add(rightWalk);

    // 2. Lush Vibrant Green Suburban Lawns
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Rich forest emerald grass
      roughness: 0.85,
      metalness: 0.02,
    });
    const lawnWidth = 35;
    const leftLawn = new THREE.Mesh(new THREE.PlaneGeometry(lawnWidth, roadLength + 10), grassMat);
    leftLawn.rotation.x = -Math.PI / 2;
    leftLawn.position.set(-roadWidth / 2 - lawnWidth / 2 - 3.2, 0.08, -roadLength / 2 + 2);
    leftLawn.receiveShadow = true;
    this.group.add(leftLawn);

    const rightLawn = leftLawn.clone();
    rightLawn.position.x = roadWidth / 2 + lawnWidth / 2 + 3.2;
    this.group.add(rightLawn);

    // 3. Flower Beds & 3D Grass Tufts along the curbs
    this.buildLawnFlora(roadWidth, roadLength);

    // 4. White Picket Fences along the property lines
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
    for (let z = -48; z <= 2; z += 1.8) {
      const picketL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 0.06), fenceMat);
      picketL.position.set(-roadWidth / 2 - 3.2, 0.65, z);
      picketL.castShadow = true;
      this.group.add(picketL);

      const picketR = picketL.clone();
      picketR.position.x = roadWidth / 2 + 3.2;
      this.group.add(picketR);
    }
    const railL1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, roadLength), fenceMat);
    railL1.position.set(-roadWidth / 2 - 3.2, 0.45, -roadLength / 2 + 2);
    this.group.add(railL1);
    const railL2 = railL1.clone();
    railL2.position.y = 0.95;
    this.group.add(railL2);

    const railR1 = railL1.clone();
    railR1.position.x = roadWidth / 2 + 3.2;
    this.group.add(railR1);
    const railR2 = railL2.clone();
    railR2.position.x = roadWidth / 2 + 3.2;
    this.group.add(railR2);

    // 5. Suburban Streetlamps along the sidewalk
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
    const lampGlassMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const lampZPositions = [-12, -28, -44];
    lampZPositions.forEach((lz) => {
      // Left Streetlamp
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), lampMat);
      postL.position.set(-roadWidth / 2 - 2.8, 2.1, lz);
      postL.castShadow = true;
      this.group.add(postL);

      const lanternL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), lampGlassMat);
      lanternL.position.set(-roadWidth / 2 - 2.8, 4.3, lz);
      this.group.add(lanternL);

      // Right Streetlamp
      const postR = postL.clone();
      postR.position.x = roadWidth / 2 + 2.8;
      this.group.add(postR);

      const lanternR = lanternL.clone();
      lanternR.position.x = roadWidth / 2 + 2.8;
      this.group.add(lanternR);
    });

    // 6. Detailed Suburban Houses in the background
    this.buildSuburbanHouse(-roadWidth / 2 - 16, 0, -25, 0x3b82f6, 0x991b1b);
    this.buildSuburbanHouse(roadWidth / 2 + 16, 0, -32, 0xf59e0b, 0x1e3a8a);
    this.buildSuburbanHouse(-roadWidth / 2 - 18, 0, -45, 0x10b981, 0x7c2d12);
    this.buildSuburbanHouse(roadWidth / 2 + 18, 0, -15, 0x8b5cf6, 0x374151);

    // Stylized low-poly trees with multi-tier foliage
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    const treePositions = [
      [-roadWidth / 2 - 6, -14],
      [-roadWidth / 2 - 8, -28],
      [-roadWidth / 2 - 7, -42],
      [roadWidth / 2 + 7, -18],
      [roadWidth / 2 + 9, -34],
      [roadWidth / 2 + 6, -48],
    ];

    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 2.2, 8), trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.4, 8), treeMat);
      foliage1.position.y = 3.2;
      foliage1.castShadow = true;
      tree.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.6, 8), treeMat);
      foliage2.position.y = 4.6;
      foliage2.castShadow = true;
      tree.add(foliage2);

      this.group.add(tree);
    });
  }

  private buildLawnFlora(roadWidth: number, roadLength: number) {
    const flowerMatYellow = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.6,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2,
    });
    const flowerMatRed = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.6,
      emissive: 0xdc2626,
      emissiveIntensity: 0.2,
    });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });

    const flowerPositions = [
      [-roadWidth / 2 - 3.8, -8],
      [-roadWidth / 2 - 4.1, -16],
      [-roadWidth / 2 - 3.9, -26],
      [-roadWidth / 2 - 4.2, -38],
      [roadWidth / 2 + 3.8, -10],
      [roadWidth / 2 + 4.1, -22],
      [roadWidth / 2 + 3.9, -35],
    ];

    flowerPositions.forEach(([fx, fz], idx) => {
      const cluster = new THREE.Group();
      cluster.position.set(fx, 0.1, fz);

      const mat = idx % 2 === 0 ? flowerMatYellow : flowerMatRed;
      for (let i = 0; i < 4; i++) {
        const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), mat);
        blossom.position.set((Math.random() - 0.5) * 0.4, 0.25 + Math.random() * 0.15, (Math.random() - 0.5) * 0.4);
        cluster.add(blossom);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), stemMat);
        stem.position.set(blossom.position.x, 0.15, blossom.position.z);
        cluster.add(stem);
      }
      this.group.add(cluster);
    });
  }

  private buildCinematicSkyAndClouds() {
    // Glowing Cinematic Sun Disk (high in sky deep down lane)
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffedd5, // Radiant golden white
    });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(4.5, 24, 24), sunMat);
    sun.position.set(18, 38, -65);
    this.group.add(sun);

    // Sun Corona Glow Ring
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const corona = new THREE.Mesh(new THREE.SphereGeometry(6.2, 16, 16), coronaMat);
    corona.position.copy(sun.position);
    this.group.add(corona);

    // Fluffy 3D Stylized Cumulus Clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.05,
    });

    const cloudSpecs = [
      { x: -35, y: 32, z: -55, scale: 1.4 },
      { x: -12, y: 36, z: -70, scale: 1.8 },
      { x: 26, y: 34, z: -58, scale: 1.5 },
      { x: 42, y: 28, z: -62, scale: 1.3 },
      { x: -22, y: 26, z: -48, scale: 1.1 },
    ];

    cloudSpecs.forEach((spec) => {
      const cloud = new THREE.Group();
      cloud.position.set(spec.x, spec.y, spec.z);
      cloud.scale.setScalar(spec.scale);

      // Overlapping puff spheres forming cumulus cloud
      const puffOffsets = [
        [0, 0, 0, 2.2],
        [-1.8, -0.4, 0.3, 1.8],
        [1.8, -0.3, -0.2, 1.7],
        [-0.8, 0.8, -0.4, 1.5],
        [1.0, 0.7, 0.2, 1.4],
      ];

      puffOffsets.forEach(([px, py, pz, pr]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 10, 10), cloudMat);
        puff.position.set(px, py, pz);
        cloud.add(puff);
      });

      this.cloudsGroup.add(cloud);
    });
  }

  private buildSuburbanHouse(x: number, y: number, z: number, wallColor: number, roofColor: number) {
    const house = new THREE.Group();
    house.position.set(x, y, z);

    const houseW = 11;
    const houseH = 6.5;
    const houseD = 9;

    // Siding body
    const bodyMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(houseW, houseH, houseD), bodyMat);
    body.position.y = houseH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);

    // Gabled Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(houseW * 0.75, 3.8, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = houseH + 1.9;
    roof.castShadow = true;
    house.add(roof);

    // Warm lit windows on neighboring house
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.1), winMat);
    win1.position.set(-2.2, 3.2, houseD / 2 + 0.05);
    house.add(win1);

    const win2 = win1.clone();
    win2.position.x = 2.2;
    house.add(win2);

    this.group.add(house);
  }

  public update(delta: number) {
    // Subtle drift of distant clouds
    this.cloudsGroup.children.forEach((cloud, idx) => {
      cloud.position.x += delta * (0.35 + idx * 0.1);
      if (cloud.position.x > 60) {
        cloud.position.x = -60;
      }
    });
  }
}
