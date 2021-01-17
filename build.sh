#!/usr/bin/env bash

# The purpose of this file is to copy a number of files to the public directory and then run webpack.
# This file is the value of the "build" script entry.

cp ./src/importModule.js ./docs/importModule.js
cp ./src/index.html ./docs/index.html
cp ./src/couchdbconfig.js ./docs/couchdbconfig.js
cp ./src/file.png ./docs/file.png
cp node_modules/perspectives-serviceworker/dist/perspectives-serviceworker.js ./docs/perspectives-serviceworker.js
webpack
