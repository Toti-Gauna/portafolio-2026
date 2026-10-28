/**
 * Shared pieces for the scenes: seeded randomness, the "light" blending, GLSL snippets, screen anchoring
 * and disposal. Only scene chunks and the engine import this (it imports three).
 *
 * Colour: ColorManagement is off (see engine.ts), so every colour here is the sRGB value written to the
 * screen. Light is added on top of the page's CSS gradient (alpha stays 0); occluders (an eclipse disc,
 * a cube face) use normal blending and do cover the gradient.
 */
import {
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  Color,
  CustomBlending,
  Material,
  Mesh,
  type Object3D,
  OneFactor,
  type PerspectiveCamera,
  ShaderMaterial,
  type Texture,
  Vector3,
  ZeroFactor,
  type IUniform,
} from 'three';

/** mulberry32: small, fast, good enough for layout noise. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedOf(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Gaussian-ish sample (sum of three uniforms), mean 0, sd ≈ 1. */
export const gauss = (rng: () => number) => (rng() + rng() + rng() - 1.5) * 2;

export const PALETTE = {
  ink: '#0e0e10',
  paper: '#eeeae3',
  coral: '#ff4d2e',
  blue: '#2b50ff',
  sky: '#7fa3ff',
  yellow: '#ffc21a',
  green: '#4fc76a',
  teal: '#5fbdb0',
} as const;

export const col = (hex: string) => new Color(hex);
export const vec = (hex: string) => {
  const c = new Color(hex);
  return new Vector3(c.r, c.g, c.b);
};

/** Additive light that keeps the canvas alpha at 0: the CSS gradient underneath shows through, lit. */
export const LIGHT = {
  transparent: true,
  depthWrite: false,
  depthTest: false,
  blending: CustomBlending,
  blendEquation: AddEquation,
  blendSrc: OneFactor,
  blendDst: OneFactor,
  blendSrcAlpha: ZeroFactor,
  blendDstAlpha: OneFactor,
} as const;

export function lightMaterial(vertexShader: string, fragmentShader: string, uniforms: Record<string, IUniform> = {}) {
  return new ShaderMaterial({ vertexShader, fragmentShader, uniforms, ...LIGHT });
}

/** Common uniforms most shaders read. */
export const baseUniforms = (dpr: number) => ({ uTime: { value: 0 }, uPx: { value: dpr } });

/**
 * Soft round dot for gl_PointCoord. Flat in the middle and soft only at the rim: a 2–3 px point samples its
 * pixels at r ≈ 0.7, so a falloff from the centre would draw small points at a few percent of their colour.
 */
export const SOFT_DOT = /* glsl */ `
float softDot(vec2 pc) {
  float r = length(pc - 0.5) * 2.0;
  return (1.0 - smoothstep(0.5, 1.0, r)) * (0.8 + 0.2 * (1.0 - r));
}`;

/** Soft round point; premultiplied light out (alpha 0). Reads vColor / vAlpha. */
export const SOFT_POINT_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
${SOFT_DOT}
void main() {
  float a = softDot(gl_PointCoord);
  if (a <= 0.0) discard;
  gl_FragColor = vec4(vColor * vAlpha * a, 0.0);
}`;

/** Per-vertex colour × alpha light, for lines and meshes. */
export const FLAT_LIGHT_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() { gl_FragColor = vec4(vColor * vAlpha, 0.0); }`;

/** Ashima 3D simplex noise (MIT), as snoise(vec3). */
export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/**
 * The world point on the plane z = `z` that the (un-tilted) camera sees at a screen fraction:
 * x01 from the left, y01 from the top. Scenes anchor their subject with it on create and resize.
 */
export function worldAt(camera: PerspectiveCamera, x01: number, y01: number, z = 0) {
  const d = camera.position.z - z;
  const halfH = d * Math.tan(((camera.fov / 2) * Math.PI) / 180);
  const halfW = halfH * camera.aspect;
  return new Vector3(camera.position.x + (x01 * 2 - 1) * halfW, camera.position.y + (1 - y01 * 2) * halfH, z);
}

/** Visible half-height and half-width at the plane z. */
export function halfSize(camera: PerspectiveCamera, z = 0) {
  const halfH = (camera.position.z - z) * Math.tan(((camera.fov / 2) * Math.PI) / 180);
  return { halfW: halfH * camera.aspect, halfH };
}

/** A quad that ignores the camera and covers clip space (or a part of it): for screen-space light. */
export function screenQuad(material: Material) {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  const m = new Mesh(g, material);
  m.frustumCulled = false;
  return m;
}

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Dispose every geometry, material and texture under `root`. */
export function disposeTree(root: Object3D) {
  const mats = new Set<Material>();
  root.traverse((o) => {
    const any = o as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
    any.geometry?.dispose();
    const m = any.material;
    if (Array.isArray(m)) m.forEach((x) => mats.add(x));
    else if (m) mats.add(m);
  });
  for (const m of mats) {
    for (const v of Object.values(m as unknown as Record<string, unknown>)) if ((v as Texture | null)?.isTexture) (v as Texture).dispose();
    const u = (m as ShaderMaterial).uniforms;
    if (u) for (const k of Object.keys(u)) if ((u[k].value as Texture | null)?.isTexture) (u[k].value as Texture).dispose();
    m.dispose();
  }
}
