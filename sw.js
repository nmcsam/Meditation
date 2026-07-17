// Xoa tat ca cache cu
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
// KHONG cache: ep lay ban moi nhat tu mang, bo qua cache HTTP cua trinh duyet
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, {cache: 'no-store'}).catch(() => fetch(e.request))
  );
});
