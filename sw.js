/*
  Macht Klarschiff offline nutzbar.

  Wichtig: Eigene Dateien werden ZUERST aus dem Netz geholt und nur als
  Rückfalllösung aus dem Speicher bedient. Sonst würde eine einmal
  gespeicherte Fassung dauerhaft ausgeliefert – auch nach einer Aktualisierung.
  Nur fremde Dateien (Schriften, React) kommen zuerst aus dem Speicher.
*/
const CACHE = "klarschiff-v8";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  let eigen = false;
  try { eigen = new URL(req.url).origin === self.location.origin; } catch (err) { eigen = false; }

  /* Seitenaufrufe und alles Eigene: erst Netz, dann Speicher */
  if (req.mode === "navigate" || eigen) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
            if (req.mode === "navigate") {
              const copy2 = res.clone();
              caches.open(CACHE).then((c) => c.put("./index.html", copy2)).catch(() => null);
            }
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) =>
            hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)
          )
        )
    );
    return;
  }

  /* Fremde Dateien wie Schriften und React: erst Speicher, dann Netz */
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res && (res.status === 200 || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
          }
          return res;
        })
        .catch(() => hit);
    })
  );
});
