/**
 * Must run INSIDE the click that opens the trailer: browsers only allow sound and fullscreen from a user gesture.
 * The AudioContext is lent to the trailer page (public/trailer/v2, same origin) through window.__igTrailerAudio.
 */
declare global {
  interface Window { __igTrailerAudio?: AudioContext }
}

/** `force`: the visitor asked for the animation even with reduced motion on. */
export function primeTrailer(force = false) {
  if (!force && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // text version: no sound, no fullscreen
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor && (!window.__igTrailerAudio || window.__igTrailerAudio.state === 'closed')) window.__igTrailerAudio = new Ctor();
    void window.__igTrailerAudio?.resume();
  } catch { /* no audio: the film still plays */ }
  if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => {});
}

/** Silences the film at once: its pads would keep sounding on the lent context after the frame is gone. */
export function stopTrailerAudio() {
  void window.__igTrailerAudio?.close().catch(() => {});
  window.__igTrailerAudio = undefined;
}

export function releaseTrailer() {
  stopTrailerAudio();
  if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
}
