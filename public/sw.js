// Minimal service worker — enables "install to home screen" (PWA) and web push.
// Network-passthrough for fetch (never serves stale HTML). Keep it boring on purpose.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {
  // No respondWith → browser handles the request normally (network).
  // Having a fetch handler is what makes the app installable.
})

// Web push: show the notification.
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) { data = {} }
  const title = data.title || 'Faresay'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/therapist/dashboard' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Tap a notification → focus an existing tab or open the target URL.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/therapist/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) { client.navigate(url); return client.focus() }
      }
      return self.clients.openWindow(url)
    }),
  )
})
