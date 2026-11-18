'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import { barDegree, chordName, STYLE_IDS, STYLES, type StyleId, ZONE_STYLE, ZONES, type ZoneKey } from '@/v2/sound/compose';
import { MUSIC_BAR, MUSIC_PREVIEW, MUSIC_STOP } from '@/v2/sound/control';
import type { BarInfo } from '@/v2/sound/engine';

type Labels = {
  letter: string; play: string; stop: string; where: string; zone: string; chord: string; bar: string; bpm: string;
  styles: Record<StyleId, { name: string; line: string }>;
};

/** The three proposals, each playable on any page's motif, with the pages where each one plays on the site. */
export function MusicLab({ labels, zones, colors }: { labels: Labels; zones: { key: ZoneKey; name: string }[]; colors: Record<StyleId, string> }) {
  const [playing, setPlaying] = useState<StyleId | null>(null);
  const [zone, setZone] = useState<ZoneKey>('home');
  const [now, setNow] = useState<BarInfo | null>(null);

  useEffect(() => {
    const onBar = (e: Event) => setNow((e as CustomEvent<BarInfo>).detail);
    window.addEventListener(MUSIC_BAR, onBar);
    // offline renders of the same engine, for the level checks of the tests and for samples
    (window as Window & { __igMusicRender?: unknown }).__igMusicRender = async (style: StyleId, z: ZoneKey | ZoneKey[], seconds: number, rate = 44100, asWav = false) => {
      const [{ renderMusic }, { levels, wav }] = await Promise.all([import('@/v2/sound/engine'), import('@/v2/sound/analyze')]);
      const b = await renderMusic(style, z, seconds, rate);
      const ch = [b.getChannelData(0), b.getChannelData(1)];
      const out: Record<string, unknown> = { ...levels(ch, rate) };
      if (asWav) { const bytes = wav(ch, rate); let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); out.wav = btoa(s); }
      return out;
    };
    return () => window.removeEventListener(MUSIC_BAR, onBar);
  }, []);
  // leaving the page ends the preview
  useEffect(() => () => { if (playing) window.dispatchEvent(new Event(MUSIC_STOP)); }, [playing]);

  const preview = (style: StyleId, z: ZoneKey) => window.dispatchEvent(new CustomEvent(MUSIC_PREVIEW, { detail: { style, zone: z } }));
  const toggle = (style: StyleId) => {
    if (playing === style) { setPlaying(null); setNow(null); window.dispatchEvent(new Event(MUSIC_STOP)); return; }
    setPlaying(style); setNow(null); preview(style, zone);
  };
  const pickZone = (z: ZoneKey) => { setZone(z); if (playing) preview(playing, z); };

  const prog = ZONES[zone].prog.map((_, i) => chordName(ZONES[zone], barDegree(ZONES[zone], i)));
  return (
    <div className="mu-lab">
      <fieldset className="ui-segmented mu-zones">
        <legend>{labels.zone}</legend>
        <div className="ui-segmented-track">
          {zones.map((z) => (
            <label key={z.key}>
              <input type="radio" name="mu-zone" value={z.key} checked={zone === z.key} onChange={() => pickZone(z.key)} />
              <span>{z.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <ul className="mu-cards">
        {STYLE_IDS.map((id, i) => {
          const on = playing === id;
          const s = labels.styles[id];
          const bar = on && now?.style === id ? now.bar % 4 : -1;
          return (
            <li key={id} className="mu-card" data-on={on || undefined} style={{ '--from': colors[id] } as CSSProperties}>
              <p className="mu-letter"><b>{String.fromCharCode(65 + i)}</b> {labels.letter}</p>
              <h3>{s.name}</h3>
              <p className="mu-line">{s.line}</p>
              <p className="mu-meta">{STYLES[id].bpm} {labels.bpm}</p>
              <p className="mu-where"><span className="v2-label">{labels.where}</span> {zones.filter((z) => ZONE_STYLE[z.key] === id).map((z) => z.name).join(' · ')}</p>
              <ol className="mu-prog" aria-label={labels.chord}>
                {prog.map((c, k) => <li key={k} data-now={k === bar || undefined}>{c}</li>)}
              </ol>
              <p className="mu-now" aria-live="polite">{on && now?.style === id ? `${labels.chord} ${now.chord} · ${labels.bar} ${now.bar + 1}` : ''}</p>
              <div className="mu-actions">
                <button type="button" className="ui-btn ui-btn--secondary ui-btn--sm" aria-pressed={on} onClick={() => toggle(id)}>
                  <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12">{on ? <path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /> : <path d="M2.5 1l8.5 5-8.5 5z" fill="currentColor" />}</svg>
                  <span>{on ? labels.stop : labels.play}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
