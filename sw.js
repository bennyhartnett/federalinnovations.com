const CACHE_VERSION = 'fi-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/js/bg.js',
    '/js/main.js',
    '/js/spa-router.js',
    '/js/meta-manager.js',
    '/favicon.svg',
    '/pages/home.html',
    '/pages/contact.html',
    '/pages/partners.html',
    '/pages/past-performance.html',
    '/pages/software-engineering.html',
    '/pages/ai-systems.html',
    '/pages/technical-advisory.html'
];

// Install - pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_VERSION)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // For HTML, JS, CSS: Network-first
    if (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname === '/') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // For images and other assets: Cache-first
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$/)) {
        event.respondWith(
            caches.match(event.request)
                .then((cached) => {
                    if (cached) return cached;
                    return fetch(event.request).then((response) => {
                        const clone = response.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                        return response;
                    });
                })
        );
        return;
    }

    // For CDN resources (fonts, libraries): Cache-first
    if (url.hostname !== location.hostname) {
        event.respondWith(
            caches.match(event.request)
                .then((cached) => {
                    if (cached) return cached;
                    return fetch(event.request).then((response) => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                        }
                        return response;
                    });
                })
        );
        return;
    }
});
