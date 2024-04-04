const cacheName = "myapp-v1";
const filesToCache = [
    "/index.html",
    "/style.css",
    "/icons/github-icon_72x72.png",
    "/icons/github-icon_512x512.png"
];

self.addEventListener("insall", (e) => {
    console.log("[SW] install");
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log("[SW] Caching files");
        await cache.addAll(filesToCache);
    })());
});


self.addEventListener("fetch", (e) => {
    console.log("[SW] Fetching url: ", e.request.url);
    e.respondWith((async () => {
        // If the request has already been cached,
        // return the cached value to avoid unnecessary
        // network usage.
        const match = await caches.match(e.request);
        if (match) return match;

        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log("[SW] Caching new resource: ", e.request.url);
        cache.put(e.request, response.clone());
        return response;
    })())
})