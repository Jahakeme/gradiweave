import { create } from 'zustand';
import type {
  GradientState,
  GradientType,
  WarpShape,
  SimpleGradientSubtype,
  PixelDensity,
  OklchColour,
} from '@/types/gradient';
import { oklchToHex } from '@/lib/colours/conversion';
import { generateRandomPalette } from '@/lib/colours/random';

export const useGradientStore = create<GradientState>((set, get) => ({
  type: 'soft-bezier',
  warpShape: 'flat',
  width: 1200,
  height: 800,
  warp: 0,
  warpSize: 0.5,
  noise: 0,
  colours: generateRandomPalette(3),
  simpleSubtype: 'linear',
  angle: 135,
  pixelDensity: 1,

  setType: (type: GradientType) => set({ type }),
  setWarpShape: (shape: WarpShape) => set({ warpShape: shape }),
  setDimensions: (w: number, h: number) => set({ width: w, height: h }),
  setWarp: (value: number) => set({ warp: value }),
  setWarpSize: (value: number) => set({ warpSize: value }),
  setNoise: (value: number) => set({ noise: value }),
  setSimpleSubtype: (subtype: SimpleGradientSubtype) => set({ simpleSubtype: subtype }),
  setAngle: (angle: number) => set({ angle }),
  setPixelDensity: (density: PixelDensity) => set({ pixelDensity: density }),

  setColours: (colours) => set({ colours }),

  addColour: (oklch: OklchColour) => {
    const { colours } = get();
    if (colours.length >= 12) return;
    set({
      colours: [
        ...colours,
        {
          id: crypto.randomUUID(),
          oklch,
          hex: oklchToHex(oklch),
          displayFormat: 'oklch',
        },
      ],
    });
  },

  removeColour: (id: string) => {
    const { colours } = get();
    if (colours.length <= 2) return;
    set({ colours: colours.filter((c) => c.id !== id) });
  },

  updateColour: (id: string, oklch: OklchColour) => {
    set({
      colours: get().colours.map((c) =>
        c.id === id ? { ...c, oklch, hex: oklchToHex(oklch) } : c,
      ),
    });
  },

  updateColourPosition: (id: string, position: { x: number; y: number }) => {
    set({
      colours: get().colours.map((c) =>
        c.id === id ? { ...c, position } : c,
      ),
    });
  },

  setColourFormat: (id: string, format: 'oklch' | 'hex') => {
    set({
      colours: get().colours.map((c) =>
        c.id === id ? { ...c, displayFormat: format } : c,
      ),
    });
  },

  randomiseColours: () => {
    const count = get().colours.length;
    set({ colours: generateRandomPalette(count) });
  },
}));
