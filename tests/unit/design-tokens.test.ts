import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { STATUS_KINDS } from '../../lib/status';

const ROOT = join(__dirname, '../..');
const tokens = JSON.parse(readFileSync(join(ROOT, 'design/2026/tokens.json'), 'utf8'));
const css = readFileSync(join(ROOT, 'app/globals.css'), 'utf8');
const cssVar = (name: string) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1]?.toLowerCase();

describe('sistema «Cartel suizo»', () => {
  it('los colores de globals.css son los de design/2026/tokens.json', () => {
    const c = tokens.color;
    expect(cssVar('ink')).toBe(c.ink);
    expect(cssVar('surface')).toBe(c.surface);
    expect(cssVar('paper')).toBe(c.paper);
    expect(cssVar('soft')).toBe(c.textSoft);
    expect(cssVar('muted')).toBe(c.textMuted);
    expect(cssVar('accent')).toBe(c.accent);
  });
  it('cada estado tiene su rótulo en es y en', () => {
    for (const k of STATUS_KINDS) {
      expect((es.status as Record<string, string>)[k], `es ${k}`).toBeTruthy();
      expect((en.status as Record<string, string>)[k], `en ${k}`).toBeTruthy();
    }
    expect(Object.keys(es.status).sort()).toEqual([...STATUS_KINDS].sort());
  });
  it('el sonido arranca apagado', () => {
    expect(tokens.sound.default).toBe('off');
  });
});
