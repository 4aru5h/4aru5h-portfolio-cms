/**
 * The dot cloud. Every dot's position is a pure function of its attributes plus shared
 * uniforms (time, pointer camera, pulses), so several canvases can render the identical
 * world without sharing a context or any GPU simulation state.
 *
 * Per dot (10 floats): a.xyz, b.xyz, p = (kind, phase, size, tint)
 *   kind 0 dust · 1 host cluster · 2 link (static dots along an edge) · 3 packet (travels a -> b)
 */

export const FLOATS = 10;

// Hubs are spread wide in x and long in y so the hero panels (and the first scroll) all see some.
// xScale narrows the world for portrait screens, which only see a thin vertical slice of it.
const BASE_VOL = { x: 8.5, yTop: 5, yBot: -10, zNear: 3, zFar: -5 };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Network graph: host clusters, dotted links between neighbours, packets travelling the links, dust. */
export function buildNetwork(count: number, xScale = 1, seed = 0x4a2b5): Float32Array {
  const VOL = { ...BASE_VOL, x: BASE_VOL.x * xScale };
  const spacing = 2.4 * Math.max(0.6, xScale);
  const r = rng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

  // ---- hubs, with a minimum spacing so clusters read as separate hosts
  const hubs: { p: [number, number, number]; s: number; mint: boolean }[] = [];
  for (let tries = 0; hubs.length < 26 && tries < 4000; tries += 1) {
    const p: [number, number, number] = [
      (r() * 2 - 1) * VOL.x,
      VOL.yBot + r() * (VOL.yTop - VOL.yBot),
      VOL.zFar + r() * (VOL.zNear - VOL.zFar),
    ];
    if (hubs.every((h) => Math.hypot(h.p[0] - p[0], h.p[1] - p[1], h.p[2] - p[2]) > spacing)) {
      hubs.push({ p, s: 0.55 + r() * 0.85, mint: r() < 0.3 });
    }
  }

  // ---- links: each hub to its 2-3 nearest neighbours
  const links: [number, number][] = [];
  const seen = new Set<string>();
  hubs.forEach((h, i) => {
    const near = hubs
      .map((o, j) => ({ j, d: Math.hypot(o.p[0] - h.p[0], o.p[1] - h.p[1], o.p[2] - h.p[2]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2 + (r() < 0.4 ? 1 : 0));
    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        links.push([i, j]);
      }
    }
  });

  const out = new Float32Array(count * FLOATS);
  for (let n = 0; n < count; n += 1) {
    const o = n * FLOATS;
    const roll = r();
    const phase = r();
    let kind: number;
    let a: number[];
    let b: number[];
    let size: number;
    let tint: number;

    if (roll < 0.4) {
      kind = 1;
      const h = hubs[Math.floor(r() * hubs.length)];
      // a dense core plus a looser shell
      const sp = h.s * (r() < 0.7 ? 0.22 : 0.5);
      a = [h.p[0] + gauss() * sp, h.p[1] + gauss() * sp, h.p[2] + gauss() * sp];
      b = a;
      size = 0.026 + r() * 0.022;
      tint = h.mint ? 0.85 : r() < 0.08 ? 1 : 0;
    } else if (roll < 0.66) {
      kind = 2;
      const [i, j] = links[Math.floor(r() * links.length)];
      const t = r();
      const A = hubs[i].p;
      const B = hubs[j].p;
      const jit = 0.025;
      a = [A[0] + (B[0] - A[0]) * t + gauss() * jit, A[1] + (B[1] - A[1]) * t + gauss() * jit, A[2] + (B[2] - A[2]) * t + gauss() * jit];
      b = a;
      size = 0.016 + r() * 0.01;
      tint = r() < 0.12 ? 0.6 : 0;
    } else if (roll < 0.72) {
      kind = 3;
      const [i, j] = links[Math.floor(r() * links.length)];
      const fwd = r() < 0.5;
      a = hubs[fwd ? i : j].p;
      b = hubs[fwd ? j : i].p;
      size = 0.05 + r() * 0.03;
      tint = 1;
    } else {
      kind = 0;
      a = [(r() * 2 - 1) * (VOL.x + 3 * xScale), VOL.yBot - 3 + r() * (VOL.yTop - VOL.yBot + 5), VOL.zFar - 3 + r() * (VOL.zNear - VOL.zFar + 3.5)];
      b = a;
      size = 0.012 + r() * 0.014;
      tint = r() < 0.1 ? 0.7 : 0;
    }

    out[o] = a[0];
    out[o + 1] = a[1];
    out[o + 2] = a[2];
    out[o + 3] = b[0];
    out[o + 4] = b[1];
    out[o + 5] = b[2];
    out[o + 6] = kind;
    out[o + 7] = phase;
    out[o + 8] = size;
    out[o + 9] = tint;
  }
  return out;
}

export const VERT = /* glsl */ `#version 300 es
layout(location = 0) in vec3 aA;
layout(location = 1) in vec3 aB;
layout(location = 2) in vec4 aP;
uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;
uniform float uPx;
uniform float uWave;
uniform vec4 uPulse[4];
out vec4 vCol;

void main() {
  float kind = aP.x;
  float ph = aP.y;
  vec3 p = aA;
  if (kind > 2.5) {
    float t = fract(uTime * (0.07 + 0.06 * fract(ph * 7.13)) + ph);
    p = mix(aA, aB, t);
  }
  float amp = kind < 0.5 ? 0.14 : 0.05;
  p += amp * vec3(
    sin(uTime * 0.31 + ph * 6.283 + aA.y * 0.7),
    sin(uTime * 0.27 + ph * 4.100 + aA.z * 0.6),
    sin(uTime * 0.23 + ph * 5.300 + aA.x * 0.5));

  float glow = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 q = uPulse[i];
    float age = uTime - q.w;
    if (age > 0.0 && age < 3.0) {
      vec3 d = p - q.xyz;
      float dist = length(d);
      float x = (dist - age * uWave) / 0.9;
      float band = exp(-x * x) * (1.0 - age / 3.0);
      p += d / (dist + 1e-3) * band * 0.7;
      glow += band;
    }
  }

  vec4 vp = uView * vec4(p, 1.0);
  gl_Position = uProj * vp;
  float depth = max(0.1, -vp.z);
  gl_PointSize = clamp(aP.z * uPx / depth * (1.0 + glow), 1.0, 64.0);

  vec3 bone = vec3(0.949, 0.941, 0.918);
  vec3 mint = vec3(0.498, 0.957, 0.690);
  vec3 c = mix(bone, mint, clamp(max(aP.w, glow), 0.0, 1.0));
  float fog = clamp(1.0 - (depth - 7.0) / 14.0, 0.15, 1.0);
  float a = kind < 0.5 ? 0.38 : kind < 1.5 ? 0.9 : kind < 2.5 ? 0.5 : 1.0;
  a = min(1.0, a * fog + glow * 0.6);
  vCol = vec4(c * a, a);
}
`;

export const FRAG = /* glsl */ `#version 300 es
precision mediump float;
in vec4 vCol;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  outColor = vCol * (1.0 - smoothstep(0.45, 1.0, r2));
}
`;
