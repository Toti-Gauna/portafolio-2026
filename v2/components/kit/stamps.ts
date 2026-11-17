/**
 * «Postal»: one stamp per stop of the journey (direction 6 of lote 1.1; Ignacio: for Work, when a project
 * opens, and for the trailer). Flat ink on cream paper, one motif per stop, no client brands.
 * The art carries no text: year and name are set in HTML over it, from messages (kit.stamps.items).
 * Drawn in code, 240 × 300, with perforations cut by a mask so a stamp sits on any background.
 */
export const STAMP_IDS = ['tach', 'ada', 'tuenti', 'complia', 'supernova', 'eclipse'] as const;
export type StampId = (typeof STAMP_IDS)[number];

const CR = '#fbf6ea', INK = '#0a0a0c', CO = '#ff4d2e', AZ = '#2b50ff', MU = '#f5b82e', GR = '#0f6b4f', MI = '#7fe0b8', PL = '#3b1352', PK = '#ff8fb0', SK = '#9fc2ff';
const f = (n: number) => +n.toFixed(1);
const pol = (cx: number, cy: number, r: number, a: number): [number, number] => [f(cx + r * Math.cos(a)), f(cy + r * Math.sin(a))];

const ART: Record<StampId, { bg: string; dot: string; svg: () => string }> = {
  tach: { bg: CO, dot: INK, svg: () => {
    let o = `<rect x="38" y="92" width="128" height="98" rx="8" fill="${INK}" transform="translate(5 5)" opacity=".28"/><rect x="38" y="92" width="128" height="98" rx="8" fill="${CR}" stroke="${INK}" stroke-width="3"/><path d="M38 112H166" stroke="${INK}" stroke-width="3"/><circle cx="50" cy="102" r="3.4" fill="${CO}"/><circle cx="61" cy="102" r="3.4" fill="${MU}"/><circle cx="72" cy="102" r="3.4" fill="${AZ}"/>`;
    [26, 40, 32, 52].forEach((h, i) => { o += `<rect x="${52 + i * 17}" y="${176 - h}" width="11" height="${h}" rx="2" fill="${i === 3 ? CO : AZ}"/>`; });
    o += `<path d="M124 126H154M124 138H148M124 150H154" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
    o += `<rect x="142" y="118" width="64" height="116" rx="11" fill="${INK}" transform="translate(5 5)" opacity=".28"/><rect x="142" y="118" width="64" height="116" rx="11" fill="${INK}"/><rect x="148" y="128" width="52" height="96" rx="5" fill="${CR}"/>`;
    o += `<rect x="153" y="136" width="42" height="27" rx="5" fill="${AZ}"/><rect x="158" y="142" width="9" height="7" rx="1.5" fill="${MU}"/><path d="M158 156H180" stroke="${CR}" stroke-width="2.6" stroke-linecap="round"/><path d="M154 174H194M154 185H184" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" opacity=".55"/><circle cx="174" cy="208" r="8" fill="${CO}"/><path d="M170.5 208h7M174 204.5v7" stroke="${CR}" stroke-width="2.2" stroke-linecap="round"/>`;
    return o; } },
  ada: { bg: MU, dot: INK, svg: () => {
    let o = `<rect x="36" y="84" width="168" height="98" rx="5" fill="${INK}" transform="translate(5 5)" opacity=".25"/><rect x="36" y="84" width="168" height="98" rx="5" fill="${GR}" stroke="${INK}" stroke-width="5"/>`;
    o += `<path d="M82 112L62 132L82 152M158 112L178 132L158 152M132 104L108 160" fill="none" stroke="${CR}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 168q8-6 16 0t16 0t16 0" fill="none" stroke="${MU}" stroke-width="3" stroke-linecap="round"/><rect x="150" y="178" width="26" height="7" rx="2" fill="${CR}" stroke="${INK}" stroke-width="2"/>`;
    ([[66, INK], [120, CO], [174, INK]] as [number, string][]).forEach(([x, c], i) => { o += `<path d="M${x - 26} 242q0-30 26-30t26 30z" fill="${c}"/><circle cx="${x}" cy="${200}" r="14" fill="${c}"/>`; if (i === 1) o += `<path d="M${x + 22} 222L${x + 34} 184" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`; });
    return o; } },
  tuenti: { bg: AZ, dot: INK, svg: () => {
    const cx = 120, cy = 154, R = 70; let o = `<circle cx="${cx + 5}" cy="${cy + 6}" r="${R + 6}" fill="${INK}" opacity=".3"/><circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="${INK}"/>`;
    const cols = [CR, CO, MU, CR, PK, CO, CR, MU];
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 - Math.PI / 2, b = a + Math.PI / 4; o += `<path d="M${cx} ${cy}L${pol(cx, cy, R, a).join(' ')}A${R} ${R} 0 0 1 ${pol(cx, cy, R, b).join(' ')}Z" fill="${cols[i]}" stroke="${INK}" stroke-width="2.4"/>`; const m = pol(cx, cy, R * 0.66, a + Math.PI / 8); o += `<circle cx="${m[0]}" cy="${m[1]}" r="5" fill="${INK}" opacity="${i % 2 ? 0.85 : 0.25}"/>`; }
    for (let i = 0; i < 16; i++) { const p = pol(cx, cy, R + 1, (i * Math.PI) / 8); o += `<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="${CR}"/>`; }
    o += `<circle cx="${cx}" cy="${cy}" r="15" fill="${INK}"/><circle cx="${cx}" cy="${cy}" r="5.5" fill="${CR}"/><path d="M${cx - 13} ${cy - R - 16}h26l-13 26z" fill="${CO}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    ([[40, 96, MU], [204, 108, PK], [34, 206, PK], [206, 214, MU], [196, 82, CR]] as [number, number, string][]).forEach(([x, y, c], i) => { o += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="${i % 2 ? 4 : 1}" fill="${c}" transform="rotate(${i * 23} ${x} ${y})"/>`; });
    return o; } },
  complia: { bg: GR, dot: INK, svg: () => {
    let o = `<path d="M58 84h72l28 28v118h-100z" fill="${INK}" transform="translate(5 6)" opacity=".3"/><path d="M58 84h72l28 28v118h-100z" fill="${CR}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M130 84v28h28" fill="${MI}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    o += `<path d="M72 128H138M72 144H144M72 176H132M72 192H144M72 208H118" stroke="${INK}" stroke-width="4.4" stroke-linecap="round" opacity=".7"/><rect x="68" y="153" width="80" height="14" rx="4" fill="${MU}"/><path d="M72 160H126" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/>`;
    o += `<path d="M142 148h56a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8h-22l-14 14v-14h-20a8 8 0 0 1-8-8v-30a8 8 0 0 1 8-8z" fill="${MI}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M150 164H190M150 178H178" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    o += `<circle cx="150" cy="226" r="19" fill="${CO}" stroke="${INK}" stroke-width="3"/><path d="M141 226l6 7l12-14" fill="none" stroke="${CR}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `<path d="M186 88q0 18 18 18q-18 0-18 18q0-18-18-18q18 0 18-18z" fill="${MU}"/><path d="M46 96q0 9 9 9q-9 0-9 9q0-9-9-9q9 0 9-9z" fill="${MI}"/>`;
    return o; } },
  supernova: { bg: PL, dot: CR, svg: () => {
    const cx = 116, cy = 150; let o = '';
    for (let i = 0; i < 24; i++) { const a = (i * Math.PI) / 12, r1 = 30, r2 = i % 2 ? 62 : 88, w = 0.06; const p1 = pol(cx, cy, r1, a - w * 2), p2 = pol(cx, cy, r2, a), p3 = pol(cx, cy, r1, a + w * 2); o += `<path d="M${p1.join(' ')}L${p2.join(' ')}L${p3.join(' ')}Z" fill="${i % 2 ? MU : PK}"/>`; }
    o += `<circle cx="${cx}" cy="${cy}" r="34" fill="${CO}"/><circle cx="${cx}" cy="${cy}" r="22" fill="${CR}"/><circle cx="${cx}" cy="${cy}" r="100" fill="none" stroke="${PK}" stroke-width="1.6" stroke-dasharray="2 7" opacity=".7"/>`;
    o += `<g transform="rotate(-14 170 214)"><path d="M128 196h84v13a8 8 0 0 0 0 16v13h-84v-13a8 8 0 0 0 0-16z" fill="${INK}" transform="translate(4 5)" opacity=".4"/><path d="M128 196h84v13a8 8 0 0 0 0 16v13h-84v-13a8 8 0 0 0 0-16z" fill="${CR}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M186 200v34" stroke="${INK}" stroke-width="2.4" stroke-dasharray="3 4"/><path d="M144 210H176M144 222H166" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M198 208l2.6 6.4 6.8.4-5.2 4.4 1.7 6.6-5.9-3.7-5.9 3.7 1.7-6.6-5.2-4.4 6.8-.4z" fill="${CO}"/></g>`;
    [[40, 92], [200, 96], [44, 224]].forEach(([x, y]) => { o += `<path d="M${x} ${y - 8}q0 8 8 8q-8 0-8 8q0-8-8-8q8 0 8-8z" fill="${CR}"/>`; });
    return o; } },
  eclipse: { bg: INK, dot: CR, svg: () => {
    const cx = 120, cy = 152; let o = '';
    for (let i = 0; i < 36; i++) { const a = (i * Math.PI) / 18, r2 = i % 3 === 0 ? 98 : i % 3 === 1 ? 80 : 86; const p1 = pol(cx, cy, 66, a), p2 = pol(cx, cy, r2, a); o += `<path d="M${p1.join(' ')}L${p2.join(' ')}" stroke="${i % 3 === 0 ? CO : MU}" stroke-width="${i % 3 === 0 ? 3.4 : 2}" stroke-linecap="round"/>`; }
    o += `<circle cx="${cx}" cy="${cy}" r="58" fill="${CO}"/><circle cx="${cx}" cy="${cy}" r="58" fill="none" stroke="${MU}" stroke-width="3"/><circle cx="${cx + 7}" cy="${cy - 7}" r="50" fill="${INK}"/><path d="M${cx - 24} ${cy - 44}a50 50 0 0 1 62 30" fill="none" stroke="${CR}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
    o += `<ellipse cx="${cx}" cy="${cy}" rx="104" ry="30" transform="rotate(-20 ${cx} ${cy})" fill="none" stroke="${SK}" stroke-width="1.6" stroke-dasharray="2 6"/><circle cx="${f(cx + 104 * Math.cos(-0.35))}" cy="${f(cy + 104 * Math.sin(-0.35))}" r="6" fill="${AZ}" stroke="${CR}" stroke-width="2"/>`;
    return o; } },
};

/** True when the stamp's field is dark, so the year over it goes in cream. */
export const stampIsDark = (id: StampId) => [INK, PL, GR, AZ].includes(ART[id].bg);

/** Inner markup of a stamp's <svg viewBox="0 0 240 300">; ids are prefixed with the stamp's own id. */
export function stampSvg(id: StampId): string {
  const a = ART[id];
  let holes = '';
  for (let x = 8; x <= 232; x += 16) holes += `<circle cx="${x}" cy="0" r="5.4"/><circle cx="${x}" cy="300" r="5.4"/>`;
  for (let y = 6; y <= 294; y += 16) holes += `<circle cx="0" cy="${y}" r="5.4"/><circle cx="240" cy="${y}" r="5.4"/>`;
  return (
    `<defs><mask id="sp-${id}"><rect width="240" height="300" fill="#fff"/><g fill="#000">${holes}</g></mask>` +
    `<pattern id="sd-${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><circle cx="2" cy="2" r="1" fill="${a.dot}"/></pattern>` +
    `<clipPath id="sc-${id}"><rect x="16" y="16" width="208" height="268"/></clipPath></defs>` +
    `<rect width="240" height="300" fill="${CR}" mask="url(#sp-${id})"/><rect x="16" y="16" width="208" height="268" fill="${a.bg}"/><rect x="16" y="16" width="208" height="268" fill="url(#sd-${id})" opacity=".1"/>` +
    `<g clip-path="url(#sc-${id})">${a.svg()}</g><rect x="22.500" y="22.500" width="195" height="255" fill="none" stroke="${stampIsDark(id) ? CR : INK}" stroke-width="1.200" opacity=".55"/>`
  );
}
