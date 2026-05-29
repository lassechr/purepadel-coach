self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data.json(); } catch(e) { data = {title:'PurePadel', body: event.data ? event.data.text() : 'Ny besked'}; }
  var title = data.title || 'PurePadel';
  var options = {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    data: data.url || '/',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
