const CACHE_NAME = 'fastorder-admin-v3';
const APP_PREFIX = 'fastorder-admin-';
const SHELL_URL = new URL('./', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shell = await fetch(SHELL_URL);
      if (!shell.ok)
        throw new Error(`No se pudo descargar el shell FastOrder Admin: ${shell.status}`);
      const html = await shell.clone().text();
      const assets = [
        ...new Set(
          [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)].map(
            (match) => match[1],
          ),
        ),
      ];
      const cache = await caches.open(CACHE_NAME);
      await cache.put(SHELL_URL, shell);
      const resources = [
        ...new Set([
          ...assets,
          './manifest.webmanifest',
          './fastorder-icon.svg',
          './placeholder.svg',
        ]),
      ];
      await Promise.all(
        resources.map(async (asset) => {
          const url = new URL(asset, SHELL_URL);
          if (url.origin !== self.location.origin) return;
          try {
            const request = new Request(url, {
              cache: 'no-store',
              signal: AbortSignal.timeout(10000),
            });
            const response = await fetch(request);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await cache.put(request, response);
          } catch (error) {
            console.error(`No se pudo guardar el recurso offline ${url.href}.`, error);
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(APP_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(SHELL_URL, response.clone());
          }
          return response;
        } catch (error) {
          const shell = await cache.match(SHELL_URL);
          if (shell) return shell;
          throw error;
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        const fallback = await cache.match(request);
        if (fallback) return fallback;
        throw error;
      }
    })(),
  );
});
