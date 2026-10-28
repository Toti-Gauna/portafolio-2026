'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { sceneForPath } from './routes';
import type { Engine } from './engine';
import type { SceneState } from './types';
import './scene.css';

// Phones and software rendering skip MSAA (and get DPR 1 and 30 fps, see engine.ts).
const glAttrs = (software: boolean): WebGLContextAttributes => ({
  alpha: true,
  antialias: !(software || matchMedia('(pointer: coarse)').matches || innerWidth < 768),
  premultipliedAlpha: true,
  depth: true,
  stencil: false,
  powerPreference: 'low-power',
  preserveDrawingBuffer: false,
});

/** WebGL2 without a GPU (SwiftShader, llvmpipe, a blocklisted driver): a 1 px probe that refuses software rendering. */
function softwareGL() {
  const probe = document.createElement('canvas');
  probe.width = probe.height = 1;
  const g = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  g?.getExtension('WEBGL_lose_context')?.loseContext();
  return !g;
}

/** Resolves once the boot screen (#boot) has left the DOM. */
function bootGone(signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    if (!document.getElementById('boot')) return resolve();
    const mo = new MutationObserver(() => {
      if (signal.cancelled || !document.getElementById('boot')) {
        mo.disconnect();
        resolve();
      }
    });
    mo.observe(document.body, { childList: true });
  });
}

const idle = () =>
  new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 1500 });
    else setTimeout(resolve, 200);
  });

/**
 * The animated background of every page: one fixed canvas behind the content (#app-shell sits above it).
 * The CSS gradient of the route's scene is in the server HTML (and is the whole background with Save-Data,
 * without WebGL or before three arrives); three itself loads after the boot screen, on idle.
 */
export function SceneBackground() {
  const pathname = usePathname();
  const id = sceneForPath(pathname);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const idRef = useRef(id);
  const [state, setState] = useState<SceneState>('idle');

  useEffect(() => {
    idRef.current = id;
    void engineRef.current?.show(id);
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signal = { cancelled: false };
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => engineRef.current?.setReduced(motion.matches);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) {
      setState('fallback');
      return;
    }
    (async () => {
      await bootGone(signal);
      await idle();
      if (signal.cancelled) return;
      // WebGL first: without it, three is never downloaded.
      const software = softwareGL();
      const gl = canvas.getContext('webgl2', glAttrs(software));
      if (!gl || gl.isContextLost()) {
        setState('fallback');
        return;
      }
      setState('loading');
      try {
        const { createEngine } = await import('./engine');
        // the chunk's evaluation and the renderer's setup run as separate tasks
        await new Promise((r) => setTimeout(r, 0));
        if (signal.cancelled) return;
        const engine = createEngine({ canvas, gl, software, reduced: motion.matches, onState: setState });
        engineRef.current = engine;
        motion.addEventListener('change', onMotion);
        await engine.show(idRef.current);
      } catch {
        if (!signal.cancelled) setState('fallback');
      }
    })();
    return () => {
      signal.cancelled = true;
      motion.removeEventListener('change', onMotion);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="scene" data-scene={id} data-state={state} aria-hidden="true">
      <canvas ref={canvasRef} className="scene__canvas" />
      <div className="scene__scrim" />
    </div>
  );
}
