var CACHE_NAME = 'purepadel-v11';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if (event.request.mode === 'navigate' || url.endsWith('/') || url.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data.json(); } catch(e) {
    data = { title: 'PurePadel Coach', body: event.data ? event.data.text() : '' };
  }
  var title = data.title || 'PurePadel Coach';
  var options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/', eventId: data.eventId || null },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Hvis appen er åben og i forgrunden - send besked i stedet for notifikation
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].focused) {
          clientList[i].postMessage({
            type: 'PUSH_RECEIVED',
            title: title,
            body: data.body || '',
            eventId: data.eventId || null
          });
          return; // Vis ikke system-notifikation
        }
      }
      // Appen er i baggrunden - vis system-notifikation
      return self.registration.showNotification(title, options);
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var notifData = event.notification.data || {};
  var targetUrl = notifData.url || '/';
  var eventId = notifData.eventId;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          client.focus();
          if (eventId) {
            client.postMessage({ type: 'OPEN_EVENT', eventId: eventId });
          }
          return;
        }
      }
      var openUrl = eventId ? '/?event=' + eventId : targetUrl;
      return clients.openWindow(openUrl);
    })
  );
});
