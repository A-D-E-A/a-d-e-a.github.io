
self.addEventListener("insall", (e) => {
    console.log("Service worker install");
})

/**
 * @param {FetchEvent} e 
 */
function onFetch(e) {
    console.log("Requested url: ", e.request.url);
    e.respondWith(
        Promise.resolve("No, you cannot request anything!")
    )
}

self.addEventListener("fetch", onFetch)