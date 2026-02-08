export const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// ---- Fragment shader chunks ----

const HEADER = `#version 300 es
precision highp float;
out vec4 fragColor;`;

const UNIFORMS = `
uniform vec2 u_resolution;
uniform vec3 u_coloursOklch[12];
uniform int u_colourCount;
uniform int u_gradientType;   // 0=sharp-bezier, 1=soft-bezier, 2=mesh-static, 3=mesh-grid, 4=simple
uniform int u_warpType;       // 0-14
uniform float u_warp;
uniform float u_warpSize;
uniform float u_noise;
uniform float u_angle;        // degrees
uniform int u_simpleSubtype;  // 0=linear, 1=radial, 2=conic
uniform vec2 u_colourPositions[12];
`;

const NOISE_FUNCTIONS = `
// --- Hash functions ---
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// --- Simplex 2D noise (Ashima Arts) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

float snoise2(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,   // (3.0-sqrt(3.0))/6.0
    0.366025403784439,   // 0.5*(sqrt(3.0)-1.0)
   -0.577350269189626,   // -1.0 + 2.0 * C.x
    0.024390243902439    // 1.0 / 41.0
  );

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;

  return 130.0 * dot(m, g);
}

// --- FBM ---
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise2(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`;

const OKLCH_FUNCTIONS = `
// --- OKLCH to linear RGB ---
vec3 oklchToLinearRgb(vec3 oklch) {
  float L = oklch.x;
  float C = oklch.y;
  float h = oklch.z * 3.14159265 / 180.0;

  float a = C * cos(h);
  float b = C * sin(h);

  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;

  return vec3(
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

// --- Linear to sRGB gamma ---
vec3 linearToSrgb(vec3 c) {
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(0.0031308, c));
}

// --- OKLCH interpolation with hue wrapping ---
vec3 interpolateOklch(vec3 oklch1, vec3 oklch2, float t) {
  float h1 = oklch1.z;
  float h2 = oklch2.z;
  float hDiff = h2 - h1;

  if (hDiff > 180.0) h1 += 360.0;
  else if (hDiff < -180.0) h2 += 360.0;

  return vec3(
    mix(oklch1.x, oklch2.x, t),
    mix(oklch1.y, oklch2.y, t),
    mod(mix(h1, h2, t), 360.0)
  );
}
`;

const WARP_FUNCTIONS = `
// --- Warp dispatcher (Phase 2: only flat implemented) ---
vec2 applyWarp(vec2 uv, int warpType, float intensity, float scale) {
  if (intensity <= 0.0 || warpType == 14) return uv; // flat or zero intensity

  // Simplex noise warp (type 0)
  if (warpType == 0) {
    float n1 = snoise2(uv * scale * 4.0);
    float n2 = snoise2(uv * scale * 4.0 + vec2(5.2, 1.3));
    return uv + vec2(n1, n2) * intensity * 0.3;
  }

  // FBM warp (type 1)
  if (warpType == 1) {
    float n1 = fbm(uv * scale * 4.0, 6);
    float n2 = fbm(uv * scale * 4.0 + vec2(5.2, 1.3), 6);
    return uv + vec2(n1, n2) * intensity * 0.3;
  }

  // Waves (type 9)
  if (warpType == 9) {
    return uv + vec2(
      sin(uv.y * scale * 6.28 * 4.0),
      sin(uv.x * scale * 6.28 * 4.0)
    ) * intensity * 0.05;
  }

  // Rows (type 12)
  if (warpType == 12) {
    return uv + vec2(sin(uv.y * scale * 6.28 * 4.0) * intensity * 0.05, 0.0);
  }

  // Columns (type 13)
  if (warpType == 13) {
    return uv + vec2(0.0, sin(uv.x * scale * 6.28 * 4.0) * intensity * 0.05);
  }

  // Stub: remaining warps return uv for now
  return uv;
}
`;

const GRADIENT_FUNCTIONS = `
// --- Multi-stop colour lookup ---
vec3 getGradientColour(float t) {
  t = clamp(t, 0.0, 1.0);
  if (u_colourCount <= 1) return u_coloursOklch[0];

  float scaled = t * float(u_colourCount - 1);
  int idx = int(floor(scaled));
  float localT = fract(scaled);

  idx = min(idx, u_colourCount - 2);

  return interpolateOklch(u_coloursOklch[idx], u_coloursOklch[idx + 1], localT);
}

// --- Bezier easing ---
float sharpBezier(float t) {
  float u = 1.0 - t;
  return u*u*u*0.0 + 3.0*u*u*t*0.05 + 3.0*u*t*t*0.95 + t*t*t*1.0;
}

float softBezier(float t) {
  float u = 1.0 - t;
  return u*u*u*0.0 + 3.0*u*u*t*0.4 + 3.0*u*t*t*0.6 + t*t*t*1.0;
}

// --- Gradient type functions ---

// Directional gradient along angle
float directionalT(vec2 uv, float angleDeg) {
  float angle = angleDeg * 3.14159265 / 180.0;
  return dot(uv - 0.5, vec2(cos(angle), sin(angle))) + 0.5;
}

vec3 sharpBezierGradient(vec2 uv) {
  float t = clamp(directionalT(uv, u_angle), 0.0, 1.0);
  return getGradientColour(sharpBezier(t));
}

vec3 softBezierGradient(vec2 uv) {
  float t = clamp(directionalT(uv, u_angle), 0.0, 1.0);
  return getGradientColour(softBezier(t));
}

vec3 meshStaticGradient(vec2 uv) {
  // Inverse-distance weighted interpolation
  // Convert OKLCH to Lab-like (L, a, b) for proper averaging, then back
  float totalWeight = 0.0;
  float sumL = 0.0;
  float sumA = 0.0;
  float sumB = 0.0;
  for (int i = 0; i < 12; i++) {
    if (i >= u_colourCount) break;
    float d = distance(uv, u_colourPositions[i]);
    float w = 1.0 / (pow(d, 2.5) + 0.0001);
    float hRad = u_coloursOklch[i].z * 3.14159265 / 180.0;
    sumL += u_coloursOklch[i].x * w;
    sumA += u_coloursOklch[i].y * cos(hRad) * w;
    sumB += u_coloursOklch[i].y * sin(hRad) * w;
    totalWeight += w;
  }
  sumL /= totalWeight;
  sumA /= totalWeight;
  sumB /= totalWeight;
  float C = sqrt(sumA * sumA + sumB * sumB);
  float H = atan(sumB, sumA) * 180.0 / 3.14159265;
  if (H < 0.0) H += 360.0;
  return vec3(sumL, C, H);
}

vec3 meshGridGradient(vec2 uv) {
  // Auto-grid: determine grid dimensions from colour count
  int cols = int(ceil(sqrt(float(u_colourCount))));
  int rows = int(ceil(float(u_colourCount) / float(cols)));

  float cellX = uv.x * float(cols);
  float cellY = uv.y * float(rows);

  int x0 = int(floor(cellX));
  int y0 = int(floor(cellY));
  int x1 = x0 + 1;
  int y1 = y0 + 1;

  // Smoothstep for smoother blending between cells
  float fx = smoothstep(0.0, 1.0, fract(cellX));
  float fy = smoothstep(0.0, 1.0, fract(cellY));

  // Clamp to grid bounds
  x0 = min(x0, cols - 1);
  x1 = min(x1, cols - 1);
  y0 = min(y0, rows - 1);
  y1 = min(y1, rows - 1);

  // Map grid position to colour index
  int i00 = min(y0 * cols + x0, u_colourCount - 1);
  int i10 = min(y0 * cols + x1, u_colourCount - 1);
  int i01 = min(y1 * cols + x0, u_colourCount - 1);
  int i11 = min(y1 * cols + x1, u_colourCount - 1);

  // Bilinear interpolation in OKLCH
  vec3 top = interpolateOklch(u_coloursOklch[i00], u_coloursOklch[i10], fx);
  vec3 bottom = interpolateOklch(u_coloursOklch[i01], u_coloursOklch[i11], fx);
  return interpolateOklch(top, bottom, fy);
}

vec3 simpleGradient(vec2 uv) {
  float t;
  if (u_simpleSubtype == 0) {
    // Linear
    t = directionalT(uv, u_angle);
  } else if (u_simpleSubtype == 1) {
    // Radial
    t = length(uv - 0.5) * 2.0;
  } else {
    // Conic
    t = atan(uv.y - 0.5, uv.x - 0.5) / (2.0 * 3.14159265) + 0.5;
  }
  t = clamp(t, 0.0, 1.0);
  return getGradientColour(t);
}
`;

const MAIN_FUNCTION = `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Apply warp
  uv = applyWarp(uv, u_warpType, u_warp, u_warpSize);

  // Select gradient type
  vec3 oklch;
  if (u_gradientType == 0) {
    oklch = sharpBezierGradient(uv);
  } else if (u_gradientType == 1) {
    oklch = softBezierGradient(uv);
  } else if (u_gradientType == 2) {
    oklch = meshStaticGradient(uv);
  } else if (u_gradientType == 3) {
    oklch = meshGridGradient(uv);
  } else {
    oklch = simpleGradient(uv);
  }

  // Convert to sRGB
  vec3 rgb = oklchToLinearRgb(oklch);
  rgb = linearToSrgb(rgb);
  rgb = clamp(rgb, 0.0, 1.0);

  // Film grain noise
  if (u_noise > 0.0) {
    float grain = (hash(gl_FragCoord.xy * 0.1 + fract(u_angle * 0.01)) - 0.5) * u_noise * 0.15;
    rgb += grain;
    rgb = clamp(rgb, 0.0, 1.0);
  }

  fragColor = vec4(rgb, 1.0);
}
`;

export const FRAGMENT_SHADER = [
  HEADER,
  UNIFORMS,
  NOISE_FUNCTIONS,
  OKLCH_FUNCTIONS,
  WARP_FUNCTIONS,
  GRADIENT_FUNCTIONS,
  MAIN_FUNCTION,
].join('\n');
