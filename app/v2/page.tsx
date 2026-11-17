import type { Metadata } from 'next';
import { BASE_PATH } from '@/lib/site';
import { V2_LOCALES, v2Messages } from '@/v2/i18n';

export const metadata: Metadata = { title: v2Messages('es').meta.title, robots: { index: false, follow: false } };

// Same as the site root: the saved language (shared with the published site), then the browser's.
const redirectScript = `(function(){var base=${JSON.stringify(BASE_PATH + '/v2')},ok=${JSON.stringify(V2_LOCALES)},pick=null;
try{var s=localStorage.getItem('ig:locale');if(ok.indexOf(s)>-1)pick=s;}catch(e){}
if(!pick){var l=(navigator.languages&&navigator.languages[0]||navigator.language||'es').slice(0,2).toLowerCase();pick=ok.indexOf(l)>-1?l:'es';}
location.replace(base+'/'+pick+'/'+location.hash);})();`;

export default function V2Redirect() {
  const m = v2Messages('es');
  return (
    <html lang="es">
      <head>
        <meta name="robots" content="noindex" />
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      </head>
      <body style={{ background: '#090720', color: '#e4e0f2', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <noscript>
          <p>
            {m.meta.redirect}:{' '}
            <a href={`${BASE_PATH}/v2/es/`} style={{ color: '#ffc247' }}>Español</a> ·{' '}
            <a href={`${BASE_PATH}/v2/en/`} style={{ color: '#ffc247' }}>English</a>
          </p>
        </noscript>
      </body>
    </html>
  );
}
