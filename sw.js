// YASAR AI Trading Platform - Service Worker
// PWA için offline support

const CACHE_NAME = 'yasar-ai-v1';
const urlsToCache = [
  '/zenty-ai-trade/',
  '/zenty-ai-trade/index.html'
];

// Install event
self.addEventListener('install', event => {
  console.log('✅ Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', event => {
  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Skip Firebase requests (always fetch from network)
  if (event.request.url.includes('firebase')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

console.log('🚀 Service Worker loaded!');


