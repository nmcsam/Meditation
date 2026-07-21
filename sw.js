// Service worker: chạy offline + hiển thị thông báo (nhắc giờ, chuông xong thời)
const CACHE = 'thien-cache-v1';
const CORE = [
  './', './index.html', './manifest.json',
  './icon-med2-192.png', './icon-med2-512.png',
  './icon-192.png', './icon-512.png'
];

// Cài đặt: lưu sẵn "vỏ" app để mở được khi mất mạng
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(CORE.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

// Kích hoạt: xoá cache cũ (khác version), giành quyền điều khiển ngay
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Nhận yêu cầu hiển thị thông báo từ trang (nhắc giờ + chuông xong thời)
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'NOTIFY') {
    self.registration.showNotification(d.title || 'Nhắc thiền', {
      body: d.body || '',
      tag: d.tag || 'thien',
      renotify: true,
      requireInteraction: !!d.requireInteraction,
      icon: './icon-med2-192.png',
      badge: './icon-med2-192.png'
    });
  }
});

// Chạm vào thông báo → mở/đưa app lên trước
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// Network-first: ưu tiên bản mới nhất từ mạng; mất mạng thì lấy từ cache
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit =>
          hit || (req.mode === 'navigation' ? caches.match('./index.html') : Response.error())
        )
      )
  );
});
