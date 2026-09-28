// Service worker: guarda la app para que funcione sin conexión.
// Sube el número de versión cuando publiques cambios para forzar la actualización.
const VERSION = 'campus-v1';
const APP = [
  './', 'index.html', 'manifest.webmanifest', 'config.js', 'styles.css',
  'app.js', 'util.js', 'store.js', 'sync.js', 'files.js', 'demo.js', 'ics.js',
  'common.js', 'hoy.js', 'horario.js', 'calendario.js',
  'asignaturas.js', 'documentos.js', 'tests.js', 'academia.js',
  'leccion.js', 'ajustes.js', 'mas.js',
  'progreso.js', 'cursos.js', 'curso-html.js',
  'curso-css.js', 'curso-javascript.js', 'curso-sql.js',
  'curso-python.js', 'curso-php.js', 'curso-herramientas.js',
  'curso-frameworks.js',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Supabase (datos y archivos) siempre por red
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return;
  // Resto: primero caché y actualiza en segundo plano (fuentes y librerías también)
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: url.origin === location.origin });
      const red = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || red;
    }),
  );
});
