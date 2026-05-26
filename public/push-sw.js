// Service Worker listener for push notifications
// Handles background notification delivery and click events when the app is closed

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    
    if (event.data) {
        let payload;
        try {
            payload = event.data.json();
        } catch (e) {
            // If the payload is plain text
            payload = {
                title: "تنبيه جديد! 📦",
                body: event.data.text()
            };
        }

        const title = payload.title || "تنبيه جديد! 📦";
        const options = {
            body: payload.body || "لديك طلب جديد في المتجر",
            icon: payload.icon || '/pwa-192x192.png',
            badge: payload.badge || '/pwa-192x192.png',
            vibrate: payload.vibrate || [100, 50, 100],
            data: payload.data || {},
            actions: payload.actions || [
                {
                    action: 'view-orders',
                    title: 'عرض الطلبات 📋',
                    icon: '/pwa-192x192.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    // Default URL to open
    const urlToOpen = event.notification.data?.url || '/store-dashboard/orders';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function(windowClients) {
            // Check if there is already a window open with this URL and focus it
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
