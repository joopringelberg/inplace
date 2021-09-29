InPlace
======================

This client runs in the browser. It can load a single model (or App). It relies on a ServiceWorker that runs the PDR.

### Develop this client
Webpack packs the source files and outputs them to the `docs` directory, so they can be picked up over the open internet on the url `joopringelberg.github.io/inplace`
1. `npm run watch` before changing code, otherwise changes will not be reflected in the interface!

### Symlinks for easy updates
`package.json` contains a run target `symlinks` that will replace the subdirectories
* perspectives-react
* perspectives-core
* perspectives-proxy

with symlinks to the same-named projects in ~Code. Run this script after calling `npm install`. A change in the `dist` directories of these projects is then immediately picked up by webpack (when watching, of course).

### About deployment
This module depends on Webpack. There is one run target:
*  **watch**: Webpack will watch source files, transpile ES6 and JSX and bundle everything under `index.js`.

### Dependencies
This client imports:
* `perspectives-react`
* `perspectives-proxy`

### Test-using this program
It should be noted that this program is in an alpha-stage!

To run InPlace, you need install nothing. Just open in your browser: `https://inplace.works`

However, since Perspectives supports you with an information infrastructure in co-operation with other people, you will need a place to store (your) data. There is no central repository! Currently you can choose from the IndexedDB database in your browser (recommended) or an installation of Couchdb on a computer you can access from the computer you use Perspectives on (it can be the same computer). This requires some installation work, however, involving both [Couchdb](https://couchdb.apache.org/) and [Apache](https://httpd.apache.org/). See the document [Configuring Couchdb for Inplace 8](Configuring%20Couchdb%20for%20Inplace%208.pdf).
