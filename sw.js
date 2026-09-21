/* Салхи: offline shell. Network first (bypassing the HTTP cache) so updates arrive at once; cache is the offline fallback. */
var V = "salkhi-v29";
var SHELL = ["./", "./index.html", "./lessons-more.js", "./dialogs-more.js", "./hanzi.js", "./firebase-config.js", "./social.js", "./placement-more-en.js", "./placement-more-zh.js", "./placement-more-ru.js", "./placement-more-de.js", "./placement-more-ja.js", "./placement-more-ko.js", "./words-en.js", "./words-zh.js", "./words-ru.js", "./words-de.js", "./words-ja.js", "./words-ko.js", "./words2-en.js", "./words2-zh.js", "./words2-ru.js", "./words2-de.js", "./words2-ja.js", "./words2-ko.js", "./words3-en.js", "./words3-zh.js", "./words3-ru.js", "./words3-de.js", "./words3-ja.js", "./words3-ko.js", "./words4-en.js", "./words4-zh.js", "./words4-ru.js", "./words4-de.js", "./words4-ja.js", "./words4-ko.js", "./words5-en.js", "./words5-zh.js", "./words5-ru.js", "./words5-de.js", "./words5-ja.js", "./words5-ko.js", "./words6-en.js", "./words6-zh.js", "./words6-ru.js", "./words6-de.js", "./words6-ja.js", "./words6-ko.js", "./words7-en.js", "./words7-zh.js", "./words7-ru.js", "./words7-de.js", "./words7-ja.js", "./words7-ko.js", "./manifest.webmanifest", "./icon.svg"];

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
