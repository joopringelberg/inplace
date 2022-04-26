InPlace
======================

This client runs in the browser. It is a general container that allows you to load a model to add new perspectives on various contexts. It relies on a SharedWorker that runs the PDR.

### Develop this client
`package.json` has several run targets. The following are very useful:

* `builddevelopment`: build sources for local use. Requires a Couchdb installation listening on port 6984.
* `buildproduction`: build sources for production. Currently publishes to https://inplace.works. Actually pushes code to that server.
* `buildmodels_dev`: build the page `models.html`. This is a page showing the source of several public models, on the local development server.
* `buildmodels_prod`: as above, but for https://inplace.works/models.html. **NOTE**: this command will not by itself push the page to the server; you'll have to commit it through git. Running builddevelopment will take care of that (after building inplace and models.html it copies the content of the development directory to the remote server).

#### Building for production: models
When building for production, one should update the models in the repository on https://inplace.works. Synchronize them from the development repository.

### Symlinks for easy updates
`package.json` contains a run target `symlinks` (it runs the script `createPerspectivessLinks.sh`) that will replace the subdirectories
* perspectives-react
* perspectives-core
* perspectives-proxy
* perspectives-pageworker
* perspectives-sharedworker
* perspectives-highlightjs

with symlinks to the same-named projects in ~Code. Run this script after calling `npm install`. A change in the `dist` directories of these projects is then immediately picked up by webpack (when watching, of course).


### Dependencies
See `package.json`.

## Dependency management
See [Publishing a new version](https://github.com/joopringelberg/perspectives-core/blob/master/technical%20readme.md#publishing-a-new-version) in the Perspectives Core (PDR) project.

### Test-using this program
It should be noted that this program is in an alpha-stage!

To run InPlace, you need install nothing. Just open in your browser: `https://inplace.works`

However, since Perspectives supports you with an information infrastructure in co-operation with other people, you will need a place to store (your) data. There is no central repository! Currently you can choose from the IndexedDB database in your browser (recommended) or an installation of Couchdb on a computer you can access from the computer you use Perspectives on (it can be the same computer). This requires some installation work, however, involving both [Couchdb](https://couchdb.apache.org/) and [Apache](https://httpd.apache.org/). See the document [Configuring Couchdb for Inplace 8](Configuring%20Couchdb%20for%20Inplace%208.pdf).
