import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { type Body, EDGE, step, toss, twirl } from '../crates';
import { C, INK, PAPER } from '../world-bands';
import { fromScreen, KX, KY } from '../world-kit';
import { buildWorld } from './build';
import { along, CAR, type Car, car as newCar, drive, type Input, pathOf, pilot, type Pilot, type Post, swing, trip } from './car';

/**
 * The world of Work from the ground (lote 4.3): the same land, built in 3D (build.ts), and a car to go through
 * it. This module is the scene and its loop; it is loaded only when someone asks for this view (three.js is
 * never part of the first load of the page).
 * The rule of the whole site holds here: nothing asks for frames on its own. A frame is drawn while the car
 * moves, a crate flies, the light changes or — only on screen, only if the visitor has not paused it and never
 * with reduced motion — the place is alive (people walking, things turning, clouds). Still and paused: no frames.
 * Space: the plane of the land is x / z, up is y. The car's own space: forward +x, right +z.
 */
export type DriveStop = { node: [number, number]; home: [number, number]; tall: number; planned: boolean };
export type DriveWalker = { x: number; y: number; dx: number; dy: number; dur: number; c: string; ink: string };
export type DriveState = { x: number; y: number; a: number; v: number; at: number; near: number | null; cam: 'in' | 'out'; pilot: boolean; frames: number; night: number; held: number; tris: number; moving: number; scale: number; kicks: number; flying: number; spots: ([number, number] | null)[] };
export type DriveOpts = {
  canvas: HTMLCanvasElement; stops: DriveStop[]; walkers: DriveWalker[]; crates: { c: string }[]; bodies: Body[];
  width: number; height: number; start: number; night: boolean; life: boolean; still: boolean; coarse: boolean;
  /** The stop the car is nearest to. */
  onAt(i: number): void;
  /** The stop the car is at the door of (or none): its card is offered. */
  onNear(i: number | null): void;
  /** Where the car is on the drawing (fractions of its width and height) and how fast (0…1), each time it moves. */
  onFrame(f: { u: number; v: number; speed: number }): void;
  /** Where the name of a stop goes on screen (px from the corner of the canvas), or that it is out of view. */
  place(i: number, x: number, y: number, show: boolean): void;
  sound(kind: string, power?: number): void;
};
export type DriveHandle = {
  input(i: Partial<Input>): void; goTo(i: number): void; horn(): void; cam(): 'in' | 'out';
  setNight(night: boolean): void; setLife(on: boolean): void; setActive(on: boolean): void; resize(): void;
  /** A press on the canvas: true if it picked up a crate. Then `move` carries it and `release` throws it. */
  grab(x: number, y: number): boolean; move(x: number, y: number): void; release(): void;
  /** Look around: turn the head by `d` radians (it comes back on its own once `lookEnd` is called). */
  look(d: number): void; lookEnd(): void;
  state(): DriveState; dispose(): void;
};

const DAY = { top: '#86aefc', low: '#fdebd8', sun: '#ffc267', amb: '#ffffff', ambK: 2.05, sunK: 1.25, cloud: '#ffffff' };
const NIGHT = { top: '#070525', low: '#2a2377', sun: '#f3efe6', amb: '#6f73ff', ambK: 1.05, sunK: 0.32, cloud: '#2f2a80' };
const HALF = EDGE / 2;
const lambert = (hex: string) => new THREE.MeshLambertMaterial({ color: hex });
const basic = (hex: string) => new THREE.MeshBasicMaterial({ color: hex, toneMapped: false });
/** A seeded random: the scene is the same on every visit. */
const rng = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

function makeCar() {
  const g = new THREE.Group(), shell = new THREE.Group(), inside = new THREE.Group();
  const paint = lambert(C.coral), dark = lambert('#14124a'), glass = lambert('#2c2670'), tyre = lambert('#0b0930'), stripe = lambert(PAPER);
  const add = (to: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); to.add(m); return m; };
  add(g, new THREE.BoxGeometry(24, 3.8, 11), paint, 0, 4.1, 0);
  add(g, new THREE.BoxGeometry(24.06, 0.5, 2.2), stripe, 0, 5.78, 0);
  add(g, new THREE.BoxGeometry(24.3, 1, 11.4), dark, 0, 2.4, 0);
  for (const [x, z] of [[7.6, 5.4], [7.6, -5.4], [-7.6, 5.4], [-7.6, -5.4]]) { const w = add(g, new THREE.CylinderGeometry(2.7, 2.7, 1.9, 16), tyre, x, 2.7, z); w.rotation.x = Math.PI / 2; const hub = add(g, new THREE.CylinderGeometry(1.2, 1.2, 2, 10), stripe, x, 2.7, z); hub.rotation.x = Math.PI / 2; }
  for (const z of [3.6, -3.6]) { add(g, new THREE.BoxGeometry(0.4, 1.3, 2.4), basic('#fff3d6'), 12.05, 4.5, z); add(g, new THREE.BoxGeometry(0.4, 1, 2.4), basic('#ff5a3c'), -12.05, 4.7, z); }
  // seen from behind: the cabin and its roof
  add(shell, new THREE.BoxGeometry(11, 3.9, 9.6), glass, -2.6, 7.9, 0);
  add(shell, new THREE.BoxGeometry(11.8, 0.7, 10.2), paint, -2.6, 10.15, 0);
  for (const [x, z] of [[2.9, 4.8], [2.9, -4.8], [-8.1, 4.8], [-8.1, -4.8], [-2.6, 4.8], [-2.6, -4.8]]) add(shell, new THREE.BoxGeometry(0.7, 3.9, 0.5), paint, x, 7.9, z);
  // seen from the seat: a low dashboard and the wheel, to one side — the road keeps the picture
  add(inside, new THREE.BoxGeometry(8.6, 3.2, 17), lambert('#0d0b3a'), -0.1, 4.75, 0);
  const column = new THREE.Group(), wheel = new THREE.Group();
  column.position.set(1.9, 7.0, -2.7); column.rotation.z = 0.42;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.15, 8, 28), lambert('#2c2670')); rim.rotation.y = Math.PI / 2;
  const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 2), stripe);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), paint);
  wheel.add(rim, spoke, hub); column.add(wheel); inside.add(column);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: '#060513', transparent: true, opacity: 0.24, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.set(15, 8.4, 1); shadow.position.y = 0.42;
  g.add(shell, inside, shadow);
  return { g, shell, inside, wheel };
}

export function createDrive(o: DriveOpts): DriveHandle {
  const renderer = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: !o.coarse, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, o.coarse ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  // if frames come slow, the picture is drawn with fewer pixels (down to half) rather than fewer frames
  let scale = 1, slow = 0, counted = 0;
  const govern = (dt: number) => {
    counted += 1; if (dt > 0.034) slow += 1;
    if (counted < 24) return;
    if (slow > 16 && scale > 0.5) { scale = Math.max(0.5, scale * 0.75); renderer.setPixelRatio(dpr * scale); renderer.setSize(o.canvas.clientWidth || 1, o.canvas.clientHeight || 1, false); }
    counted = 0; slow = 0;
  };
  renderer.toneMapping = THREE.NoToneMapping;
  const scene = new THREE.Scene();
  const fog = new THREE.Fog(DAY.low, 240, 2100);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(66, 1, 2, 6400);

  /* ── the land ── */
  const firstPlanned = Math.max(1, o.stops.findIndex((s) => s.planned) < 0 ? o.stops.length : o.stops.findIndex((s) => s.planned));
  const world = buildWorld(o.stops.map((s) => s.node), firstPlanned);
  scene.add(world.group);
  const doors = o.stops.map((s) => fromScreen(s.node[0], s.node[1])), homes = o.stops.map((s) => fromScreen(s.home[0], s.home[1]));
  // the way the autopilot follows: the path of light, through every door
  const STEPS = 24;
  // the car keeps to a lane beside the path of light (people walk on the path), and parks there, a few steps back from every door
  const LANE = 30 * Math.SQRT1_2;
  const parks = doors.map(([x, y]) => [x + LANE, y + LANE] as [number, number]);
  const curve = new THREE.CatmullRomCurve3(parks.map(([x, y]) => new THREE.Vector3(x, 0, y)), false, 'catmullrom', 0.5);
  const way = pathOf(Array.from({ length: (parks.length - 1) * STEPS + 1 }, (_, j) => { const p = curve.getPoint(j / ((parks.length - 1) * STEPS)); return [p.x, p.z] as [number, number]; }));
  const markOf = (i: number) => way.at[i * STEPS];
  const fence = (x: number, y: number): [number, number] => {
    const sx = (x - y) * KX, sy = (x + y) * KY, cx = Math.max(-260, Math.min(o.width + 260, sx)), cy = Math.max(-70, Math.min(o.height + 230, sy));
    if (cx === sx && cy === sy) return [x, y];
    const p = fromScreen(cx, cy);
    return [p[0], p[1]];
  };

  /* ── the sky and the light ── */
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5200, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: { top: { value: new THREE.Color(DAY.top) }, low: { value: new THREE.Color(DAY.low) } },
    vertexShader: 'varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 low; varying vec3 vDir; void main() { float h = clamp(normalize(vDir).y, 0.0, 1.0); gl_FragColor = vec4(mix(low, top, pow(h, 0.5)), 1.0);\n#include <colorspace_fragment>\n}',
  }));
  sky.renderOrder = -2; sky.frustumCulled = false;
  const rnd = rng(7), starPos: number[] = [];
  for (let i = 0; i < 420; i++) { const a = rnd() * Math.PI * 2, e = 0.08 + rnd() * 1.4; starPos.push(Math.cos(a) * Math.cos(e) * 5000, Math.sin(e) * 5000, Math.sin(a) * Math.cos(e) * 5000); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: PAPER, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  stars.renderOrder = -3; stars.frustumCulled = false;
  // the sun (the moon by night) sits ahead of the way the path goes, so the trip drives towards it
  const sunDir = new THREE.Vector3(0.74, 0.42, -0.52).normalize();
  const sunMat = new THREE.MeshBasicMaterial({ color: DAY.sun, fog: false, depthWrite: false, transparent: true, toneMapped: false });
  const haloMat = new THREE.MeshBasicMaterial({ color: DAY.sun, fog: false, depthWrite: false, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, toneMapped: false });
  // far, but nearer than the end of the view: whatever stands in the land hides them, as it should
  const sun = new THREE.Group(); sun.add(new THREE.Mesh(new THREE.CircleGeometry(430, 40), haloMat), new THREE.Mesh(new THREE.CircleGeometry(190, 40), sunMat));
  sun.children.forEach((c, i) => { c.renderOrder = i - 2; c.frustumCulled = false; });
  const backdrop = new THREE.Group(); backdrop.add(sky, stars, sun); scene.add(backdrop);
  sun.position.copy(sunDir).multiplyScalar(4600); sun.lookAt(0, 0, 0);
  const ambient = new THREE.AmbientLight(DAY.amb, DAY.ambK), sunLight = new THREE.DirectionalLight('#fff1dc', DAY.sunK);
  sunLight.position.set(-0.35, 0.86, 0.5);
  scene.add(ambient, sunLight);
  const cloudMat = new THREE.MeshBasicMaterial({ color: DAY.cloud, fog: false, toneMapped: false });
  const clouds = Array.from({ length: 8 }, (_, i) => {
    const parts = Array.from({ length: 4 }, (_, k) => { const s = new THREE.IcosahedronGeometry(30 + rnd() * 26, 1); s.scale(1.5, 0.52, 1); s.translate((k - 1.5) * 38, rnd() * 10, (rnd() - 0.5) * 26); return s; });
    const m = new THREE.Mesh(mergeGeometries(parts), cloudMat);
    m.userData = { along: -1700 + i * 480 + rnd() * 160, across: -520 + rnd() * 900, speed: 5 + rnd() * 6 };
    m.position.y = 250 + rnd() * 130; m.scale.setScalar(0.8 + rnd() * 0.7);
    scene.add(m);
    return m;
  });

  /* ── the car ── */
  const start = Math.max(0, Math.min(o.stops.length - 1, o.start));
  const faceOf = (i: number) => Math.atan2(homes[i][1] - parks[i][1], homes[i][0] - parks[i][0]);
  const c: Car = newCar(parks[start][0], parks[start][1], faceOf(start));
  const model = makeCar();
  scene.add(model.g);
  const lamps = new THREE.SpotLight('#fff0c8', 0, 330, 0.5, 0.7, 0);
  lamps.position.set(11, 5, 0); lamps.target.position.set(60, 0, 0);
  model.g.add(lamps, lamps.target);
  const inp: Input = { gas: 0, turn: 0 };
  let trip_: Pilot | null = null, tripTo = -1, facing: number | null = faceOf(start);
  let cam: 'in' | 'out' = 'in', camK = 0, lookYaw = 0, looking = false, tilt = 0;
  const camPos = new THREE.Vector3(), camAt = new THREE.Vector3();

  /* ── who walks ── */
  const coat = new THREE.CylinderGeometry(1.5, 2.4, 8.4, 8); coat.translate(0, 6.3, 0);
  const head = new THREE.SphereGeometry(2.3, 10, 8); head.translate(0, 13, 0);
  const legs = new THREE.BoxGeometry(2.6, 2.4, 1.8); legs.translate(0, 1.2, 0);
  const coats = new THREE.InstancedMesh(coat, new THREE.MeshLambertMaterial(), o.walkers.length);
  const rest = new THREE.InstancedMesh(mergeGeometries([head, legs]), new THREE.MeshLambertMaterial(), o.walkers.length);
  const walk = o.walkers.map((w, i) => {
    const p = fromScreen(w.x, w.y), d = fromScreen(w.dx, w.dy);
    coats.setColorAt(i, new THREE.Color(w.c)); rest.setColorAt(i, new THREE.Color(w.ink));
    return { p, d, dur: Math.max(2, w.dur), x: p[0], y: p[1], hop: 0, phase: (i * 0.37) % 2 };
  });
  coats.frustumCulled = false; rest.frustumCulled = false;
  scene.add(coats, rest);
  const dummy = new THREE.Object3D();
  let lifeT = 0;
  const placeWalkers = () => {
    walk.forEach((w, i) => {
      const f = (lifeT / w.dur + w.phase) % 2, k = f < 1 ? f : 2 - f;
      w.x = w.p[0] + w.d[0] * k; w.y = w.p[1] + w.d[1] * k;
      const up = w.hop > 0 ? Math.sin((1 - w.hop) * Math.PI) * 7 : Math.abs(Math.sin(lifeT * 7 + i)) * 0.5;
      dummy.position.set(w.x, up, w.y);
      dummy.rotation.y = -(Math.atan2(w.d[1], w.d[0]) + (f < 1 ? 0 : Math.PI));
      dummy.updateMatrix();
      coats.setMatrixAt(i, dummy.matrix); rest.setMatrixAt(i, dummy.matrix);
    });
    coats.instanceMatrix.needsUpdate = true; rest.instanceMatrix.needsUpdate = true;
  };
  placeWalkers();

  /* ── what can be thrown: the same crates as the map, wherever they were left ── */
  const walls = { x0: 24, x1: o.width - 24, y0: 70, y1: o.height - 10 };
  const crateGeo = new THREE.BoxGeometry(EDGE, EDGE, EDGE), crateEdges = new THREE.EdgesGeometry(crateGeo), edgeMat = new THREE.LineBasicMaterial({ color: INK });
  const blobGeo = new THREE.CircleGeometry(1, 16), blobMat = new THREE.MeshBasicMaterial({ color: '#060513', transparent: true, opacity: 0.2, depthWrite: false });
  const crates = o.bodies.map((_, i) => {
    const m = new THREE.Mesh(crateGeo, lambert(o.crates[i]?.c ?? C.coral));
    m.add(new THREE.LineSegments(crateEdges, edgeMat));
    const s = new THREE.Mesh(blobGeo, blobMat); s.rotation.x = -Math.PI / 2;
    scene.add(m, s);
    return { m, s };
  });
  const placeCrate = (i: number) => {
    const b = o.bodies[i], { m, s } = crates[i];
    m.position.set(b.p[0], b.p[2], b.p[1]);
    // the body's space has up as its third axis; here up is the second: the same turn, mirrored
    m.quaternion.set(-b.q[0], -b.q[2], -b.q[1], b.q[3]);
    const k = 9 + b.p[2] * 0.05;
    s.position.set(b.p[0], 0.4, b.p[1]); s.scale.set(k, k, 1);
  };
  o.bodies.forEach((_, i) => placeCrate(i));
  let held = -1, holdAt = 30;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const aimRay = (x: number, y: number) => { const r = o.canvas.getBoundingClientRect(); ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); };
  const carry = () => {
    const b = o.bodies[held], p = ray.ray.origin.clone().addScaledVector(ray.ray.direction, holdAt);
    b.p = [p.x, p.z, Math.max(HALF + 2, p.y)];
  };

  /* ── the hour ── */
  let night = o.night ? 1 : 0, nightTo = night;
  const mixc = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), k);
  const paintHour = () => {
    const k = night, low = mixc(DAY.low, NIGHT.low, k);
    (sky.material as THREE.ShaderMaterial).uniforms.top.value.copy(mixc(DAY.top, NIGHT.top, k));
    (sky.material as THREE.ShaderMaterial).uniforms.low.value.copy(low);
    fog.color.copy(low);
    (stars.material as THREE.PointsMaterial).opacity = k * 0.9;
    sunMat.color.copy(mixc(DAY.sun, NIGHT.sun, k)); haloMat.color.copy(sunMat.color); haloMat.opacity = 0.22 - k * 0.1;
    ambient.color.copy(mixc(DAY.amb, NIGHT.amb, k)); ambient.intensity = DAY.ambK + (NIGHT.ambK - DAY.ambK) * k;
    sunLight.color.copy(mixc('#fff1dc', '#aab4ff', k)); sunLight.intensity = DAY.sunK + (NIGHT.sunK - DAY.sunK) * k;
    cloudMat.color.copy(mixc(DAY.cloud, NIGHT.cloud, k));
    world.materials.line.color.setScalar(1 - 0.45 * k);
    world.materials.beam.opacity = 0.2 + 0.34 * k;
    // the headlights exist only by night (a light that is off still costs every pixel its sum)
    lamps.visible = k > 0; lamps.intensity = k * 7;
  };
  paintHour();

  /* ── the loop ── */
  let raf = 0, last = 0, frames = 0, active = true, life = o.life, disposed = false;
  let at = -1, near: number | null = -1 as number | null, motorSent = -1, motorAt = 0, moving = 0, kicks = 0;
  const report = () => {
    let best = 0, gap = Infinity;
    parks.forEach((d, i) => { const g = Math.hypot(d[0] - c.x, d[1] - c.y); if (g < gap) { gap = g; best = i; } });
    const here = trip_ ? tripTo : best;
    if (here !== at) { at = here; o.onAt(at); }
    const n = !trip_ && gap < 110 ? best : null;
    if (n !== near) { near = n; o.onNear(n); }
    o.onFrame({ u: ((c.x - c.y) * KX) / o.width, v: ((c.x + c.y) * KY) / o.height, speed: Math.min(1, Math.abs(c.v) / CAR.top) });
  };
  const v3 = new THREE.Vector3();
  const names = () => {
    const w = o.canvas.clientWidth, h = o.canvas.clientHeight;
    doors.forEach((d, i) => {
      v3.set(d[0], 30, d[1]);
      const far = v3.distanceTo(camera.position);
      v3.project(camera);
      o.place(i, (v3.x * 0.5 + 0.5) * w, (-v3.y * 0.5 + 0.5) * h, v3.z < 1 && far > 70 && far < 760 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1);
    });
  };
  const frame = () => {
    const fx = Math.cos(c.a), fy = Math.sin(c.a);
    model.g.position.set(c.x, 0, c.y); model.g.rotation.y = -c.a;
    model.wheel.rotation.x = c.steer * 2.6;
    model.shell.visible = camK > 0.5; model.inside.visible = camK <= 0.5;
    // from the seat: the driver's eyes; from behind: over the roof, looking past the car
    const yaw = c.a + lookYaw, lx = Math.cos(yaw), ly = Math.sin(yaw);
    const seat = v3.set(c.x - fx * 3.2, 9.5, c.y - fy * 3.2);
    const inPos = seat.clone(), inAt = seat.clone().add(new THREE.Vector3(lx * 40, Math.tan(tilt) * 40 - 1.2, ly * 40));
    const outPos = new THREE.Vector3(c.x - lx * 50, 22, c.y - ly * 50), outAt = new THREE.Vector3(c.x + fx * 22, 7 + Math.tan(tilt) * 30, c.y + fy * 22);
    camPos.lerpVectors(inPos, outPos, camK); camAt.lerpVectors(inAt, outAt, camK);
    camera.position.copy(camPos); camera.lookAt(camAt);
    backdrop.position.copy(camera.position);
    renderer.render(scene, camera);
    frames += 1;
    names();
  };
  const update = (dt: number): boolean => {
    let busy = false;
    /* the car: on autopilot, at the wheel, or settling to face the place it arrived at */
    const before = [c.x, c.y, c.a];
    if (trip_) {
      if (pilot(c, trip_, way, dt)) { trip_ = null; facing = faceOf(tripTo); o.sound('stop'); }
      busy = true;
    } else {
      if (inp.gas || inp.turn) facing = null;
      const posts: Post[] = walk.map((w) => [w.x, w.y, 2.6] as Post);
      o.bodies.forEach((b) => { if (!b.held && b.rest && Math.abs(c.v) <= 12) posts.push([b.p[0], b.p[1], HALF]); });
      const hit = drive(c, inp, dt, world.walls, posts, fence);
      if (hit > 0.08) o.sound('thud', hit);
      if (facing !== null) { const d = swing(c.a, facing); c.a += d * Math.min(1, dt * 3.4); if (Math.abs(d) < 0.004) { c.a = facing; facing = null; } busy = true; }
      if (inp.gas || inp.turn || Math.abs(c.v) > 0.3 || Math.abs(c.steer) > 0.004) busy = true; else { c.v = 0; c.steer = 0; }
    }
    /* a crate in the way of a moving car flies */
    const fx = Math.cos(c.a), fy = Math.sin(c.a);
    o.bodies.forEach((b) => {
      if (b.held || Math.abs(c.v) <= 12 || b.p[2] > HALF + 0.8) return;
      const dx = b.p[0] - c.x, dy = b.p[1] - c.y, d = Math.hypot(dx, dy);
      if (d > CAR.r + HALF + 1.5) return;
      const s = Math.sign(c.v), nx = dx / (d || 1) + fx * s * 0.8, ny = dy / (d || 1) + fy * s * 0.8, n = Math.hypot(nx, ny) || 1, speed = Math.abs(c.v) * 1.2 + 60;
      toss(b, (nx / n) * speed, (ny / n) * speed);
      kicks += 1;
      o.sound('thud', Math.min(1, Math.abs(c.v) / CAR.top + 0.25));
      c.v *= 0.93;
    });
    /* the crates: in the hand, or in the air */
    o.bodies.forEach((b, i) => {
      if (b.held) { if (i === held) carry(); twirl(b, dt); placeCrate(i); busy = true; return; }
      if (b.rest) return;
      const hit = Math.max(step(b, dt / 2, walls), step(b, dt / 2, walls));
      if (hit > 0.12 && Math.hypot(b.p[0] - c.x, b.p[1] - c.y) < 520) o.sound('thud', hit);
      placeCrate(i);
      busy = busy || !b.rest;
    });
    /* the head comes back, the gaze rises at a door, the camera changes seat, the hour changes */
    if (!looking && lookYaw) { lookYaw *= Math.exp(-dt * 5); if (Math.abs(lookYaw) < 0.002) lookYaw = 0; else busy = true; }
    const want = near !== null && near >= 0 && Math.abs(c.v) < 6 ? Math.max(0, Math.min(0.3, Math.atan2(o.stops[near].tall * 0.4 - 9, Math.hypot(homes[near][0] - c.x, homes[near][1] - c.y)))) : 0;
    if (tilt !== want) { tilt = o.still || Math.abs(want - tilt) < 0.006 ? want : tilt + (want - tilt) * Math.min(1, dt * 4); busy = true; }
    const camTo = cam === 'out' ? 1 : 0;
    if (camK !== camTo) { camK = o.still ? camTo : Math.max(0, Math.min(1, camK + Math.sign(camTo - camK) * dt * 2.4)); busy = true; }
    if (night !== nightTo) { night = o.still ? nightTo : Math.max(0, Math.min(1, night + Math.sign(nightTo - night) * dt * 1.25)); paintHour(); busy = true; }
    /* the place is alive: only on screen, only if it was not paused, never with reduced motion */
    const alive = life && !o.still;
    if (alive || walk.some((w) => w.hop > 0)) {
      if (alive) lifeT += dt;
      walk.forEach((w) => { if (w.hop > 0) w.hop = Math.max(0, w.hop - dt * 2.2); });
      placeWalkers();
      if (alive) {
        for (const s of world.spinners) {
          const k = s.kind;
          s.group.rotation.y = k.includes('wl-nod') ? Math.sin(lifeT * 1.5) * 0.17 : lifeT * (k.includes('wl-sweep') ? 0.8 : k.includes('--fast') ? 2.6 : k.includes('--slow') ? 0.22 : k.includes('wl-clock') ? 0.1 : 0.45);
        }
        // clouds drift the way the path goes, and come round again
        clouds.forEach((m) => { const u = m.userData as { along: number; across: number; speed: number }; u.along += u.speed * dt; if (u.along > 2100) u.along -= 4200; m.position.x = c.x + (u.along + u.across) * Math.SQRT1_2; m.position.z = c.y + (-u.along + u.across) * Math.SQRT1_2; });
      }
      busy = busy || alive || walk.some((w) => w.hop > 0);
    }
    if (c.x !== before[0] || c.y !== before[1] || c.a !== before[2]) { moving += 1; report(); }
    /* the engine's hum follows the speed (a few times a second at most) */
    const level = Math.min(1, Math.abs(c.v) / CAR.top), now = performance.now();
    if ((now - motorAt > 110 && Math.abs(level - motorSent) > 0.03) || (level === 0 && motorSent > 0)) { motorSent = level; motorAt = now; o.sound('motor', level); }
    return busy;
  };
  const tick = (now: number) => {
    raf = 0;
    if (disposed || !active) return;
    // a frame can come stamped before the moment it was asked for: time never runs backwards
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = Math.max(last, now);
    const busy = update(dt);
    if (dt > 0) govern(dt);
    frame();
    if (busy) raf = requestAnimationFrame(tick);
  };
  const wake = () => { if (!raf && active && !disposed) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const resize = () => {
    const w = o.canvas.clientWidth || 1, h = o.canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w < h ? 84 : 66; camera.updateProjectionMatrix();
    wake();
  };
  clouds.forEach((m) => { const u = m.userData as { along: number; across: number }; m.position.x = c.x + (u.along + u.across) * Math.SQRT1_2; m.position.z = c.y + (-u.along + u.across) * Math.SQRT1_2; });
  resize();
  report();
  // the first picture is drawn at once: whoever asked for this view sees it when the curtain lifts
  { const w = o.canvas.clientWidth || 1, h = o.canvas.clientHeight || 1; renderer.setSize(w, h, false); c.a = facing ?? c.a; facing = null; frame(); }

  return {
    input(i) { Object.assign(inp, i); if (inp.gas || inp.turn) { trip_ = null; } wake(); },
    goTo(i) {
      const n = Math.max(0, Math.min(o.stops.length - 1, i));
      tripTo = n; facing = null;
      if (o.still) { trip_ = null; c.x = parks[n][0]; c.y = parks[n][1]; c.a = faceOf(n); c.v = 0; o.sound('stop'); report(); moving += 1; }
      else trip_ = trip(c, way, markOf(n));
      report();
      wake();
    },
    horn() {
      o.sound('horn');
      // whoever is near jumps
      walk.forEach((w) => { if (Math.hypot(w.x - c.x, w.y - c.y) < 150) w.hop = 1; });
      wake();
    },
    cam() { cam = cam === 'in' ? 'out' : 'in'; wake(); return cam; },
    setNight(n) { nightTo = n ? 1 : 0; wake(); },
    setLife(on) { life = on; wake(); },
    setActive(on) { active = on; if (on) wake(); else { cancelAnimationFrame(raf); raf = 0; if (motorSent > 0) { motorSent = 0; o.sound('motor', 0); } } },
    resize,
    grab(x, y) {
      aimRay(x, y);
      let best = -1, gap = 190;
      o.bodies.forEach((b, i) => {
        v3.set(b.p[0], b.p[2], b.p[1]).sub(ray.ray.origin);
        const t = v3.dot(ray.ray.direction);
        if (t < 4 || t > gap) return;
        if (v3.addScaledVector(ray.ray.direction, -t).length() < EDGE * 0.95) { best = i; gap = t; }
      });
      if (best < 0) return false;
      held = best; holdAt = Math.max(24, Math.min(46, gap));
      const b = o.bodies[best];
      b.held = true; b.rest = false; b.v = [0, 0, 0]; b.w = [0, 0, 0]; b.calm = 0;
      carry();
      o.sound('grab');
      wake();
      return true;
    },
    move(x, y) { if (held >= 0) { aimRay(x, y); wake(); } },
    release() {
      if (held < 0) return;
      const b = o.bodies[held], d = ray.ray.direction, n = Math.hypot(d.x, d.z) || 1;
      // it leaves the hand the way you are looking, with whatever the car was doing
      toss(b, (d.x / n) * 250 + Math.cos(c.a) * c.v, (d.z / n) * 250 + Math.sin(c.a) * c.v);
      held = -1;
      wake();
    },
    look(d) { looking = true; lookYaw = Math.max(-1.9, Math.min(1.9, lookYaw + d)); wake(); },
    lookEnd() { looking = false; wake(); },
    state: () => ({
      x: c.x, y: c.y, a: c.a, v: c.v, at, near, cam, pilot: !!trip_, frames, night, held, tris: world.count.lit + world.count.glow, moving, scale, kicks,
      flying: o.bodies.filter((b) => !b.rest && !b.held).length,
      // where each crate is on the canvas, if it is in view and within reach (for whoever tests the hand)
      spots: o.bodies.map((b) => {
        v3.set(b.p[0], b.p[2], b.p[1]);
        const far = v3.distanceTo(camera.position);
        v3.project(camera);
        return v3.z < 1 && far < 170 && Math.abs(v3.x) < 0.9 && Math.abs(v3.y) < 0.9 ? [(v3.x * 0.5 + 0.5) * o.canvas.clientWidth, (-v3.y * 0.5 + 0.5) * o.canvas.clientHeight] as [number, number] : null;
      }),
    }),
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      if (held >= 0) { o.bodies[held].held = false; held = -1; }
      if (motorSent > 0) o.sound('motor', 0);
      world.dispose();
      scene.traverse((obj) => { const m = obj as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
