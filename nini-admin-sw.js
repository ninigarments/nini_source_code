self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: "Nini Garments",
      body: event.data ? event.data.text() : "New notification"
    };
  }

  const title = data.title || "Nini Garments";

  const options = {
    body: data.body || "You have a new notification.",
    icon: "/nini-logo.jpeg",
    badge: "/nini-logo.jpeg",
    tag: data.tag || "nini-notification",
    data: {
      url: data.url || "/admin",
      order_id: data.order_id || null
    },
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification?.data?.url || "/admin";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
