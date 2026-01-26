/* eslint-env serviceworker */
/**
 * Service Worker for The Garden Gate PWA
 * Handles push notifications and notification clicks
 */

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
    let data = {
        type: 'move', // 'move' or 'chat'
        title: 'The Garden Gate',
        body: 'Your opponent made a move!',
        gameId: null,
        icon: '/android-icon-192x192.png',
        badge: '/android-icon-96x96.png'
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            // If not JSON, use text as body
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: {
            gameId: data.gameId,
            url: data.gameId ? `/?game=${data.gameId}` : '/'
        },
        actions: [
            { action: 'open', title: 'Open Game' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        // Use gameId and type as tag to replace existing notifications
        tag: data.gameId ? `${data.type}-${data.gameId}` : `${data.type}-notification`,
        renotify: true,
        requireInteraction: false
    };

    // For chat notifications, check if the game is currently open
    if (data.type === 'chat' && data.gameId) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if any window has this game open and is focused
                    const gameOpenAndFocused = clientList.some(client =>
                        client.url.includes(`game=${data.gameId}`) && client.focused
                    );

                    // Only show notification if game is not open/focused
                    if (!gameOpenAndFocused) {
                        return self.registration.showNotification(data.title, options);
                    }
                })
        );
    } else {
        // Move notifications always show
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // If user clicked dismiss, do nothing
    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Try to find an existing window and focus it
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus().then(() => {
                            // Navigate to the game if gameId provided
                            if (event.notification.data?.gameId) {
                                return client.navigate(urlToOpen);
                            }
                        });
                    }
                }
                // No existing window, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle notification close (for analytics if needed)
self.addEventListener('notificationclose', (event) => {
    // Could log analytics here if desired
});
