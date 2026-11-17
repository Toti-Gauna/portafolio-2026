'use client';

import { useEffect, useRef } from 'react';
import { tokens, LAYERS } from '@/v2/tokens';

const col = (id: (typeof LAYERS)[number], end: 'from' | 'to') => tokens.layer[`${id}-${end}` as keyof typeof tokens.layer];

/**
 * The /v2 look in real 3D: the five layers as dark slabs with a rim of light in their colour, seen by an
 * orthographic camera at the same angle as the drawings. Drag (or ← →) to turn it.
 *  · three.js is downloaded only when the stage first comes on screen (never on first load).
 *  · It renders on demand: while it eases in, while you drag and while it coasts. Nothing loops.
 *  · Pixel ratio capped at 1.5; reduced motion draws one still frame; without WebGL the poster stays.
 */
export function StackScene({ label }: { label: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!;
    let dispose = () => {};
    let started = false;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || started) return;
      started = true;
      io.disconnect();
      const THREE = await import('three');
      const probe = document.createElement('canvas');
      if (!probe.getContext('webgl2')) { el.dataset.ready = '0'; return; }
      const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      camera.position.set(9, 7.4, 9);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(-4, 8, 3);
      scene.add(key);

      const group = new THREE.Group();
      scene.add(group);
      const W = 4.8, D = 3, T = 0.16, GAP = 0.86;
      const slab = new THREE.BoxGeometry(W, T, D);
      const edges = new THREE.EdgesGeometry(slab);
      const bar = new THREE.BoxGeometry(1, 0.03, 0.12);
      const made: { dispose(): void }[] = [slab, edges, bar];
      LAYERS.forEach((id, i) => {
        const y = (LAYERS.length - 1) / 2 * GAP - i * GAP;
        const a = new THREE.Color(col(id, 'from')), b = new THREE.Color(col(id, 'to'));
        const body = new THREE.MeshStandardMaterial({ color: 0x1a1550, roughness: 0.55, metalness: 0.15, emissive: a, emissiveIntensity: 0.012 });
        const rim = new THREE.LineBasicMaterial({ color: a });
        const ink = new THREE.MeshBasicMaterial({ color: b });
        made.push(body, rim, ink);
        const layer = new THREE.Group();
        layer.position.y = y;
        layer.add(new THREE.Mesh(slab, body), new THREE.LineSegments(edges, rim));
        // a few strips of "content" on each face, in the layer's colour
        for (let k = 0; k < 5; k++) {
          const strip = new THREE.Mesh(bar, ink);
          const len = 0.9 + ((i * 7 + k * 5) % 6) * 0.42;
          strip.scale.x = len;
          strip.position.set(-W / 2 + 0.5 + len / 2 + (k % 2) * 0.4, T / 2 + 0.02, -D / 2 + 0.55 + k * 0.46);
          layer.add(strip);
        }
        group.add(layer);
      });

      let turn = calm ? 0 : -0.9, tilt = 0, vel = 0, frame = 0, dragging = false, lastX = 0, lastY = 0, easing = !calm;
      const draw = () => { group.rotation.y = turn; group.rotation.x = tilt; renderer.render(scene, camera); el.dataset.drawn = String(renderer.info.render.triangles); };
      const size = () => {
        const w = el.clientWidth, h = el.clientHeight, view = 3.8, asp = w / h;
        camera.left = -view * asp; camera.right = view * asp; camera.top = view; camera.bottom = -view;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        draw();
      };
      const tick = () => {
        frame = 0;
        if (easing) { turn += (0 - turn) * 0.07; if (Math.abs(turn) < 0.002) { turn = 0; easing = false; } }
        else if (!dragging) { turn += vel; vel *= 0.92; if (Math.abs(vel) < 0.0004) vel = 0; }
        draw();
        if (easing || dragging || vel !== 0) frame = requestAnimationFrame(tick);
      };
      const run = () => { if (!frame) frame = requestAnimationFrame(tick); };
      const down = (e: PointerEvent) => { dragging = true; easing = false; vel = 0; lastX = e.clientX; lastY = e.clientY; el.setPointerCapture(e.pointerId); run(); };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        vel = (e.clientX - lastX) * 0.008;
        turn += vel;
        tilt = Math.max(-0.35, Math.min(0.35, tilt + (e.clientY - lastY) * 0.004));
        lastX = e.clientX; lastY = e.clientY;
      };
      const up = () => { dragging = false; if (calm) vel = 0; run(); };
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        easing = false;
        turn += e.key === 'ArrowRight' ? 0.2 : -0.2;
        el.dataset.turn = turn.toFixed(2);
        draw();
      };
      const ro = new ResizeObserver(size);
      ro.observe(el);
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('keydown', onKey);
      size();
      el.dataset.ready = '1';
      run();
      dispose = () => {
        cancelAnimationFrame(frame);
        ro.disconnect();
        el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('keydown', onKey);
        made.forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    }, { threshold: 0.2 });
    io.observe(el);
    return () => { io.disconnect(); dispose(); };
  }, []);
  return <div className="kit-scene" ref={host} tabIndex={0} role="img" aria-label={label} />;
}
