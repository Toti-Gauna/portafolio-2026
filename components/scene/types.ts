/**
 * Contract between the engine (`engine.ts`) and each scene (`scenes/<id>.ts`). Types only: importing this
 * file never pulls three into a bundle.
 *
 * A scene module exports `create(ctx)` and, optionally, `still` (the time in seconds of the frame shown with
 * reduced motion) and `renderScale` (≤ 1 for soft, shader-heavy scenes that look the same at lower resolution).
 * The engine owns the renderer, the camera (inside a rig that takes the pointer parallax), resize, the RAF loop
 * and disposal: everything a scene adds to `ctx.scene` is disposed for it.
 */
import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export type SceneInput = {
  /** scene time in seconds (stops while paused) */
  t: number;
  /** seconds since the previous frame, clamped to 0.1 */
  dt: number;
  /** window.scrollY in CSS px */
  scroll: number;
  /** scroll progress of the page, 0..1 */
  progress: number;
  /** smoothed pointer, -1..1 (always 0 on touch screens) */
  px: number;
  py: number;
};

export type SceneContext = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  /** seeded generator for this scene: the same picture on every load */
  rng: () => number;
  /** phone-class device: fewer particles, DPR 1, 30 fps */
  mobile: boolean;
  reduced: boolean;
  /** canvas size in CSS px */
  w: number;
  h: number;
  /** device pixels per CSS px actually used by the renderer */
  dpr: number;
};

export type SceneInstance = {
  frame(input: SceneInput): void;
  resize?(w: number, h: number): void;
  dispose?(): void;
};

export type SceneModule = {
  create(ctx: SceneContext): SceneInstance;
  still?: number;
  renderScale?: number;
};

export type SceneState = 'idle' | 'loading' | 'running' | 'still' | 'paused' | 'fallback';
