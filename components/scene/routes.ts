/**
 * Route → background scene. Pure (no DOM, no three): the server HTML and the client agree on it,
 * and `tests/unit/scene-routes.test.ts` pins it down.
 *
 * A scene is picked by the last path segment that names one (`/es/proyectos/complia/` → complia,
 * `/en/negocio/` → negocio), so pages added later at `/<locale>/<slug>/` or `/<locale>/proyectos/<slug>/`
 * get their scene without touching this file. Anything else falls back to `default`.
 */
export const SCENE_IDS = [
  'home',
  'complia',
  'handyx',
  'eclipse',
  'kinetic',
  'agentes',
  'tuenti',
  'volta',
  'dentalos',
  'games',
  'velmar',
  'supernova',
  'negocio',
  'default',
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

const LOCALES = ['es', 'en'];

/** Other spellings a page may use for the same scene (repo names, English slugs). */
const ALIASES: Record<string, SceneId> = {
  'modelos-de-negocio': 'negocio',
  'modelos-negocio': 'negocio',
  'business-models': 'negocio',
  business: 'negocio',
  agents: 'agentes',
  'sistema-agentico': 'agentes',
  'agentic-system': 'agentes',
  'kinetic-studio': 'kinetic',
  'supplements-ecommerce': 'volta',
  'velmar-ecommerce': 'velmar',
  'games-market': 'games',
  'supernova-eventos': 'supernova',
  handy: 'handyx',
  // inner pages of the site: «Cómo trabajo» is the agentic system's graph; «Sobre mí» grows from the home's seed.
  // «Trabajo» and «Capacidades» keep the quiet dot field (default).
  'como-trabajo': 'agentes',
  'how-i-work': 'agentes',
  'sobre-mi': 'home',
  about: 'home',
};

const NAMED = new Set<string>(SCENE_IDS.filter((id) => id !== 'home' && id !== 'default'));

export function sceneForPath(pathname: string | null | undefined): SceneId {
  const clean = (pathname ?? '/').split(/[?#]/)[0].toLowerCase();
  const segs = clean.split('/').filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  if (segs[0] && LOCALES.includes(segs[0])) segs.shift();
  if (segs.at(-1) === 'index.html') segs.pop();
  if (segs.length === 0) return 'home';
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    if (NAMED.has(s)) return s as SceneId;
    if (ALIASES[s]) return ALIASES[s];
  }
  return 'default';
}
