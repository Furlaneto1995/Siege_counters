/* Siege Counters — service worker
   App shell em cache-first; retratos do CDN em stale-while-revalidate. */
'use strict';

const VERSION    = 'v1';
const SHELL      = `siege-shell-${VERSION}`;
const PORTRAITS  = `siege-portraits-${VERSION}`;
const CDN        = 'https://raw.githubusercontent.com/swarfarm/swarfarm/';

/* Arquivos do app. O HTML já traz CSS, JS e os ícones de elemento embutidos,
   então o shell é pequeno e funciona 100% offline depois da 1ª visita. */
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './maskable-192.png',
  './maskable-512.png',
  './apple-touch-icon.png',
  './favicon.ico',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // addAll falha inteiro se um arquivo faltar; tolera ausências individuais
    await Promise.all(SHELL_FILES.map(f =>
      cache.add(new Request(f, { cache: 'reload' })).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL, PORTRAITS]);
    const names = await caches.keys();
    await Promise.all(names.map(n => keep.has(n) ? null : caches.delete(n)));
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* 1. Navegação: rede primeiro (pega atualizações), cai pro cache offline */
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        const fresh = await fetch(req);
        const cache = await caches.open(SHELL);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(SHELL);
        return (await cache.match('./index.html')) ||
               (await cache.match('./')) ||
               new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }

  /* 2. Retratos dos monstros (CDN): stale-while-revalidate */
  if (req.url.startsWith(CDN)) {
    event.respondWith((async () => {
      const cache  = await caches.open(PORTRAITS);
      const hit    = await cache.match(req);
      const update = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return hit || (await update) ||
             new Response('', { status: 504, statusText: 'Portrait offline' });
    })());
    return;
  }

  /* 3. Mesma origem: cache primeiro */
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      const hit   = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return new Response('', { status: 504 });
      }
    })());
  }
});
