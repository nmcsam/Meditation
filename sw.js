const CACHE_NAME = "quyen22-cache-v97";
const ASSETS = [
  "./",
  "./index.html",
  "./data.js",
  "./citta_cetasika_data.js",
  "./dactinh_tl_data.js",
  "./anduc_data.js",
  "./daolo_data.js",
  "./app.js",
  "./app2.js",
  "./anduc_page.js",
  "./daolo_page.js",
  "./manifest.json",
  "./icon-buddha3-192.png",
  "./icon-buddha3-512.png",
  "./home-buddha4.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: always try to fetch the latest version first.
// Falls back to cache only when offline. This avoids serving a stale
// app shell after an update has been pushed to GitHub Pages.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request, { cache: "no-store" }).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
