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
It should be noted that this program is in an alpha-stage. You will have to install Couchdb (version 3.1.0)! To run it, type in your browser: `https://github.com/joopringelberg/inplace`
