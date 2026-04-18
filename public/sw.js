const CACHE_NAME = 'traineros-v1';
const OFFLINE_URL = '/offline';

const staticAssets = [
    '/',
    '/login',
    '/manifest.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(staticAssets);
        })
    );
});

self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const title = data.title || 'TrainerOS';
    const options = {
        body: data.body || 'Você tem uma nova mensagem',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: data.url || '/',
        actions: data.actions || [],
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data;
    if (url) {
        event.waitUntil(clients.openWindow(url));
    }
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request).then((response) => {
                    return response || caches.match(OFFLINE_URL);
                });
            })
        );
    }
});