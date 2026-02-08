// --- Colour Types ---

export interface OklchColour {
  l: number;  // 0–1 (lightness)
  c: number;  // 0–0.4 (chroma)
  h: number;  // 0–360 (hue)
  a: number;  // 0–1 (alpha)
}

export interface ColourStop {
  id: string;
  oklch: OklchColour;
  hex: string;
  position?: { x: number; y: number };
  displayFormat: 'oklch' | 'hex';
  locked: boolean;
}

// --- Gradient Types ---

export const GRADIENT_TYPES = [
  'sharp-bezier',
  'soft-bezier',
  'mesh-static',
  'mesh-grid',
  'simple',
] as const;
export type GradientType = (typeof GRADIENT_TYPES)[number];

export const GRADIENT_TYPE_LABELS: Record<GradientType, string> = {
  'sharp-bezier': 'Sharp Bezier',
  'soft-bezier': 'Soft Bezier',
  'mesh-static': 'Mesh Static',
  'mesh-grid': 'Mesh Grid',
  'simple': 'Simple',
};

export const GRADIENT_TYPE_INDEX: Record<GradientType, number> = {
  'sharp-bezier': 0,
  'soft-bezier': 1,
  'mesh-static': 2,
  'mesh-grid': 3,
  'simple': 4,
};

// --- Simple Gradient Sub-types ---

export const SIMPLE_SUBTYPES = ['linear', 'radial', 'conic'] as const;
export type SimpleGradientSubtype = (typeof SIMPLE_SUBTYPES)[number];

// --- Warp Shapes ---

export const WARP_SHAPES = [
  // Noise-based (9)
  'simplex-noise',
  'fbm-noise',
  'circular-noise',
  'value-noise',
  'worley-noise',
  'voronoi-noise',
  'domain-warping',
  'smooth-noise',
  'gravity',
  // Geometric (6)
  'waves',
  'circular',
  'oval',
  'rows',
  'columns',
  'flat',
] as const;
export type WarpShape = (typeof WARP_SHAPES)[number];

export const WARP_SHAPE_LABELS: Record<WarpShape, string> = {
  'simplex-noise': 'Simplex Noise',
  'fbm-noise': 'FBM Noise',
  'circular-noise': 'Circular Noise',
  'value-noise': 'Value Noise',
  'worley-noise': 'Worley Noise',
  'voronoi-noise': 'Voronoi Noise',
  'domain-warping': 'Domain Warping',
  'smooth-noise': 'Smooth Noise',
  'gravity': 'Gravity',
  'waves': 'Waves',
  'circular': 'Circular',
  'oval': 'Oval',
  'rows': 'Rows',
  'columns': 'Columns',
  'flat': 'Flat',
};

export const WARP_SHAPE_INDEX: Record<WarpShape, number> = {
  'simplex-noise': 0,
  'fbm-noise': 1,
  'circular-noise': 2,
  'value-noise': 3,
  'worley-noise': 4,
  'voronoi-noise': 5,
  'domain-warping': 6,
  'smooth-noise': 7,
  'gravity': 8,
  'waves': 9,
  'circular': 10,
  'oval': 11,
  'rows': 12,
  'columns': 13,
  'flat': 14,
};

export const NOISE_WARP_SHAPES: WarpShape[] = [
  'simplex-noise', 'fbm-noise', 'circular-noise', 'value-noise',
  'worley-noise', 'voronoi-noise', 'domain-warping', 'smooth-noise', 'gravity',
];

export const GEOMETRIC_WARP_SHAPES: WarpShape[] = [
  'waves', 'circular', 'oval', 'rows', 'columns', 'flat',
];

// --- Export ---

export type PixelDensity = 1 | 2 | 3 | 4;

// --- Store Shape ---

export interface GradientState {
  type: GradientType;
  warpShape: WarpShape;
  width: number;
  height: number;
  warp: number;
  warpSize: number;
  noise: number;
  colours: ColourStop[];
  simpleSubtype: SimpleGradientSubtype;
  angle: number;
  pixelDensity: PixelDensity;

  setType: (type: GradientType) => void;
  setWarpShape: (shape: WarpShape) => void;
  setDimensions: (w: number, h: number) => void;
  setWarp: (value: number) => void;
  setWarpSize: (value: number) => void;
  setNoise: (value: number) => void;
  setSimpleSubtype: (subtype: SimpleGradientSubtype) => void;
  setAngle: (angle: number) => void;
  setPixelDensity: (density: PixelDensity) => void;
  setColours: (colours: ColourStop[]) => void;
  addColour: (oklch: OklchColour) => void;
  removeColour: (id: string) => void;
  updateColour: (id: string, oklch: OklchColour) => void;
  updateColourPosition: (id: string, position: { x: number; y: number }) => void;
  setColourFormat: (id: string, format: 'oklch' | 'hex') => void;
  toggleColourLock: (id: string) => void;
  randomiseColours: () => void;
}
