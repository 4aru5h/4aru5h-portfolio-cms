/**
 * Portal windows: every art panel renders the same 3D dot world through its own slice
 * of one shared camera, so neighbouring panels line up as windows onto one space.
 *
 *  - One <canvas> + WebGL2 context per art panel, created when the panel comes near the
 *    viewport, released (WEBGL_lose_context) when it is far away. At most three alive.
 *  - One rAF loop for all panels. It runs only while a panel is on screen and the tab is
 *    visible: zero GPU work otherwise.
 *  - The camera covers the whole viewport; each panel's projection is the sub-frustum
 *    matching its getBoundingClientRect(). Rects are read once per frame before any writes.
 *  - Pointer shifts the eye (parallax around the focal plane); scroll moves the camera at
 *    0.45x page speed so the world sits behind the site; fx:pulse sends a shockwave.
 *  - The SVG underneath stays as first paint and fallback. The canvas fades in only after
 *    it has drawn; on context loss it fades out again; a compile failure stops everything.
 */
import { WAVE_PX_PER_MS } from '../fx/grid';
import { PULSE_EVENT, type PulseDetail } from '../fx/pulse';
import { FLOATS, FRAG, VERT, buildNetwork } from './cloud';
import { compile, frustum, lookAt, type Vec3 } from './core';

const TAN = Math.tan((40 * Math.PI) / 180 / 2); // 40deg across the viewport's shorter side
const CAM_Z = 10;
const NEAR = 0.5;
const FAR = 40;
const SCROLL_RATE = 0.45;
const MAX_ALIVE = 3;

interface GLState {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  vao: WebGLVertexArrayObject;
  buf: WebGLBuffer;
  u: Record<'proj' | 'view' | 'time' | 'px' | 'wave' | 'pulse', WebGLUniformLocation | null>;
}

interface Panel {
  host: HTMLElement;
  canvas: HTMLCanvasElement | null;
  st: GLState | null;
  visible: boolean;
  near: boolean;
  lost: boolean;
  shown: boolean;
  bw: number;
  bh: number;
  onLost?: (e: Event) => void;
  onRestored?: () => void;
}

export function startPortals(hosts: HTMLElement[]): () => void {
  const phone = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const total = phone ? 12000 : 40000;
  const dprCap = phone ? 1.5 : 2;
  // Portrait screens see a slice of the world about (width / height) as wide as landscape
  // ones; build the network that much narrower so the same clusters land on screen.
  const aspect = window.innerWidth / window.innerHeight;
  const data = buildNetwork(total, aspect < 1 ? Math.max(0.4, aspect) : 1);
  let drawCount = total;
  let broken = false;

  const panels: Panel[] = hosts.map((host) => ({
    host,
    canvas: null,
    st: null,
    visible: false,
    near: false,
    lost: false,
    shown: false,
    bw: 0,
    bh: 0,
  }));

  // ---- shared state
  const t0 = performance.now();
  const proj = new Float32Array(16);
  const view = new Float32Array(16);
  const pulses = new Float32Array(16).fill(-1e4);
  let pulseSlot = 0;
  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  let raf = 0;
  let lastFrame = 0;
  let frames = 0;
  let frameSum = 0;
  let basis = { x: [1, 0, 0] as Vec3, y: [0, 1, 0] as Vec3, z: [0, 0, 1] as Vec3 };
  let eye: Vec3 = [0, 0, CAM_Z];

  const setup = (gl: WebGL2RenderingContext): GLState => {
    const prog = compile(gl, VERT, FRAG);
    const vao = gl.createVertexArray();
    const buf = gl.createBuffer();
    if (!vao || !buf) throw new Error('buffer alloc failed');
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const stride = FLOATS * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 24);
    gl.bindVertexArray(null);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const loc = (n: string) => gl.getUniformLocation(prog, n);
    return {
      gl,
      prog,
      vao,
      buf,
      u: {
        proj: loc('uProj'),
        view: loc('uView'),
        time: loc('uTime'),
        px: loc('uPx'),
        wave: loc('uWave'),
        pulse: loc('uPulse[0]') ?? loc('uPulse'),
      },
    };
  };

  const fail = () => {
    broken = true;
    panels.forEach(release);
  };

  const create = (p: Panel) => {
    if (broken || p.canvas) return;
    if (panels.filter((q) => q.canvas).length >= MAX_ALIVE) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'gl-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    });
    if (!gl) {
      fail();
      return;
    }
    try {
      p.st = setup(gl);
    } catch (err) {
      console.warn('[gl] falling back to SVG:', err);
      fail();
      return;
    }
    p.onLost = (e) => {
      e.preventDefault();
      p.lost = true;
      p.st = null;
      p.shown = false;
      p.host.classList.remove('gl-on');
    };
    p.onRestored = () => {
      try {
        p.st = setup(gl);
        p.lost = false;
        p.bw = p.bh = 0;
        schedule();
      } catch {
        fail();
      }
    };
    canvas.addEventListener('webglcontextlost', p.onLost);
    canvas.addEventListener('webglcontextrestored', p.onRestored);
    p.canvas = canvas;
    p.bw = p.bh = 0;
    p.host.appendChild(canvas);
  };

  function release(p: Panel) {
    if (!p.canvas) return;
    p.host.classList.remove('gl-on');
    if (p.onLost) p.canvas.removeEventListener('webglcontextlost', p.onLost);
    if (p.onRestored) p.canvas.removeEventListener('webglcontextrestored', p.onRestored);
    const gl = p.st?.gl;
    if (gl && !gl.isContextLost()) {
      gl.deleteBuffer(p.st!.buf);
      gl.deleteVertexArray(p.st!.vao);
      gl.deleteProgram(p.st!.prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    p.canvas.remove();
    p.canvas = null;
    p.st = null;
    p.lost = false;
    p.shown = false;
  }

  // ---- frame
  const frame = (now: number) => {
    raf = 0;
    if (broken || document.hidden) return;
    const live = panels.filter((p) => p.visible && p.st && p.canvas && !p.lost);
    if (!live.length) return;

    // reads first
    const W = window.innerWidth;
    const H = window.innerHeight;
    const rects = live.map((p) => p.canvas!.getBoundingClientRect());
    const scrollY = window.scrollY;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

    // frame-time guard: if the first 60 frames average over 20ms, halve the dots
    if (lastFrame) {
      frames += 1;
      if (frames <= 60) {
        frameSum += Math.min(100, now - lastFrame);
        if (frames === 60 && frameSum / 60 > 20) drawCount = Math.floor(total / 2);
      }
    }
    lastFrame = now;

    // shared camera
    const time = (now - t0) / 1000;
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;
    const minSide = Math.min(W, H);
    const worldPerPx = (2 * CAM_Z * TAN) / minSide;
    const camY = -scrollY * worldPerPx * SCROLL_RATE;
    eye = [px * 1.1 + Math.sin(time * 0.07) * 0.6, camY - py * 0.75 + Math.sin(time * 0.05) * 0.25, CAM_Z];
    basis = lookAt(view, eye, [0, camY, 0], [0, 1, 0]);
    const u = (2 * NEAR * TAN) / minSide; // near-plane units per css px
    const pxScale = (minSide * dpr) / (2 * TAN);
    const wave = WAVE_PX_PER_MS * 1000 * worldPerPx;

    live.forEach((p, i) => {
      const r = rects[i];
      if (r.width < 2 || r.height < 2) return;
      const st = p.st!;
      const gl = st.gl;
      const bw = Math.max(1, Math.round(r.width * dpr));
      const bh = Math.max(1, Math.round(r.height * dpr));
      if (bw !== p.bw || bh !== p.bh) {
        p.canvas!.width = p.bw = bw;
        p.canvas!.height = p.bh = bh;
      }
      gl.viewport(0, 0, bw, bh);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      frustum(proj, (r.left - W / 2) * u, (r.right - W / 2) * u, (H / 2 - r.bottom) * u, (H / 2 - r.top) * u, NEAR, FAR);
      gl.useProgram(st.prog);
      gl.uniformMatrix4fv(st.u.proj, false, proj);
      gl.uniformMatrix4fv(st.u.view, false, view);
      gl.uniform1f(st.u.time, time);
      gl.uniform1f(st.u.px, pxScale);
      gl.uniform1f(st.u.wave, wave);
      gl.uniform4fv(st.u.pulse, pulses);
      gl.bindVertexArray(st.vao);
      gl.drawArrays(gl.POINTS, 0, drawCount);
      gl.bindVertexArray(null);
      if (!p.shown) {
        p.shown = true;
        // fade in on the next frame, once this one has been presented
        requestAnimationFrame(() => p.canvas && p.host.classList.add('gl-on'));
      }
    });

    schedule();
  };

  function schedule() {
    if (!raf && !broken) raf = requestAnimationFrame(frame);
  }

  // ---- visibility: render while on screen, keep a context while near, release when far
  const seeIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const p = panels.find((q) => q.host === e.target);
      if (p) p.visible = e.isIntersecting;
    }
    lastFrame = 0;
    schedule();
  });
  const nearIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const p = panels.find((q) => q.host === e.target);
        if (!p) continue;
        p.near = e.isIntersecting;
        if (p.near) create(p);
        else release(p);
      }
      schedule();
    },
    { rootMargin: '100% 0px 100% 0px' },
  );
  panels.forEach((p) => {
    seeIO.observe(p.host);
    nearIO.observe(p.host);
  });

  // ---- input
  const onMove = (e: PointerEvent) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onPulse = (e: Event) => {
    const d = (e as CustomEvent<PulseDetail>).detail;
    if (!d) return;
    // unproject the viewport point onto the focal plane (z = 0) through the shared camera
    const W = window.innerWidth;
    const H = window.innerHeight;
    const u = (2 * NEAR * TAN) / Math.min(W, H);
    const nx = (d.x - W / 2) * u;
    const ny = (H / 2 - d.y) * u;
    const { x, y, z } = basis;
    const dir: Vec3 = [x[0] * nx + y[0] * ny - z[0] * NEAR, x[1] * nx + y[1] * ny - z[1] * NEAR, x[2] * nx + y[2] * ny - z[2] * NEAR];
    const t = Math.abs(dir[2]) > 1e-6 ? -eye[2] / dir[2] : CAM_Z;
    const o = pulseSlot * 4;
    pulses[o] = eye[0] + dir[0] * t;
    pulses[o + 1] = eye[1] + dir[1] * t;
    pulses[o + 2] = eye[2] + dir[2] * t;
    pulses[o + 3] = (performance.now() - t0) / 1000;
    pulseSlot = (pulseSlot + 1) % 4;
    schedule();
  };
  const onVis = () => {
    lastFrame = 0;
    if (!document.hidden) schedule();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener(PULSE_EVENT, onPulse);
  document.addEventListener('visibilitychange', onVis);

  return () => {
    cancelAnimationFrame(raf);
    raf = 0;
    broken = true;
    seeIO.disconnect();
    nearIO.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener(PULSE_EVENT, onPulse);
    document.removeEventListener('visibilitychange', onVis);
    panels.forEach(release);
  };
}
