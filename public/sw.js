// Minimal service worker: caches only the offline fallback page, and serves
// it for page navigations when the network request fails. Does not cache or
// intercept anything else — data pages (recipes, discounts) always go to the
// network, since their content changes weekly and isn't API-backed yet.
// Bump this whenever OFFLINE_URL's content changes — the browser only
// re-runs `install` (and thus re-fetches the cached page) when sw.js's own
// bytes change, so a version bump here is what forces the stale cached page
// to be replaced. The `activate` handler then deletes the old-named cache.
const CACHE_NAME = "mcc-offline-v2";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle full page loads (navigations) — everything else (images,
  // CSS, JS, API calls) passes through untouched.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
  );
});
