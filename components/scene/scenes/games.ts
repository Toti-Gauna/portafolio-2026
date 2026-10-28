/**
 * games · voxels. Low-poly cubes float in a slow orbit at the side of the page, each tumbling on its own axis:
 * dark faces lit from one side, thin glowing edges in the palette's colours.
 */
import { BoxGeometry, Color, Group, InstancedMesh, Matrix4, Quaternion, ShaderMaterial, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { halfSize, vec, worldAt, PALETTE } from '../kit';

export const still = 20;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile } = ctx;
  const orbit = new Group();
  scene.add(orbit);
  const N = mobile ? 18 : 34;
  const colours = [PALETTE.coral, PALETTE.sky, PALETTE.yellow, PALETTE.green, PALETTE.paper];
  const geo = new BoxGeometry(1, 1, 1);
  const mat = new ShaderMaterial({
    uniforms: { uLight: { value: new Vector3(0.6, 0.7, 0.45).normalize() }, uInk: { value: vec('#0b0b0d') } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec2 vUv; varying vec3 vCol; varying float vDepth;
      void main() {
        vUv = uv;
        vCol = instanceColor;
        mat4 m = modelMatrix * instanceMatrix;
        vN = normalize(mat3(m) * normal);
        vec4 mv = viewMatrix * m * vec4(position, 1.0);
        vDepth = clamp((-mv.z - 7.0) / 10.0, 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uLight; uniform vec3 uInk;
      varying vec3 vN; varying vec2 vUv; varying vec3 vCol; varying float vDepth;
      void main() {
        float d = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float edge = smoothstep(0.045, 0.0, d);
        float lit = max(dot(normalize(vN), uLight), 0.0);
        float fade = 1.0 - vDepth * 0.65;
        vec3 tint = vCol * (0.035 + 0.11 * lit);
        vec3 rim = vCol * (0.28 + 0.3 * lit);
        gl_FragColor = vec4(uInk + mix(tint, rim, edge) * fade, 1.0);
      }`,
  });
  const cubes = new InstancedMesh(geo, mat, N);
  const items = Array.from({ length: N }, () => {
    const r = 1.2 + rng() * 2.4;
    return {
      r,
      a: rng() * Math.PI * 2,
      y: (rng() - 0.5) * 3.2,
      size: 0.12 + rng() * rng() * 0.36,
      axis: new Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize(),
      spin: 0.1 + rng() * 0.25,
      ph: rng() * 6.28,
      orbit: 0.02 + rng() * 0.025,
    };
  });
  items.forEach((it, i) => cubes.setColorAt(i, new Color(colours[i % colours.length])));
  orbit.add(cubes);

  const m = new Matrix4();
  const q = new Quaternion();
  const pos = new Vector3();
  const scl = new Vector3();

  const place = () => {
    const portrait = ctx.h > ctx.w;
    const { halfH, halfW } = halfSize(camera, 0);
    orbit.position.copy(worldAt(camera, portrait ? 0.78 : 0.82, portrait ? 0.3 : 0.5, -2));
    orbit.scale.setScalar(portrait ? halfW * 0.42 : halfH * 0.36);
    orbit.rotation.set(0.3, 0, 0.12);
  };
  place();

  return {
    frame(i: SceneInput) {
      items.forEach((it, k) => {
        const a = it.a + i.t * it.orbit + i.progress * 0.8;
        pos.set(Math.cos(a) * it.r, it.y + Math.sin(i.t * 0.3 + it.ph) * 0.08, Math.sin(a) * it.r);
        q.setFromAxisAngle(it.axis, i.t * it.spin + it.ph);
        scl.setScalar(it.size);
        m.compose(pos, q, scl);
        cubes.setMatrixAt(k, m);
      });
      cubes.instanceMatrix.needsUpdate = true;
    },
    resize() {
      place();
    },
  };
}
