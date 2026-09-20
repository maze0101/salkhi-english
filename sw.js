/* Салхи: offline shell. Network first (bypassing the HTTP cache) so updates arrive at once; cache is the offline fallback. */
var V = "salkhi-v2";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); })); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" }).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(V).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match("./index.html"); });
    })
  );
});
