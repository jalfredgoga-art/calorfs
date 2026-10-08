/* CalorFS – Service Worker
   Cambia VERSION cada vez que publiques cambios para forzar la actualización. */
const VERSION = 'calorfs-v1.0.0';
const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-64.png',
  './icons/icon-96.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico'
];
const EXTERNAL = [
  FB + 'firebase-app.js',
  FB + 'firebase-auth.js',
  FB + 'firebase-firestore.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    // Las librerías externas se intentan cachear sin bloquear la instalación
    await Promise.all(EXTERNAL.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && c.put(u, r)).catch(() => {})));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Nunca interceptar Firestore/Auth/clima: el SDK maneja su propia caché offline
  if (/googleapis\.com|firebaseio\.com|identitytoolkit|securetoken|open-meteo\.com/.test(url.host)) return;

  // Navegación: red primero (para recibir actualizaciones), caché si no hay conexión
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        const c = await caches.open(VERSION); c.put('./index.html', r.clone());
        return r;
      } catch {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  // Recursos: caché primero y actualización en segundo plano
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const net = fetch(req).then(async r => {
      if (r && (r.ok || r.type === 'opaque')) { const c = await caches.open(VERSION); c.put(req, r.clone()); }
      return r;
    }).catch(() => null);
    return cached || (await net) || new Response('', { status: 504, statusText: 'Offline' });
  })());
});
