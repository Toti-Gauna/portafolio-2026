import { BASE_PATH } from '@/lib/site';

export default function NotFound() {
  return (
    <html lang="es">
      <head>
        <title>404 · Ignacio Gauna</title>
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ background: '#0e0e10', color: '#eeeae3', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1 style={{ fontSize: 20 }}>404</h1>
        <p><a href={`${BASE_PATH}/es/`} style={{ color: '#ff4d2e' }}>Ignacio Gauna</a> · <a href={`${BASE_PATH}/en/`} style={{ color: '#ff4d2e' }}>English</a></p>
      </body>
    </html>
  );
}
