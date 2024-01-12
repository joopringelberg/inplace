// BEGIN LICENSE
// Perspectives Distributed Runtime
// Copyright (C) 2019 Joop Ringelberg (joopringelberg@perspect.it), Cor Baars
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
// Full text of this license can be found in the LICENSE file in the projects root.
// END LICENSE

////////////////////////////////////////////////////////////////////////////////
//// SERVICE WORKER
////////////////////////////////////////////////////////////////////////////////

const cacheName = "mycontexts" + __MyContextsversionNumber__ + "14";

const toBeCached = [
  "/"
  , "/favicon.png"
  , "/file.png"
  , "/index.html"
  , "/index.js"
  , "/manage.html"
  , "/perspectives-pageworker_dist_perspectives-pageworker_js.js"
  , "/perspectives-pageworker.js"
  , "/perspectives-serviceworker.js"
  , "/perspectives.webmanifest"
  , "/perspectives-sharedworker.js"
  , "/src_lang_en_mycontexts_json.js"
  , "/src_lang_en_preact_json.perspectives-react.js"
  , "/src_lang_nl_mycontexts_json.js"
  , "/src_lang_nl_preact_json.perspectives-react.js"
];

const macIcons = ["512.png", "256.png", "128.png", "32.png", "16.png"].map( icon => "/appimages/ios/" + icon);

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all mycontext sources");
      await cache.addAll(toBeCached.concat(macIcons))
        .then( e => console.log( e ));
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      // As a reminder: these are all requests on the origin https://mycontexts.com
      // We want to ignore all requests on the directory /remotetest/
      if ( new URL( e.request.url ).pathname.match( "/remotetest/") )
      {
        console.log( `[Service Worker] Passing through remotetest request: ${e.request.url}`);
      }
      else
      {
        const r = await caches.match(e.request);
        if (r) {
          console.log(`[Service Worker] Taking resource from cache: ${e.request.url}`);
          return r;
        }
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      }
    })(),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});
