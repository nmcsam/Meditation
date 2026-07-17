// Xoa tat ca cache cu
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
// Khong cache - luon lay tu mang
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
