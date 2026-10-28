import * as THREE from 'three';
import { createToonMaterial } from './toonShading';

export class SuburbanEnvironment {
  public group: THREE.Group;
  private cloudsGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.cloudsGroup = new THREE.Group();
    this.group.add(this.cloudsGroup);
    this.buildWindWakerScene();
    this.buildWindWakerSkyAndClouds();
  }

  private buildWindWakerScene() {
    // 1. Wind Waker Stylized Cobblestone Driveway / Defense Lane
    const roadWidth = 14;
    const roadLength = 55;
    const roadMat = createToonMaterial(0x94a3b8, { steps: 3 }); // Sunlit stone
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth, roadLength),
      roadMat
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -roadLength / 2 + 2);
    road.receiveShadow = true;
    this.group.add(road);

    // Cobblestone slab border curbs
    const curbMat = createToonMaterial(0x64748b, { steps: 3 });
    const curbL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, roadLength), curbMat);
    curbL.position.set(-roadWidth / 2 - 0.3, 0.11, -roadLength / 2 + 2);
    curbL.castShadow = true;
    this.group.add(curbL);

    const curbR = curbL.clone();
    curbR.position.x = roadWidth / 2 + 0.3;
    this.group.add(curbR);

    // Wind Waker cartoon yellow lane diamonds (instead of modern highway dashes)
    const diamondMat = createToonMaterial(0xfacc15, { steps: 3 });
    for (let z = -45; z <= 0; z += 5) {
      const diamond = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), diamondMat);
      diamond.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
      diamond.position.set(0, 0.015, z);
      this.group.add(diamond);
    }

    // 2. Vibrant Wind Waker Emerald Green Lawn
    const grassMat = createToonMaterial(0x22c55e, { steps: 3 });
    const lawnWidth = 90;
    const lawnLength = 70;
    const lawnL = new THREE.Mesh(
      new THREE.PlaneGeometry((lawnWidth - roadWidth) / 2, lawnLength),
      grassMat
    );
    lawnL.rotation.x = -Math.PI / 2;
    lawnL.position.set(-roadWidth / 2 - (lawnWidth - roadWidth) / 4, -0.01, -lawnLength / 2 + 5);
    lawnL.receiveShadow = true;
    this.group.add(lawnL);

    const lawnR = lawnL.clone();
    lawnR.position.x = roadWidth / 2 + (lawnWidth - roadWidth) / 4;
    this.group.add(lawnR);

    // 3. Cute Cartoon Flowers on Lawn
    this.buildCartoonFlowerPatches();

    // 4. Wind Waker Pom-Pom Lollipop Trees
    const treePositions = [
      [-12, -8],
      [-14, -22],
      [-13, -38],
      [12, -10],
      [14, -25],
      [13, -40],
    ];
    treePositions.forEach(([tx, tz]) => {
      this.buildWindWakerTree(tx, 0, tz);
    });

    // 5. Stylized White Cartoon Picket Fences
    this.buildCartoonFences(roadLength);

    // 6. Neighboring Wind Waker Island Cottages
    this.buildWindWakerCottage(-26, 0, -22, 0xfef08a, 0xe11d48);
    this.buildWindWakerCottage(26, 0, -25, 0xbfdbfe, 0xf97316);
  }

  private buildCartoonFlowerPatches() {
    const flowerWhiteMat = createToonMaterial(0xffffff, { steps: 3 });
    const flowerYellowMat = createToonMaterial(0xfde047, { steps: 3 });
    const flowerRedMat = createToonMaterial(0xf87171, { steps: 3 });

    const flowerCoords = [
      [-9, -4], [-10.5, -6], [-8.5, -12], [-11, -18], [-9.5, -30],
      [9, -5], [10.5, -7], [8.5, -14], [11, -20], [9.5, -32],
    ];

    flowerCoords.forEach(([fx, fz], idx) => {
      const flowerGroup = new THREE.Group();
      flowerGroup.position.set(fx, 0.05, fz);

      // Flower center
      const center = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), flowerYellowMat);
      flowerGroup.add(center);

      // Petals
      const petalMat = idx % 2 === 0 ? flowerWhiteMat : flowerRedMat;
      for (let p = 0; p < 5; p++) {
        const angle = (p / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6), petalMat);
        petal.position.set(Math.cos(angle) * 0.2, 0, Math.sin(angle) * 0.2);
        flowerGroup.add(petal);
      }
      this.group.add(flowerGroup);
    });
  }

  private buildWindWakerTree(x: number, y: number, z: number) {
    const tree = new THREE.Group();
    tree.position.set(x, y, z);

    const trunkMat = createToonMaterial(0x9a3412, { steps: 3 });
    const leavesDarkMat = createToonMaterial(0x16a34a, { steps: 3 });
    const leavesLightMat = createToonMaterial(0x4ade80, { steps: 3 });

    // Chunky wooden trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 3.5, 8), trunkMat);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    tree.add(trunk);

    // Tiered cartoon pom-pom foliage (Wind Waker style)
    const botLeaves = new THREE.Mesh(new THREE.SphereGeometry(2.0, 10, 8), leavesDarkMat);
    botLeaves.position.y = 4.0;
    botLeaves.scale.set(1.2, 0.9, 1.2);
    botLeaves.castShadow = true;
    tree.add(botLeaves);

    const topLeaves = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8), leavesLightMat);
    topLeaves.position.y = 5.4;
    topLeaves.scale.set(1.0, 0.9, 1.0);
    topLeaves.castShadow = true;
    tree.add(topLeaves);

    // Contact cartoon shadow
    const shadowGeo = new THREE.CircleGeometry(2.2, 12);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x14532d, transparent: true, opacity: 0.35 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    tree.add(shadow);

    this.group.add(tree);
  }

  private buildCartoonFences(roadLength: number) {
    const fenceMat = createToonMaterial(0xf8fafc, { steps: 3 });
    const fenceXOffsets = [-8.0, 8.0];

    fenceXOffsets.forEach((fx) => {
      for (let fz = -44; fz <= -4; fz += 3.2) {
        // Picket post
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.14), fenceMat);
        post.position.set(fx, 0.55, fz);
        post.castShadow = true;
        this.group.add(post);

        // Pointy fence tip
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 4), fenceMat);
        tip.rotation.y = Math.PI / 4;
        tip.position.set(fx, 1.21, fz);
        this.group.add(tip);

        // Horizontal rail
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 3.2), fenceMat);
        rail.position.set(fx, 0.65, fz + 1.6);
        this.group.add(rail);
      }
    });
  }

  private buildWindWakerSkyAndClouds() {
    // 1. Wind Waker Vibrant Ocean Sky Dome
    const skyGeo = new THREE.SphereGeometry(95, 24, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Vibrant Wind Waker blue
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(sky);

    // 2. Wind Waker Cartoon Stylized Sun with clean ring
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sun = new THREE.Mesh(new THREE.CircleGeometry(6.0, 24), sunMat);
    sun.position.set(22, 44, -75);
    this.group.add(sun);

    // Sun outer corona ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(6.5, 8.2, 24), ringMat);
    ring.position.copy(sun.position);
    this.group.add(ring);

    // 3. Wind Waker Iconic Spiral & Scrollwork Cartoon Clouds
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
    });

    const cloudSpecs = [
      { x: -38, y: 34, z: -60, scale: 2.2 },
      { x: -14, y: 38, z: -72, scale: 2.8 },
      { x: 28, y: 35, z: -62, scale: 2.4 },
      { x: 48, y: 30, z: -66, scale: 2.0 },
      { x: -24, y: 28, z: -52, scale: 1.8 },
    ];

    cloudSpecs.forEach((spec) => {
      const cloud = new THREE.Group();
      cloud.position.set(spec.x, spec.y, spec.z);
      cloud.scale.setScalar(spec.scale);

      // Overlapping cartoon puffs forming stylized cumulus
      const puffOffsets = [
        [0, 0, 0, 1.8],
        [-1.6, -0.3, 0.2, 1.4],
        [1.6, -0.2, -0.2, 1.3],
        [-0.7, 0.8, -0.2, 1.2],
        [0.9, 0.7, 0.1, 1.1],
      ];

      puffOffsets.forEach(([px, py, pz, pr]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 8, 8), cloudMat);
        puff.position.set(px, py, pz);
        cloud.add(puff);
      });

      this.cloudsGroup.add(cloud);
    });
  }

  private buildWindWakerCottage(x: number, y: number, z: number, wallColor: number, roofColor: number) {
    const house = new THREE.Group();
    house.position.set(x, y, z);

    const houseW = 10;
    const houseH = 6;
    const houseD = 9;

    const bodyMat = createToonMaterial(wallColor, { steps: 3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(houseW, houseH, houseD), bodyMat);
    body.position.y = houseH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);

    // Warm terracotta / clay cartoon roof
    const roofMat = createToonMaterial(roofColor, { steps: 3 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(houseW * 0.78, 3.5, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = houseH + 1.75;
    roof.castShadow = true;
    house.add(roof);

    // Cheerful cartoon window
    const winMat = createToonMaterial(0x93c5fd, { steps: 3 });
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.15), winMat);
    win1.position.set(-2.2, 3.2, houseD / 2 + 0.08);
    house.add(win1);

    const win2 = win1.clone();
    win2.position.x = 2.2;
    house.add(win2);

    this.group.add(house);
  }

  public update(delta: number) {
    this.cloudsGroup.children.forEach((cloud, idx) => {
      cloud.position.x += delta * (0.35 + idx * 0.1);
      if (cloud.position.x > 65) {
        cloud.position.x = -65;
      }
    });
  }
}
