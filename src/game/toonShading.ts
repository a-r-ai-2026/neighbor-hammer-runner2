import * as THREE from 'three';

/**
 * Shared Cel-Shading Gradient Maps for Wind Waker Aesthetic
 */
let threeStepGradient: THREE.DataTexture | null = null;
let fourStepGradient: THREE.DataTexture | null = null;

export function getThreeStepToonGradient(): THREE.DataTexture {
  if (threeStepGradient) return threeStepGradient;

  // 3-step cel shading: shadow (0.35), midtone (0.75), highlight (1.0)
  const colors = new Uint8Array([90, 195, 255]);
  threeStepGradient = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat);
  threeStepGradient.minFilter = THREE.NearestFilter;
  threeStepGradient.magFilter = THREE.NearestFilter;
  threeStepGradient.generateMipmaps = false;
  threeStepGradient.needsUpdate = true;
  return threeStepGradient;
}

export function getFourStepToonGradient(): THREE.DataTexture {
  if (fourStepGradient) return fourStepGradient;

  // 4-step cel shading for smoother character and prop surfaces
  const colors = new Uint8Array([70, 140, 210, 255]);
  fourStepGradient = new THREE.DataTexture(colors, 4, 1, THREE.RedFormat);
  fourStepGradient.minFilter = THREE.NearestFilter;
  fourStepGradient.magFilter = THREE.NearestFilter;
  fourStepGradient.generateMipmaps = false;
  fourStepGradient.needsUpdate = true;
  return fourStepGradient;
}

/**
 * Helper to create a Wind Waker styled MeshToonMaterial with stepped lighting
 */
export function createToonMaterial(
  color: THREE.ColorRepresentation,
  options: {
    steps?: 3 | 4;
    wireframe?: boolean;
    transparent?: boolean;
    opacity?: number;
    side?: THREE.Side;
    emissive?: THREE.ColorRepresentation;
    emissiveIntensity?: number;
  } = {}
): THREE.MeshToonMaterial {
  const gradientMap = options.steps === 4 ? getFourStepToonGradient() : getThreeStepToonGradient();

  return new THREE.MeshToonMaterial({
    color,
    gradientMap,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1.0,
    side: options.side ?? THREE.FrontSide,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0.0,
    wireframe: options.wireframe ?? false,
  });
}
