/* Салхи: offline shell. Network first (bypassing the HTTP cache) so updates arrive at once; cache is the offline fallback. */
var V = "salkhi-v15";
var SHELL = ["./", "./index.html", "./lessons-more.js", "./dialogs-more.js", "./words-en.js", "./words-zh.js", "./words-ru.js", "./words-de.js", "./words-ja.js", "./words-ko.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); })); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== V && k !== "salkhi-meta"; }).map(function (k) { return caches.delete(k); })); })
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

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if ("focus" in list[i]) { list[i].postMessage({ type: "daily" }); return list[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});

/* Background reminder (Chrome installed PWA): fires roughly daily, reads settings mirrored by the page. */
self.addEventListener("periodicsync", function (e) {
  if (e.tag !== "salkhi-remind") return;
  e.waitUntil(caches.open("salkhi-meta").then(function (c) {
    return c.match("notif").then(function (r) { return r ? r.json() : null; }).then(function (n) {
      if (!n || !n.on) return;
      var now = new Date(), p = String(n.t || "19:00").split(":"), due = new Date();
      due.setHours(+p[0] || 19, +p[1] || 0, 0, 0);
      var key = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
      if (now < due || n.sw === key) return;
      n.sw = key;
      return c.put("notif", new Response(JSON.stringify(n))).then(function () {
        return self.registration.showNotification("Салхи", { body: "Өнөөдрийн дасгалаа хийх цаг боллоо 🌬️", icon: "icon.svg", tag: "salkhi-daily", data: { url: "./#daily" } });
      });
    });
  }));
});
