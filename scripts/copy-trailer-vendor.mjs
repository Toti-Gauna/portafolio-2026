// Copies the GSAP UMD builds the trailer kit expects on `window` into public/trailer/vendor/.
// Runs before dev/build so the files always match the installed gsap version (not committed).
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const dist = join(dirname(require.resolve('gsap/package.json')), 'dist');
const out = new URL('../public/trailer/vendor/', import.meta.url);
mkdirSync(out, { recursive: true });
for (const f of ['gsap.min.js', 'SplitText.min.js', 'MorphSVGPlugin.min.js', 'DrawSVGPlugin.min.js', 'ScrambleTextPlugin.min.js']) {
  copyFileSync(join(dist, f), new URL(f, out));
}
console.log('trailer vendor: GSAP copied to public/trailer/vendor/');
