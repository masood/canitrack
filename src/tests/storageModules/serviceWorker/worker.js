self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
  
  let secret; // undefined
  
self.addEventListener("fetch", (event) => {
    console.log("IN FETCH")
    const scope = self.registration.scope;
    let shortPath = event.request.url.split(scope)[1];
    if (shortPath) {
      if (shortPath.includes("serviceworker-write?")) {
        secret = (new URL(event.request.url)).searchParams.get("secret");
        event.respondWith(new Response(""));
      } else if (shortPath.includes("serviceworker-read")) {
        event.respondWith(new Response(secret));
      }
    }
  });
  