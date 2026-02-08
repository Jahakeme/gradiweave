import type { OklchColour } from '@/types/gradient';

export function interpolateOklch(
  a: OklchColour,
  b: OklchColour,
  t: number,
): OklchColour {
  let h1 = a.h;
  let h2 = b.h;
  const hDiff = h2 - h1;

  // Shortest-path hue wrapping
  if (hDiff > 180) h1 += 360;
  else if (hDiff < -180) h2 += 360;

  return {
    l: a.l + (b.l - a.l) * t,
    c: a.c + (b.c - a.c) * t,
    h: ((h1 + (h2 - h1) * t) % 360 + 360) % 360,
    a: a.a + (b.a - a.a) * t,
  };
}
