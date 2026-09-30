/*
 * Afronomics service worker.
 * - Pages: network first, so readers always get fresh numbers; the last copy is kept for offline reading.
 * - Build assets, fonts and icons: cache first (their file names change when they change).
 * - Data downloads, APIs, embeds and other sites: never touched.
 */
const VERSION = "af-v3";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const OFFLINE = "/offline";
const MAX_PAGES = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll([OFFLINE, "/", "/markets/tbills"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i += 1) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/embed/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGES).then((cache) => cache.put(request, copy).then(() => trim(PAGES, MAX_PAGES)));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(OFFLINE)) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || /\.(woff2|png|svg|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSETS).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});

/* Auction alerts: show the notification sent by the af-push-check function, open the market on tap. */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Afronomics", {
      body: data.body || "A new auction result is in.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "afronomics",
      data: { url: data.url || "/markets/tbills" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/markets/tbills", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const open = wins.find((w) => w.url === url);
      return open ? open.focus() : self.clients.openWindow(url);
    }),
  );
});
