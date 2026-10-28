/**
 * handyx · a coastal city at night seen from above, like Mar del Plata: a diagonal street grid that stops at
 * the coast, the sea with a few slow swell lines. Small lights (specialists) travel the streets to a house;
 * the house lights up when they arrive. Blue streets, yellow lights.
 */
import { BufferAttribute, BufferGeometry, Group, LineSegments, Points, Vector2 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { FLAT_LIGHT_FRAG, SOFT_POINT_FRAG, lightMaterial, vec, PALETTE } from '../kit';

const STEP = 0.55; // block size (world units)
const ANG = 0.72; // the grid runs diagonal to the coast

export const still = 9;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const city = new Group();
  scene.add(city);

  // seen from a plane over the sea, looking inland: the coast crosses the lower third
  const aim = () => {
    const portrait = ctx.h > ctx.w;
    camera.position.set(portrait ? 1.6 : 2.4, -9.5, 7.2);
    camera.up.set(0, 0, 1);
    camera.lookAt(portrait ? 1.2 : 2.6, 2.2, 0);
  };
  aim();

  const coast = (x: number) => -1.2 + 0.55 * Math.sin(x * 0.38 + 0.6) + 0.22 * Math.sin(x * 1.1 + 2.0) - 0.35 * Math.exp(-((x - 2.2) ** 2) / 1.2);
  const ca = Math.cos(ANG), sa = Math.sin(ANG);
  const toWorld = (gu: number, gv: number) => new Vector2((gu * ca - gv * sa) * STEP, (gu * sa + gv * ca) * STEP);
  const R = 15; // grid half-size in blocks
  const onLand = (p: Vector2) => p.y > coast(p.x) + 0.12 && p.length() < 10.5 && p.y < 9;
  // the city is brightest downtown, by the coast on the right, and fades inland and to the left
  const fade = (p: Vector2) => Math.max(0, 1 - new Vector2(p.x - 3.2, (p.y - 0.2) * 1.3).length() / 9);

  // streets: grid edges with both ends on land
  const sp: number[] = [];
  const sa2: number[] = [];
  for (let gu = -R; gu <= R; gu++)
    for (let gv = -R; gv <= R; gv++) {
      const a = toWorld(gu, gv);
      if (!onLand(a)) continue;
      for (const [du, dv] of [[1, 0], [0, 1]]) {
        const b = toWorld(gu + du, gv + dv);
        if (!onLand(b)) continue;
        const avenue = (du === 1 ? gv : gu) % 4 === 0; // every fourth street is an avenue
        sp.push(a.x, a.y, 0, b.x, b.y, 0);
        const al = (avenue ? 0.2 : 0.11) * fade(a);
        sa2.push(al, (avenue ? 0.2 : 0.11) * fade(b));
      }
    }
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uBlue: { value: vec(PALETTE.blue) },
    uSky: { value: vec(PALETTE.sky) },
    uYellow: { value: vec(PALETTE.yellow) },
    uWarm: { value: vec('#ffd98a') },
  };
  const sg = new BufferGeometry();
  sg.setAttribute('position', new BufferAttribute(new Float32Array(sp), 3));
  sg.setAttribute('aAlpha', new BufferAttribute(new Float32Array(sa2), 1));
  const streets = new LineSegments(
    sg,
    lightMaterial(
      /* glsl */ `
      attribute float aAlpha; uniform vec3 uSky; uniform vec3 uBlue;
      varying vec3 vColor; varying float vAlpha;
      void main() { vColor = mix(uBlue, uSky, 0.35); vAlpha = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  city.add(streets);

  // the coastline and the swell offshore (parallel lines that breathe)
  const cp: number[] = [];
  const cw: number[] = [];
  for (let k = 0; k < 6; k++)
    for (let x = -10; x < 10; x += 0.25) {
      const off = k === 0 ? 0 : 0.35 + k * 0.42;
      cp.push(x, coast(x) - off, 0, x + 0.25, coast(x + 0.25) - off, 0);
      cw.push(k, k);
    }
  const cg = new BufferGeometry();
  cg.setAttribute('position', new BufferAttribute(new Float32Array(cp), 3));
  cg.setAttribute('aK', new BufferAttribute(new Float32Array(cw), 1));
  const shore = new LineSegments(
    cg,
    lightMaterial(
      /* glsl */ `
      attribute float aK; uniform float uTime; uniform vec3 uSky; uniform vec3 uBlue;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec3 p = position;
        float swell = sin(uTime * 0.35 - aK * 0.9 + p.x * 0.3);
        p.y += aK > 0.5 ? swell * 0.06 : 0.0;
        float edge = 1.0 - smoothstep(6.0, 10.0, abs(p.x - 1.5));
        vColor = aK < 0.5 ? uSky : uBlue;
        vAlpha = edge * (aK < 0.5 ? 0.19 : (0.07 + 0.05 * swell) * (1.0 - aK / 7.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  city.add(shore);

  // houses: warm dots at some corners
  const keyOf = (gu: number, gv: number) => `${gu},${gv}`;
  const land = new Set<string>();
  for (let gu = -R; gu <= R; gu++) for (let gv = -R; gv <= R; gv++) if (onLand(toWorld(gu, gv))) land.add(keyOf(gu, gv));
  const H = mobile ? 160 : 320;
  const hp = new Float32Array(H * 3);
  const hs = new Float32Array(H);
  const houses: [number, number][] = [];
  const landList = [...land].map((k) => k.split(',').map(Number) as [number, number]);
  for (let i = 0; i < H; i++) {
    const [gu, gv] = landList[Math.floor(rng() * landList.length)];
    houses.push([gu, gv]);
    const p = toWorld(gu, gv);
    // a house sits inside the block, off the corner
    hp.set([p.x + (rng() - 0.5) * STEP * 0.5, p.y + (rng() - 0.5) * STEP * 0.5, 0], i * 3);
    hs[i] = rng() * fade(p);
  }
  const hit = new Float32Array(H); // time a light last arrived at this house
  hit.fill(-99);
  const hitAttr = new BufferAttribute(hit, 1);
  const hg = new BufferGeometry();
  hg.setAttribute('position', new BufferAttribute(hp, 3));
  hg.setAttribute('aSeed', new BufferAttribute(hs, 1));
  hg.setAttribute('aHit', hitAttr);
  const housePts = new Points(
    hg,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; attribute float aHit;
      uniform float uTime; uniform float uPx; uniform vec3 uWarm; uniform vec3 uYellow;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float lit = exp(-max(uTime - aHit, 0.0) * 0.35) * step(aHit, uTime);
        vColor = mix(uWarm, uYellow, lit);
        vAlpha = 0.18 + aSeed * 0.45 + lit * 0.9;
        gl_PointSize = (1.6 + aSeed * 1.6 + lit * 4.0) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  city.add(housePts);

  // travellers: a light that goes along the grid (first one way, then the other) to a house
  type Trip = { path: Vector2[]; len: number; start: number; speed: number; house: number };
  const M = mobile ? 7 : 13;
  const trips: Trip[] = [];
  const plan = (t: number, from?: [number, number]): Trip => {
    const house = Math.floor(rng() * H);
    const [hu, hv] = houses[house];
    let [u0, v0] = from ?? landList[Math.floor(rng() * landList.length)];
    const pts = [toWorld(u0, v0)];
    // walk u then v, staying on land (falls back to a straight line if the grid is cut)
    while (u0 !== hu) { u0 += Math.sign(hu - u0); if (!land.has(keyOf(u0, v0))) break; pts.push(toWorld(u0, v0)); }
    while (v0 !== hv) { v0 += Math.sign(hv - v0); if (!land.has(keyOf(u0, v0))) break; pts.push(toWorld(u0, v0)); }
    pts.push(new Vector2(hp[house * 3], hp[house * 3 + 1]));
    let len = 0;
    for (let k = 1; k < pts.length; k++) len += pts[k].distanceTo(pts[k - 1]);
    return { path: pts, len, start: t + rng() * 2.5, speed: 0.55 + rng() * 0.35, house };
  };
  for (let m = 0; m < M; m++) trips.push(plan(-rng() * 6));
  const TR = 6; // trail samples per traveller
  const tp = new Float32Array(M * TR * 2 * 3);
  const ta = new Float32Array(M * TR * 2);
  const tg = new BufferGeometry();
  const tpAttr = new BufferAttribute(tp, 3);
  const taAttr = new BufferAttribute(ta, 1);
  tg.setAttribute('position', tpAttr);
  tg.setAttribute('aAlpha', taAttr);
  const trails = new LineSegments(
    tg,
    lightMaterial(
      /* glsl */ `
      attribute float aAlpha; uniform vec3 uYellow;
      varying vec3 vColor; varying float vAlpha;
      void main() { vColor = uYellow; vAlpha = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  city.add(trails);
  const hpAttr = new Float32Array(M * 3);
  const headAttr = new BufferAttribute(hpAttr, 3);
  const headA = new Float32Array(M);
  const headAAttr = new BufferAttribute(headA, 1);
  const heg = new BufferGeometry();
  heg.setAttribute('position', headAttr);
  heg.setAttribute('aAlpha', headAAttr);
  const heads = new Points(
    heg,
    lightMaterial(
      /* glsl */ `
      attribute float aAlpha; uniform float uPx; uniform vec3 uYellow;
      varying vec3 vColor; varying float vAlpha;
      void main() { vColor = mix(uYellow, vec3(1.0), 0.25); vAlpha = aAlpha; gl_PointSize = 4.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  city.add(heads);

  const at = (trip: Trip, d: number) => {
    let rest = Math.max(0, Math.min(trip.len, d));
    for (let k = 1; k < trip.path.length; k++) {
      const seg = trip.path[k].distanceTo(trip.path[k - 1]);
      if (rest <= seg) return trip.path[k - 1].clone().lerp(trip.path[k], seg ? rest / seg : 0);
      rest -= seg;
    }
    return trip.path[trip.path.length - 1].clone();
  };

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      let hits = false;
      trips.forEach((trip, m) => {
        const d = (i.t - trip.start) * trip.speed;
        if (d > trip.len) {
          hit[trip.house] = i.t;
          hits = true;
          trips[m] = plan(i.t + 0.8, houses[trip.house]);
        }
        const tr = trips[m];
        const dd = (i.t - tr.start) * tr.speed;
        const live = dd > 0 && dd <= tr.len ? Math.min(1, dd / 0.4, (tr.len - dd) / 0.2 + 0.3) : 0;
        const head = at(tr, dd);
        hpAttr.set([head.x, head.y, 0.02], m * 3);
        headA[m] = live * 0.95;
        for (let k = 0; k < TR; k++) {
          const a = at(tr, dd - k * 0.09), b = at(tr, dd - (k + 1) * 0.09);
          tp.set([a.x, a.y, 0.01, b.x, b.y, 0.01], (m * TR + k) * 6);
          ta.set([live * 0.5 * (1 - k / TR), live * 0.5 * (1 - (k + 1) / TR)], (m * TR + k) * 2);
        }
      });
      if (hits) hitAttr.needsUpdate = true;
      tpAttr.needsUpdate = true;
      taAttr.needsUpdate = true;
      headAttr.needsUpdate = true;
      headAAttr.needsUpdate = true;
      // a slow flight along the coast; scrolling carries it further
      city.position.x = -Math.sin(i.t * 0.02) * 0.6 - i.progress * 2.2;
      city.position.y = -i.progress * 0.8;
    },
    resize() {
      aim();
    },
  };
}

