import type { Metadata } from 'next';
import { routing, localeTags } from '@/i18n/routing';
import { BASE_PATH, absoluteUrl } from '@/lib/site';
import es from '@/messages/es.json';

export const metadata: Metadata = {
  title: es.meta.title,
  description: es.meta.description,
  alternates: {
    canonical: absoluteUrl('/'),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [localeTags[l], absoluteUrl(`/${l}/`)])),
      'x-default': absoluteUrl('/es/'),
    },
  },
};

// Static export has no middleware: pick the language on the client (saved choice, then the browser's)
// and redirect to /es/ or /en/. Without JS, <noscript> links to both.
const redirectScript = `(function(){var base=${JSON.stringify(BASE_PATH)},ok=${JSON.stringify(routing.locales)},pick=null;
try{var s=localStorage.getItem('ig:locale');if(ok.indexOf(s)>-1)pick=s;}catch(e){}
if(!pick){var l=(navigator.languages&&navigator.languages[0]||navigator.language||'es').slice(0,2).toLowerCase();pick=ok.indexOf(l)>-1?l:'es';}
location.replace(base+'/'+pick+'/'+location.hash);})();`;

export default function RootRedirect() {
  return (
    <html lang="es">
      <head>
        <meta name="robots" content="noindex" />
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      </head>
      <body style={{ background: '#0e0e10', color: '#eeeae3', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <noscript>
          <p>
            <a href={`${BASE_PATH}/es/`} style={{ color: '#ff4d2e' }}>Español</a> ·{' '}
            <a href={`${BASE_PATH}/en/`} style={{ color: '#ff4d2e' }}>English</a>
          </p>
        </noscript>
      </body>
    </html>
  );
}
