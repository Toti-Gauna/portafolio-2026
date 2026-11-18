/** Level checks and WAV export for offline renders of the music (tests, and samples to listen to). */

export type Levels = { peak: number; rms: number; peakDb: number; rmsDb: number; silentSeconds: number };
const db = (x: number) => (x > 0 ? 20 * Math.log10(x) : -Infinity);

/** Peak and RMS over all channels, and the longest stretch below -60 dBFS (in seconds). */
export function levels(channels: Float32Array[], rate: number): Levels {
  let peak = 0, sum = 0, n = 0, run = 0, longest = 0;
  const len = channels[0]?.length ?? 0;
  for (let i = 0; i < len; i++) {
    let m = 0;
    for (const c of channels) { const v = Math.abs(c[i]); if (v > m) m = v; sum += c[i] * c[i]; n++; }
    if (m > peak) peak = m;
    if (m < 0.001) { run++; if (run > longest) longest = run; } else run = 0;
  }
  const rms = Math.sqrt(sum / Math.max(1, n));
  return { peak, rms, peakDb: db(peak), rmsDb: db(rms), silentSeconds: longest / rate };
}

/** 16-bit PCM WAV of the channels. */
export function wav(channels: Float32Array[], rate: number): Uint8Array {
  const ch = channels.length, len = channels[0].length;
  const buf = new ArrayBuffer(44 + len * ch * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + len * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, len * ch * 2, true);
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, channels[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
  return new Uint8Array(buf);
}
