import { FixtureSpec, LevelConfig } from './types';

export const FIXTURE_SPECS: FixtureSpec[] = [
  {
    id: 'awning_window',
    name: 'Awning Window',
    category: 'window',
    width: 6.0,
    height: 3.5,
    depth: 0.4,
    frameColor: '#f8fafc', // crisp white PVC
    frameMaterial: 'pvc_white',
    description: 'Hinged at top and swings outward. Compact footprint with thick weatherstripped perimeter.',
    facts: [
      'Awning windows can stay open during rain because the outward glass sash deflects falling water like a roof canopy.',
      'Because they seal with a compression gasket clamped by crank locks, awning windows have one of the highest airtightness ratings.',
      'Often placed high on walls or above doors to promote natural passive ventilation while maintaining full privacy.',
      'First popularized in mid-century coastal architecture to capture sea breezes without letting spray inside.'
    ],
    panelsCount: 1,
    isPatioDoor: false,
    glassStyle: 'clear',
  },
  {
    id: 'sliding_doors',
    name: 'Sliding Patio Doors',
    category: 'door',
    width: 9.0,
    height: 6.0,
    depth: 0.5,
    frameColor: '#334155', // architectural slate bronze
    frameMaterial: 'bronze',
    description: 'Wide dual-track patio sliders. Large expansive glass area requiring fast side-to-side defense.',
    facts: [
      'Sliding patio doors were popularized in 1950s California ranch houses to create seamless indoor-outdoor living.',
      'Building codes require patio door glass to be tempered safety glass, which is 4x to 5x stronger than standard float glass.',
      'Modern tandem stainless steel rollers can glide heavy 200-lb thermal double-glazed glass panels with minimal fingertip effort.',
      'Low-E (low-emissivity) coatings reflect infrared heat while transmitting up to 70% of natural visible sunlight.'
    ],
    panelsCount: 2,
    isPatioDoor: true,
    glassStyle: 'double_pane',
  },
  {
    id: 'casement_window',
    name: 'Casement Window',
    category: 'window',
    width: 6.8,
    height: 4.2,
    depth: 0.4,
    frameColor: '#f1f5f9',
    frameMaterial: 'pvc_white',
    description: 'Side-hinged crank window that projects outward to capture fresh breezes.',
    facts: [
      'Casement windows were the standard window in Europe before double-hung sash windows were invented.',
      'When fully opened perpendicular to the wall, casement windows act like aerodynamic funnels channeling cross breezes inside.',
      'Single-lever multi-point locks secure casement frames at three separate points along the jamb simultaneously.',
      'Because the sash presses tight against the frame when closed, strong winds actually press the seal tighter.'
    ],
    panelsCount: 2,
    isPatioDoor: false,
    glassStyle: 'clear',
  },
  {
    id: 'french_doors',
    name: 'French Patio Doors',
    category: 'door',
    width: 9.5,
    height: 6.2,
    depth: 0.55,
    frameColor: '#ffffff',
    frameMaterial: 'pvc_white',
    description: 'Classic double glass doors with elegant divided lites (mullion grids).',
    facts: [
      'Originating in 17th-century Renaissance France as "porte-fenêtre", they let maximum sunlight into salons before electricity.',
      'French doors feature individual or simulated divided lites (mullion grids) inspired by classical Greek proportions.',
      'A decorative astragal vertical moulding bar seals the junction where the two active door leaves meet in the center.',
      'Modern French patio doors feature dual concealed perimeter gaskets for severe-weather wind and water resistance.'
    ],
    panelsCount: 2,
    isPatioDoor: true,
    glassStyle: 'divided_lites',
  },
  {
    id: 'double_hung_window',
    name: 'Double Hung Window',
    category: 'window',
    width: 7.2,
    height: 4.6,
    depth: 0.45,
    frameColor: '#e2e8f0',
    frameMaterial: 'pvc_white',
    description: 'Traditional two-sash window where both upper and lower panes glide vertically.',
    facts: [
      'Invented in England around 1670, double-hung windows are the most common historical window in American homes.',
      'Opening both top and bottom sashes simultaneously creates natural chimney convection: warm room air escapes at the top while cool air enters below.',
      'Modern vinyl versions feature tilt-in sashes so homeowners can wash the exterior glass comfortably from inside.',
      'Historical double-hung sash windows used hidden cast-iron counterweights suspended by cotton cords inside the wall cavities.'
    ],
    panelsCount: 2,
    isPatioDoor: false,
    glassStyle: 'divided_lites',
  },
  {
    id: 'gliding_window',
    name: 'Gliding Window',
    category: 'window',
    width: 8.0,
    height: 4.0,
    depth: 0.45,
    frameColor: '#1e293b',
    frameMaterial: 'dark_slate',
    description: 'Horizontal sliding window designed for wide exterior sightlines and easy operation.',
    facts: [
      'Gliding windows offer uninterrupted panoramic views because both sashes slide horizontally along parallel tracks.',
      'They do not project outwards, making them ideal above walkways, patio decks, or landscaping bushes.',
      'High-performance gliding tracks use self-lubricating nylon or brass rollers for effortless whisper-quiet glide.',
      'Gliding windows are a staple in Mid-Century Modern architecture for creating horizontal geometric ribbons of daylight.'
    ],
    panelsCount: 2,
    isPatioDoor: false,
    glassStyle: 'double_pane',
  },
  {
    id: 'bay_window',
    name: 'Bay Window',
    category: 'window',
    width: 10.5,
    height: 4.8,
    depth: 1.4,
    frameColor: '#f8fafc',
    frameMaterial: 'pvc_white',
    description: 'Three-segment architectural feature extending outward with angled flanking panes.',
    facts: [
      'Bay windows became an iconic hallmark of Victorian domestic architecture, dramatically expanding interior living space.',
      'A classic bay window consists of three panels: a wide central picture window flanked by two angled venting sashes at 30° or 45°.',
      'The projecting floor area inside often doubles as a sunny breakfast nook, reading alcove, or cozy window seat.',
      'Cantilevered bay assemblies are supported from above using heavy-duty steel tie-rod turnbuckles anchored into roof ceiling joists.'
    ],
    panelsCount: 3,
    isPatioDoor: false,
    glassStyle: 'divided_lites',
  },
  {
    id: 'bow_window',
    name: 'Bow Window',
    category: 'window',
    width: 11.5,
    height: 5.0,
    depth: 1.6,
    frameColor: '#78350f', // rich wood tone
    frameMaterial: 'natural_wood',
    description: 'Graceful curved panoramic assembly of four joined casement panes forming a gentle arc.',
    facts: [
      'First introduced in the 18th century Federal period, bow windows curve outward in a sweeping semi-circular radial arc.',
      'Unlike a 3-sided angled bay, a bow window uses four, five, or six continuous mullioned panels to create a cylindrical panorama.',
      'Bow windows allow daylight to enter from multiple compass angles as the sun tracks across the sky from dawn to dusk.',
      'The structural curved header and sill require custom laminated radius millwork crafted to tight tolerances.'
    ],
    panelsCount: 4,
    isPatioDoor: false,
    glassStyle: 'curved',
  },
  {
    id: 'picture_window',
    name: 'Picture Window',
    category: 'window',
    width: 12.0,
    height: 5.4,
    depth: 0.45,
    frameColor: '#0f172a',
    frameMaterial: 'dark_slate',
    description: 'Expansive uninterrupted plate glass offering maximum natural light and high vulnerability.',
    facts: [
      'Picture windows are non-operable (fixed) glazed openings engineered solely to frame outdoor landscape scenery like a living painting.',
      'Because they have no moving sashes or sash weights, picture windows achieve the highest energy insulation ratings (lowest air infiltration).',
      'Large picture windows often use argon gas fill sealed hermetically between panes to double thermal efficiency.',
      'In mid-century modern Eichler homes, floor-to-ceiling picture windows dissolved the boundary between living room and garden.'
    ],
    panelsCount: 1,
    isPatioDoor: false,
    glassStyle: 'clear',
  },
  {
    id: 'coastal_impact_window',
    name: 'Coastal Impact Window',
    category: 'window',
    width: 10.0,
    height: 5.0,
    depth: 0.6,
    frameColor: '#475569',
    frameMaterial: 'bronze',
    description: 'Heavy-duty storm-rated aluminum reinforced frame designed to withstand hurricane winds and debris.',
    facts: [
      'Impact glass consists of two glass panes bonded by a tough, flexible polyvinyl butyral (PVB) interlayer under 200 PSI heat.',
      'During certified missile testing, coastal impact windows must survive a 9-pound 2x4 lumber projectile fired at 50 feet per second.',
      'Even if cracked, the laminated interlayer keeps the envelope airtight, preventing catastrophic roof blow-off during hurricanes.',
      'Coastal impact windows also block 99% of damaging UV fading rays and reduce outside neighborhood traffic noise by up to 80%.'
    ],
    panelsCount: 2,
    isPatioDoor: false,
    glassStyle: 'impact_rated',
  },
  {
    id: 'specialty_window',
    name: 'Specialty Arch Window',
    category: 'window',
    width: 11.0,
    height: 5.8,
    depth: 0.5,
    frameColor: '#f1f5f9',
    frameMaterial: 'pvc_white',
    description: 'Custom cathedral arch with geometric sunburst mullions guarding the master suite.',
    facts: [
      'Arched and Palladian windows trace their heritage back to 16th-century Venetian Renaissance master Andrea Palladio.',
      'The curved top arch is constructed using custom steam-bent or precision-molded vinyl radius sash extrusions.',
      'Sunburst radiating muntin grids require complex compound-angle joinery where each spoke intersects the perimeter rim.',
      'Specialty geometric shapes are popular in cathedral ceilings, entry foyers, and master bedroom gables for dramatic focal points.'
    ],
    panelsCount: 3,
    isPatioDoor: false,
    glassStyle: 'arched',
  },
];

export function getLevelConfig(level: number): LevelConfig {
  const index = (level - 1) % FIXTURE_SPECS.length;
  const loopCount = Math.floor((level - 1) / FIXTURE_SPECS.length);
  const baseFixture = FIXTURE_SPECS[index];

  // In later loops, width escalates slightly for extra challenge
  const widthScale = 1 + loopCount * 0.15;
  const fixture: FixtureSpec = {
    ...baseFixture,
    width: Math.min(14.0, baseFixture.width * widthScale),
  };

  // Accelerated coin rewards for faster progression: 15, 30, 45, 60...
  const coinReward = 15 * level;
  
  // Projectile counts and speeds scale with level
  const projectileCount = 14 + level * 4;
  const spawnInterval = Math.max(0.65, 1.8 - level * 0.08);
  const baseSpeed = 16 + Math.min(22, level * 1.6);

  return {
    levelNumber: level,
    fixture,
    projectileCount,
    spawnInterval,
    baseSpeed,
    coinReward,
  };
}
