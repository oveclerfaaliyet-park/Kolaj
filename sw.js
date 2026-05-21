const CACHE_NAME = 'kolaj-v6-cache';
const ASSETS = [
  'kolaj.html',
  'manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Kurulum ve Dosyaları Önbelleğe Alma
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Çevrimdışı İstekleri Yönetme
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
