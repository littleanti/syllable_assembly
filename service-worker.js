const CACHE = 'syllable-assembly-v2';
const ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './icon.svg',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/layout.css',
  './src/css/blocks.css',
  './src/css/screens.css',
  './src/js/config.js',
  './src/js/hangul.js',
  './src/js/utils.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/audio.js',
  './src/js/pointer.js',
  './src/js/layout.js',
  './src/js/ui.js',
  './src/js/lesson.js',
  './src/js/tap.js',
  './src/js/game.js',
  './src/js/main.js',
  './src/data/jamo.js',
  './src/data/lessons.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
