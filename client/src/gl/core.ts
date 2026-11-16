/** Minimal WebGL2 helpers: program compile/link with readable errors, and the two matrices we need. */

export function compile(gl: WebGL2RenderingContext, vert: string, frag: string): WebGLProgram {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) throw new Error('createShader failed');
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
      const log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(`${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader: ${log}`);
    }
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER, vert);
  const fs = shader(gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram();
  if (!prog) throw new Error('createProgram failed');
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
    throw new Error(`link: ${gl.getProgramInfoLog(prog)}`);
  }
  return prog;
}

export type Vec3 = [number, number, number];

/** Off-axis perspective frustum (column-major), like glFrustum. */
export function frustum(out: Float32Array, l: number, r: number, b: number, t: number, n: number, f: number) {
  out.fill(0);
  out[0] = (2 * n) / (r - l);
  out[5] = (2 * n) / (t - b);
  out[8] = (r + l) / (r - l);
  out[9] = (t + b) / (t - b);
  out[10] = -(f + n) / (f - n);
  out[11] = -1;
  out[14] = (-2 * f * n) / (f - n);
  return out;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** View matrix; also returns the camera basis so screen points can be unprojected. */
export function lookAt(out: Float32Array, eye: Vec3, target: Vec3, up: Vec3) {
  const z = norm(sub(eye, target));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  out.set([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
  return { x, y, z };
}
