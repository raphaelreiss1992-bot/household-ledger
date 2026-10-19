// Caches only the app's own code so it opens fast and works as a home screen app.
// Financial data is never cached here: it stays encrypted in Google Drive.
const VERSION = "ledger-v9";
const SHELL = ["./","index.html","config.js","css/app.css","css/gate.css","js/drive-db.js","js/pdf-reader.js","js/app.js","js/register-sw.js",
  "vendor/chart.umd.js","vendor/xlsx.full.min.js","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png",
  "vendor/fonts/ibm-plex-sans-latin-400-normal.woff2","vendor/fonts/ibm-plex-sans-latin-500-normal.woff2","vendor/fonts/ibm-plex-sans-latin-600-normal.woff2","vendor/fonts/ibm-plex-sans-latin-700-normal.woff2",
  "vendor/fonts/ibm-plex-sans-hebrew-hebrew-400-normal.woff2","vendor/fonts/ibm-plex-sans-hebrew-hebrew-500-normal.woff2","vendor/fonts/ibm-plex-sans-hebrew-hebrew-600-normal.woff2"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Google calls go straight to the network
  // Network first so updates show up, cache as fallback.
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
