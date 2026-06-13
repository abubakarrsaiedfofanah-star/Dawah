const DAWAAH_CACHE = 'dawah-shell-supabase-v3'; // Supabase: bump cache after Vercel backend readiness update.
const SHELL_ASSETS = [
  './',
  './index.html',
  './install.html',
  './verify-receipt.html',
  './verify-member.html',
  './offline.html',
  './daawah.css',
  './daawah.js',
  './canonical_redirect.js',
  './ai_worker_config.js',
  './ai_assistant_widget.js',
  './ai_assistant_widget.css', // Supabase: Removed Supabase_shared.js
  './supabase_shared.js', // Supabase: Added supabase_shared.js
  './admin.html',
  './admin.js',
  './officer.html',
  './officer.js',
  './manifest.webmanifest',
  './version.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(DAWAAH_CACHE)
      .then(cache => Promise.allSettled(
        SHELL_ASSETS.map(asset =>
          fetch(asset, { cache: 'no-store' })
            .then(response => {
              if (response.ok) {
                return cache.put(asset, response);
              }
              return null;
            })
            .catch(() => null)
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== DAWAAH_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => clients.forEach(client => client.postMessage({ type: 'APP_UPDATED' })))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('.php')) return;

  const isShellAsset = request.mode === 'navigate' ||
    /\/(index\.html|install\.html|offline\.html|verify-receipt\.html|verify-member\.html|daawah\.css|daawah\.js|admin\.js|officer\.js|supabase_shared\.js|canonical_redirect\.js|ai_worker_config\.js|ai_assistant_widget\.js|ai_assistant_widget\.css|manifest\.webmanifest|version\.json|service-worker\.js)$/i.test(url.pathname); // Supabase: Updated regex for supabase_shared.js

  if (isShellAsset) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).then(response => {
        const copy = response.clone();
        caches.open(DAWAAH_CACHE).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(request).then(cached => cached || caches.match('./offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      const copy = response.clone();
      caches.open(DAWAAH_CACHE).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match('./offline.html')))
  );
});
