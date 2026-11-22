const CACHE_NAME = "koltuktr-v345-cache-v1";
const ASSETS = [
    "./",
    "./index.html",
    "./randevu.html",
    "./takip.html",
    "./partner.html",
    "./manifest.json",
    "./apple-touch-icon.png",
    "./apple-touch-icon-180x180.png",
    "./koltuktr-touch-180.png",
    "./koltuktr-icon-192.png",
    "./koltuktr-icon-512.png",
    "./favicon.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.hostname.includes("firebase") || url.hostname.includes("googleapis.com") || url.hostname.includes("open-meteo") || url.hostname.includes("nominatim")) return;
    if (url.pathname.endsWith(".png") || url.pathname.endsWith(".apk") || url.pathname.indexOf("/.well-known/") === 0) return;

    event.respondWith(
        fetch(req)
            .then((res) => {
                if (res && res.status === 200 && res.type === "basic") {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
                }
                return res;
            })
            .catch(() => caches.match(req).then((cached) => cached || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())))
    );
});
