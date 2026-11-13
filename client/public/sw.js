// Network-first pass-through: never cache personal charts, readings, or authentication responses.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
