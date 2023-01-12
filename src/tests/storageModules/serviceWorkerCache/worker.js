self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
  
const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1");
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/storage/server/serviceWorkerCache/resources/sw-secret"
    ])
  );
});

cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  return new Response('Cache Unavailable', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' },
  });;
};

self.addEventListener('fetch', async function(event) {
  const scope = self.registration.scope;
  let shortPath = event.request.url.split(scope)[1];
    if (shortPath) {
      if (event.request.url.includes("sw-secret")) {
        event.respondWith(cacheFirst(event.request));
      }
    } 
});
