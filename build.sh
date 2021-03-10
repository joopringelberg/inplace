#!/usr/bin/env bash

# The purpose of this file is to copy a number of files to the public directory and then run webpack.
# This file is the value of the "build" script entry.

# Pass this script an argument that represents the url of the default repository to be used by Inplace.

cp ./src/index.html ./docs/index.html
cp ./src/file.png ./docs/file.png

cp ./node_modules/perspectives-pageworker/dist/perspectives-pageworker.js ./docs/perspectives-pageworker.js
cp ./node_modules/perspectives-sharedworker/dist/perspectives-sharedworker.js ./docs/perspectives-sharedworker.js
cp ./node_modules/perspectives-serviceworker/dist/perspectives-serviceworker.js ./docs/perspectives-serviceworker.js

webpack --env $1
