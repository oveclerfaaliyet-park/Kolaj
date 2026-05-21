// Her yeni deploy'da bu versiyonu değiştir → tarayıcı yeni SW'yi otomatik kurar
const CACHE_VERSION = 'kolaj-v7';
const CACHE_NAME = `${CACHE_VERSION}-cache`;

// Önbelleğe alınacak dosyalar — hepsi göreceli yol
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ─── KURULUM: Tüm dosyaları önbelleğe al, hemen aktif ol ───
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Beklemeden hemen devral
  );
});

// ─── AKTİVASYON: Eski önbellekleri sil, tüm sekmeleri kontrol et ───
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // Eski versiyonları sil
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Açık sekmeleri de hemen kontrol et
  );
});

// ─── FETCH: Önce ağdan dene, hata varsa önbellekten sun ───
// Network-first stratejisi → her zaman güncel içerik gelir
// Ağ yoksa (offline) → önbellekten yükler
self.addEventListener('fetch', (e) => {
  // POST, chrome-extension vb. istekleri atla
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Başarılı ağ yanıtını önbelleğe de yaz
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Ağ yoksa önbellekten sun
        return caches.match(e.request).then((cached) => {
          return cached || caches.match('./index.html');
        });
      })
  );
});

// ─── MESAJ: Dışarıdan "skipWaiting" mesajı gönderilirse hemen devral ───
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
