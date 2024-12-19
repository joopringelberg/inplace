MyContexts
======================

This client runs in the browser. It is a general container that allows you to load a model to add new perspectives on various contexts. It relies on a SharedWorker that runs the PDR. For IOS it runs the PDR in the first page to open. The other pages use it through window messaging.

### Develop this client
`package.json` has several run targets. The following are very useful:

* `buildProduction`: build sources for production. Currently publishes to https://mycontexts.com. Actually pushes code to that server.
* `buildRemoteTest`: builds sources for development and copies all files necessary to run MyContexts to https://mycontexts.com/remotetest. Purely for testing. Also builds other targets like `models.js`, `manage.js`, `perspectives-serviceworker.js` and `perspectives-pagedispatcher.js`. Clears out the remotetest directory both locally and remotely before copying files.
* `buildMyContextsInRemoteTest`: faster than `buildRemoteTest`, as it just builds `index.js` (MyContexts itself). Cleans the local directory but not the remote directory. Copies the `perspectives-react` language files. Use this if only `perspectives-react` or `mycontexts` have changed.

### What to run when during development for testing purposes
* If `perspectives-core` has changed, build that project and publish directly to remotetest (there is a script for that).
* If `perspectives-proxy` or `perspectives-apitypes` have changed, build an publish the core and run `buildMyContextsInRemoteTest`.
* If `perspectives-sharedworker` or `perspectives-pageworker` have changed, run `buildRemoteTest`.
* If `perspectives-react` has changed, run `buildMyContextsInRemoteTest`.

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

### Publish a new package version
1. Increase the package number in `package.template.json`.
2. Update the version numbers in `bumpversions.sh` and run it.
3. Commit.
4. Create tag.
5. Push tag.

### Test-using this program
It should be noted that this program is in an alpha-stage!

To run MyContexts, you need install nothing. Just open in your browser: `https://nycontexts.works`

However, since Perspectives supports you with an information infrastructure in co-operation with other people, you will need a place to store (your) data. There is no central repository! Currently you can choose from the IndexedDB database in your browser (recommended) or an installation of Couchdb on a computer you can access from the computer you use Perspectives on (it can be the same computer). This requires some installation work, however, involving both [Couchdb](https://couchdb.apache.org/) and [Apache](https://httpd.apache.org/). See the document [Configuring Couchdb for MyContexts 8](Configuring%20Couchdb%20for%20MyContexts%208.pdf).
