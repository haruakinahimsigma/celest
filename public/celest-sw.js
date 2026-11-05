const LAB_PREFIX = "/__celest_lab__/";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // This first-stage lab only observes Celest's own fixture.
  // It deliberately does not proxy or rewrite third-party traffic.
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(LAB_PREFIX)) {
    return;
  }

  event.respondWith((async () => {
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Celest-Service-Worker", "controlled-lab");
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  })());
});
