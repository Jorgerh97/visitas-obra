// Guarda la app en el móvil para que se abra y grabe aunque no haya cobertura en obra.
const CACHE = 'visitas-obra-v3';
const ASSETS = [
  './', 'index.html', 'manifest.json',
  'icons/icon-192.png', 'icons/icon-512.png',
  'vendor/jspdf.umd.min.js', 'vendor/jspdf.plugin.autotable.min.js',
  'fonts/barlow-latin-400-normal.woff2', 'fonts/barlow-latin-500-normal.woff2', 'fonts/barlow-latin-600-normal.woff2',
  'fonts/barlow-condensed-latin-600-normal.woff2', 'fonts/barlow-condensed-latin-700-normal.woff2',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate' || req.url.endsWith('index.html')) {
    // Primero la red, para recibir las actualizaciones; si no hay cobertura, la copia guardada.
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
