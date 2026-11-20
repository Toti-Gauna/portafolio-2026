/**
 * The six marketing playbooks (lote 6.3): the way of each project's customer, stage by stage, and the touchpoints on
 * it in the order they are met. Every touchpoint that is not a proposal cites a file of its repo and a literal string
 * on it (checked against the clones: session scratchpad, mk63/verify.mjs, 20/11/2026). Facts: o8b/negocio-hechos.md
 * and n62/hechos.md of the same scratchpad. Words: messages/v2/mkt/<locale>/<id>.json.
 */
import type { Play, PlayId } from './types';

const ig: Play = {
  id: 'ig', repo: 'Toti-Gauna/portafolio-2026', stages: 4,
  touches: [
    { id: 'post', lane: 'digital', stage: 0, kind: 'post', origin: 'plan' },
    { id: 'share', lane: 'digital', stage: 0, kind: 'link', origin: 'site', src: { path: 'app/[locale]/layout.tsx', match: "absoluteUrl('/og.png')" } },
    { id: 'card', lane: 'physical', stage: 1, kind: 'card', origin: 'plan' },
    { id: 'trailer', lane: 'digital', stage: 1, kind: 'story', origin: 'site', src: { path: 'components/TrailerOverlay.tsx', match: '«Conocer a Ignacio»' } },
    { id: 'case', lane: 'digital', stage: 2, kind: 'web', origin: 'site', src: { path: 'v2/components/case/CaseFilm.tsx', match: 'four chapters, ten seconds' } },
    { id: 'sheet', lane: 'physical', stage: 2, kind: 'sheet', origin: 'plan' },
    { id: 'mail', lane: 'digital', stage: 3, kind: 'mail', origin: 'site', src: { path: 'v2/components/home/sections.tsx', match: 'mailto:${CONTACT_EMAIL}' } },
  ],
};

const eclipse: Play = {
  id: 'eclipse', repo: 'Toti-Gauna/Eclipse-Web', sha: 'eb1f5079018821b2726323aa619a78059e3e7508', stages: 5,
  touches: [
    { id: 'mail', lane: 'digital', stage: 0, kind: 'mail', origin: 'doc', src: { path: 'docs/v3/lote-2.5-conversion-seguimiento.md', match: 'Las consultas que llegan fuera de horario' } },
    { id: 'call', lane: 'digital', stage: 0, kind: 'call', origin: 'doc', src: { path: 'docs/v3/lote-2.5-conversion-seguimiento.md', match: '¿Hablo con quien decide' } },
    { id: 'visit', lane: 'physical', stage: 0, kind: 'sheet', origin: 'doc', src: { path: 'docs/v3/lote-2.5-conversion-seguimiento.md', match: 'Pasé a mostrarte una demo' } },
    { id: 'demo', lane: 'digital', stage: 1, kind: 'web', origin: 'repo', src: { path: 'components/demo-experience/SelectorLayer.tsx', match: "track('selector_chosen'" } },
    { id: 'wa', lane: 'digital', stage: 2, kind: 'chat', origin: 'repo', src: { path: 'lib/whatsapp.ts', match: "track('whatsapp_opened'" } },
    { id: 'proposal', lane: 'digital', stage: 3, kind: 'mail', origin: 'doc', src: { path: 'docs/v3/lote-2.5-conversion-seguimiento.md', match: 'propuesta en ≤ 24 h' } },
    { id: 'paid', lane: 'digital', stage: 4, kind: 'ticket', origin: 'doc', src: { path: 'docs/v3/lote-2.5-conversion-seguimiento.md', match: 'status = collected' } },
    { id: 'box', lane: 'physical', stage: 4, kind: 'box', origin: 'plan' },
  ],
};

const volta: Play = {
  id: 'volta', repo: 'Toti-Gauna/supplements-ecommerce', sha: '0ae34ddeef588ff866762b0b96ad1995595b638b', stages: 5,
  touches: [
    { id: 'post', lane: 'digital', stage: 0, kind: 'post', origin: 'repo', src: { path: 'src/demo/fixtures/studio.ts', match: 'STUDIO_KEYWORDS' } },
    { id: 'date', lane: 'digital', stage: 1, kind: 'web', origin: 'repo', src: { path: 'src/demo/fixtures/themes.ts', match: 'Overclock de precios' } },
    { id: 'game', lane: 'digital', stage: 2, kind: 'game', origin: 'repo', src: { path: 'src/demo/engine/game-prize.ts', match: 'GAME_COUPON_PREFIX = "SHAKER"' } },
    { id: 'wa', lane: 'digital', stage: 3, kind: 'chat', origin: 'repo', src: { path: 'src/demo/fixtures/whatsapp.ts', match: 'decí el código' } },
    { id: 'counter', lane: 'physical', stage: 3, kind: 'counter', origin: 'repo', src: { path: 'docs/plan-rediseno.md', match: 'FEFO' } },
    { id: 'sample', lane: 'physical', stage: 3, kind: 'sample', origin: 'repo', src: { path: 'src/demo/fixtures/club.ts', match: 'Sachet de muestra en cada pedido' } },
    { id: 'repurchase', lane: 'digital', stage: 4, kind: 'chat', origin: 'repo', src: { path: 'src/demo/admin/repurchase-text.ts', match: '¿Te preparamos otro?' } },
    { id: 'gift', lane: 'digital', stage: 4, kind: 'story', origin: 'repo', src: { path: 'src/features/gifts/scenes/reveal/story-card.ts', match: 'Historia 9:16 del regalo' } },
  ],
  calendar: {
    lanes: ['sales', 'sport'],
    src: { path: 'src/demo/fixtures/themes.ts', match: 'CrossFit Open' },
    dates: [
      { key: 'madre', lane: 'sales', from: [10, 1], to: [10, 18] },
      { key: 'halloween', lane: 'sales', from: [10, 19], to: [10, 31] },
      { key: 'cyber', lane: 'sales', from: [11, 2], to: [11, 4] },
      { key: 'black', lane: 'sales', from: [11, 23], to: [11, 30] },
      { key: 'navidad', lane: 'sales', from: [12, 1], to: [12, 25] },
      { key: 'nuevo', lane: 'sales', from: [12, 26], to: [1, 6] },
      { key: 'valentin', lane: 'sales', from: [2, 1], to: [2, 14] },
      { key: 'gym', lane: 'sales', from: [3, 9], to: [3, 21] },
      { key: 'hot', lane: 'sales', from: [5, 10], to: [5, 12] },
      { key: 'padre', lane: 'sales', from: [6, 6], to: [6, 20] },
      { key: 'amigo', lane: 'sales', from: [7, 13], to: [7, 20] },
      { key: 'verano', lane: 'sales', from: [9, 16], to: [9, 30] },
      { key: 'crossfit', lane: 'sport', from: [2, 18], to: [3, 8] },
      { key: 'actividad', lane: 'sport', from: [4, 3], to: [4, 6] },
      { key: 'running', lane: 'sport', from: [5, 31], to: [6, 2] },
      { key: 'futbol', lane: 'sport', from: [6, 21], to: [6, 22] },
      { key: 'box', lane: 'sport', from: [9, 11], to: [9, 14] },
    ],
  },
};

const velmar: Play = {
  id: 'velmar', repo: 'Toti-Gauna/velmar-ecommerce-', sha: 'aac5aedaa9c0226fffbe3e0a20c1b56d9fe48634', stages: 5,
  touches: [
    { id: 'fair', lane: 'physical', stage: 0, kind: 'tag', origin: 'repo', src: { path: 'src/demo/fixtures/commerce.ts', match: 'FERIA2000' } },
    { id: 'carousel', lane: 'digital', stage: 0, kind: 'post', origin: 'repo', src: { path: 'docs/panel-demo.md', match: 'Cómo pedir el tuyo' } },
    { id: 'theme', lane: 'digital', stage: 1, kind: 'web', origin: 'repo', src: { path: 'src/demo/fixtures/themes.ts', match: 'Su día, sus cosas' } },
    { id: 'wheel', lane: 'digital', stage: 2, kind: 'game', origin: 'repo', src: { path: 'src/demo/engine/wheel.ts', match: 'RULETA' } },
    { id: 'production', lane: 'digital', stage: 3, kind: 'mail', origin: 'repo', src: { path: 'src/demo/fixtures/emails.ts', match: '¡Manos a la obra! Tu pedido ' } },
    { id: 'box', lane: 'physical', stage: 3, kind: 'box', origin: 'plan' },
    { id: 'birthday', lane: 'digital', stage: 4, kind: 'mail', origin: 'repo', src: { path: 'src/demo/fixtures/emails.ts', match: '¡Feliz cumple, ' } },
  ],
  calendar: {
    lanes: ['dates'],
    src: { path: 'src/demo/fixtures/themes.ts', match: 'Día del Animal' },
    dates: [
      { key: 'madre', lane: 'dates', from: [10, 1], to: [10, 18] },
      { key: 'halloween', lane: 'dates', from: [10, 19], to: [10, 31] },
      { key: 'orgullo', lane: 'dates', from: [11, 1], to: [11, 7] },
      { key: 'black', lane: 'dates', from: [11, 23], to: [11, 30] },
      { key: 'navidad', lane: 'dates', from: [12, 1], to: [12, 25] },
      { key: 'nuevo', lane: 'dates', from: [12, 26], to: [1, 6] },
      { key: 'valentin', lane: 'dates', from: [2, 1], to: [2, 14] },
      { key: 'pascuas', lane: 'dates', from: [3, 18], to: [3, 28] },
      { key: 'animal', lane: 'dates', from: [4, 20], to: [4, 29] },
      { key: 'hot', lane: 'dates', from: [5, 10], to: [5, 12] },
      { key: 'mayo', lane: 'dates', from: [5, 18], to: [5, 25] },
      { key: 'padre', lane: 'dates', from: [6, 1], to: [6, 17] },
      { key: 'bandera', lane: 'dates', from: [6, 18], to: [6, 20] },
      { key: 'julio', lane: 'dates', from: [7, 3], to: [7, 9] },
      { key: 'amigo', lane: 'dates', from: [7, 13], to: [7, 20] },
      { key: 'nino', lane: 'dates', from: [8, 2], to: [8, 15] },
    ],
  },
};

const brisa: Play = {
  id: 'brisa', repo: 'Toti-Gauna/DentalOS', sha: 'aac7eea2d057034929cb1d0b69b56fd9a7980e56', stages: 5,
  touches: [
    { id: 'home', lane: 'digital', stage: 0, kind: 'web', origin: 'repo', src: { path: 'src/pages/public/Home.tsx', match: "navigate('/reservar?motivo=ST-PRIMERA')" } },
    { id: 'wa', lane: 'digital', stage: 1, kind: 'chat', origin: 'repo', src: { path: 'src/domain/chat.ts', match: 'Mi próximo turno' } },
    { id: 'reminder', lane: 'digital', stage: 2, kind: 'chat', origin: 'repo', src: { path: 'src/domain/commands.ts', match: 'bloqueado_optout' } },
    { id: 'receipt', lane: 'physical', stage: 2, kind: 'ticket', origin: 'repo', src: { path: 'src/ui/Receipt.tsx', match: 'boleto de papel con talón' } },
    { id: 'kids', lane: 'digital', stage: 2, kind: 'game', origin: 'repo', src: { path: 'docs/spec/requisitos.md', match: 'R-KID-03' } },
    { id: 'control', lane: 'digital', stage: 3, kind: 'chat', origin: 'repo', src: { path: 'src/domain/campaigns.ts', match: 'tenés un control ya indicado' } },
    { id: 'kit', lane: 'physical', stage: 3, kind: 'box', origin: 'plan' },
    { id: 'again', lane: 'digital', stage: 4, kind: 'mail', origin: 'repo', src: { path: 'src/domain/campaigns.ts', match: 'volver a coordinar el turno' } },
  ],
};

const lucero: Play = {
  id: 'lucero', repo: 'Toti-Gauna/foody', sha: '12f0d43125760a96a5e7226f61889cabdafe73b6', stages: 5,
  touches: [
    { id: 'ig', lane: 'digital', stage: 0, kind: 'post', origin: 'doc', src: { path: 'content/academy.json', match: 'Instagram que trae gente a la mesa' } },
    { id: 'board', lane: 'physical', stage: 0, kind: 'board', origin: 'doc', src: { path: 'content/academy.json', match: 'La pizarra de la vereda' } },
    { id: 'qr', lane: 'physical', stage: 1, kind: 'qr', origin: 'doc', src: { path: 'content/academy.json', match: 'Escaneá, pedí y Gus te lo trae' } },
    { id: 'carta', lane: 'digital', stage: 2, kind: 'web', origin: 'repo', src: { path: 'components/lucero/carta/CartaApp.tsx', match: 'Right after scanning the QR' } },
    { id: 'ruleta', lane: 'digital', stage: 3, kind: 'game', origin: 'repo', src: { path: 'messages/es.json', match: 'Mostrale el código al mozo.' } },
    { id: 'code', lane: 'physical', stage: 3, kind: 'ticket', origin: 'repo', src: { path: 'content/lucero-prizes.json', match: 'Postre de la casa' } },
    { id: 'review', lane: 'digital', stage: 4, kind: 'review', origin: 'doc', src: { path: 'content/academy.json', match: 'Reseñas en Google sin pedir de más' } },
    { id: 'matches', lane: 'physical', stage: 4, kind: 'box', origin: 'plan' },
  ],
  calendar: {
    lanes: ['season'],
    src: { path: 'lib/seasons.ts', match: "season: 'halloween', from: [10, 20], to: [11, 3]" },
    dates: [
      { key: 'halloween', lane: 'season', from: [10, 20], to: [11, 3] },
      { key: 'navidad', lane: 'season', from: [12, 1], to: [1, 6] },
      { key: 'valentin', lane: 'season', from: [2, 7], to: [2, 15] },
    ],
  },
};

export const PLAYS: Record<PlayId, Play> = { ig, eclipse, velmar, volta, brisa, lucero };
export const PLAY_ORDER: PlayId[] = ['ig', 'eclipse', 'velmar', 'volta', 'brisa', 'lucero'];
export const isPlayId = (s: string): s is PlayId => PLAY_ORDER.includes(s as PlayId);

/** Seconds each step of «Recorrer el camino» stays (a timer, never animation frames). */
export const WALK_STEP_MS = 1900;

